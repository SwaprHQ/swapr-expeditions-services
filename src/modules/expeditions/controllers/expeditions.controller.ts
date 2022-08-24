import { captureException } from '@sentry/node';
import Boom from '@hapi/boom';
import { verifyMessage } from '@ethersproject/wallet';
import dayjs from 'dayjs';

import { VisitModel } from '../models';
import { SIGNATURE_TEXT_PAYLOAD } from '../../config/config.service';
import { MultichainSubgraphService } from '../services/MultichainSubgraph.service';
import { APIGeneralResponse } from 'src/modules/shared/interfaces/response.interface';
import { WeeklyFragmentService } from '../services/WeeklyFragments.service';
import { getCurrentWeekInformation } from '../utils/week';
import { WeeklyFragmentModel } from '../models/WeeklyFragment.model';
import { WeeklyFragmentType } from '../interfaces/IFragment.interface';
import {
  IAddDailyVisitsRequest,
  IAddDailyVisitsResponse,
  IClaimWeeklyRewardsRequest,
  IGetDailyVisitsRequest,
  IGetDailyVisitsResponse,
  IGetWeeklyRewardsRequest,
} from './types';

/**
 * Get daily visits for a given address
 */
export async function getDailyVisitsController(
  req: IGetDailyVisitsRequest
): Promise<IGetDailyVisitsResponse> {
  try {
    const { address } = req.query;

    const lastVisitDocument = await VisitModel.findOne({
      address,
    });

    const lastVisit = lastVisitDocument?.lastVisit || 0;
    const allVisits = lastVisitDocument?.allVisits || 0;

    return {
      data: {
        address,
        allVisits,
        lastVisit,
      },
    };
  } catch (error) {
    console.log(error);
    captureException(error);
    throw Boom.badRequest(error);
  }
}

/**
 * Add daily visits for a given address
 */
export async function addDailyVisitsController(
  req: IAddDailyVisitsRequest
): Promise<IAddDailyVisitsResponse> {
  try {
    const { signature, address } = req.payload;
    const addressFromSignature = verifyMessage(
      SIGNATURE_TEXT_PAYLOAD,
      signature
    );

    if (addressFromSignature !== address) {
      throw new Error('Invalid signature');
    }

    const lastVisitDocument = await VisitModel.findOne({
      address,
    });

    if (lastVisitDocument != null) {
      const diffBetweenLastVisitAndNow = dayjs
        .utc()
        .diff(lastVisitDocument.lastVisit);
      if (diffBetweenLastVisitAndNow < 24 * 60 * 60 * 1000) {
        throw new Error('Daily visit already recorded');
      }
    }

    const lastVisit = dayjs.utc().toDate();
    const allVisits = lastVisitDocument ? lastVisitDocument.allVisits + 1 : 1;

    // Record the new visit
    await VisitModel.updateOne(
      {
        address,
      },
      {
        address,
        lastVisit,
        allVisits,
      },
      {
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    // Return the new visit
    return {
      data: {
        address,
        lastVisit,
        allVisits,
      },
    };
  } catch (error) {
    console.log(error);
    captureException(error);
    throw Boom.badRequest(error);
  }
}

type GetWeeklyLiquidityPositionDepositsResponse = APIGeneralResponse<{
  liquidityDeposits: any[];
  totalAmountUSD: number;
  claimableFragments: number;
  claimedFragments: number;
}>;

/**
 * Returns the weekly liquidity rewards for a given address
 * @param req
 * @returns
 */
export async function getWeeklyLiquidityPositionDeposits(
  req: IGetWeeklyRewardsRequest
): Promise<GetWeeklyLiquidityPositionDepositsResponse> {
  try {
    let { address } = req.query;
    address = address.toLowerCase();

    const currentWeek = getCurrentWeekInformation();

    const weeklyFragmentService = new WeeklyFragmentService({
      multichainSubgraphService: new MultichainSubgraphService(),
      weeklyFragmentModel: WeeklyFragmentModel,
    });

    const weeklyRewardData = await weeklyFragmentService.getLiquidityProvisionWeekRewards(
      {
        address,
        week: currentWeek,
      }
    );

    return {
      data: weeklyRewardData,
    };
  } catch (error) {
    console.log(error);
    captureException(error);
    throw Boom.badRequest(error);
  }
}

type ClaimWeeklyFragmentsForLiquidityPositionDepositsResponse = APIGeneralResponse<{
  claimedFragments: number;
}>;

/**
 * Claims the weekly fragments for liquidity position deposits
 */
export async function claimWeeklyFragmentsForLiquidityPositionDeposits(
  req: IClaimWeeklyRewardsRequest
): Promise<ClaimWeeklyFragmentsForLiquidityPositionDepositsResponse> {
  try {
    const { signature } = req.payload;

    // Get the address and use the lowercase version
    const address = verifyMessage(
      SIGNATURE_TEXT_PAYLOAD,
      signature
    ).toLowerCase();

    // Fetch the weekly fragment informationx
    const currentWeek = getCurrentWeekInformation();
    const weeklyFragmentService = new WeeklyFragmentService({
      multichainSubgraphService: new MultichainSubgraphService(),
      weeklyFragmentModel: WeeklyFragmentModel,
    });

    const weekRewards = await weeklyFragmentService.getLiquidityProvisionWeekRewards(
      {
        address,
        week: currentWeek,
      }
    );

    // Store the claimed fragments
    const currentWeeklyFragment = await WeeklyFragmentModel.findOne({
      address,
      week: currentWeek.weekNumber,
    });

    if (currentWeeklyFragment != null) {
      throw new Error('Weekly fragment already claimed');
    }

    if (weekRewards.claimableFragments === 0) {
      throw new Error('No claimable fragments');
    }

    await new WeeklyFragmentModel({
      address,
      type: WeeklyFragmentType.LIQUIDITY_PROVISION,
      week: currentWeek.weekNumber,
      fragments: weekRewards.claimableFragments,
    }).save();

    return {
      data: {
        claimedFragments: weekRewards.claimableFragments,
      },
    };
  } catch (error) {
    console.log(error);
    captureException(error);
    throw Boom.badRequest(error);
  }
}

type IGetWeeklyRewardsResponse = APIGeneralResponse<{
  liquidityProvision: Awaited<
    ReturnType<
      InstanceType<
        typeof WeeklyFragmentService
      >['getLiquidityProvisionWeekRewards']
    >
  >;
  liquidityStaking: Awaited<
    ReturnType<
      InstanceType<
        typeof WeeklyFragmentService
      >['getLiquidityStakingWeekRewards']
    >
  >;
}>;

/**
 * Returns the weekly rewards for a given address
 */
export async function getWeeklyRewardsFragmentsState(
  req: IGetDailyVisitsRequest
): Promise<IGetWeeklyRewardsResponse> {
  try {
    const { address } = req.query;

    const weeklyFragmentService = new WeeklyFragmentService({
      multichainSubgraphService: new MultichainSubgraphService(),
      weeklyFragmentModel: WeeklyFragmentModel,
    });

    const currentWeek = getCurrentWeekInformation();

    const liquidityProvision = await weeklyFragmentService.getLiquidityProvisionWeekRewards(
      {
        address,
        week: currentWeek,
      }
    );

    const liquidityStaking = await weeklyFragmentService.getLiquidityStakingWeekRewards(
      {
        address,
        week: currentWeek,
      }
    );

    return {
      data: {
        liquidityProvision,
        liquidityStaking,
      },
    };
  } catch (error) {
    console.log(error);
    captureException(error);
    throw Boom.badRequest(error);
  }
}

