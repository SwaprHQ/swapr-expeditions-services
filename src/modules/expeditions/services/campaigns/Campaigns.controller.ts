import Boom from '@hapi/boom';
import { captureException } from '@sentry/node';
import { campaignsService } from './Campaigns.service';
import { ADD_CAMPAIGN_MESSAGE } from './Campaigns.consts';
import {
  AddCampaignRequest,
  AddCampaignResponse,
  GetCampaignProgressRequest,
  GetCampaignProgressResponse,
} from './Campaigns.types';
import { validateSignature } from '../../utils/validateSignature';
import { getActiveCampaign } from '../../utils/getActiveCampaign';

export async function addCampaign(
  req: AddCampaignRequest
): AddCampaignResponse {
  try {
    const { signature, address, startDate, endDate, redeemEndDate } =
      req.payload;

    validateSignature({
      address,
      signature,
      message: ADD_CAMPAIGN_MESSAGE,
    });

    const newCampaign = await campaignsService.addCampaign({
      address,
      endDate,
      startDate,
      redeemEndDate,
    });

    return {
      startDate: newCampaign.startDate,
      endDate: newCampaign.endDate,
      redeemEndDate: newCampaign.redeemEndDate,
      initiatorAddress: newCampaign.initiatorAddress,
    };
  } catch (error) {
    console.log(error);
    captureException(error);
    throw Boom.badRequest(error);
  }
}

export async function getCampaignProgress(
  req: GetCampaignProgressRequest
): Promise<GetCampaignProgressResponse> {
  try {
    const { address } = req.query;

    const campaign = await getActiveCampaign();

    return await campaignsService.getCampaignProgress({
      address,
      campaign_id: campaign._id,
    });
  } catch (error) {
    console.log(error);
    captureException(error);
    throw Boom.badRequest(error);
  }
}
