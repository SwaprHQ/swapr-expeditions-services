import { Server } from '@hapi/hapi';
import { isAddress } from '@ethersproject/address';
import Joi from 'joi';

import {
  addDailyVisitsController,
  getDailyVisitsController,
  getWeeklyLiquidityPositionDeposits,
  getWeeklyRewardsFragmentsState,
} from '../expeditions';

/**
 * Custom method to validate Joi Ethereum addresss.
 * @param value - The value to validate.
 * @returns {boolean} - True if the value is a valid Ethereum address.
 */
const joiEthereumAddressMethod = (value: string) => {
  if (!isAddress(value)) {
    throw new Error('Address is not valid');
  }

  return value;
};

/**
 * Signature parameter validator
 */
const signature = Joi.string().required();
/**
 * Ethereum address validator
 */
const address = Joi.string().custom(joiEthereumAddressMethod).required();

async function register(server: Server) {
  // Return nothing
  server.route({
    method: '*',
    path: '/',
    handler: async (_, h) => h.response().code(204),
  });

  server.route({
    method: 'GET',
    path: '/expeditions',
    options: {
      description: `Get an address's expedition information`,
      validate: {
        query: {
          address,
        },
      },
      tags: ['api', 'expeditions'],
    },
    handler: getDailyVisitsController,
  });

  server.route({
    method: 'POST',
    path: '/expeditions/daily-visit',
    options: {
      description: `Record a daily visit to an expedition`,
      validate: {
        payload: {
          signature,
          address,
        },
      },
      tags: ['api', 'expeditions', 'daily visit'],
    },
    handler: addDailyVisitsController,
  });

  server.route({
    method: 'GET',
    path: '/expeditions/weekly-rewards',
    options: {
      description: `Get an address's weekly rewards state for given address`,
      validate: {
        query: {
          address,
        },
      },
      tags: [
        'api',
        'expeditions',
        'weekly liquidity',
        'weekly rewards',
        'weekly rewards fragments',
      ],
    },
    handler: getWeeklyRewardsFragmentsState,
  });

  server.route({
    method: 'GET',
    path: '/expeditions/weekly-liquidity',
    options: {
      description: `Get an address's weekly liquidity rewards state for given address`,
      validate: {
        query: {
          address,
        },
      },
      tags: ['api', 'expeditions', 'weekly liquidity', 'weekly rewards'],
    },
    handler: getWeeklyLiquidityPositionDeposits,
  });

  server.route({
    method: 'POST',
    path: '/expeditions/weekly-liquidity/claim',
    options: {
      description: `Claim a weekly liquidity reward (fragments)`,
      validate: {
        payload: {
          signature,
          address,
        },
      },
      tags: ['api', 'expeditions', 'weekly liquidity'],
    },
    handler: getWeeklyLiquidityPositionDeposits,
  });
}

export const RoutesPlugin = {
  name: 'swapr-expeditions-api/routes',
  version: '0.0.1',
  register,
};

