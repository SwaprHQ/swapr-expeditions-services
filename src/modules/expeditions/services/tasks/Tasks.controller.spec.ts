import { Server, ServerInjectResponse } from '@hapi/hapi';

import { constants, Wallet } from 'ethers';

import { HydratedDocument } from 'mongoose';

import {
  ClaimTaskRequest,
  ClaimTaskResult,
  RegisterDailySwapRequest,
  RegisterDailySwapResponse,
  TasksTypes,
} from './Tasks.types';
import { dayjs } from '../../../shared/dayjs';

import { ICampaign } from '../../interfaces/ICampaign.interface';

import { CampaignModel } from '../../models/Campaign.model';

import { VisitModel } from '../../models/Visit.model';

import { DailySwapsModel } from '../../models/DailySwaps.model';

import { getWeekInformation, WeekInformation } from '../../utils';

import {
  createMakeRequest,
  startMockServer,
  stopMockServer,
  TypedRequestCreator,
} from '../../utils/tests/setup';

import { multichainSubgraphService } from '../multichainSubgraph/MultichainSubgraph.service';

import { WeeklyFragmentModel } from '../../models/WeeklyFragment.model';
import {
  DAILY_SWAPS_MULTIPLAND,
  FRAGMENTS_PER_WEEK,
} from '../../../config/config.service';
import { IDailySwaps } from '../../interfaces/IDailySwaps.interface';

const generateProvisionData = (positions: number[]) =>
  positions.map(position => ({ amountUSD: position.toString() }));

const generateStakingData = (positions: number[]) =>
  positions.map(position => ({
    __typename: 'Deposit',

    amount: position.toString(),

    liquidityMiningCampaign: {
      stakablePair: {
        totalSupply: '1',

        reserveUSD: 1,
      },
    },
  }));

