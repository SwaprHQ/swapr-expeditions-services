/* 
    CONCEPT
    -- -- Fetching Images
    Option 1
    - on getCampaignProgress user gets address of the ERC1155 and id's of all rewards (tokens)
    - user fetches metadata from ipfs, then fetches image (present on metadata) from ipfs
    - everything is nicely displayed
    Option 2
    - we store imageURL in the backend
    - images are already served skipping metadata
    
    -- -- Checking if NFT is already owned
    Option 1
    - after getting ERC1155 address from response and array of tokenIds user make a query to a contract
    Option 2
    - we keep track of collected tokens in the Backend and add 'owned' flag to each nft fetched in 'rewards'

    -- -- Claiming
    - user fires claim reward endpoint with signature and tokenID
    - BE validates that there are enough fragments and signature
    - BE produces signed typed data (userAddress, tokenId), stores it in db and sends it back to the user
    - - if for some reason claiming process stops on the front end, next call for claim will return sig from db
    - user makes claim call to the contract
    - contract verifies if user already have it, verifies signature, if all good then token is minted

    -- -- style-affecting nfts
    - FE would need to have address of the ERC1155 contract
    - on init it would check balance of all tokens owned by the user
    - if user has some of them then it will be available to pick them from config menu
    - info about prefered style would be held in local-storage
    - each login would need to verify if user can use specified style

    -- 
*/

export class RewardsService {
  async getActiveRewards() {
    return;
  }
}
