import { WeeklyFragmentsType } from '../../interfaces/IFragment.interface';
import { AddressWithId } from '../../interfaces/shared';
import { DailyFragmentsService } from '../dailyFragments/DailyFragments.service';
import {
  DailyFragments,
  DailyFragmentsTypes,
} from '../dailyFragments/DailyFragments.types';
import { WeeklyFragmentsBase } from '../weeklyFragments';
import { WeeklyFragmentsService } from '../weeklyFragments/WeeklyFragments.service';

export const TasksTypes = { ...WeeklyFragmentsType, ...DailyFragmentsTypes };
export type TasksTypes = WeeklyFragmentsType | DailyFragmentsTypes;

export interface ClaimRequest {
  payload: {
    type: TasksTypes;
    address: string;
    signature: string;
  };
}

export type ClaimResponse = Promise<ClaimResult>;

export interface ClaimParams extends AddressWithId {
  type: TasksTypes;
}

export interface ClaimResult {
  type: TasksTypes;
  claimedFragments: number;
}

export interface TasksServiceParams {
  weeklyFragmentsService: WeeklyFragmentsService;
  dailyFragmentsService: DailyFragmentsService;
}

type ActiveWeeklyTask<Task> = Task & {
  startDate: Date;
  endDate: Date;
  type: TasksTypes;
};

type ActiveDailyTask<Task> = Task & {
  lastVisit: Date | number;
  nextVisit: Date;
  type: TasksTypes;
};

export interface ActiveTasks {
  dailyVisit: ActiveDailyTask<DailyFragments>;
  liquidityProvision: ActiveWeeklyTask<WeeklyFragmentsBase>;
  liquidityStaking: ActiveWeeklyTask<WeeklyFragmentsBase>;
}
