import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { BigNumber } from '@ethersproject/bignumber';
import ERC20_ABI from './ERC20.json';

interface Token {
  address: string;
  providerURL: string;
}

interface MultichainERC20ServiceParams {
  tokens: Token[];
}

interface TokenBalance {
  tokenAddress: string;
  balance: BigNumber;
  chainId: number;
}

export class MultichainERC20Service {
  tokens: Token[];

  constructor(public params: MultichainERC20ServiceParams) {
    this.tokens = params.tokens;
  }

  /**
   * Fetches the balance of a token for a given address across all chains.
   * @param address The address to check the balance of.
   * @returns The balance of the token for the address across all chains.
   */
  async balanceOf(address: string): Promise<TokenBalance[]> {
    const response = await Promise.all(
      this.tokens.map(async token => {
        const tokenBalance: TokenBalance = {
          tokenAddress: token.address,
          balance: BigNumber.from(0),
          chainId: 0,
        };

        try {
          const staticProvider = new StaticJsonRpcProvider(token.providerURL);
          const erc20Contract = new Contract(
            address,
            ERC20_ABI,
            staticProvider
          );

          const { chainId } = await staticProvider.getNetwork();
          const balance = await erc20Contract.balanceOf(address);

          tokenBalance.balance = balance;
          tokenBalance.chainId = chainId;
        } catch (e) {
          console.log(e);
        }

        return tokenBalance;
      })
    );
    return response;
  }
}

