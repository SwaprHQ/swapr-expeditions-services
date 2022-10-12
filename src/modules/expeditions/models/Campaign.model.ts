import MongooseDelete from 'mongoose-delete';
import { model, Schema } from 'mongoose';

import { ICampaign } from '../interfaces/ICampaign.interface';

export const CampaignSchema = new Schema<ICampaign>(
  {
    startDate: {
      type: Schema.Types.Date,
      required: true,
    },
    endDate: {
      type: Schema.Types.Date,
      required: true,
    },
    redeemEndDate: {
      type: Schema.Types.Date,
      required: true,
    },
    initiatorAddress: {
      type: Schema.Types.String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure virtual fields are serialised.
CampaignSchema.set('toJSON', {
  virtuals: true,
}).set('toObject', {
  virtuals: true,
});

CampaignSchema.index({
  startDate: 'text',
  endDate: 'text',
}).index({
  '$**': 'text',
});

CampaignSchema.plugin(MongooseDelete, {
  deletedAt: true,
});

// register the model and export it
export const CampaignModel = model<ICampaign>('Campaign', CampaignSchema);

export type CampaignModel = typeof CampaignModel;
