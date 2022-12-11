import { Wallet } from 'ethers';
import type { TypedDataDomain } from '@ethersproject/abstract-signer';
import {
  ActiveReward,
  ClaimRewardParams,
  ClaimRewardResult,
  RewardsServiceParams,
} from './Rewards.types';
import { RewardModel } from '../../models/Reward.model';
import { RewardClaimModel } from '../../models/RewardClaim.model';
import { TasksService, tasksService } from '../tasks/Tasks.service';
import {
  DOMAIN_CHAIN_ID,
  DOMAIN_NAME,
  DOMAIN_VERIFYING_CONTRACT,
  DOMAIN_VERSION,
  TOKEN_EMITTER_PRIVATE_KEY,
} from '../../../config/config.service';
import { AddressWithId } from '../../interfaces/shared';

export class RewardsService {
  private rewardModel: RewardModel;
  private rewardClaimModel: RewardClaimModel;
  private tasksService: TasksService;

  constructor({
    rewardModel,
    rewardClaimModel,
    tasksService,
  }: RewardsServiceParams) {
    this.rewardModel = rewardModel;
    this.rewardClaimModel = rewardClaimModel;
    this.tasksService = tasksService;
  }

  async getActiveRewards({
    campaign_id,
  }: Pick<AddressWithId, 'campaign_id'>): Promise<ActiveReward[]> {
    const rewards = await this.rewardModel.find({ campaign_id });

    return rewards.map(reward => {
      const { _id, campaign_id, ...rest } = reward.toObject();
      return rest;
    });
  }

  async claim({
    address,
    campaign_id,
    tokenId,
  }: ClaimRewardParams): Promise<ClaimRewardResult> {
    const rewardToClaim = await this.rewardModel.findOne({
      tokenId,
      campaign_id,
    });

    if (!rewardToClaim) {
      throw new Error('Reward not found');
    }

    const existingRewardClaim = await this.rewardClaimModel.findOne({
      tokenId,
      receiverAddress: address,
      campaign_id,
    });

    if (existingRewardClaim) {
      const { domainChainId, domainVerifyingContract, claimSignature } =
        existingRewardClaim;

      return {
        tokenId,
        chainId: domainChainId,
        nftAddress: domainVerifyingContract,
        claimSignature,
      };
    }

    const claimedFragmentsBalance = await this.tasksService.getClaimedFragments(
      { address, campaign_id }
    );

    if (claimedFragmentsBalance < rewardToClaim.requiredFragments) {
      throw new Error('Not enough fragments to claim reward');
    }

    const generatedClaimSignature = await this.generateClaimSignature({
      tokenId,
      receiver: address,
    });

    await new RewardClaimModel({
      campaign_id,
      ...generatedClaimSignature,
    }).save();

    return {
      tokenId,
      chainId: generatedClaimSignature.domainChainId,
      nftAddress: generatedClaimSignature.domainVerifyingContract,
      claimSignature: generatedClaimSignature.claimSignature,
    };
  }

  private async generateClaimSignature({
    tokenId,
    receiver,
  }: {
    tokenId: string;
    receiver: string;
  }) {
    if (
      !TOKEN_EMITTER_PRIVATE_KEY ||
      !DOMAIN_NAME ||
      !DOMAIN_VERSION ||
      !DOMAIN_CHAIN_ID ||
      !DOMAIN_VERIFYING_CONTRACT
    ) {
      throw new Error('Missing domain/tokenEmitter config');
    }

    const tokenEmitter = new Wallet(TOKEN_EMITTER_PRIVATE_KEY);

    const domain: TypedDataDomain = {
      name: DOMAIN_NAME,
      version: DOMAIN_VERSION,
      chainId: DOMAIN_CHAIN_ID,
      verifyingContract: DOMAIN_VERIFYING_CONTRACT,
    };

    const types = {
      ClaimingData: [
        { name: 'receiver', type: 'address' },
        { name: 'tokenId', type: 'uint256' },
      ],
    };

    const data = {
      tokenId,
      receiver,
    };

    const claimSignature = await tokenEmitter._signTypedData(
      domain,
      types,
      data
    );

    return {
      domainChainId: DOMAIN_CHAIN_ID,
      domainName: DOMAIN_NAME,
      domainVerifyingContract: DOMAIN_VERIFYING_CONTRACT,
      domainVersion: DOMAIN_VERSION,
      receiverAddress: receiver,
      claimSignature,
      tokenEmitterAddress: tokenEmitter.address,
      tokenId,
    };
  }
}
export const rewardsService = new RewardsService({
  rewardModel: RewardModel,
  rewardClaimModel: RewardClaimModel,
  tasksService,
});
