export interface Validator {
  validator_name: string;
  validator_website: string;
  vote_account_id: string;
  nft_share: number;
  total_requested_stake: number;
  apy: number;
  image_ref: string;
}

export interface InglNft {
  nft_pubkey: string;
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

export interface ValidatorMetaData {
  rarities: number[];
  rarity_names: string[];
  twitter_handle: string;
  discord_invite: string;
}

export interface ValidatorRegistration extends ValidatorMetaData {
  proposal_quorum: number;
  init_commission: number; //in percentage
  total_delegated_stake: string; //in lamports (big number)
  initial_redemption_fee: number;
  is_validator_id_switchable: boolean;
  unit_backing: string; //big number
  redemption_fee_duration: number;
  creator_royalties: number;
  validator_name: string;
  collection_uri: string;
  nft_holders_share: number;
  website: string;
  governance_expiration_time: number;
  default_uri: string;
}
export interface InglValidator
  extends Omit<ValidatorRegistration, keyof ValidatorMetaData> {
  validator_id: string;
  validator_apy: number;
  current_skip_rate: number;
  vote_account_id: number;
  collection_id: string;
  total_delegated_count: number;
  total_secondary_stake: string; // in lamports (big number)
}
