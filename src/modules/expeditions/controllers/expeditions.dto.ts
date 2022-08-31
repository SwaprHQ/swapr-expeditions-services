import Joi from 'joi';
import { address, signature } from '../../routes/validations';
import { WeeklyFragmentType } from '../interfaces/IFragment.interface';

export const DailyVisitsRequestDTO = Joi.object({
  address,
  signature,
}).label('DailyVisitsRequestDTO');

export const ClaimWeeklyFragmentsDTO = DailyVisitsRequestDTO.keys({
  type: Joi.string()
    .valid(...Object.values(WeeklyFragmentType))
    .required(),
}).label('ClaimWeeklyFragmentsResponseDTO');

export const DailyVisitsResponseDTO = Joi.object({
  address,
  allVisits: Joi.number(),
  lastVisit: Joi.date(),
}).label('DailyVisitsResponseDTO');

export const ClaimWeeklyLiquidityProvisionFragmentsResponseDTO = Joi.object({
  claimedFragments: Joi.number(),
}).label('ClaimWeeklyLiquidityProvisionFragmentsResponseDTO');

const weeklyRewardsFragmentSchema = Joi.object({
  totalAmountUSD: Joi.number(),
  claimableFragments: Joi.number(),
  claimedFragments: Joi.number(),
}).label('WeeklyRewardsFragments');

export const GetWeeklyRewardsFragmentsResponseDTO = Joi.object({
  liquidityProvision: weeklyRewardsFragmentSchema,
  liquidityStaking: weeklyRewardsFragmentSchema,
}).label('GetWeeklyRewardsFragmentsResponseDTO');
