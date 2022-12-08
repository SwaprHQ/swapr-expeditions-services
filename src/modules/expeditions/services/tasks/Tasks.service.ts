import {
  ActiveTasks,
  ClaimTaskParams,
  ClaimTaskResult,
  TasksServiceParams,
  TasksTypes,
} from './Tasks.types';
import { AddressWithId } from '../../interfaces/shared';
import { getWeekInformation } from '../../utils';
import {
  DailyFragmentsService,
  dailyFragmentsService,
} from '../dailyFragments/DailyFragments.service';
import {
  weeklyFragmentsService,
  WeeklyFragmentsService,
} from '../weeklyFragments/WeeklyFragments.service';
import { RegisterDailySwapParams } from '../dailyFragments/DailyFragments.types';

export class TasksService {
  private weeklyFragmentsService: WeeklyFragmentsService;
  private dailyFragmentsService: DailyFragmentsService;

  constructor({
    weeklyFragmentsService,
    dailyFragmentsService,
  }: TasksServiceParams) {
    this.weeklyFragmentsService = weeklyFragmentsService;
    this.dailyFragmentsService = dailyFragmentsService;
  }

  async getActiveTasks({
    address,
    campaign_id,
  }: AddressWithId): Promise<ActiveTasks> {
    const currentWeek = getWeekInformation();
    const { liquidityProvision, liquidityStaking } =
      await this.weeklyFragmentsService.getWeeklyFragments({
        address,
        campaign_id,
      });
    const dailyVisit = await this.dailyFragmentsService.getDailyVisitFragments({
      address,
      campaign_id,
    });

    const startDate = currentWeek.startDate.toDate();
    const endDate = currentWeek.endDate.toDate();

    return {
      dailyVisit: {
        ...dailyVisit,
        type: TasksTypes.VISIT,
      },
      liquidityProvision: {
        ...liquidityProvision,
        startDate,
        endDate,
        type: TasksTypes.LIQUIDITY_PROVISION,
      },
      liquidityStaking: {
        ...liquidityStaking,
        startDate,
        endDate,
        type: TasksTypes.LIQUIDITY_STAKING,
      },
    };
  }

  async getClaimedFragments({
    address,
    campaign_id,
  }: AddressWithId): Promise<number> {
    const weeklyFragments =
      await this.weeklyFragmentsService.getTotalClaimedFragments({
        address,
        campaign_id,
      });

    const dailyFragments =
      await this.dailyFragmentsService.getTotalClaimedFragments({
        address,
        campaign_id,
      });

    return weeklyFragments + dailyFragments;
  }

  async claim({
    address,
    type,
    campaign_id,
  }: ClaimTaskParams): Promise<ClaimTaskResult> {
    switch (type) {
      case TasksTypes.VISIT:
        return this.dailyFragmentsService.claimDailyVisitFragments({
          address,
          campaign_id,
        });
      case TasksTypes.LIQUIDITY_PROVISION:
      case TasksTypes.LIQUIDITY_STAKING:
        return this.weeklyFragmentsService.claimWeeklyFragments({
          address,
          type,
          campaign_id,
        });
      default:
        throw new Error('Task not claimable');
    }
  }

  async registerDailySwap(params: RegisterDailySwapParams) {
    return await this.dailyFragmentsService.registerDailySwap(params);
  }
}

export const tasksService = new TasksService({
  weeklyFragmentsService: weeklyFragmentsService,
  dailyFragmentsService: dailyFragmentsService,
});
