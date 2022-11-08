import { constants } from 'ethers';
import mongoose from 'mongoose';
import { getActiveCampaign } from './getActiveCampaign';
import { getWeekInformation, WeekInformation } from './week';
import { CampaignModel } from '../models/Campaign.model';

describe('getActiveCampaign', () => {
  let weekInfo: WeekInformation;

  beforeEach(async () => {
    await mongoose.connect(process.env.MONGO_URI as string);
    weekInfo = getWeekInformation();
  });

  afterEach(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
  });

  it(`finds active campaign where fragments can be claimed`, async () => {
    const campaignTimelines = {
      startDate: weekInfo.startDate.subtract(1, 'weeks').toDate(),
      endDate: weekInfo.endDate.add(1, 'weeks').toDate(),
      redeemEndDate: weekInfo.endDate.add(2, 'weeks').toDate(),
    };
    await new CampaignModel({
      ...campaignTimelines,
      initiatorAddress: constants.AddressZero,
    }).save();

    const activeCampaign = await getActiveCampaign();

    expect(activeCampaign).toEqual(
      expect.objectContaining({
        initiatorAddress: constants.AddressZero,
        ...campaignTimelines,
      })
    );
  });

  it(`finds active campaign where fragments can be only spent`, async () => {
    const campaignTimelines = {
      startDate: weekInfo.startDate.subtract(1, 'weeks').toDate(),
      endDate: weekInfo.endDate.subtract(1, 'weeks').toDate(),
      redeemEndDate: weekInfo.endDate.add(2, 'weeks').toDate(),
    };

    await new CampaignModel({
      ...campaignTimelines,
      initiatorAddress: constants.AddressZero,
    }).save();

    const activeCampaign = await getActiveCampaign();

    expect(activeCampaign).toEqual(
      expect.objectContaining({
        initiatorAddress: constants.AddressZero,
        ...campaignTimelines,
      })
    );
  });

  it('throws for outdatedCampaign', async () => {
    const weekInfo = getWeekInformation();

    const campaignTimelines = {
      startDate: weekInfo.startDate.subtract(2, 'weeks').toDate(),
      endDate: weekInfo.endDate.subtract(2, 'weeks').toDate(),
      redeemEndDate: weekInfo.endDate.subtract(1, 'weeks').toDate(),
    };

    await new CampaignModel({
      ...campaignTimelines,
      initiatorAddress: constants.AddressZero,
    }).save();

    expect(() => getActiveCampaign()).rejects.toThrowError();
  });

  it(`throws for campaign that doesn't exists`, async () => {
    expect(() => getActiveCampaign()).rejects.toThrowError();
  });
});
