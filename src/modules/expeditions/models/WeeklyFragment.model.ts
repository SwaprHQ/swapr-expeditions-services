import MongooseDelete from 'mongoose-delete';
import { model, Schema } from 'mongoose';
import { isAddress } from '@ethersproject/address';

import { CampaignModelName } from './Campaign.model';
import {
  IWeeklyFragment,
  WeeklyFragmentsType,
} from '../interfaces/IFragment.interface';

export const WeelyFragmentSchema = new Schema<IWeeklyFragment>(
  {
    address: {
      type: Schema.Types.String,
      required: true,
      validate: {
        validator: isAddress,
        message: 'Address is not valid',
      },
    },
    week: {
      type: Schema.Types.Number,
      required: true,
      validate: {
        validator: (value: number) => value > 0 && value < 53,
        message: 'Week is not valid',
      },
    },
    year: {
      type: Schema.Types.Number,
      required: true,
      validate: {
        validator: (value: number) => value >= 2022,
        message: 'Year is not valid',
      },
    },
    type: {
      type: Schema.Types.String,
      enum: [
        WeeklyFragmentsType.LIQUIDITY_PROVISION,
        WeeklyFragmentsType.LIQUIDITY_STAKING,
      ],
      required: true,
    },
    fragments: {
      type: Schema.Types.Number,
      required: true,
      min: 0,
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
WeelyFragmentSchema.set('toJSON', {
  virtuals: true,
}).set('toObject', {
  virtuals: true,
});

WeelyFragmentSchema.index({
  week: 'text',
  year: 'text',
}).index({
  '$**': 'text',
});

WeelyFragmentSchema.plugin(MongooseDelete, {
  deletedAt: true,
});

// register the model and export it
export const WeeklyFragmentModelName = 'WeelyFragment';
export const WeeklyFragmentModel = model<IWeeklyFragment>(
  WeeklyFragmentModelName,
  WeelyFragmentSchema
);

export type WeeklyFragmentModel = typeof WeeklyFragmentModel;
