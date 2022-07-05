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

