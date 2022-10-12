import dayjs from 'dayjs';
import Joi from 'joi';
import { address, signature } from '../../routes/validations';
import { WeeklyFragmentType } from '../interfaces/IFragment.interface';

export const DailyVisitsRequestDTO = Joi.object({
  address,
  signature,
}).label('DailyVisitsRequest');

export const DailyVisitsResponseDTO = Joi.object({
  address,
  allVisits: Joi.number().required(),
  lastVisit: Joi.date().required(),
}).label('DailyVisitsResponse');

/**
 * Get weekly fragments response DTO
 */
const weeklyFragmentsRewardsSchema = Joi.object({
  totalAmountUSD: Joi.number().required(),
  claimableFragments: Joi.number().required(),
  claimedFragments: Joi.number().required(),
}).label('WeeklyFragments');

export const GetWeeklyFragmentsResponseDTO = Joi.object({
  liquidityProvision: weeklyFragmentsRewardsSchema.required(),
  liquidityStaking: weeklyFragmentsRewardsSchema.required(),
}).label('GetWeeklyFragmentsResponse');

export const ClaimWeeklyFragmentsDTO = DailyVisitsRequestDTO.keys({
  type: Joi.string()
    .valid(...Object.values(WeeklyFragmentType))
    .required(),
}).label('ClaimWeeklyFragments');

export const ClaimWeeklyFragmentsResponseDTO = Joi.object({
  claimedFragments: Joi.number().required(),
}).label('ClaimWeeklyFragmentsResponse');

export const AddCampaignDTO = Joi.object({
  address,
  signature,
  startDate: Joi.date()
    .required()
    .custom((value, helper) => {
      if (dayjs(value).get('d') !== 1) {
        return helper.message({ custom: 'startDate must be Monday' });
      }
      return value;
    }),
  endDate: Joi.date()
    .required()
    .min(Joi.ref('startDate'))
    .custom((value, helper) => {
      if (dayjs(value).get('d') !== 0) {
        return helper.message({ custom: 'endDate must be Sunday' });
      }
      return value;
    }),
  redeemEndDate: Joi.date().required().min(Joi.ref('endDate')),
}).options({ abortEarly: false });
