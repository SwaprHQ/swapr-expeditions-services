import MongooseDelete from 'mongoose-delete';
import { model, Schema } from 'mongoose';
import { IVisit } from '../interfaces/IVisit.interface';
import { isAddress } from '@ethersproject/address';

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
export const VisitSchemaModel = model<IVisit>('ImageAsset', VisitSchema);

