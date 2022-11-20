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
 * Base number of fragments per week.
 */
export const FRAGMENTS_PER_WEEK = 40;

export const DAILY_VISIT_MULTIPLAND = 1;

export const DAILY_SWAPS_MULTIPLAND = 1;

export const DAILY_SWAPS_MIN_USD_AMOUNT = 10;
