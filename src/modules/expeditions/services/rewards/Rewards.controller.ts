import { captureException } from '@sentry/node';
import Boom from '@hapi/boom';
import { ClaimRewardRequest, ClaimRewardResponse } from './Rewards.types';
import { rewardsService } from './Rewards.service';
import { getActiveCampaign } from '../../utils/getActiveCampaign';
import { validateSignature } from '../../utils/validateSignature';

export async function claimReward(
  req: ClaimRewardRequest
): ClaimRewardResponse {
  try {
    const { address, signature, tokenId } = req.payload;

    const campaign = await getActiveCampaign();

    validateSignature({
      address,
      signature,
      message: tokenId,
    });

    return await rewardsService.claim({
      address,
      tokenId,
      campaign_id: campaign._id,
    });
  } catch (error) {
    console.log(error);
    captureException(error);
    throw Boom.badRequest(error);
  }
}
