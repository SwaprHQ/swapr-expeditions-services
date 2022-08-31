import {
  CLAIM_WEEKLY_LIQUIDITY_PROVISION_FRAGMENTS_MESSAGE,
  CLAIM_WEEKLY_LIQUIDITY_STAKING_FRAGMENTS_MESSAGE,
} from '../constants';
import { WeeklyFragmentType } from '../interfaces/IFragment.interface';

export function getWeeklyFragmentMessageByType(
  fragmentType: WeeklyFragmentType
): string {
  if (fragmentType === WeeklyFragmentType.LIQUIDITY_PROVISION) {
    return CLAIM_WEEKLY_LIQUIDITY_PROVISION_FRAGMENTS_MESSAGE;
  }

  if (fragmentType === WeeklyFragmentType.LIQUIDITY_STAKING) {
    return CLAIM_WEEKLY_LIQUIDITY_STAKING_FRAGMENTS_MESSAGE;
  }

  throw new Error(`Unknown fragment type: ${fragmentType}`);
}
