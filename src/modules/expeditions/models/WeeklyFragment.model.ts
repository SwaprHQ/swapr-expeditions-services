import MongooseDelete from 'mongoose-delete';
import { model, Schema } from 'mongoose';
import { isAddress } from '@ethersproject/address';

import {
  IWeeklyFragment,
  WeeklyFragmentType,
} from '../interfaces/IFragment.interface';
import { MAX_WEEKLY_CLAIM_FRAGMENT } from '../../config/config.service';

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
        WeeklyFragmentType.LIQUIDITY_PROVISION,
        WeeklyFragmentType.LIQUIDITY_STAKING,
      ],
      required: true,
    },
    fragments: {
      type: Schema.Types.Number,
      required: true,
      max: MAX_WEEKLY_CLAIM_FRAGMENT,
      min: 0,
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
export const WeeklyFragmentModel = model<IWeeklyFragment>(
  'WeelyFragment',
  WeelyFragmentSchema
);

export type WeeklyFragmentModel = typeof WeeklyFragmentModel;

