import { ethers } from 'ethers';
import { validateSignature } from './validateSignature';

describe('Validate Signature', () => {
  it('works correctly', async () => {
    const walletA = ethers.Wallet.createRandom();
    const walletB = ethers.Wallet.createRandom();
    const message = 'Message';
    const signature = await walletA.signMessage(message);

    expect(() =>
      validateSignature({
        address: walletB.address,
        message,
        signature,
      })
    ).toThrow();

    expect(() =>
      validateSignature({
        address: walletA.address,
        message: 'Other message',
        signature,
      })
    ).toThrow();

    expect(() =>
      validateSignature({
        address: walletA.address,
        message,
        signature,
      })
    ).not.toThrow();
  });
});
