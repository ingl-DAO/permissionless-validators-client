import BN from 'bn.js';

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
  rarity?: string;
  is_delegated: boolean;
  video_ref?: string;
  numeration: number;
}

export interface NftReward {
  nft_mint_id: string;
  image_ref: string;
  numeration: number;
  rewards: BN;
}

export interface ValidatorRarity {
  rarities: number[];
  rarity_names: string[];
}

export interface ValidatorRegistration extends ValidatorRarity {
  proposal_quorum: number;
  init_commission: number; //in percentage
  max_primary_stake: BN; //in lamports (big number)
  initial_redemption_fee: number;
  is_validator_id_switchable: boolean;
  unit_backing: BN; //big number
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
  total_delegated_stake: BN;
  total_secondary_stake: BN; // in lamports (big number)
}
// the JSON file format is as followed:
export interface NftJSON {
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

export abstract class GovernanceType {}
export interface GovenanceInterface {
  proposal_id: string;
  title: string;
  description: string;
  votes: [number, boolean][];
  is_still_ongoing: boolean; //can vote
  did_proposal_pass?: boolean; //succeded a few second ago
  is_proposal_executed: boolean;
  date_finalize?: boolean; //completed
  expiration_time: boolean;
  govenance_type: GovernanceType;
}
export class ConfigAccount extends GovernanceType {}
export class ProgramUpgrade extends GovernanceType {
  public buffer_account!: string;

  public code_link!: string;

  constructor(properties: ProgramUpgrade) {
    super();
    Object.assign(this, properties);
  }
}
export class VoteAccountGovernance extends GovernanceType {}
