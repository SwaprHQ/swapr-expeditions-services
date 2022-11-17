import MongooseDelete from 'mongoose-delete';
import { model, Schema } from 'mongoose';
import { isAddress } from '@ethersproject/address';
import { CampaignModelName } from './Campaign.model';
import { IVisit } from '../interfaces/IVisit.interface';

export const VisitSchema = new Schema<IVisit>(
  {
    address: {
      type: Schema.Types.String,
      required: true,
      validate: {
        validator: isAddress,
        message: 'Address is not valid',
      },
    },
    lastVisit: {
      type: Schema.Types.Date,
      required: true,
    },
    allVisits: {
      type: Schema.Types.Number,
      required: true,
      default: 0,
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
VisitSchema.set('toJSON', {
  virtuals: true,
}).set('toObject', {
  virtuals: true,
});

VisitSchema.index({
  name: 'text',
}).index({
  '$**': 'text',
});

VisitSchema.plugin(MongooseDelete, {
  deletedAt: true,
});

// register the model and export it
export const VisitModelName = 'Visit';
export const VisitModel = model<IVisit>(VisitModelName, VisitSchema);
export type VisitModel = typeof VisitModel;
