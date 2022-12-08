import MongooseDelete from 'mongoose-delete';
import { model, Schema } from 'mongoose';
import { isAddress } from '@ethersproject/address';

import { CampaignModelName } from './Campaign.model';
import { IReward, RarityType } from '../interfaces/IReward.interface';

export const RewardSchema = new Schema<IReward>(
  {
    nftAddress: {
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
    name: {
      type: Schema.Types.String,
      required: true,
    },
    description: {
      type: Schema.Types.String,
      required: true,
    },
    requiredFragments: {
      type: Schema.Types.Number,
      required: true,
      min: 0,
    },
    rarity: {
      type: Schema.Types.String,
      enum: [
        RarityType.COMMON,
        RarityType.UNCOMMON,
        RarityType.RARE,
        RarityType.EPIC,
        RarityType.LEGENDARY,
      ],
      required: true,
    },
    imageURI: {
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
RewardSchema.set('toJSON', {
  virtuals: true,
}).set('toObject', {
  virtuals: true,
  transform(_, ret) {
    delete ret.deleted;
    delete ret.__v;
    delete ret.createdAt;
    delete ret.updatedAt;
    delete ret.id;
  },
});

RewardSchema.index({
  tokenId: 'text',
}).index({
  '$**': 'text',
});

RewardSchema.plugin(MongooseDelete, {
  deletedAt: true,
});

// register the model and export it
export const RewardModelName = 'Reward';
export const RewardModel = model<IReward>(RewardModelName, RewardSchema);

export type RewardModel = typeof RewardModel;
