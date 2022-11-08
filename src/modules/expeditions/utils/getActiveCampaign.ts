import { HydratedDocument } from 'mongoose';
import { getWeekInformation } from './week';
import { ICampaign } from '../interfaces/ICampaign.interface';
import { CampaignModel } from '../models/Campaign.model';

export const getActiveCampaign = async (): Promise<
  HydratedDocument<ICampaign>
> => {
  const week = getWeekInformation();

  const activeCampaign = await CampaignModel.findOne({
    startDate: { $lte: week.startDate },
    redeemEndDate: { $gte: week.endDate },
  });

  if (!activeCampaign) {
    throw new Error('No active campaign has been found');
  }

  return activeCampaign;
};
