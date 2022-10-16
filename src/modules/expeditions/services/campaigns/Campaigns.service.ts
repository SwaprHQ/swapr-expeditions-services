import { ICampaign } from '../../interfaces/ICampaign.interface';
import { CampaignModel } from '../../models/Campaign.model';

export class CampaignsService {
  private campaignModel: CampaignModel;

  constructor({ campaignModel }: { campaignModel: CampaignModel }) {
    this.campaignModel = campaignModel;
  }

  async addCampaign(params: {
    address: string;
    startDate: Date;
    endDate: Date;
    redeemEndDate: Date;
  }): Promise<ICampaign> {
    const { address, startDate, endDate, redeemEndDate } = params;

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

    const newCampaign = new CampaignModel({
      startDate,
      endDate,
      redeemEndDate,
      initiatorAddress: address,
    });

    return newCampaign.save();
  }
}

export const campaignsService = new CampaignsService({
  campaignModel: CampaignModel,
});
