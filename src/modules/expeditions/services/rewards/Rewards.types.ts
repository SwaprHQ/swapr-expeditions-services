import { IReward } from '../../interfaces/IReward.interface';
import { AddressWithId } from '../../interfaces/shared';
import { RewardModel } from '../../models/Reward.model';
import { RewardClaimModel } from '../../models/RewardClaim.model';
import { TasksService } from '../tasks/Tasks.service';
export interface ClaimRewardParams extends AddressWithId {
  tokenId: string;
}

export interface ClaimRewardRequest {
  payload: {
    tokenId: string;
    address: string;
    signature: string;
  };
}
export type ActiveReward = Omit<IReward, 'campaign_id'>;

export type ClaimRewardResponse = Promise<ClaimRewardResult>;
export interface RewardsServiceParams {
  rewardModel: RewardModel;
  rewardClaimModel: RewardClaimModel;
  tasksService: TasksService;
}

export interface ClaimRewardResult {
  claimSignature: string;
  nftAddress: string;
  chainId: string;
  tokenId: string;
}
