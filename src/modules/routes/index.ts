import { HandlerDecorations, Server } from '@hapi/hapi';

import {
  addDailyVisitsController,
  claimWeeklyFragmentsForLiquidityPositionDeposits,
  getDailyVisitsController,
  getWeeklyLiquidityPositionDeposits,
  getWeeklyRewardsFragmentsState,
} from '../expeditions';

import { 
  AddressWithSignatureDTO, 
  ClaimWeeklyFragmentsForLiquidityPositionDepositsResponseDTO, 
  DailyVisitsResponseDTO, 
  GetWeeklyLiquidityPositionDepositsResponseDTO, 
  GetWeeklyRewardsFragmentsStateResponseDTO
} from '../expeditions/controllers/expeditions.dto';

import { address } from './validations'
async function register(server: Server) {
  // Return nothing
  server.route({
    method: '*',
    path: '/',
    handler: async (_, h) => h.response().code(204),
  });

  server.route({
    method: 'GET',
    path: '/expeditions/daily-visits',
    options: {
      description: `Get an address's expedition information`,
      validate: {
        query: {
          address,
        },
      },
      tags: ['api', 'expeditions'],
      response: {
        schema: DailyVisitsResponseDTO
      }
    },
    handler: getDailyVisitsController as HandlerDecorations,
  });

  server.route({
    method: 'POST',
    path: '/expeditions/daily-visits',
    options: {
      description: `Record a daily visit to an expedition`,
      validate: {
        payload: AddressWithSignatureDTO,
      },
      tags: ['api', 'expeditions', 'daily visit'],
      response: {
        schema: DailyVisitsResponseDTO
      }
    },
    handler: addDailyVisitsController as HandlerDecorations,
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
      response: {
        schema: GetWeeklyRewardsFragmentsStateResponseDTO
      }
    },
    handler: getWeeklyRewardsFragmentsState as HandlerDecorations,
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
      response: { 
        schema: GetWeeklyLiquidityPositionDepositsResponseDTO 
      }
    },
    handler: getWeeklyLiquidityPositionDeposits as HandlerDecorations,
  });

  server.route({
    method: 'POST',
    path: '/expeditions/weekly-liquidity/claim',
    options: {
      description: `Claim a weekly liquidity reward (fragments)`,
      validate: {
        payload: AddressWithSignatureDTO,
      },
      tags: ['api', 'expeditions', 'weekly liquidity'],
      response: {
        schema: ClaimWeeklyFragmentsForLiquidityPositionDepositsResponseDTO
      }
    },
    handler: claimWeeklyFragmentsForLiquidityPositionDeposits as HandlerDecorations,
  });
}

export const RoutesPlugin = {
  name: 'swapr-expeditions-api/routes',
  version: '0.0.1',
  register,
};

