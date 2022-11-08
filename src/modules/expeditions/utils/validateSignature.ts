import { ethers } from 'ethers';

export interface ValidateSignatureParams {
  address: string;
  signature: string;
  message: string;
}

export const validateSignature = ({
  address,
  message,
  signature,
}: ValidateSignatureParams) => {
  const addressFromSignature = ethers.utils.verifyMessage(message, signature);

  if (addressFromSignature.toLowerCase() !== address.toLowerCase()) {
    throw new Error('Invalid signature');
  }
};
