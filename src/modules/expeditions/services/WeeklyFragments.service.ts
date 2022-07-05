import {
  ADD_LIQUIDITY_MIN_USD_AMOUNT,
  FRAGMENTS_PER_WEEK,
} from '../../config/config.service';
import { CurrentWeekInformation } from '../utils/week';

import type { MultichainSubgraphService } from './MultichainSubgraph.service';
import type { WeeklyFragmentModel } from '../models/WeeklyFragment.model';

interface WeeklyFragmentRewards {
  claimableFragments: number;
  claimedFragments: number;
  totalAmountUSD: number;
  liquidityDeposits: any[];
}

interface GetWeeklyRewardsParams {
  address: string;
  week: CurrentWeekInformation;
}

interface WeeklyFragmentServiceParams {
  multichainSubgraphService: MultichainSubgraphService;
  weeklyFragmentModel: WeeklyFragmentModel;
}

export class WeeklyFragmentService {
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
  }: GetWeeklyRewardsParams): Promise<WeeklyFragmentRewards> {
    // Return value
    const returnValue: WeeklyFragmentRewards = {
      totalAmountUSD: 0,
      liquidityDeposits: [],
      claimableFragments: 0,
      claimedFragments: 0,
    };

    const queryParams = {
      address,
      minAmountUSD: ADD_LIQUIDITY_MIN_USD_AMOUNT.toString(),
      timestampA: week.startDate.unix(),
      timestampB: week.endDate.unix(),
    };

    returnValue.liquidityDeposits = await this.multichainSubgraphService.getLiquidityPositionDepositsBetweenTimestampAAndTimestampB(
      queryParams
    );

    // calculate the total amount of USD deposited
    const totalAmountUSD: number = returnValue.liquidityDeposits.reduce(
      (acc, { amountUSD }) => acc + parseInt(amountUSD || '0'),
      0
    );

    // Calculate claimable fragments for this week.
    // Add the base 50 fragments for this week
    // if the provided liquidity deposits are more than $50 USD
    if (totalAmountUSD > ADD_LIQUIDITY_MIN_USD_AMOUNT) {
      returnValue.claimableFragments = FRAGMENTS_PER_WEEK;
    }

    return returnValue;
  }
}

