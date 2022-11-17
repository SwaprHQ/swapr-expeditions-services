import { FilterQuery, HydratedDocument } from 'mongoose';
import {
  WeeklyRewardsBaseParams,
  WeeklyFragmentsBase,
  WeeklyFragmentServiceParams,
} from './WeeklyFragments.types';
import { calculateLiquidityStakingDepositUSDValue } from './WeeklyFragments.utils';
import {
  ADD_LIQUIDITY_MIN_USD_AMOUNT,
  FRAGMENTS_PER_WEEK,
} from '../../../config/config.service';

import {
  multichainSubgraphService,
  MultichainSubgraphService,
} from '../multichainSubgraph/MultichainSubgraph.service';
import { WeeklyFragmentModel } from '../../models/WeeklyFragment.model';

import {
  IWeeklyFragment,
  WeeklyFragmentsType,
} from '../../interfaces/IFragment.interface';
import { getWeekInformation } from '../../utils';
import { calculateStreakBonus } from '../../utils/calculateStreakBonus';
import { AddressWithId } from '../../interfaces/shared';
import { ClaimResult } from '../tasks/Tasks.types';

export class WeeklyFragmentsService {
  private multichainSubgraphService: MultichainSubgraphService;
  private weeklyFragmentModel: WeeklyFragmentModel;

  constructor({
    multichainSubgraphService,
    weeklyFragmentModel,
  }: WeeklyFragmentServiceParams) {
    this.multichainSubgraphService = multichainSubgraphService;
    this.weeklyFragmentModel = weeklyFragmentModel;
  }

  private async getWeeklyRewardsBaseData({
    address,
    type,
    campaign_id,
  }: WeeklyRewardsBaseParams) {
    const week = getWeekInformation();

    const returnValue: WeeklyFragmentsBase = {
      totalAmountUSD: 0,
      claimableFragments: 0,
      claimedFragments: 0,
    };

    const weeklyFragmentDocuments = await this.weeklyFragmentModel.find({
      address,
      type,
      campaign_id,
    });

    const weeklyFragmentDocument:
      | HydratedDocument<IWeeklyFragment>
      | undefined = weeklyFragmentDocuments.find(
      ({ week: weekNumber }) => weekNumber === week.weekNumber
    );

    if (weeklyFragmentDocument) {
      returnValue.claimedFragments = weeklyFragmentDocument.fragments;
    }

    const streakBonus = calculateStreakBonus(weeklyFragmentDocuments, week);

    const queryParams = {
      address,
      timestampA: week.startDate.unix(),
      timestampB: week.endDate.unix(),
    };

    return {
      queryParams,
      returnValue,
      weeklyFragmentDocument,
      streakBonus,
    };
  }

  private async getLiquidityProvisionWeekRewards({
    address,
    campaign_id,
  }: AddressWithId): Promise<WeeklyFragmentsBase> {
    const { queryParams, returnValue, streakBonus } =
      await this.getWeeklyRewardsBaseData({
        address,
        campaign_id,
        type: WeeklyFragmentsType.LIQUIDITY_PROVISION,
      });

    const liquidityProvisionList =
      await this.multichainSubgraphService.getLiquidityPositionDepositsBetweenTimestampAAndTimestampB(
        {
          ...queryParams,
          minAmountUSD: ADD_LIQUIDITY_MIN_USD_AMOUNT.toString(),
        }
      );

    // calculate the total amount of USD deposited
    returnValue.totalAmountUSD = liquidityProvisionList.reduce(
      (acc, { amountUSD }) => acc + parseInt(amountUSD || '0'),
      0
    );

    // Calculate claimable fragments for this week.
    // Add the base 50 fragments for this week
    // if the provided liquidity deposits are more than $50 USD
    if (returnValue.totalAmountUSD >= ADD_LIQUIDITY_MIN_USD_AMOUNT) {
      returnValue.claimableFragments = FRAGMENTS_PER_WEEK + streakBonus;
    }

    return returnValue;
  }

  private async getLiquidityStakingWeekRewards({
    address,
    campaign_id,
  }: AddressWithId): Promise<WeeklyFragmentsBase> {
    const { queryParams, returnValue, streakBonus } =
      await this.getWeeklyRewardsBaseData({
        address,
        campaign_id,
        type: WeeklyFragmentsType.LIQUIDITY_STAKING,
      });

    const liquidityStakingDepositList =
      await this.multichainSubgraphService.getLiquidityStakingPositionBetweenTimestampAAndTimestampB(
        queryParams
      );

    returnValue.totalAmountUSD = calculateLiquidityStakingDepositUSDValue(
      liquidityStakingDepositList
    );

    // Calculate claimable fragments for this week.
    // Add the base 50 fragments for this week
    // if the provided liquidity deposits are more than $50 USD
    if (returnValue.totalAmountUSD >= ADD_LIQUIDITY_MIN_USD_AMOUNT) {
      returnValue.claimableFragments = FRAGMENTS_PER_WEEK + streakBonus;
    }

    return returnValue;
  }

  /**
   * Returns the weekly rewards for a given address for given week.
   * @returns Weekly fragment rewards
   */
  private async getWeeklyFragmentsByType({
    address,
    type,
    campaign_id,
  }: WeeklyRewardsBaseParams) {
    switch (type) {
      case WeeklyFragmentsType.LIQUIDITY_PROVISION:
        return this.getLiquidityProvisionWeekRewards({
          address,
          campaign_id,
        });
      case WeeklyFragmentsType.LIQUIDITY_STAKING:
        return this.getLiquidityStakingWeekRewards({
          address,
          campaign_id,
        });
      default:
        throw Error('Invalid type');
    }
  }

  async getWeeklyFragments({ address, campaign_id }: AddressWithId) {
    const liquidityStaking = await this.getWeeklyFragmentsByType({
      address,
      campaign_id,
      type: WeeklyFragmentsType.LIQUIDITY_STAKING,
    });
    const liquidityProvision = await this.getWeeklyFragmentsByType({
      address,
      campaign_id,
      type: WeeklyFragmentsType.LIQUIDITY_PROVISION,
    });

    return { liquidityStaking, liquidityProvision };
  }

  async getTotalClaimedFragments({ address, campaign_id }: AddressWithId) {
    const weeklyFragmentDocuments = await this.weeklyFragmentModel.find({
      address,
      campaign_id,
    });

    return weeklyFragmentDocuments.reduce(
      (claimedFragments, weeklyFragment) =>
        (claimedFragments += weeklyFragment.fragments),
      0
    );
  }

  async claimWeeklyFragments({
    address,
    type,
    campaign_id,
  }: WeeklyRewardsBaseParams): Promise<ClaimResult> {
    // Fetch the weekly fragment information
    const currentWeek = getWeekInformation();
    const weekRewards = await this.getWeeklyFragmentsByType({
      address,
      type,
      campaign_id,
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
      campaign_id,
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
      type,
      claimedFragments: weekRewards.claimableFragments,
    };
  }
}

export const weeklyFragmentsService = new WeeklyFragmentsService({
  multichainSubgraphService,
  weeklyFragmentModel: WeeklyFragmentModel,
});
