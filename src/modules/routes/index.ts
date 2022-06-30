import { Server } from '@hapi/hapi';
import { isAddress } from '@ethersproject/address';
import Joi from 'joi';

import { getDailyVisitsController } from '../expeditions';

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
              } else {
                return true;
              }
            })
            .required(),
        },
      },
      tags: ['api', 'expeditions'],
    },
    handler: () => ({
      message: 'not implemented',
    }),
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
    handler: getDailyVisitsController,
  });
}

export const RoutesPlugin = {
  name: 'swapr-expeditions-api/routes',
  version: '0.0.1',
  register,
};

