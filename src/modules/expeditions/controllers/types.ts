import { WeeklyFragmentType } from '../interfaces/IFragment.interface';
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

export interface ClaimWeeklyFragmentsRequest extends ClaimFragmentsRequest {
  payload: ClaimFragmentsRequest['payload'] & {
    type: WeeklyFragmentType;
  };
}

export interface AddCampaignRequest extends ClaimFragmentsRequest {
  payload: ClaimFragmentsRequest['payload'] & {
    startDate: Date;
    endDate: Date;
    redeemEndDate: Date;
  };
}

export interface GetDailyVisitFragmentsResponse {
  address: string;
  allVisits: number;
  lastVisit: Date | number;
}

/**
 * Claim daily visits fragments response interface.
 */
export type ClaimDailyVisitFragmentsResponse = GetDailyVisitFragmentsResponse;

/**
 * Claim weekly rewards for a given address
 */
export interface ClaimWeeklyFragmentsResponse {
  claimedFragments: number;
}

/**
 * Describes a weekly fragment response.
 */
export interface GetWeeklyFragmentsResponse {
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
}

/**
 * Claim weekly liquidity provision fragments Response
 */
export interface ClaimWeeklyLiquidityProvisionFragmentsResponse {
  claimedFragments: number;
}

/**
 * Claim weekly liquidity staking fragments Response
 */
export interface ClaimWeeklyLiquidityStakingFragmentsResponse {
  claimedFragments: number;
}
