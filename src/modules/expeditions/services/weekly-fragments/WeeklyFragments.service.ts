import {
  ADD_LIQUIDITY_MIN_USD_AMOUNT,
  FRAGMENTS_PER_WEEK,
} from '../../../config/config.service';

import type { MultichainSubgraphService } from '../MultichainSubgraph.service';
import type { WeeklyFragmentModel } from '../../models/WeeklyFragment.model';

import {
  GetWeeklyRewardsParams,
  IWeeklyFragmentService,
  WeeklyFragmentsBase,
  WeeklyFragmentServiceParams,
} from './WeeklyFragments.types';

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
    // Return value
    const returnValue: WeeklyFragmentsBase = {
      totalAmountUSD: 0,
      claimableFragments: 0,
      claimedFragments: 0,
    };

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
    if (returnValue.totalAmountUSD > ADD_LIQUIDITY_MIN_USD_AMOUNT) {
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
    // Return value
    const returnValue: WeeklyFragmentsBase = {
      totalAmountUSD: 0,
      claimableFragments: 0,
      claimedFragments: 0,
    };

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

    // calculate the total amount of USD deposited
    returnValue.totalAmountUSD = liquidityStakingDepositList.reduce(
      (total, liquidityStakingDeposit) => {
        // Compute the USD value of the staking position
        if (liquidityStakingDeposit.__typename === 'Deposit') {
          const { totalSupply, reserveUSD } =
            liquidityStakingDeposit.liquidityMiningCampaign.stakablePair;

          total =
            total +
            (parseFloat(liquidityStakingDeposit.amount) /
              parseFloat(totalSupply)) *
              reserveUSD;
        }

        return total;
      },
      0
    );

    // Calculate claimable fragments for this week.
    // Add the base 50 fragments for this week
    // if the provided liquidity deposits are more than $50 USD
    if (returnValue.totalAmountUSD > ADD_LIQUIDITY_MIN_USD_AMOUNT) {
      returnValue.claimableFragments = FRAGMENTS_PER_WEEK;
    }

    return returnValue;
  }
}
