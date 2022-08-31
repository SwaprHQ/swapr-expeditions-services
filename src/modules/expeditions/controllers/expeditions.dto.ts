import Joi from 'joi';
import { address, signature } from '../../routes/validations';
import { WeeklyFragmentType } from '../interfaces/IFragment.interface';

const apiGeneralResponseDTOCreator = (responseSchema: Joi.SchemaLike) =>
  Joi.object({
    data: responseSchema,
  });

export const AddressWithSignatureDTO = Joi.object({
  address,
  signature,
});

export const ClaimWeeklyFragmentsDTO = AddressWithSignatureDTO.keys({
  type: Joi.string()
    .valid(...Object.values(WeeklyFragmentType))
    .required(),
});

export const DailyVisitsResponseDTO = apiGeneralResponseDTOCreator(
  Joi.object({
    address,
    allVisits: Joi.number(),
    lastVisit: Joi.date(),
  })
);

export const ClaimWeeklyLiquidityProvisionFragmentsResponseDTO =
  apiGeneralResponseDTOCreator(
    Joi.object({
      claimedFragments: Joi.number(),
    })
  );

const weeklyRewardsFragmentSchema = Joi.object({
  totalAmountUSD: Joi.number(),
  claimableFragments: Joi.number(),
  claimedFragments: Joi.number(),
});

export const GetWeeklyRewardsFragmentsResponseDTO =
  apiGeneralResponseDTOCreator(
    Joi.object({
      liquidityProvision: weeklyRewardsFragmentSchema,
      liquidityStaking: weeklyRewardsFragmentSchema,
    })
  );
