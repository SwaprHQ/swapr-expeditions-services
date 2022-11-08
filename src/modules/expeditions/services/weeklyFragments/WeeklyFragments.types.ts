import { WeeklyFragmentsType } from '../../interfaces/IFragment.interface';
import { AddressWithId } from '../../interfaces/shared';
import { WeeklyFragmentModel } from '../../models/WeeklyFragment.model';
import { MultichainSubgraphService } from '../multichainSubgraph/MultichainSubgraph.service';

export interface RewardsBaseParams extends AddressWithId {
  type: WeeklyFragmentsType;
}
export interface WeeklyFragmentsBase {
  claimableFragments: number;
  claimedFragments: number;
  totalAmountUSD: number;
}

export interface WeeklyFragmentServiceParams {
  multichainSubgraphService: MultichainSubgraphService;
  weeklyFragmentModel: WeeklyFragmentModel;
}
