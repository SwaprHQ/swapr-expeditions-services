import { WeeklyFragmentType } from '../../interfaces/IFragment.interface';
import { WeeklyFragmentModel } from '../../models/WeeklyFragment.model';
import type { WeekInformation } from '../../utils';
import { MultichainSubgraphService } from '../MultichainSubgraph.service';

export interface WeeklyFragmentsBase {
  claimableFragments: number;
  claimedFragments: number;
  totalAmountUSD: number;
}

export interface GetWeeklyRewardsParams {
  address: string;
  week: WeekInformation;
}

export interface GetWeeklyFragmentsParams {
  address: string;
  week: WeekInformation;
  type: WeeklyFragmentType;
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
