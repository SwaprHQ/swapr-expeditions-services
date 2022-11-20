import { Types } from 'mongoose';

export interface IDailySwaps {
  address: string;
  date: Date;
  fragments: number;
  totalTradeUSDValue: number;
  campaign_id: Types.ObjectId;
}
