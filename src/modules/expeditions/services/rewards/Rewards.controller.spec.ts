import { Server } from '@hapi/hapi';
import { constants, Wallet } from 'ethers';
import { HydratedDocument } from 'mongoose';
import dayjs from 'dayjs';
import { ClaimRewardRequest, ClaimRewardResult } from './Rewards.types';
import { ICampaign } from '../../interfaces/ICampaign.interface';
import { CampaignModel } from '../../models/Campaign.model';
import { getWeekInformation, WeekInformation } from '../../utils';
import { seedRewards } from '../../utils/tests/rewardsSeed';
import {
  createMakeRequest,
  startMockServer,
  stopMockServer,
  TypedRequestCreator,
} from '../../utils/tests/setup';
import { VisitModel } from '../../models/Visit.model';
import { RewardClaimModel } from '../../models/RewardClaim.model';

describe('Tasks controller', () => {
  const testWallet = Wallet.createRandom();
  let server: Server;
  let campaign: HydratedDocument<ICampaign>;
  let signature: string;
  let week: WeekInformation;

  beforeEach(async () => {
    jest.clearAllMocks();
    server = await startMockServer();

    week = getWeekInformation();

    campaign = await new CampaignModel({
      startDate: week.startDate.subtract(3, 'weeks').toDate(),
      endDate: week.endDate.add(2, 'weeks').toDate(),
      redeemEndDate: week.endDate.add(3, 'weeks').toDate(),
      initiatorAddress: constants.AddressZero,
    }).save();

    await seedRewards({ campaign_id: campaign._id });
    signature = await testWallet.signMessage('1');
  });

  afterEach(async () => {
    await stopMockServer(server);
  });

  describe('claimReward', () => {
    let makeClaimRequest: TypedRequestCreator<ClaimRewardRequest['payload']>;

    beforeEach(() => {
      makeClaimRequest = createMakeRequest<ClaimRewardRequest['payload']>(
        server,
        {
          method: 'POST',
          url: '/expeditions/claimReward',
        }
      );
    });

    it('throws when pass redeem end date (no campaign)', async () => {
      await CampaignModel.findByIdAndDelete(campaign._id);

      await new CampaignModel({
        startDate: week.startDate.subtract(3, 'weeks').toDate(),
        endDate: week.endDate.subtract(2, 'weeks').toDate(),
        redeemEndDate: week.endDate.subtract(1, 'weeks').toDate(),
        initiatorAddress: constants.AddressZero,
      }).save();

      const testRes = await makeClaimRequest({
        signature,
        address: testWallet.address,
        tokenId: '1',
      });

      expect(testRes.result).toEqual({
        statusCode: 400,
        error: 'Bad Request',
        message: 'No active campaign has been found',
      });
    });

    it('throws when reward not found', async () => {
      signature = await testWallet.signMessage('100');

      const testRes = await makeClaimRequest({
        signature,
        address: testWallet.address,
        tokenId: '100',
      });

      expect(testRes.result).toEqual({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Reward not found',
      });
    });

    it('throws when not enough fragments', async () => {
      signature = await testWallet.signMessage('1');

      const testRes = await makeClaimRequest({
        signature,
        address: testWallet.address,
        tokenId: '1',
      });

      expect(testRes.result).toEqual({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Not enough fragments to claim reward',
      });
    });

    it('returns existing rewardClaim', async () => {
      signature = await testWallet.signMessage('1');
      let rewardClaims;
      await new VisitModel({
        address: testWallet.address,
        campaign_id: campaign._id,
        fragments: 100,
        allVisits: 1,
        lastVisit: dayjs().subtract(1, 'day').toDate(),
      }).save();

      const reqParams = {
        signature,
        address: testWallet.address,
        tokenId: '1',
      };

      const expectedResponse = {
        chainId: process.env.DOMAIN_CHAIN_ID || '',
        tokenId: '1',
        nftAddress: process.env.NFT_CONTRACT_ADDRESS || '',
        claimSignature: expect.stringContaining('0x'),
      };

      const testRes = await makeClaimRequest(reqParams);

      expect(testRes.result).toEqual<ClaimRewardResult>(expectedResponse);

      rewardClaims = await RewardClaimModel.find({
        tokenId: '1',
        receiverAddress: testWallet.address,
        campaign_id: campaign._id,
      });

      expect(rewardClaims).toHaveLength(1);

      const testRes2 = await makeClaimRequest(reqParams);

      expect(testRes2.result).toEqual<ClaimRewardResult>(expectedResponse);

      rewardClaims = await RewardClaimModel.find({
        tokenId: '1',
        receiverAddress: testWallet.address,
        campaign_id: campaign._id,
      });

      expect(rewardClaims).toHaveLength(1);
    });
  });
});
