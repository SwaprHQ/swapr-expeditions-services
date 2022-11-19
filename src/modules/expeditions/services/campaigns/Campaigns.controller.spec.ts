import { Server, ServerInjectResponse } from '@hapi/hapi';
import { constants, Wallet } from 'ethers';
import { HydratedDocument } from 'mongoose';
import { ADD_CAMPAIGN_MESSAGE } from './Campaigns.consts';
import {
  AddCampaignRequest,
  GetCampaignProgressRequest,
} from './Campaigns.types';
import { dayjs } from '../../../shared/dayjs';
import { ICampaign } from '../../interfaces/ICampaign.interface';
import { VisitModel } from '../../models/Visit.model';
import { CampaignModel } from '../../models/Campaign.model';
import { WeeklyFragmentModel } from '../../models/WeeklyFragment.model';
import { getWeekInformation, WeekInformation } from '../../utils';
import {
  createMakeRequest,
  startMockServer,
  stopMockServer,
  TypedRequestCreator,
} from '../../utils/tests/setup';
import { TasksTypes } from '../tasks/Tasks.types';
import { FRAGMENTS_PER_WEEK } from '../../../config/config.service';

describe('Campaigns controller', () => {
  const testWallet = Wallet.createRandom();
  let server: Server;

  beforeEach(async () => {
    server = await startMockServer();
  });

  afterEach(async () => {
    await stopMockServer(server);
  });

  describe('addCampaign', () => {
    let res: ServerInjectResponse;
    let makeAddCampaignRequest: TypedRequestCreator<
      AddCampaignRequest['payload']
    >;
    let signature: string;

    beforeAll(async () => {
      signature = await testWallet.signMessage(ADD_CAMPAIGN_MESSAGE);
    });

    beforeEach(async () => {
      makeAddCampaignRequest = createMakeRequest<AddCampaignRequest['payload']>(
        server,
        {
          method: 'POST',
          url: `/expeditions/add-campaign`,
        }
      );
    });

    test('should validate payload', async () => {
      const defaultRequest: AddCampaignRequest['payload'] = {
        signature,
        address: testWallet.address,
        startDate: new Date('2022-01-03'),
        endDate: new Date('2022-01-09'),
        redeemEndDate: new Date('2022-01-16'),
      };

      res = await makeAddCampaignRequest({
        ...defaultRequest,
        startDate: new Date('2022-01-02'), // Other than Monday
      });

      expect(res.statusCode === 400);
      res = await makeAddCampaignRequest({
        ...defaultRequest,
        endDate: new Date('2022-01-08'), // Other than Sunday
      });

      expect(res.statusCode === 400);

      res = await makeAddCampaignRequest({
        ...defaultRequest,
        endDate: new Date('2022-01-01'), // Earlier than startDate
      });

      expect(res.statusCode === 400);

      res = await makeAddCampaignRequest({
        ...defaultRequest,
        redeemEndDate: new Date('2022-01-01'), // Earlier than endDate
      });

      expect(res.statusCode === 400);
    });

    it('should prevent adding campaign if there is overlapping one', async () => {
      const defaultRequest: AddCampaignRequest['payload'] = {
        signature,
        address: testWallet.address,
        startDate: new Date('2022-01-03'),
        endDate: new Date('2022-01-09'),
        redeemEndDate: new Date('2022-01-16'),
      };

      await new CampaignModel({
        startDate: new Date('2022-01-10'),
        endDate: new Date('2022-01-16'),
        redeemEndDate: new Date('2022-01-30'),
        initiatorAddress: constants.AddressZero,
      }).save();

      // Req:  <===>
      // DB :  <===>

      res = await makeAddCampaignRequest({
        ...defaultRequest,
        startDate: new Date('2022-01-10'),
        endDate: new Date('2022-01-16'),
        redeemEndDate: new Date('2022-01-30'),
      });

      expect(res.statusCode).toBe(400);

      // Req: <===>
      // DB :   <===>
      res = await makeAddCampaignRequest({
        ...defaultRequest,
        startDate: new Date('2022-01-03'),
        endDate: new Date('2022-01-09'),
        redeemEndDate: new Date('2022-01-16'),
      });

      expect(res.statusCode).toBe(400);

      // Req:   <===>
      // DB : <===>

      res = await makeAddCampaignRequest({
        ...defaultRequest,
        startDate: new Date('2022-01-17'),
        endDate: new Date('2022-01-23'),
        redeemEndDate: new Date('2022-02-06'),
      });

      expect(res.statusCode).toBe(400);

      // Req:  <=====>
      // DB :   <===>
      res = await makeAddCampaignRequest({
        ...defaultRequest,
        startDate: new Date('2022-01-03'),
        endDate: new Date('2022-01-09'),
        redeemEndDate: new Date('2022-02-06'),
      });

      expect(res.statusCode).toBe(400);

      // Req:  <===>
      // DB :  <=====>
      res = await makeAddCampaignRequest({
        ...defaultRequest,
        startDate: new Date('2022-01-10'),
        endDate: new Date('2022-01-16'),
        redeemEndDate: new Date('2022-01-23'),
      });

      expect(res.statusCode).toBe(400);

      // Req:  <===>
      // DB :       <===>
      res = await makeAddCampaignRequest({
        ...defaultRequest,
        startDate: new Date('2022-02-07'),
        endDate: new Date('2022-02-13'),
        redeemEndDate: new Date('2022-02-20'),
      });

      expect(res.statusCode).toBe(200);
    });
  });

  describe('getCampaignProgress', () => {
    let res: ServerInjectResponse;
    let makeGetCampaignProgressRequest: TypedRequestCreator<
      GetCampaignProgressRequest['payload']
    >;
    let campaign: HydratedDocument<ICampaign>;
    let week: WeekInformation;

    beforeEach(async () => {
      week = getWeekInformation();

      campaign = await new CampaignModel({
        startDate: week.startDate.subtract(2, 'weeks').toDate(),
        endDate: week.endDate.add(2, 'weeks').toDate(),
        redeemEndDate: week.endDate.add(3, 'weeks').toDate(),
        initiatorAddress: constants.AddressZero,
      }).save();

      makeGetCampaignProgressRequest = createMakeRequest<
        GetCampaignProgressRequest['payload']
      >(server, {
        method: 'GET',
        url: `/expeditions/progress?address=${testWallet.address}`,
      });
    });

    it('returns results for new participant', async () => {
      res = await makeGetCampaignProgressRequest({
        address: testWallet.address,
      });

      expect(res.result).toEqual(
        expect.objectContaining({
          claimedFragments: 0,
          tasks: {
            dailyVisit: {
              allVisits: 0,
              lastVisit: 0,
              fragments: 0,
              nextVisit: new Date(0),
              type: TasksTypes.VISIT,
            },
            liquidityProvision: {
              totalAmountUSD: 0,
              claimableFragments: 0,
              claimedFragments: 0,
              startDate: week.startDate.toDate(),
              endDate: week.endDate.toDate(),
              type: TasksTypes.LIQUIDITY_PROVISION,
            },
            liquidityStaking: {
              totalAmountUSD: 0,
              claimableFragments: 0,
              claimedFragments: 0,
              startDate: week.startDate.toDate(),
              endDate: week.endDate.toDate(),
              type: TasksTypes.LIQUIDITY_STAKING,
            },
          },
        })
      );
    });

    it('returns results for some progress made', async () => {
      const base = {
        campaign_id: campaign._id,
        address: testWallet.address,
        year: week.year,
      };

      await new WeeklyFragmentModel({
        ...base,
        week: week.weekNumber - 2,
        fragments: FRAGMENTS_PER_WEEK,
        type: TasksTypes.LIQUIDITY_PROVISION,
      }).save();

      await new WeeklyFragmentModel({
        ...base,
        week: week.weekNumber - 1,
        fragments: FRAGMENTS_PER_WEEK + FRAGMENTS_PER_WEEK * 1,
        type: TasksTypes.LIQUIDITY_PROVISION,
      }).save();

      await new WeeklyFragmentModel({
        ...base,
        week: week.weekNumber,
        fragments: FRAGMENTS_PER_WEEK + FRAGMENTS_PER_WEEK * 2,
        type: TasksTypes.LIQUIDITY_PROVISION,
      }).save();

      await new WeeklyFragmentModel({
        ...base,
        week: week.weekNumber,
        fragments: FRAGMENTS_PER_WEEK,
        type: TasksTypes.LIQUIDITY_STAKING,
      }).save();

      const lastVisit = dayjs().subtract(1, 'day').toDate();

      await new VisitModel({
        address: testWallet.address,
        campaign_id: campaign._id,
        fragments: 1 + 2 + 3 + 4 + 5,
        allVisits: 5,
        lastVisit,
      }).save();

      res = await makeGetCampaignProgressRequest({
        address: testWallet.address,
      });

      expect(res.result).toEqual(
        expect.objectContaining({
          claimedFragments: 240 + 40 + 15,
          tasks: {
            dailyVisit: {
              allVisits: 5,
              lastVisit,
              nextVisit: dayjs.utc(lastVisit).add(1, 'day').toDate(),
              fragments: 15,
              type: TasksTypes.VISIT,
            },
            liquidityProvision: {
              totalAmountUSD: 0,
              claimableFragments: 0,
              claimedFragments: 120,
              startDate: week.startDate.toDate(),
              endDate: week.endDate.toDate(),
              type: TasksTypes.LIQUIDITY_PROVISION,
            },
            liquidityStaking: {
              totalAmountUSD: 0,
              claimableFragments: 0,
              claimedFragments: 40,
              startDate: week.startDate.toDate(),
              endDate: week.endDate.toDate(),
              type: TasksTypes.LIQUIDITY_STAKING,
            },
          },
        })
      );
    });
  });
});
