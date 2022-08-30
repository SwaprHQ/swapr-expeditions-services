import Joi from 'joi';
import { address, signature } from '../../routes/validations';

const apiGeneralResponseDTOCreator = (responseSchema: Joi.SchemaLike) =>
  Joi.object({
    data: responseSchema,
  });

export const AddressWithSignatureDTO = Joi.object({
  address,
  signature,
});

export const DailyVisitsResponseDTO = apiGeneralResponseDTOCreator(
  Joi.object({
    address,
    allVisits: Joi.number(),
    lastVisit: Joi.date(),
  })
);

export const ClaimWeeklyLiquidityProvisionFragmentsResponseDTO = apiGeneralResponseDTOCreator(
  Joi.object({
    claimedFragments: Joi.number(),
  })
);

const weeklyRewardsFragmentSchema = Joi.object({
  totalAmountUSD: Joi.number(),
  claimableFragments: Joi.number(),
  claimedFragments: Joi.number(),
});

export const GetWeeklyRewardsFragmentsResponseDTO = apiGeneralResponseDTOCreator(
  Joi.object({
    liquidityProvision: weeklyRewardsFragmentSchema,
    liquidityStaking: weeklyRewardsFragmentSchema,
  })
);

