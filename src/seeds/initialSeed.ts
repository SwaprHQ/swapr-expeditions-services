import { constants } from 'ethers';
import Mongoose, { HydratedDocument } from 'mongoose';
import { config } from 'dotenv';
import { RarityType } from '../modules/expeditions/interfaces/IReward.interface';
import { CampaignModel } from '../modules/expeditions/models/Campaign.model';
import { RewardModel } from '../modules/expeditions/models/Reward.model';
import { getWeekInformation } from '../modules/expeditions/utils';
import { ICampaign } from '../modules/expeditions/interfaces/ICampaign.interface';

config();

const seedRewards = async () => {
  Mongoose.connect(process.env.MONGO_URI || '');

  const week = getWeekInformation();
  let campaign: HydratedDocument<ICampaign> | null;

  campaign = await CampaignModel.findOne({
    startDate: { $lte: week.startDate },
    redeemEndDate: { $gte: week.endDate },
  });

  if (!campaign) {
    campaign = await new CampaignModel({
      startDate: week.startDate.subtract(2, 'weeks').toDate(),
      endDate: week.endDate.add(2, 'weeks').toDate(),
      redeemEndDate: week.endDate.add(3, 'weeks').toDate(),
      initiatorAddress: constants.AddressZero,
    }).save();
  }

  const rewards = [
    {
      description:
        'A journey through space-time. A traversal of the lavendar sea. Discoveries and dangers beyond the imagination. \n\nStop. Think. Breathe. This expedition is the start of a journey larger than life. Are you ready? \n\nThis NFT was claimable for 50 Fragments in the initial Swapr Expeditions event.',
      imageURI: `ipfs://QmRo7LhZFJHkVqKkQL9ySbEX1pyPXVvUZ7Xz9zDQNK765f/1.png`,
      name: `Introspection`,
      nftAddress: process.env.NFT_CONTRACT_ADDRESS || '',
      rarity: RarityType.COMMON,
      requiredFragments: 50,
      tokenId: `1`,
      campaign_id: campaign._id,
    },
    {
      description:
        'You dream of a world plagued. The Pestilence paints a beautiful mockery of life and death. So... familiar. \nThis NFT was claimable for 100 Fragments in the initial Swapr Expeditions event. \nIt grants the “scourge” profile accent at https://swapr.eth.limo/ to the NFT holder.',
      imageURI: `ipfs://QmRo7LhZFJHkVqKkQL9ySbEX1pyPXVvUZ7Xz9zDQNK765f/2.png`,
      name: `Visions of Scourge`,
      nftAddress: process.env.NFT_CONTRACT_ADDRESS || '',
      rarity: RarityType.COMMON,
      requiredFragments: 100,
      tokenId: `2`,
      campaign_id: campaign._id,
    },
    {
      description:
        'A shell of its former self, your home planet lay in a state of disarray. Mysterious creatures plague the surface, eradicating what little life remains in the once prosperous world. You WILL find a better world for your race. This NFT was claimable for 200 Fragments in the initial Swapr Expeditions event.',
      imageURI: 'ipfs://QmRo7LhZFJHkVqKkQL9ySbEX1pyPXVvUZ7Xz9zDQNK765f/3.png',
      name: 'Birth',
      nftAddress: process.env.NFT_CONTRACT_ADDRESS || '',
      rarity: RarityType.UNCOMMON,
      requiredFragments: 200,
      tokenId: `3`,
      campaign_id: campaign._id,
    },
    {
      description:
        'A shell of its former self, your home planet lay in a state of disarray. Mysterious creatures plague the surface, eradicating what little life remains in the once prosperous world. You WILL find a better world for your race. This NFT was claimable for 200 Fragments in the initial Swapr Expeditions event.',
      imageURI: 'ipfs://QmRo7LhZFJHkVqKkQL9ySbEX1pyPXVvUZ7Xz9zDQNK765f/4.png',
      name: 'Visions of Creation',
      nftAddress: process.env.NFT_CONTRACT_ADDRESS || '',
      rarity: RarityType.UNCOMMON,
      requiredFragments: 300,
      tokenId: `4`,
      campaign_id: campaign._id,
    },
    {
      description:
        'Have you made peace with your future? A life of pilgrimage and uncertainty. Prospect and vulnerability. You gather yourself and return to your vessel. This NFT was claimable for 450 Fragments in the initial Swapr Expeditions event.',
      imageURI: 'ipfs://QmRo7LhZFJHkVqKkQL9ySbEX1pyPXVvUZ7Xz9zDQNK765f/5.png',
      name: 'Wayfarer',
      nftAddress: process.env.NFT_CONTRACT_ADDRESS || '',
      rarity: RarityType.RARE,
      requiredFragments: 450,
      tokenId: `5`,
      campaign_id: campaign._id,
    },
    {
      description:
        'You dream of draught. THe fascinating environment that was stripped away from your world. Beauty beyond the beholder. This NFT was claimable for 600 Fragments in the initial Swapr Expeditions event. It grants the “depth” profile accent at https://swapr.eth.limo/ to the NFT holder.',
      imageURI: 'ipfs://QmRo7LhZFJHkVqKkQL9ySbEX1pyPXVvUZ7Xz9zDQNK765f/6.png',
      name: 'Visions of Depth',
      nftAddress: process.env.NFT_CONTRACT_ADDRESS || '',
      rarity: RarityType.RARE,
      requiredFragments: 600,
      tokenId: `6`,
      campaign_id: campaign._id,
    },
    {
      description:
        'A life of yearning. Searching for somewhere that may not exist. You make peace with your arrangement and take one final look at your home. This NFT was claimable for 800 Fragments in the initial Swapr Expeditions event.',
      imageURI: 'ipfs://QmRo7LhZFJHkVqKkQL9ySbEX1pyPXVvUZ7Xz9zDQNK765f/7.png',
      name: 'Preparations',
      nftAddress: process.env.NFT_CONTRACT_ADDRESS || '',
      rarity: RarityType.EPIC,
      requiredFragments: 800,
      tokenId: `7`,
      campaign_id: campaign._id,
    },
    {
      description:
        'You dream of the end. destruction and death beyond comprehension. A universe that lay in ruin. This NFT was claimable for 1000 Fragments in the initial Swapr Expeditions event. It grants the “cessation” profile accent at https://swapr.eth.limo/ to the NFT holder.',
      imageURI: 'ipfs:/QmRo7LhZFJHkVqKkQL9ySbEX1pyPXVvUZ7Xz9zDQNK765f/8.png',
      name: 'Visions of Cessation',
      nftAddress: process.env.NFT_CONTRACT_ADDRESS || '',
      rarity: RarityType.EPIC,
      requiredFragments: 1000,
      tokenId: `8`,
      campaign_id: campaign._id,
    },
    {
      description:
        'Adventure lay ahead. The fate of you and your people rests solely in your hands. You fire the engines of your small craft and, in a fiery blaze, exit the atmosphere. This NFT was claimable for 1250 Fragments in the initial Swapr Expeditions event.',
      imageURI: 'ipfs://QmRo7LhZFJHkVqKkQL9ySbEX1pyPXVvUZ7Xz9zDQNK765f/9.png',
      name: 'Launch',
      nftAddress: process.env.NFT_CONTRACT_ADDRESS || '',
      rarity: RarityType.LEGENDARY,
      requiredFragments: 1250,
      tokenId: `9`,
      campaign_id: campaign._id,
    },
    {
      description:
        'You dream of splendor. A vision so surreal, representing the resounding success of your journey. This NFT was claimable for 1500 Fragments in the initial Swapr Expeditions event. It grants the “grandeur” profile accent at https://swapr.eth.limo/ to the NFT holder.',
      imageURI: 'ipfs://QmRo7LhZFJHkVqKkQL9ySbEX1pyPXVvUZ7Xz9zDQNK765f/10.png',
      name: 'Visions of Grandeur',
      nftAddress: process.env.NFT_CONTRACT_ADDRESS || '',
      rarity: RarityType.LEGENDARY,
      requiredFragments: 1500,
      tokenId: `10`,
      campaign_id: campaign._id,
    },
  ];

  for await (const seed of rewards) {
    await RewardModel.findOneAndUpdate(
      {
        campaign_id: seed.campaign_id,
        tokenId: seed.tokenId,
      },
      seed,
      { upsert: true }
    );
  }

  console.log('done');
};

seedRewards()
  .then(() => {
    process.exit(0);
  })
  .catch(reason => {
    console.error(reason);
    process.exit(1);
  });
