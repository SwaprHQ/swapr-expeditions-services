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
  ClaimTaskRequestDTO,
  ClaimTaskResponseDTO,
  RegisterDailySwapRequestDTO,
  RegisterDailySwapResponseDTO,
} from '../expeditions/services/tasks/Tasks.dto';
import {
  claimTask,
  registerDailySwap,
} from '../expeditions/services/tasks/Tasks.controller';
import { claimReward } from '../expeditions/services/rewards/Rewards.controller';
import {
  ClaimRewardRequestDTO,
  ClaimRewardResponseDTO,
} from '../expeditions/services/rewards/Rewards.dto';

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
    path: '/expeditions/claim-task',
    options: {
      description: `Claim rewards (fragments) for specified type of task`,
      validate: {
        payload: ClaimTaskRequestDTO,
      },
      tags: ['api', 'expeditions', 'claimTask'],
      response: {
        schema: ClaimTaskResponseDTO,
      },
    },
    handler: claimTask as HandlerDecorations,
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

  server.route({
    method: 'POST',
    path: '/expeditions/register-daily-swap',
    options: {
      description: 'Registers a trade made through swapr dapp',
      validate: {
        payload: RegisterDailySwapRequestDTO,
      },
      tags: ['api', 'expeditions', 'dailySwap'],
      response: {
        schema: RegisterDailySwapResponseDTO,
      },
    },
    handler: registerDailySwap as HandlerDecorations,
  });

  server.route({
    method: 'POST',
    path: '/expeditions/claim-reward',
    options: {
      description:
        'Creates claim signature for nft reward that can be claimed on nft contract',
      validate: {
        payload: ClaimRewardRequestDTO,
      },
      tags: ['api', 'expeditions', 'claimReward'],
      response: {
        schema: ClaimRewardResponseDTO,
      },
    },
    handler: claimReward as HandlerDecorations,
  });
}

export const RoutesPlugin = {
  name: 'swapr-expeditions-api/routes',
  version: '0.0.1',
  register,
};
