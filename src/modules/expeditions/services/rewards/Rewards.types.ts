import { RarityType } from '../../interfaces/IReward.interface';

export interface IRewardMetadata {
  name: string;

  description: string;

  image: string;

  properties: {
    rarity: RarityType;

    author: string;

    campaignId: string;

    fragmentsRequired: number;
  };
}
