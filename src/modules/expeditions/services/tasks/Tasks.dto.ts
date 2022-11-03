import Joi from 'joi';
import { TasksTypes } from './Tasks.types';
import { address, signature } from '../../../shared/validations';

const type = Joi.string()
  .valid(...Object.values(TasksTypes))
  .required()
  .label('TasksType');

export const ClaimRequestDTO = Joi.object({
  address,
  signature,
  type,
}).label('ClaimRequest');

export const ClaimResponseDTO = Joi.object({
  claimedFragments: Joi.number(),
  type,
}).label('ClaimResponse');
