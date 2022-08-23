import { config } from 'dotenv';

// Load the config
config();

export const SERVER_PORT = process.env.SERVER_PORT || 3000;
export const SERVER_HOST = process.env.SERVER_HOST || '0.0.0.0';

/**
 * MongoDB
 */
export const MONGO_URI = process.env.MONGO_URI as string;

/**
 * Sentry Debug DSN: optional
 */
export const SENTRY_DSN = process.env.SENTRY_DSN;

/**
 * Minimum amount of USD to be eligible for weekly rewards for liquidity provisioning
 */
export const ADD_LIQUIDITY_MIN_USD_AMOUNT = 50;

/**
 * Minimum amount of USD to be eligible for weekly rewards for staking liquidity
 */
export const STAKE_LIQUIDITY_MIN_USD_AMOUNT = 50;

/**
 * The maximum number of fragments that can be claimed by a user in a week.
 */
export const MAX_WEEKLY_CLAIM_FRAGMENT = 750;

/**
 * Past completed week adds 50 fragments to the total fragments.
 */
export const PAST_WEEK_ADDITIONAL_FRAGMENT = 50;

/**
 * Base number of fragments per week.
 */
export const FRAGMENTS_PER_WEEK = 50;

/**
 * A shared text payload used to verify the signature of a message.
 */
export const SIGNATURE_TEXT_PAYLOAD = 'Swapr Daily Visit';

/**
 *
 */
export const JSON_RPC_PROVIDER_ETHEREUM =
  process.env.JSON_RPC_PROVIDER_ETHEREUM;
export const JSON_RPC_PROVIDER_ARBITRUM_ONE =
  process.env.JSON_RPC_PROVIDER_ARBITRUM_ONE;
export const JSON_RPC_PROVIDER_GNOSIS = process.env.JSON_RPC_PROVIDER_GNOSIS;

