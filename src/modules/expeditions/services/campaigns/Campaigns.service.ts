import {
  AddCampaignParams,
  CampaignProgress,
  CampaignServiceParams,
} from './Campaigns.types';
import { AddressWithId } from '../../interfaces/shared';
import { CampaignModel } from '../../models/Campaign.model';
import { TasksService, tasksService } from '../tasks/Tasks.service';

export class CampaignsService {
  private campaignModel: CampaignModel;
  private tasksService: TasksService;

  constructor({ campaignModel, tasksService }: CampaignServiceParams) {
    this.campaignModel = campaignModel;
    this.tasksService = tasksService;
  }

  async getCampaignProgress({
    address,
    campaign_id,
  }: AddressWithId): Promise<CampaignProgress> {
    const tasks = await this.tasksService.getActiveTasks({
      address,
      campaign_id,
    });
    const claimedFragments = await this.tasksService.getClaimedFragments({
      address,
      campaign_id,
    });

    return {
      claimedFragments,
      tasks,
    };
  }

  async addCampaign({
    endDate,
    address,
    startDate,
    redeemEndDate,
  }: AddCampaignParams) {
    const overlappingCampaigns = await this.campaignModel.find({
      $or: [
        {
          $and: [
            { startDate: { $gte: startDate } },
            { redeemEndDate: { $lte: redeemEndDate } },
          ],
        },
        {
          $and: [
            { redeemEndDate: { $gte: startDate } },
            { redeemEndDate: { $lte: redeemEndDate } },
          ],
        },
        {
          $and: [
            { startDate: { $gte: startDate } },
            { startDate: { $lte: redeemEndDate } },
          ],
        },
        {
          $and: [
            { startDate: { $lte: startDate } },
            { redeemEndDate: { $gte: redeemEndDate } },
          ],
        },
      ],
    });

    if (overlappingCampaigns.length > 0) {
      throw new Error('Overlapping campaign already exists.');
    }

    const newCampaign = await new CampaignModel({
      startDate,
      endDate,
      redeemEndDate,
      initiatorAddress: address,
    }).save();

    return newCampaign;
  }
}

export const campaignsService = new CampaignsService({
  campaignModel: CampaignModel,
  tasksService: tasksService,
});