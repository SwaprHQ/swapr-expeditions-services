import { HandlerDecorations, Server } from '@hapi/hapi';

import {
  AddCampaignRequestDTO,
  AddCampaignResponseDTO,
  GetCampaignProgressRequestDTO,
  GetCampaignProgressResponseDTO,
} from '../expeditions/services/campaigns/Campaigns.dto';
import {
  addCampaign,
  getCampaignProgress,
} from '../expeditions/services/campaigns/Campaigns.controller';
import {
  ClaimRequestDTO,
  ClaimResponseDTO,
} from '../expeditions/services/tasks/Tasks.dto';
import { claim } from '../expeditions/services/tasks/Tasks.controller';

async function register(server: Server) {
  // Return nothing
  server.route({
    method: '*',
    path: '/',
    handler: async (_, h) => h.response().code(204),
  });

  server.route({
    method: 'POST',
    path: '/expeditions/add-campaign',
    options: {
      description: `Adds new campaign for a given date. Initiator must be on verified address list`,
      validate: {
        payload: AddCampaignRequestDTO,
      },
      tags: ['api', 'expeditions', 'campaign'],
      response: {
        schema: AddCampaignResponseDTO,
      },
    },
    handler: addCampaign as HandlerDecorations,
  });

  server.route({
    method: 'POST',
    path: '/expeditions/claim',
    options: {
      description: `Claim rewards (fragments) for specified type of task`,
      validate: {
        payload: ClaimRequestDTO,
      },
      tags: ['api', 'expeditions', 'claim'],
      response: {
        schema: ClaimResponseDTO,
      },
    },
    handler: claim as HandlerDecorations,
  });

  server.route({
    method: 'GET',
    path: '/expeditions/progress',
    options: {
      description: `Get campaign status for a given address`,
      validate: {
        query: GetCampaignProgressRequestDTO,
      },
      tags: ['api', 'expeditions', 'progress'],
      response: {
        schema: GetCampaignProgressResponseDTO,
      },
    },
    handler: getCampaignProgress as HandlerDecorations,
  });
}

export const RoutesPlugin = {
  name: 'swapr-expeditions-api/routes',
  version: '0.0.1',
  register,
};
