import BN from 'bn.js';

export interface Validator {
  validator_name: string;
  validator_logo_url: string;
  vote_account_id: string;
  number_of_unique_stakers: number;
  price: BN;
  total_stake: BN;
}
export interface ValidatorSecondaryItem {
  desciption: string;
  price: BN;
}

export interface ValidatorListing
  extends Omit<Validator, 'number_of_unique_stakers' | 'total_stake'> {
  validator_id: string;
  authorized_withdrawer_id: string;
  description: string;
  should_transfer_validator_secondary_items: boolean;
  mediation_time: number | undefined; // optional
  validator_secondary_item: ValidatorSecondaryItem[] | undefined; // optional
  seller_public_key: string;
}

export interface StakePerEpoch {
  epoch: number;
  stake: BN;
}

export interface ConfirmedValidatorSecondaryItem
  extends ValidatorSecondaryItem {
  confirmed: boolean;
}

export interface ValidatorDetails extends ValidatorListing {
  is_sold: boolean;
  number_of_unique_stakers: number;
  total_stake: BN;
  validator_initial_epoch: number;
  stake_per_epochs: StakePerEpoch[];
  total_validator_rewards: BN;
  buyer_public_key: string | undefined; // optional
  confirmed_secondary_items: ConfirmedValidatorSecondaryItem[] | undefined; // optional
  is_mediation_requested: boolean | undefined; // optional
  requested_mediation_date: Date | undefined;
}

export type PurchasedValidator = Pick<
  Validator,
  'validator_logo_url' | 'price' | 'vote_account_id'
>;

export interface MyPurchases {
  validators: PurchasedValidator[];
}
