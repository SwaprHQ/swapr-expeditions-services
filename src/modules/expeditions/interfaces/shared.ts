import { Types } from 'mongoose';

export interface AddressWithId {
  address: string;
  campaign_id: Types.ObjectId;
}
