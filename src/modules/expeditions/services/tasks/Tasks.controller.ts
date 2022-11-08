import Boom from '@hapi/boom';
import { captureException } from '@sentry/node';
import { tasksService } from './Tasks.service';
import { ClaimRequest, ClaimResponse } from './Tasks.types';
import { getActiveCampaign } from '../../utils/getActiveCampaign';
import { validateSignature } from '../../utils/validateSignature';

export async function claim(req: ClaimRequest): ClaimResponse {
  try {
    const { address, signature, type } = req.payload;

    const campaign = await getActiveCampaign();

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
