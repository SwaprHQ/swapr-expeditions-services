import { isAddress } from '@ethersproject/address';
import Joi from 'joi';

/**
 * Custom method to validate Joi Ethereum addresss.
 * @param value - The value to validate.
 * @returns {boolean} - True if the value is a valid Ethereum address.
 */
export const joiEthereumAddressMethod = (value: string) => {
  if (!isAddress(value)) {
    throw new Error('Address is not valid');
  }

  return value;
};

/**
 * Signature parameter validator
 */
export const signature = Joi.string()
  .required()
  .description('Return value signer.signMessage()');
/**
 * Ethereum address validator
 */
export const address = Joi.string()
  .custom(joiEthereumAddressMethod)
  .required()
  .description('Ethereum address');
