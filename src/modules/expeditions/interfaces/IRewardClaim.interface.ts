import { Types } from 'mongoose';

export interface IRewardClaim {
  domainVersion: string;
  domainName: string;
  domainChainId: string;
  domainVerifyingContract: string;
  receiverAddress: string;
  tokenId: string;
  tokenEmitterAddress: string;
  claimSignature: string;
  campaign_id: Types.ObjectId;
}
