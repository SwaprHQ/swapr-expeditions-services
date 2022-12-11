import Joi from 'joi';
import { TasksTypes } from './Tasks.types';
import { address, signature } from '../../../shared/validations';

const type = Joi.string()
  .valid(...Object.values(TasksTypes))
  .required()
  .label('TasksType');

export const ClaimTaskRequestDTO = Joi.object({
  address,
  signature,
  type,
}).label('ClaimTaskRequest');

export const ClaimTaskResponseDTO = Joi.object({
  claimedFragments: Joi.number().required(),
  type,
}).label('ClaimTaskResponse');

export const RegisterDailySwapRequestDTO = Joi.object({
  address,
  tradeUSDValue: Joi.number().required(),
}).label('RegisterDailySwapRequest');

export const RegisterDailySwapResponseDTO = Joi.object({
  claimedFragments: Joi.number().required(),
  totalTradeUSDValue: Joi.number().required(),
}).label('RegisterDailySwapResponse');
