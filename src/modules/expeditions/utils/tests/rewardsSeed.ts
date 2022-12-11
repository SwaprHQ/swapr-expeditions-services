import { IReward, RarityType } from '../../interfaces/IReward.interface';
import { AddressWithId } from '../../interfaces/shared';
import { RewardModel } from '../../models/Reward.model';
import { ActiveReward } from '../../services/rewards/Rewards.types';

export const seedRewards = async ({
  campaign_id,
}: Omit<AddressWithId, 'address'>) => {
  const rarityArray = Object.values(RarityType);

  const { seeds, rewards } = rarityArray.reduce<{
    rewards: ActiveReward[];
    seeds: IReward[];
  }>(
    (total, rarity, index) => {
      const id = index + 1;

      const reward = {
        description: `Description${id}`,
        imageURI: `ipfs://${id}.png`,
        name: `Name${id}`,
        nftAddress: process.env.NFT_CONTRACT_ADDRESS || '',
        rarity,
        requiredFragments: id * 100,
        tokenId: `${id}`,
      };

      const seed = { ...reward, campaign_id };

      total.rewards.push(reward);
      total.seeds.push(seed);

      return total;
    },
    { rewards: [], seeds: [] }
  );

  await RewardModel.insertMany(seeds);

  return rewards;
};
