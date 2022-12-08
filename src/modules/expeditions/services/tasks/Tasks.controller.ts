import Boom from '@hapi/boom';
import { captureException } from '@sentry/node';
import dayjs from 'dayjs';
import { tasksService } from './Tasks.service';
import {
  ClaimTaskRequest,
  ClaimTaskResponse,
  RegisterDailySwapRequest,
  RegisterDailySwapResponse,
} from './Tasks.types';
import { getActiveCampaign } from '../../utils/getActiveCampaign';
import { validateSignature } from '../../utils/validateSignature';

export async function claimTask(req: ClaimTaskRequest): ClaimTaskResponse {
  try {
    const { address, signature, type } = req.payload;

    const campaign = await getActiveCampaign();

    if (dayjs.utc().isAfter(campaign.endDate)) {
      throw Error('Campaign end date has passed');
    }

    validateSignature({
      address,
      signature,
      message: type,
    });

    return await tasksService.claim({
      address,
      type,
      campaign_id: campaign._id,
    });
  } catch (error) {
    console.log(error);
    captureException(error);
    throw Boom.badRequest(error);
  }
}

export async function registerDailySwap(
  req: RegisterDailySwapRequest
): RegisterDailySwapResponse {
  try {
    const { address, tradeUSDValue } = req.payload;

    const campaign = await getActiveCampaign();

    if (dayjs.utc().isAfter(campaign.endDate)) {
      throw Error('Campaign end date has passed');
    }

    return await tasksService.registerDailySwap({
      address,
      campaign_id: campaign._id,
      tradeUSDValue,
    });
  } catch (error) {
    console.log(error);
    captureException(error);
    throw Boom.badRequest(error);
  }
}
