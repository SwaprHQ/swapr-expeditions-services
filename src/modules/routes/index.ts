import { Server } from '@hapi/hapi';
import { isAddress } from '@ethersproject/address';
import Joi from 'joi';

import {
  claimDailyVisitFragments as claimDailyVisitFragmentsController,
  getDailyVisitFragments as getDailyVisitFragmentsController,
  getWeeklyFragments as getWeeklyFragmentsController,
  claimWeeklyLiquidityProvisionFragments as claimWeeklyLiquidityProvisionFragmentsController,
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
    path: '/expeditions/daily-visit',
    options: {
      description: `Get an address's expedition information`,
      validate: {
        query: {
          address,
        },
      },
      tags: ['api', 'expeditions', 'daily visit', 'fragments'],
    },
    handler: getDailyVisitFragmentsController,
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
    handler: claimDailyVisitFragmentsController,
  });

  server.route({
    method: 'GET',
    path: '/expeditions/weekly-fragments',
    options: {
      description: `Get an address's weekly rewards (fragments) state for given address`,
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
    handler: getWeeklyFragmentsController,
  });

  server.route({
    method: 'POST',
    path: '/expeditions/weekly-fragments/liquiditt-provision/claim',
    options: {
      description: `Claim all weekly fragments available for an address`,
      validate: {
        payload: {
          signature,
          address,
        },
      },
      tags: ['api', 'expeditions', 'weekly liquidity'],
    },
    handler: claimWeeklyLiquidityProvisionFragmentsController,
  });
}

export const RoutesPlugin = {
  name: 'swapr-expeditions-api/routes',
  version: '0.0.1',
  register,
};

