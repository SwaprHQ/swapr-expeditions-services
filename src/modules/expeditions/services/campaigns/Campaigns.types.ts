import { Request } from '@hapi/hapi';
import { ICampaign } from '../../interfaces/ICampaign.interface';
import { CampaignModel } from '../../models/Campaign.model';
import { TasksService } from '../tasks/Tasks.service';
import { ActiveTasks } from '../tasks/Tasks.types';

export interface AddCampaignRequest extends Request {
  payload: {
    startDate: Date;
    endDate: Date;
    redeemEndDate: Date;
    address: string;
    signature: string;
  };
}

export type AddCampaignResponse = Promise<ICampaign>;

export interface CampaignServiceParams {
  campaignModel: CampaignModel;
  tasksService: TasksService;
}

export interface AddCampaignParams {
  address: string;
  startDate: Date;
  endDate: Date;
  redeemEndDate: Date;
}

export interface GetCampaignProgressRequest extends Request {
  payload: {
    address: string;
  };
}

export interface CampaignProgress {
  claimedFragments: number;
  tasks: ActiveTasks;
}

export type GetCampaignProgressResponse = CampaignProgress;