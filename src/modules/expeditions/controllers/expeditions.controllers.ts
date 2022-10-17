import { captureException } from '@sentry/node';
import Boom from '@hapi/boom';
import { weeklyFragmentService } from '../services/weeklyFragments';
import { getWeekInformation } from '../utils/week';

import {
  ADD_CAMPAIGN_MESSAGE,
  CLAIM_DAILY_VISIT_FRAGMENTS_MESSAGE,
} from '../constants';
import {
  ClaimFragmentsRequest,
  ClaimWeeklyFragmentsResponse,
  GetDailyVisitFragmentsResponse,
  GetFragmentsRequest,
  ClaimDailyVisitFragmentsResponse,
  GetWeeklyFragmentsResponse,
  ClaimWeeklyFragmentsRequest,
  AddCampaignRequest,
} from './types';
import { getWeeklyFragmentMessageByType } from '../utils/messages';
import { validateSignature } from '../utils/validateSignature';
import { campaignsService } from '../services/campaigns/Campaigns.service';
import { dailyFragmentsService } from '../services/dailyFragments/DailyFragments.service';
/**
 * Get daily visits for a given address
 */
export async function getDailyVisitFragments(
  req: GetFragmentsRequest
): Promise<GetDailyVisitFragmentsResponse> {
  try {
    const { address } = req.query;

    return dailyFragmentsService.getDailyFragments({ address });
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

    validateSignature({
      address,
      signature,
      message: CLAIM_DAILY_VISIT_FRAGMENTS_MESSAGE,
    });

    return dailyFragmentsService.claimDailyFragments({ address });
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

    const getWeeklyFragmentsParams = {
      address,
      week: currentWeek,
    };

    const [liquidityProvision, liquidityStaking] = await Promise.all([
      weeklyFragmentService.getLiquidityProvisionWeekRewards(
        getWeeklyFragmentsParams
      ),
      weeklyFragmentService.getLiquidityStakingWeekRewards(
        getWeeklyFragmentsParams
      ),
    ]);

    return {
      liquidityProvision,
      liquidityStaking,
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
export async function claimWeeklyFragments(
  req: ClaimWeeklyFragmentsRequest
): Promise<ClaimWeeklyFragmentsResponse> {
  try {
    const type = req.payload.type;

    // Verify the type
    const message = getWeeklyFragmentMessageByType(type);

    if (!message) {
      throw new Error('Invalid type');
    }

    const address = req.payload.address.toLowerCase();

    validateSignature({
      address: req.payload.address,
      signature: req.payload.signature,
      message,
    });

    return weeklyFragmentService.claimWeeklyFragments({ address, type });
  } catch (error) {
    console.log(error);
    captureException(error);
    throw Boom.badRequest(error);
  }
}

export async function addCampaign(req: AddCampaignRequest): Promise<object> {
  try {
    const { signature, address, startDate, endDate, redeemEndDate } =
      req.payload;

    validateSignature({
      address,
      signature,
      message: ADD_CAMPAIGN_MESSAGE,
    });

    await campaignsService.addCampaign({
      address,
      endDate,
      startDate,
      redeemEndDate,
    });

    return {};
  } catch (error) {
    console.log(error);
    captureException(error);
    throw Boom.badRequest(error);
  }
}
