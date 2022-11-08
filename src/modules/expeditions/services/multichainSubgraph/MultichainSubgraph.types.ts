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

export enum ChainId {
  MAINNET = 1,
  GNOSIS_CHAIN = 100,
  ARBTIRUM_ONE = 42161,
}

export interface Mint {
  __typename?: 'Mint' | undefined;
  amountUSD?: string;
  to: string;
  timestamp: string;
}
