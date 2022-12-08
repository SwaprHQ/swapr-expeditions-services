import { Types } from 'mongoose';

export enum RarityType {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

export interface IReward {
  nftAddress: string;
  tokenId: string;
  name: string;
  description: string;
  requiredFragments: number;
  rarity: RarityType;
  imageURI: string;
  campaign_id: Types.ObjectId;
}
