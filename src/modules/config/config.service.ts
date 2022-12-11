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

export const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS;
export const DOMAIN_NAME = process.env.DOMAIN_NAME;
export const DOMAIN_VERSION = process.env.DOMAIN_VERSION;
export const DOMAIN_CHAIN_ID = process.env.DOMAIN_CHAIN_ID;
export const DOMAIN_VERIFYING_CONTRACT = NFT_CONTRACT_ADDRESS;
export const TOKEN_EMITTER_PRIVATE_KEY = process.env.TOKEN_EMITTER_PRIVATE_KEY;
