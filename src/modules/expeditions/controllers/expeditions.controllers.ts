import { captureException } from '@sentry/node';
import Boom from '@hapi/boom';
import dayjs from 'dayjs';

import { VisitModel } from '../models';
import { weeklyFragmentService } from '../services/weekly-fragments';
import { getWeekInformation } from '../utils/week';
import { WeeklyFragmentModel } from '../models/WeeklyFragment.model';

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
import { IWeeklyFragment } from '../interfaces/IFragment.interface';
import { FilterQuery } from 'mongoose';
import { validateSignature } from '../utils/validateSignature';
import { CampaignModel } from '../models/Campaign.model';
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
      address,
      allVisits,
      lastVisit,
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

    validateSignature({
      address,
      signature,
      message: CLAIM_DAILY_VISIT_FRAGMENTS_MESSAGE,
    });

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
      address,
      lastVisit,
      allVisits,
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

    // Fetch the weekly fragment informationx
    const currentWeek = getWeekInformation();
    const weekRewards = await weeklyFragmentService.getWeeklyFragments({
      address,
      week: currentWeek,
      type,
    });

    if (weekRewards.claimableFragments === 0) {
      throw new Error('No claimable fragments');
    }

    // Criteria for claiming the weekly fragments
    const searchParams: FilterQuery<IWeeklyFragment> = {
      address,
      week: currentWeek.weekNumber,
      year: currentWeek.year,
      type,
    };

    // Search for existing weekly fragment
    const currentWeeklyFragment = await WeeklyFragmentModel.findOne(
      searchParams
    );

    if (currentWeeklyFragment != null) {
      throw new Error(
        `Weekly fragment for ${type} for ${currentWeek.weekDate} already claimed`
      );
    }

    await new WeeklyFragmentModel({
      ...searchParams,
      type,
      fragments: weekRewards.claimableFragments,
    }).save();

    return {
      claimedFragments: weekRewards.claimableFragments,
    };
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

    const overlappingCampaigns = await CampaignModel.find({
      $or: [
        {
          $and: [
            { startDate: { $gte: startDate } },
            { redeemEndDate: { $lte: redeemEndDate } },
          ],
        },
        {
          $and: [
            { redeemEndDate: { $gte: startDate } },
            { redeemEndDate: { $lte: redeemEndDate } },
          ],
        },
        {
          $and: [
            { startDate: { $gte: startDate } },
            { startDate: { $lte: redeemEndDate } },
          ],
        },
        {
          $and: [
            { startDate: { $lte: startDate } },
            { redeemEndDate: { $gte: redeemEndDate } },
          ],
        },
      ],
    });

    if (overlappingCampaigns.length > 0) {
      throw new Error('Overlapping campaign already exists.');
    }

    const newCampaign = new CampaignModel({
      startDate,
      endDate,
      redeemEndDate,
      initiatorAddress: address,
    });

    await newCampaign.save();

    return {};
  } catch (error) {
    console.log(error);
    captureException(error);
    throw Boom.badRequest(error);
  }
}
