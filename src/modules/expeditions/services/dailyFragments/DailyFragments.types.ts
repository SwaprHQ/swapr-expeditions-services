import { VisitModel } from '../../models/Visit.model';

export enum DailyFragmentsTypes {
  VISIT = 'DAILY_VISIT',
}

export interface DailyFragmentsServiceParams {
  visitModel: VisitModel;
}

export interface DailyFragments {
  allVisits: number;
  lastVisit: number | Date;
}
