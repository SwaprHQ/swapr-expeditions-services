import {
  ADD_LIQUIDITY_MIN_USD_AMOUNT,
  FRAGMENTS_PER_WEEK,
} from '../../../config/config.service';

import {
  multichainSubgraphService,
  MultichainSubgraphService,
} from '../MultichainSubgraph.service';
import { WeeklyFragmentModel } from '../../models/WeeklyFragment.model';

import {
  GetWeeklyFragmentsParams,
  GetWeeklyRewardsParams,
  IWeeklyFragmentService,
  WeeklyFragmentsBase,
  WeeklyFragmentServiceParams,
} from './WeeklyFragments.types';
import { WeeklyFragmentType } from '../../interfaces/IFragment.interface';
import { calculateLiquidityStakingDepositUSDValue } from './WeeklyFragments.utils';

export class WeeklyFragmentService implements IWeeklyFragmentService {
  multichainSubgraphService: MultichainSubgraphService;
  weeklyFragmentModel: WeeklyFragmentModel;

  /**
   * Create a new `WeeklyFragmentService` instance.
   */
  constructor({
    multichainSubgraphService,
    weeklyFragmentModel,
  }: WeeklyFragmentServiceParams) {
    this.multichainSubgraphService = multichainSubgraphService;
    this.weeklyFragmentModel = weeklyFragmentModel;
  }

  /**
   * Returns the weekly rewards for a given address for current week. All times are in UTC.
   * @returns {Promise<WeeklyFragmentRewards>}
   */
  async getLiquidityProvisionWeekRewards({
    address,
    week,
  }: GetWeeklyRewardsParams): Promise<WeeklyFragmentsBase> {
    // use lowercase
    address = address.toLowerCase();

    // Return value
    const returnValue: WeeklyFragmentsBase = {
      totalAmountUSD: 0,
      claimableFragments: 0,
      claimedFragments: 0,
    };

    // Check database
    const weeklyFragmentDocument = await this.weeklyFragmentModel.findOne({
      address,
      week: week.weekNumber,
      year: week.year,
      type: WeeklyFragmentType.LIQUIDITY_PROVISION,
    });

    if (weeklyFragmentDocument != null) {
      returnValue.claimedFragments = weeklyFragmentDocument.fragments;
    }

    const queryParams = {
      address,
      minAmountUSD: ADD_LIQUIDITY_MIN_USD_AMOUNT.toString(),
      timestampA: week.startDate.unix(),
      timestampB: week.endDate.unix(),
    };

    const liquidityProvisionList =
      await this.multichainSubgraphService.getLiquidityPositionDepositsBetweenTimestampAAndTimestampB(
        queryParams
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
      returnValue.claimableFragments = FRAGMENTS_PER_WEEK;
    }

    return returnValue;
  }

  /**
   * Returns the weekly rewards for a given address for current week. All times are in UTC.
   * @returns {Promise<WeeklyFragmentRewards>}
   */
  async getLiquidityStakingWeekRewards({
    address,
    week,
  }: GetWeeklyRewardsParams): Promise<WeeklyFragmentsBase> {
    // use lowercase
    address = address.toLowerCase();

    // Return value
    const returnValue: WeeklyFragmentsBase = {
      totalAmountUSD: 0,
      claimableFragments: 0,
      claimedFragments: 0,
    };

    // Check database for claimed fragments
    const weeklyFragmentDocument = await this.weeklyFragmentModel.findOne({
      address,
      week: week.weekNumber,
      year: week.year,
      type: WeeklyFragmentType.LIQUIDITY_STAKING,
    });

    if (weeklyFragmentDocument !== null) {
      returnValue.claimedFragments = weeklyFragmentDocument.fragments;
    }

    // Fetch and compute the total amount of USD
    // deposited during the week from all subgraphs
    const queryParams = {
      address,
      minAmountUSD: ADD_LIQUIDITY_MIN_USD_AMOUNT.toString(),
      timestampA: week.startDate.unix(),
      timestampB: week.endDate.unix(),
    };

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
    if (
      weeklyFragmentDocument === null &&
      returnValue.totalAmountUSD >= ADD_LIQUIDITY_MIN_USD_AMOUNT
    ) {
      returnValue.claimableFragments = FRAGMENTS_PER_WEEK;
    }

    return returnValue;
  }

  /**
   * Returns the weekly rewards for a given address for given week.
   * @returns Weekly fragment rewards
   */
  async getWeeklyFragments({
    address,
    week,
    type,
  }: GetWeeklyFragmentsParams): Promise<WeeklyFragmentsBase> {
    if (!address) {
      throw new Error('Address is required');
    }

    if (!week) {
      throw new Error('Week is required');
    }

    if (type === WeeklyFragmentType.LIQUIDITY_PROVISION) {
      return this.getLiquidityProvisionWeekRewards({
        address,
        week,
      });
    }

    if (type === WeeklyFragmentType.LIQUIDITY_STAKING) {
      return this.getLiquidityStakingWeekRewards({
        address,
        week,
      });
    }

    throw new Error('Type is required');
  }
}

export const weeklyFragmentService = new WeeklyFragmentService({
  multichainSubgraphService,
  weeklyFragmentModel: WeeklyFragmentModel,
});
