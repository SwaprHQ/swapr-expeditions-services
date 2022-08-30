import { GraphQLClient } from 'graphql-request';
import { getSdk, Sdk } from '../generated/graphql/queries';

export interface GetLiquidityPositionDepositsBetweenTimestampAAndTimestampBParams {
  address: string;
  minAmountUSD: string;
  timestampA: number;
  timestampB: number;
}

export type GetLiquidityStakingPositionBetweenTimestampAAndTimestampBParams =
  Omit<
    GetLiquidityPositionDepositsBetweenTimestampAAndTimestampBParams,
    'minAmountUSD'
  >;

enum ChainId {
  MAINNET = 1,
  GNOSIS_CHAIN = 100,
  ARBTIRUM_ONE = 42161,
}

interface Mint {
  __typename?: 'Mint' | undefined;
  amountUSD?: string;
  to: string;
  timestamp: string;
}

export class MultichainSubgraphService {
  readonly subgraphsEndpoints: Record<number, string> = {
    [ChainId.MAINNET]:
      'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-mainnet-v2',
    [ChainId.GNOSIS_CHAIN]:
      'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-xdai-v2',
    [ChainId.ARBTIRUM_ONE]:
      'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-arbitrum-one-v2',
  };

  readonly subgraphsSDKs: Record<number, Sdk> = {};

  constructor() {
    for (const [chainId, subgraphEndpoint] of Object.entries(
      this.subgraphsEndpoints
    )) {
      this.subgraphsSDKs[chainId as unknown as number] = getSdk(
        new GraphQLClient(subgraphEndpoint)
      );
    }
  }

  async getLiquidityPositionDepositsBetweenTimestampAAndTimestampB({
    address,
    minAmountUSD,
    timestampA,
    timestampB,
  }: GetLiquidityPositionDepositsBetweenTimestampAAndTimestampBParams): Promise<
    Mint[]
  > {
    address = address.toLowerCase();
    // Prepare the GraphQL client
    const resultsPerSubgraph = await Promise.all(
      Object.values(this.subgraphsSDKs).map(async subgraphSDK => {
        // Bound results to this week
        const { mints } =
          await subgraphSDK.getLiquidityPositionDepositsBetweenTimestampAAndTimestampB(
            {
              address,
              minAmountUSD,
              timestampA,
              timestampB,
            }
          );

        // Filter out results that are not within the time range
        return mints;
      })
    );

    return resultsPerSubgraph.flat();
  }

  async getLiquidityStakingPositionBetweenTimestampAAndTimestampB({
    address,
    timestampA,
    timestampB,
  }: GetLiquidityStakingPositionBetweenTimestampAAndTimestampBParams) {
    address = address.toLowerCase();
    // Prepare the GraphQL client
    const resultsPerSubgraph = await Promise.all(
      Object.values(this.subgraphsSDKs).map(async subgraphSDK => {
        // Bound results to this week
        const {
          liquidityMiningCampaignDeposits,
          singleSidedStakingCampaignDeposits,
        } = await subgraphSDK.getLiquidityMiningCampaignDepositsBetweenTimestampAAndTimestampB(
          {
            address,
            timestampA,
            timestampB,
          }
        );

        // Filter out results that are not within the time range
        return [
          ...liquidityMiningCampaignDeposits,
          ...singleSidedStakingCampaignDeposits,
        ];
      })
    );

    return resultsPerSubgraph.flat();
  }
}
