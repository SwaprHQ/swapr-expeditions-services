import { IDailySwaps } from '../../interfaces/IDailySwaps.interface';
import { IVisit } from '../../interfaces/IVisit.interface';
import { AddressWithId } from '../../interfaces/shared';
import { DailySwapsModel } from '../../models/DailySwaps.model';
import { VisitModel } from '../../models/Visit.model';

export enum DailyFragmentsTypes {
  VISIT = 'DAILY_VISIT',
  SWAPS = 'DAILY_SWAPS',
}

export interface RegisterDailySwapParams extends AddressWithId {
  tradeUSDValue: number;
}
export interface DailyFragmentsServiceParams {
  visitModel: VisitModel;
  dailySwapsModel: DailySwapsModel;
}

export type ActiveDailySwaps = Pick<
  IDailySwaps,
  'fragments' | 'totalTradeUSDValue'
> & {
  startDate: Date;
  endDate: Date;
};

export type DailyFragments = Pick<IVisit, 'allVisits' | 'fragments'> & {
  lastVisit: Date | number;
  nextVisit: Date;
};
