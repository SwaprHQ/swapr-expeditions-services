import { MultichainSubgraphService } from '../multichainSubgraph/MultichainSubgraph.service';

type CalculateLiquidityStakingDepositUSDValueParam = Awaited<
  ReturnType<
    InstanceType<
      typeof MultichainSubgraphService
    >['getLiquidityStakingPositionBetweenTimestampAAndTimestampB']
  >
>;

/**
 * Calculates the USD value of a liquidity staking deposit.
 * @param liquidityStakingDepositList The list of liquidity staking deposits
 * @returns The total USD value of the liquidity staking deposits
 */
export function calculateLiquidityStakingDepositUSDValue(
  liquidityStakingDepositList: CalculateLiquidityStakingDepositUSDValueParam
): number {
  // calculate the total amount of USD deposited
  return liquidityStakingDepositList.reduce(
    (total, liquidityStakingDeposit) => {
      // Compute the USD value of the staking position
      if (liquidityStakingDeposit.__typename === 'Deposit') {
        const { totalSupply, reserveUSD } =
          liquidityStakingDeposit.liquidityMiningCampaign.stakablePair;

        total =
          total +
          (parseFloat(liquidityStakingDeposit.amount) /
            parseFloat(totalSupply)) *
            reserveUSD;
      }

      return total;
    },
    0
  );
}
