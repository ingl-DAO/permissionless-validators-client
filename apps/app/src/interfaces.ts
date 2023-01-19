export interface Validator {
  validator_program_id: string;
  validator_name: string;
  validator_website: string;
  vote_account_id: string;
  nft_share: number;
  total_requested_stake: number;
  apy: number;
  image_ref: string;
}

export interface InglNft {
  nft_mint_id: string;
  image_ref: string;
  video_ref?: string;
  rarity?: string;
  is_delegated: boolean;
  numeration: number;
}

export interface NftReward {
  nft_pubkey: string;
  image_ref: string;
  numeration: number;
  rewards: number;
}
