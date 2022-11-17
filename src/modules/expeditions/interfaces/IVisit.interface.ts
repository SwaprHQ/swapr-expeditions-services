import { Types } from 'mongoose';

export interface IVisit {
  address: string;
  lastVisit: Date;
  allVisits: number;
  fragments: number;
  campaign_id: Types.ObjectId;
}
