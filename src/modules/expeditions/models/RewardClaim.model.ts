import MongooseDelete from 'mongoose-delete';
import { model, Schema } from 'mongoose';
import { isAddress } from '@ethersproject/address';

import { CampaignModelName } from './Campaign.model';
import { IRewardClaim } from '../interfaces/IRewardClaim.interface';

export const RewardClaimSchema = new Schema<IRewardClaim>(
  {
    domainName: {
      type: Schema.Types.String,
      required: true,
    },
    domainVersion: {
      type: Schema.Types.String,
      required: true,
    },
    domainChainId: {
      type: Schema.Types.String,
      required: true,
    },
    domainVerifyingContract: {
      type: Schema.Types.String,
      required: true,
      validate: {
        validator: isAddress,
        message: 'Address is not valid',
      },
    },
    receiverAddress: {
      type: Schema.Types.String,
      required: true,
      validate: {
        validator: isAddress,
        message: 'Address is not valid',
      },
    },
    tokenId: {
      type: Schema.Types.String,
      required: true,
      validate: {
        validator: (value: string) => !isNaN(Number(value)),
        message: 'TokenId must be convertable to number',
      },
    },
    tokenEmitterAddress: {
      type: Schema.Types.String,
      required: true,
      validate: {
        validator: isAddress,
        message: 'Address is not valid',
      },
    },
    claimSignature: {
      type: Schema.Types.String,
      required: true,
    },
    campaign_id: {
      type: Schema.Types.ObjectId,
      ref: CampaignModelName,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure virtual fields are serialised.
RewardClaimSchema.set('toJSON', {
  virtuals: true,
}).set('toObject', {
  virtuals: true,
});

RewardClaimSchema.index({
  receiverAddress: 'text',
  tokenId: 'text',
}).index({
  '$**': 'text',
});

RewardClaimSchema.plugin(MongooseDelete, {
  deletedAt: true,
});

// register the model and export it
export const RewardClaimModelName = 'RewardClaim';
export const RewardClaimModel = model<IRewardClaim>(
  RewardClaimModelName,
  RewardClaimSchema
);

export type RewardClaimModel = typeof RewardClaimModel;
