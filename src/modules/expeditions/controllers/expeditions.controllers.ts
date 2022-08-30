import { captureException } from '@sentry/node';
import Boom from '@hapi/boom';
import { verifyMessage } from '@ethersproject/wallet';
import dayjs from 'dayjs';

import { VisitModel } from '../models';
import { SIGNATURE_TEXT_PAYLOAD } from '../../config/config.service';
import { MultichainSubgraphService } from '../services/MultichainSubgraph.service';
import { WeeklyFragmentService } from '../services/weekly-fragments';
import { getWeekInformation } from '../utils/week';
import { WeeklyFragmentModel } from '../models/WeeklyFragment.model';
import { WeeklyFragmentType } from '../interfaces/IFragment.interface';
import {
  ClaimFragmentsRequest,
  ClaimWeeklyFragmentsResponse,
  GetDailyVisitFragmentsResponse,
  GetFragmentsRequest,
  ClaimDailyVisitFragmentsResponse,
  GetWeeklyFragmentsResponse,
} from './types';

/**
 * Get daily visits for a given address
 */
export async function getDailyVisitFragments(
  req: GetFragmentsRequest
): Promise<GetDailyVisitFragmentsResponse> {
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
 * Claim daily visits fragments
 */
export async function claimDailyVisitFragments(
  req: ClaimFragmentsRequest
): Promise<ClaimDailyVisitFragmentsResponse> {
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

/**
 * Returns the weekly rewards for a given address
 */
export async function getWeeklyFragments(
  req: GetFragmentsRequest
): Promise<GetWeeklyFragmentsResponse> {
  try {
    const { address, week } = req.query;

    // Get this week's information
    const currentWeek = getWeekInformation(week);

    const weeklyFragmentService = new WeeklyFragmentService({
      multichainSubgraphService: new MultichainSubgraphService(),
      weeklyFragmentModel: WeeklyFragmentModel,
    });

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

/**
 * Claims the weekly fragments for liquidity position deposits
 */
export async function claimWeeklyLiquidityProvisionFragments(
  req: ClaimFragmentsRequest
): Promise<ClaimWeeklyFragmentsResponse> {
  try {
    const { signature } = req.payload;

    // Get the address and use the lowercase version
    const address = verifyMessage(
      SIGNATURE_TEXT_PAYLOAD,
      signature
    ).toLowerCase();

    // Fetch the weekly fragment informationx
    const currentWeek = getWeekInformation();
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
      fragmentType: WeeklyFragmentType.LIQUIDITY_PROVISION,
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

