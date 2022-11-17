import { IVisit } from '../../interfaces/IVisit.interface';
import { AddressWithId } from '../../interfaces/shared';
import { VisitModel } from '../../models/Visit.model';

export enum DailyFragmentsTypes {
  VISIT = 'DAILY_VISIT',
}

export interface DailyRewardsBaseParams extends AddressWithId {
  type: DailyFragmentsTypes;
}

export interface DailyFragmentsServiceParams {
  visitModel: VisitModel;
}

export type DailyFragments = Pick<IVisit, 'allVisits' | 'fragments'> & {
  lastVisit: Date | number;
  nextVisit: Date;
};
