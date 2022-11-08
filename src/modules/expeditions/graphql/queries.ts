import { gql } from 'graphql-request';

export const getLiquidityPositionDepositsBetweenTimestampAAndTimestampB = gql`
  query getLiquidityPositionDepositsBetweenTimestampAAndTimestampB(
    $address: Bytes!
    $minAmountUSD: BigDecimal!
    $timestampA: BigInt!
    $timestampB: BigInt!
  ) {
    mints(
      where: {
        to: $address
        amountUSD_gte: $minAmountUSD
        timestamp_gte: $timestampA
        timestamp_lte: $timestampB
      }
    ) {
      amountUSD
      to
      timestamp
    }
  }
`;

export const getLiquidityMiningCampaignDepositsBetweenTimestampAAndTimestampB = gql`
  query getLiquidityMiningCampaignDepositsBetweenTimestampAAndTimestampB(
    $address: Bytes!
    $timestampA: BigInt!
    $timestampB: BigInt!
  ) {
    liquidityMiningCampaignDeposits: deposits(
      where: {
        user: $address
        timestamp_gte: $timestampA
        timestamp_lte: $timestampB
      }
    ) {
      __typename
      id
      amount
      timestamp
      liquidityMiningCampaign {
        id
        stakablePair {
          id
          reserveUSD
          totalSupply
          token0 {
            id
            symbol
          }
          token1 {
            id
            symbol
          }
        }
      }
    }
    singleSidedStakingCampaignDeposits(
      where: {
        user: $address
        timestamp_gte: $timestampA
        timestamp_lte: $timestampB
      }
    ) {
      __typename
      id
      amount
      timestamp
      singleSidedStakingCampaign {
        stakeToken {
          id
          symbol
        }
      }
    }
  }
`;