describe('Tasks controller', () => {
  const testWallet = Wallet.createRandom();

  let server: Server;

  let campaign: HydratedDocument<ICampaign>;

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
  });

  afterEach(async () => {
    await stopMockServer(server);
  });

  describe('claimTask', () => {
    let makeClaimRequest: TypedRequestCreator<ClaimTaskRequest['payload']>;

    beforeEach(() => {
      makeClaimRequest = createMakeRequest<ClaimTaskRequest['payload']>(
        server,
        {
          method: 'POST',
          url: '/expeditions/claim-task',
        }
      );
    });

    it('throws when no active campaign has been found', async () => {
      await CampaignModel.findByIdAndDelete(campaign._id);

      const signature = await testWallet.signMessage(TasksTypes.VISIT);

      const testRes = await makeClaimRequest({
        signature,

        address: testWallet.address,

        type: TasksTypes.VISIT,
      });

      expect(testRes.result).toEqual({
        statusCode: 400,

        error: 'Bad Request',

        message: 'No active campaign has been found',
      });
    });

    it('throws when past end date', async () => {
      await CampaignModel.findByIdAndDelete(campaign._id);

      await new CampaignModel({
        startDate: week.startDate.subtract(3, 'weeks').toDate(),

        endDate: week.endDate.subtract(1, 'weeks').toDate(),

        redeemEndDate: week.endDate.add(3, 'weeks').toDate(),

        initiatorAddress: constants.AddressZero,
      }).save();

      const signature = await testWallet.signMessage(TasksTypes.VISIT);

      const testRes = await makeClaimRequest({
        signature,

        address: testWallet.address,

        type: TasksTypes.VISIT,
      });

      expect(testRes.result).toEqual({
        statusCode: 400,

        error: 'Bad Request',

        message: 'Campaign end date has passed',
      });
    });

    describe('daily visit', () => {
      let signature: string;

      beforeAll(async () => {
        signature = await testWallet.signMessage(TasksTypes.VISIT);
      });

      test('should return updated claimed fragments after visit', async () => {
        const testRes = await makeClaimRequest({
          signature,

          address: testWallet.address,

          type: TasksTypes.VISIT,
        });

        expect(testRes.statusCode).toBe(200);

        expect(testRes.result).toEqual<ClaimTaskResult>({
          claimedFragments: 1,

          type: TasksTypes.VISIT,
        });
      });

      test('should increase visits by one when address has previous visits', async () => {
        const testDate = dayjs().utc().add(-2, 'days').toDate();

        const visitDocument = await new VisitModel({
          address: testWallet.address,

          allVisits: 4,

          fragments: 40 * 4 + 40 * (0 + 1 + 2 + 3),

          lastVisit: testDate,

          campaign_id: campaign._id,
        }).save();

        const testRes = await makeClaimRequest({
          signature,

          address: testWallet.address,

          type: TasksTypes.VISIT,
        });

        expect(testRes.statusCode).toBe(200);

        const newVisitDocument = await VisitModel.findById(visitDocument._id);

        if (!newVisitDocument) {
          throw new Error('Document not found');
        }

        expect(newVisitDocument.allVisits).toEqual(5);
      });
    });

    describe('liquidity provision', () => {
      let provisionMock: jest.SpyInstance;

      let provisionSignature: string;

      beforeAll(async () => {
        provisionMock = jest.spyOn(
          multichainSubgraphService,
          'getLiquidityPositionDepositsBetweenTimestampAAndTimestampB'
        );
        provisionSignature = await testWallet.signMessage(
          TasksTypes.LIQUIDITY_PROVISION
        );
      });

      afterAll(() => {
        jest.restoreAllMocks();
      });

      it('throws if 50 USD equivalent has not been reached', async () => {
        provisionMock.mockResolvedValue(generateProvisionData([10, 20]));

        const testRes = await makeClaimRequest({
          signature: provisionSignature,

          address: testWallet.address,

          type: TasksTypes.LIQUIDITY_PROVISION,
        });

        expect(testRes.result).toEqual({
          statusCode: 400,

          error: 'Bad Request',

          message: 'No claimable fragments',
        });
      });

      it('throws if already claimed', async () => {
        provisionMock.mockResolvedValue(generateProvisionData([50]));

        await new WeeklyFragmentModel({
          address: testWallet.address,

          type: TasksTypes.LIQUIDITY_PROVISION,

          fragments: FRAGMENTS_PER_WEEK,

          campaign_id: campaign._id,

          week: week.weekNumber,

          year: week.year,
        }).save();

        const testRes = await makeClaimRequest({
          signature: provisionSignature,

          address: testWallet.address,

          type: TasksTypes.LIQUIDITY_PROVISION,
        });

        expect(testRes.result).toEqual({
          statusCode: 400,

          error: 'Bad Request',

          message: `Weekly fragment for LIQUIDITY_PROVISION for ${week.weekDate} already claimed`,
        });
      });

      it('applies bonus', async () => {
        provisionMock.mockResolvedValue(generateProvisionData([50]));

        await new WeeklyFragmentModel({
          address: testWallet.address,

          type: TasksTypes.LIQUIDITY_PROVISION,

          fragments: FRAGMENTS_PER_WEEK,

          campaign_id: campaign._id,

          week: week.weekNumber - 3,

          year: week.year,
        }).save();

        await new WeeklyFragmentModel({
          address: testWallet.address,

          type: TasksTypes.LIQUIDITY_PROVISION,

          fragments: FRAGMENTS_PER_WEEK + FRAGMENTS_PER_WEEK * 1,

          campaign_id: campaign._id,

          week: week.weekNumber - 2,

          year: week.year,
        }).save();

        await new WeeklyFragmentModel({
          address: testWallet.address,

          type: TasksTypes.LIQUIDITY_PROVISION,

          fragments: FRAGMENTS_PER_WEEK + FRAGMENTS_PER_WEEK * 2,

          campaign_id: campaign._id,

          week: week.weekNumber - 1,

          year: week.year,
        }).save();

        const testRes = await makeClaimRequest({
          signature: provisionSignature,

          address: testWallet.address,

          type: TasksTypes.LIQUIDITY_PROVISION,
        });

        expect(testRes.result).toEqual<ClaimTaskResult>({
          claimedFragments: FRAGMENTS_PER_WEEK + FRAGMENTS_PER_WEEK * 3,

          type: TasksTypes.LIQUIDITY_PROVISION,
        });
      });
    });

    describe('liquidity staking', () => {
      let stakingMock: jest.SpyInstance;

      let stakingSignature: string;

      beforeAll(async () => {
        stakingMock = jest.spyOn(
          multichainSubgraphService,
          'getLiquidityStakingPositionBetweenTimestampAAndTimestampB'
        );
        stakingSignature = await testWallet.signMessage(
          TasksTypes.LIQUIDITY_STAKING
        );
      });

      afterAll(() => {
        jest.restoreAllMocks();
      });

      it('throws if 50 USD equivalent has not been reached', async () => {
        stakingMock.mockResolvedValue(generateStakingData([10, 20]));

        const testRes = await makeClaimRequest({
          signature: stakingSignature,

          address: testWallet.address,

          type: TasksTypes.LIQUIDITY_STAKING,
        });

        expect(testRes.result).toEqual({
          statusCode: 400,

          error: 'Bad Request',

          message: 'No claimable fragments',
        });
      });

      it('throws if already claimed', async () => {
        stakingMock.mockResolvedValue(generateStakingData([50]));

        await new WeeklyFragmentModel({
          address: testWallet.address,

          type: TasksTypes.LIQUIDITY_STAKING,

          fragments: FRAGMENTS_PER_WEEK,

          campaign_id: campaign._id,

          week: week.weekNumber,

          year: week.year,
        }).save();

        const testRes = await makeClaimRequest({
          signature: stakingSignature,

          address: testWallet.address,

          type: TasksTypes.LIQUIDITY_STAKING,
        });

        expect(testRes.result).toEqual({
          statusCode: 400,

          error: 'Bad Request',

          message: `Weekly fragment for LIQUIDITY_STAKING for ${week.weekDate} already claimed`,
        });
      });

      it('applies streak bonus', async () => {
        stakingMock.mockResolvedValue(generateStakingData([50]));

        await new WeeklyFragmentModel({
          address: testWallet.address,

          type: TasksTypes.LIQUIDITY_STAKING,

          fragments: FRAGMENTS_PER_WEEK,

          campaign_id: campaign._id,

          week: week.weekNumber - 3,

          year: week.year,
        }).save();

        await new WeeklyFragmentModel({
          address: testWallet.address,

          type: TasksTypes.LIQUIDITY_STAKING,

          fragments: FRAGMENTS_PER_WEEK + FRAGMENTS_PER_WEEK * 1,

          campaign_id: campaign._id,

          week: week.weekNumber - 2,

          year: week.year,
        }).save();

        await new WeeklyFragmentModel({
          address: testWallet.address,

          type: TasksTypes.LIQUIDITY_STAKING,

          fragments: FRAGMENTS_PER_WEEK + FRAGMENTS_PER_WEEK * 2,

          campaign_id: campaign._id,

          week: week.weekNumber - 1,

          year: week.year,
        }).save();

        const testRes = await makeClaimRequest({
          signature: stakingSignature,

          address: testWallet.address,

          type: TasksTypes.LIQUIDITY_STAKING,
        });

        expect(testRes.result).toEqual<ClaimTaskResult>({
          claimedFragments: FRAGMENTS_PER_WEEK + FRAGMENTS_PER_WEEK * 3,

          type: TasksTypes.LIQUIDITY_STAKING,
        });
      });
    });
  });

  describe('registerDailySwap', () => {
    let makeRegisterRequest: TypedRequestCreator<
      RegisterDailySwapRequest['payload']
    >;

    beforeEach(() => {
      makeRegisterRequest = createMakeRequest<
        RegisterDailySwapRequest['payload']
      >(server, {
        method: 'POST',
        url: '/expeditions/register-daily-swap',
      });
    });

    it('throws when no active campaign has been found', async () => {
      await CampaignModel.findByIdAndDelete(campaign._id);

      const testRes = await makeRegisterRequest({
        address: testWallet.address,
        tradeUSDValue: 2,
      });

      expect(testRes.result).toEqual({
        statusCode: 400,

        error: 'Bad Request',

        message: 'No active campaign has been found',
      });
    });

    it('throws when past end date', async () => {
      await CampaignModel.findByIdAndDelete(campaign._id);

      await new CampaignModel({
        startDate: week.startDate.subtract(3, 'weeks').toDate(),

        endDate: week.endDate.subtract(1, 'weeks').toDate(),

        redeemEndDate: week.endDate.add(3, 'weeks').toDate(),

        initiatorAddress: constants.AddressZero,
      }).save();

      const testRes = await makeRegisterRequest({
        address: testWallet.address,
        tradeUSDValue: 2,
      });

      expect(testRes.result).toEqual({
        statusCode: 400,

        error: 'Bad Request',

        message: 'Campaign end date has passed',
      });
    });

    it('creates new entry', async () => {
      const testRes = await makeRegisterRequest({
        address: testWallet.address,
        tradeUSDValue: 2,
      });

      expect(testRes.result).toEqual<Awaited<RegisterDailySwapResponse>>({
        claimedFragments: 0,
        totalTradeUSDValue: 2,
      });

      const dailySwapsDocument = await DailySwapsModel.findOne({
        address: testWallet.address,
      });

      expect(dailySwapsDocument).toEqual(
        expect.objectContaining<IDailySwaps>({
          address: testWallet.address,
          campaign_id: campaign._id,
          date: dayjs.utc().startOf('day').toDate(),
          fragments: 0,
          totalTradeUSDValue: 2,
        })
      );
    });

    it('adds fragments in single swap tx', async () => {
      const testRes = await makeRegisterRequest({
        address: testWallet.address,
        tradeUSDValue: 10,
      });

      expect(testRes.result).toEqual<Awaited<RegisterDailySwapResponse>>({
        claimedFragments: DAILY_SWAPS_MULTIPLAND,
        totalTradeUSDValue: 10,
      });
    });

    it('adds fragments in multiple swaps txs', async () => {
      let testRes: ServerInjectResponse;
      testRes = await makeRegisterRequest({
        address: testWallet.address,
        tradeUSDValue: 2,
      });

      expect(testRes.result).toEqual<Awaited<RegisterDailySwapResponse>>({
        claimedFragments: 0,
        totalTradeUSDValue: 2,
      });

      testRes = await makeRegisterRequest({
        address: testWallet.address,
        tradeUSDValue: 2,
      });

      expect(testRes.result).toEqual<Awaited<RegisterDailySwapResponse>>({
        claimedFragments: 0,
        totalTradeUSDValue: 4,
      });

      testRes = await makeRegisterRequest({
        address: testWallet.address,
        tradeUSDValue: 6,
      });

      expect(testRes.result).toEqual<Awaited<RegisterDailySwapResponse>>({
        claimedFragments: DAILY_SWAPS_MULTIPLAND,
        totalTradeUSDValue: 10,
      });
    });

    it('grants fragments only once per day', async () => {
      let testRes: ServerInjectResponse;
      testRes = await makeRegisterRequest({
        address: testWallet.address,
        tradeUSDValue: 11,
      });

      expect(testRes.result).toEqual<Awaited<RegisterDailySwapResponse>>({
        claimedFragments: DAILY_SWAPS_MULTIPLAND,
        totalTradeUSDValue: 11,
      });

      testRes = await makeRegisterRequest({
        address: testWallet.address,
        tradeUSDValue: 50.11,
      });

      expect(testRes.result).toEqual<Awaited<RegisterDailySwapResponse>>({
        claimedFragments: 0,
        totalTradeUSDValue: 61.11,
      });
    });

    it('works correctly across different days', async () => {
      const mockDayjs = jest.spyOn(dayjs, 'utc');

      const currentDay = dayjs.utc();
      const nextDay = currentDay.add(1, 'day');

      let testRes: ServerInjectResponse;
      testRes = await makeRegisterRequest({
        address: testWallet.address,
        tradeUSDValue: 11,
      });

      expect(testRes.result).toEqual<Awaited<RegisterDailySwapResponse>>({
        claimedFragments: DAILY_SWAPS_MULTIPLAND,
        totalTradeUSDValue: 11,
      });

      mockDayjs.mockReturnValue(nextDay);
      testRes = await makeRegisterRequest({
        address: testWallet.address,
        tradeUSDValue: 5,
      });

      expect(testRes.result).toEqual<Awaited<RegisterDailySwapResponse>>({
        claimedFragments: 0,
        totalTradeUSDValue: 5,
      });

      const currentDaySwaps = await DailySwapsModel.findOne({
        address: testWallet.address,
        date: currentDay.startOf('day').toDate(),
      });

      expect(currentDaySwaps).toEqual(
        expect.objectContaining<Partial<IDailySwaps>>({
          date: currentDay.startOf('day').toDate(),
          totalTradeUSDValue: 11,
        })
      );

      const nextDaySwaps = await DailySwapsModel.findOne({
        address: testWallet.address,
        date: nextDay.startOf('day').toDate(),
      });

      expect(nextDaySwaps).toEqual(
        expect.objectContaining<Partial<IDailySwaps>>({
          date: nextDay.startOf('day').toDate(),
          totalTradeUSDValue: 5,
        })
      );
    });

    it('applies bonus', async () => {
      const mockDayjs = jest.spyOn(dayjs, 'utc');

      let testRes: ServerInjectResponse;
      testRes = await makeRegisterRequest({
        address: testWallet.address,
        tradeUSDValue: 10,
      });

      expect(testRes.result).toEqual<Awaited<RegisterDailySwapResponse>>({
        claimedFragments: DAILY_SWAPS_MULTIPLAND,
        totalTradeUSDValue: 10,
      });

      mockDayjs.mockReturnValue(dayjs.utc().add(1, 'day'));
      testRes = await makeRegisterRequest({
        address: testWallet.address,
        tradeUSDValue: 10,
      });

      expect(testRes.result).toEqual<Awaited<RegisterDailySwapResponse>>({
        claimedFragments: 2,
        totalTradeUSDValue: 10,
      });

      mockDayjs.mockReturnValue(dayjs.utc().add(2, 'days'));
      testRes = await makeRegisterRequest({
        address: testWallet.address,
        tradeUSDValue: 10,
      });

      expect(testRes.result).toEqual<Awaited<RegisterDailySwapResponse>>({
        claimedFragments: 3,
        totalTradeUSDValue: 10,
      });
    });
  });
});
