export interface Validator {
  program_id: string;
  validator_name: string;
  validator_logo_url: string;
  vote_account_id: string;
  number_of_unique_stakers: number;
  price: number; //in sol
  total_stake: number; //in sol
  seller_public_key: string;
  buyer_public_key?: string; // optional
  secondary_items: ValidatorSecondaryItem[];
}
export interface ValidatorSecondaryItem {
  date_validated?: number;
  price: number; //in sol
  description: string;
  name: string;
}

export interface ValidatorListing
  extends Omit<
    Validator,
    | 'number_of_unique_stakers'
    | 'total_stake'
    | 'program_id'
    | 'seller_public_key'
  > {
  description: string;
  mediatable_date: number;
}

export interface StakePerEpoch {
  epoch: number;
  stake: number; //in sol
}

export interface ValidatorDetails extends ValidatorListing, Validator {
  validator_id: string;
  validator_initial_epoch: number;
  total_validator_rewards: number;
  date_validated?: number; // in seconds
  request_mediation_date?: number; //in seconds

  stake_per_epochs: StakePerEpoch[];
}