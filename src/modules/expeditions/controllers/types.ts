import { APIGeneralResponse } from 'src/modules/shared/interfaces/response.interface';
import type { WeeklyFragmentService } from '../services/weekly-fragments';

export interface GetFragmentsRequest extends Request {
  query: {
    address: string;
    /**
     * Week date in ISO format: YYYY-MM-DD
     */
    week?: string;
  };
}

/**
 * A generic fragment claim request interface.
 * All fragment claim requests should implement this interface.
 */
export interface ClaimFragmentsRequest extends Request {
  payload: {
    address: string;
    signature: string;
  };
}

export type GetDailyVisitFragmentsResponse = APIGeneralResponse<{
  address: string;
  allVisits: number;
  lastVisit: Date | number;
}>;

/**
 * Claim daily visits fragments response interface.
 */
export type ClaimDailyVisitFragmentsResponse = GetDailyVisitFragmentsResponse;

/**
 * Claim weekly rewards for a given address
 */
export type ClaimWeeklyFragmentsResponse = APIGeneralResponse<{
  claimedFragments: number;
}>;

/**
 * Describes a weekly fragment response.
 */
export type GetWeeklyFragmentsResponse = APIGeneralResponse<{
  liquidityProvision: Awaited<
    ReturnType<
      InstanceType<
        typeof WeeklyFragmentService
      >['getLiquidityProvisionWeekRewards']
    >
  >;
  liquidityStaking: Awaited<
    ReturnType<
      InstanceType<
        typeof WeeklyFragmentService
      >['getLiquidityStakingWeekRewards']
    >
  >;
}>;

/**
 * Claim weekly liquidity provision fragments Response
 */
export type ClaimWeeklyLiquidityProvisionFragmentsResponse = APIGeneralResponse<{
  claimedFragments: number;
}>;

/**
 * Claim weekly liquidity staking fragments Response
 */
export type ClaimWeeklyLiquidityStakingFragmentsResponse = APIGeneralResponse<{
  claimedFragments: number;
}>;

