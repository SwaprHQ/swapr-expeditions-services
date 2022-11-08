import { Types } from 'mongoose';

export enum WeeklyFragmentsType {
  LIQUIDITY_PROVISION = 'LIQUIDITY_PROVISION',
  LIQUIDITY_STAKING = 'LIQUIDITY_STAKING',
}

export interface IWeeklyFragment {
  address: string;
  /**
   * A number representing the week of the year.
   */
  week: number;
  /**
   * A number representing the year.
   */
  year: number;
  /**
   * Claimed fragments for this week.
   */
  fragments: number;
  /**
   *
   */
  type: WeeklyFragmentsType;

  campaign_id: Types.ObjectId;
}
