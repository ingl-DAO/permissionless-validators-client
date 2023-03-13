import BN from 'bn.js';

export interface Validator {
  validator_program_id: string;
  validator_name: string;
  validator_website: string;
  vote_account_id: string;
  nft_share: number;
  total_requested_stake: BN;
  apy: number;
  image_ref: string;
  unit_backing?: BN;
}

export interface InglNft {
  nft_mint_id: string;
  image_ref: string;
  rarity?: string;
  is_delegated: boolean;
  video_ref?: string;
  numeration: number;
  votes: {
    numeration: number;
    vote: boolean;
  }[];
}

export interface NftReward {
  nft_mint_id: string;
  image_ref: string;
  numeration: number;
  rewards: number;
}

export interface Rarity {
  rarity: number;
  uris: string[];
}
export interface ValidatorRarity {
  rarities: Rarity[];
  rarity_names: string[];
}

export interface ValidatorRegistration extends ValidatorRarity {
  proposal_quorum: number;
  init_commission: number; //in percentage
  max_primary_stake: number; //in sol
  initial_redemption_fee: number;
  is_validator_id_switchable: boolean;
  unit_backing: number; //in sol
  redemption_fee_duration: number;
  creator_royalties: number;
  validator_name: string;
  collection_uri: string;
  nft_holders_share: number;
  website: string;
  governance_expiration_time: number;
  default_uri: string;
  twitter_handle: string;
  discord_invite: string;
  validator_id?: string;
  vote_account_id?: string;
}
export interface InglValidator
  extends Omit<ValidatorRegistration, keyof ValidatorRarity> {
  validator_id: string;
  validator_apy: number;
  current_skip_rate?: number;
  vote_account_id: string;
  collection_id: string;
  total_delegated_count: number;
  total_minted_count: number;
  total_delegated_stake: number;
  total_secondary_stake: number; 
}
// the JSON file format is as followed:
export interface CollectionJson {
  collection_uri: string;
  rarity_names: string[];
  rarities: number[];
  uris: string[][];
  default_uri: string;
}
// A uri will be passed to a function that will return it's data with following structure:
export interface UriData {
  name: string;
  symbol: string;
  description: string;
  image: string;
  rarity: string;
}

export enum ConfigAccountEnum {
  MaxPrimaryStake = 'MaxPrimaryStake',
  NftHolderShare = 'NftHolderShare',
  InitialRedemptionFee = 'InitialRedemptionFee',
  RedemptionFeeDuration = 'RedemptionFeeDuration',
  ValidatorName = 'ValidatorName',
  TwitterHandle = 'TwitterHandle',
  DiscordInvite = 'DiscordInvite',
}

export enum VoteAccountEnum {
  ValidatorID = 'ValidatorID',
  Commission = 'Commission',
}

export interface ConfigAccountType {
  config_type: ConfigAccountEnum;
  value: number | string;
}

export interface ProgramUpgrade {
  buffer_account: string;
  code_link: string;
}

export interface VoteAccountGovernance {
  vote_type: VoteAccountEnum;
  value: number | string;
}

export interface CreateProposal {
  title: string;
  program_id: string;
  description: string;
  configAccount?: ConfigAccountType;
  programUpgrade?: ProgramUpgrade;
  voteAccount?: VoteAccountGovernance;
  nft_mint_id: string;
}

export interface GovernanceInterface
  extends Omit<CreateProposal, 'nft_mint_id'> {
  proposal_id: string;
  number_of_yes_votes: number;
  number_of_no_votes: number;
  is_still_ongoing: boolean; //can vote
  did_proposal_pass?: boolean; //succeded a few second ago
  is_proposal_executed: boolean;
  date_finalize?: number; //completed
  expiration_time: number; //in seconds
  proposal_numeration: number;
  proposal_quorum: number;
}
