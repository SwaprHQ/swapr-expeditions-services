import { Server } from '@hapi/hapi';
import { isAddress } from '@ethersproject/address';
import Joi from 'joi';

import {
  addDailyVisitsController,
  getDailyVisitsController,
} from '../expeditions';

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
          address: Joi.string()
            .custom(value => {
              if (!isAddress(value)) {
                throw new Error('Address is not valid');
              }

              return value;
            })
            .required(),
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
          signature: Joi.string().required(),
        },
      },
      tags: ['api', 'expeditions', 'daily visit'],
    },
    handler: addDailyVisitsController,
  });
}

export const RoutesPlugin = {
  name: 'swapr-expeditions-api/routes',
  version: '0.0.1',
  register,
};

