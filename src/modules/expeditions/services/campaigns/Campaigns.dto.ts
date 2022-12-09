import Joi from 'joi';
import { address, signature } from '../../../shared/validations';
import { dayjs } from '../../../shared/dayjs';
import { TasksTypes } from '../tasks/Tasks.types';
import { RarityType } from '../../interfaces/IReward.interface';

export const AddCampaignRequestDTO = Joi.object({
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
}).label('AddCampaignRequest');

export const AddCampaignResponseDTO = Joi.object({
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  redeemEndDate: Joi.date().required(),
  initiatorAddress: address,
}).label('AddCampaignResponse');

export const GetCampaignProgressRequestDTO = { address };

const activeDailyTaskBase = {
  lastVisit: Joi.date().required(),
  nextVisit: Joi.date().required(),
  type: Joi.string()
    .valid(...Object.values(TasksTypes))
    .required(),
};

const activeWeeklyTaskBase = {
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  type: Joi.string()
    .valid(...Object.values(TasksTypes))
    .required(),
};

const weeklyFragments = Joi.object({
  totalAmountUSD: Joi.number().required(),
  claimableFragments: Joi.number().required(),
  claimedFragments: Joi.number().required(),
  ...activeWeeklyTaskBase,
}).label('WeeklyFragments');

const dailyVisit = Joi.object({
  allVisits: Joi.number().required(),
  fragments: Joi.number().required(),
  ...activeDailyTaskBase,
})
  .required()
  .label('DailyVisit');

const reward = Joi.object({
  requiredFragments: Joi.number().required(),
  nftAddress: address,
  tokenId: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().required(),
  rarity: Joi.string()
    .valid(...Object.values(RarityType))
    .required(),
  imageURI: Joi.string().required(),
})
  .required()
  .label('Reward');

export const GetCampaignProgressResponseDTO = Joi.object({
  claimedFragments: Joi.number().required(),
  rewards: Joi.array().items(reward).required().label('Rewards'),
  tasks: Joi.object({
    dailyVisit,
    liquidityProvision: weeklyFragments.required(),
    liquidityStaking: weeklyFragments.required(),
  })
    .required()
    .label('Tasks'),
}).label('GetCampaignProgressResponse');
