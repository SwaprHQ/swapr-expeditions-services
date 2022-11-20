import MongooseDelete from 'mongoose-delete';
import { model, Schema } from 'mongoose';

import { isAddress } from '@ethersproject/address';
import { CampaignModelName } from './Campaign.model';
import { IDailySwaps } from '../interfaces/IDailySwaps.interface';

export const DailySwapsSchema = new Schema<IDailySwaps>(
  {
    address: {
      type: Schema.Types.String,
      required: true,
      validate: {
        validator: isAddress,
        message: 'Address is not valid',
      },
    },
    date: {
      type: Schema.Types.Date,
      required: true,
    },
    fragments: {
      type: Schema.Types.Number,
      required: true,
      min: 0,
    },
    totalTradeUSDValue: {
      type: Schema.Types.Number,
      required: true,
      default: 0,
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
DailySwapsSchema.set('toJSON', {
  virtuals: true,
}).set('toObject', {
  virtuals: true,
});

DailySwapsSchema.index({
  date: 'text',
}).index({
  '$**': 'text',
});

DailySwapsSchema.plugin(MongooseDelete, {
  deletedAt: true,
});

export const DailySwapsModelName = 'DailySwap';
export const DailySwapsModel = model<IDailySwaps>(
  DailySwapsModelName,
  DailySwapsSchema
);

export type DailySwapsModel = typeof DailySwapsModel;
