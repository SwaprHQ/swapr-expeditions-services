import { WeeklyFragmentModel } from '../../models/WeeklyFragment.model';
import type { CurrentWeekInformation } from '../../utils';
import { MultichainSubgraphService } from '../MultichainSubgraph.service';

export interface WeeklyFragmentsBase {
  claimableFragments: number;
  claimedFragments: number;
  totalAmountUSD: number;
}

export interface GetWeeklyRewardsParams {
  address: string;
  week: CurrentWeekInformation;
}

export interface WeeklyFragmentServiceParams {
  multichainSubgraphService: MultichainSubgraphService;
  weeklyFragmentModel: WeeklyFragmentModel;
}

export interface IWeeklyFragmentService {
  multichainSubgraphService: MultichainSubgraphService;
  weeklyFragmentModel: WeeklyFragmentModel;
  getLiquidityProvisionWeekRewards(
    params: GetWeeklyRewardsParams
  ): Promise<WeeklyFragmentsBase>;
  getLiquidityStakingWeekRewards(
    params: GetWeeklyRewardsParams
  ): Promise<WeeklyFragmentsBase>;
}

