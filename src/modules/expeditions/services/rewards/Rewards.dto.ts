import Joi from 'joi';
import { address, signature } from '../../../shared/validations';

export const ClaimRewardRequestDTO = Joi.object({
  address,
  signature,
  tokenId: Joi.string().required(),
}).label('ClaimRewardRequest');

export const ClaimRewardResponseDTO = Joi.object({
  tokenId: Joi.string().required(),
  claimSignature: Joi.string().required(),
  chainId: Joi.string().required(),
  nftAddress: address,
}).label('ClaimRewardResponse');
