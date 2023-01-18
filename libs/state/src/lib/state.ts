import { field, option, variant, vec } from '@dao-xyz/borsh';
import { PublicKey } from '@solana/web3.js';
import * as BN from 'bn.js';

export const DEVNET_PRICE_FEEDS = [
  '9ATrvi6epR5hVYtwNs7BB7VCiYnd4WM7e8MfafWpfiXC', //BTC_USD
  '7LLvRhMs73FqcLkA8jvEE1AM2mYZXTmqfUv8GAEurymx', //SOL_USD
  '6fhxFvPocWapZ5Wa2miDnrX2jYRFKvFqYnX11GGkBo2f', //ETH_USD
  'DR6PqK15tD21MEGSLmDpXwLA7Fw47kwtdZeUMdT7vd7L', //BNB_USD
  'HPRYVJQ3DcTqszvorS4gCwbJvvNeWMgaCCoF3Lj3sAgC', //ADA_USD
  '2qcLzR7FatMnfCbiB9BdhGsd6SxDgEqWq7xkD62n3xoT', //BCH_USD
  'Bux82YCH8DgqFAQTKBxuQHDp3cud5AhD1Kibhjadz22D', //SBR_USD
  '9gGvxPErkRubNj1vKE19smLa4Kp89kkzMVyA6TMvmKEZ', //ZEC_USD
  '3WNhN4RJwRui4R3k1S9agGzyMZkCwKQkWjoEHbDeAF8J', //LUNA_USD
  'CNzjdKHfXqyAeGd2APpzvwLcuPACrFdHb3k6SLsod6Ao', //TRX_USD
  '6cBTHY4HQ4PABmhUqVLT4n4bNpmZAi2br5VnqTQoVRUo', //SUSHI_USD
  'GRGMtrTszsoNzjqwTxsvkHVAPq5Snju2UzaAws5KBPed', //DOGE_USD
  'C9CeLP5B4Lqq7cFppRBUZjt6hrvd99YR3Sk4EPPuAoAC', //LTC_USD
  'FReW6u9YPpGQNaeEHNkVqA4KGA2WzbcT87NThwFb7fwm', //XLM_USD
  'GEp5pZFjFPqn1teMmx9sLPyADf9N9aQsRn9TE17PwmmL', //LINK_USD
  'Fd3UQMqmKCA6SNf6To97PdC2H3EfzYWR5bxr5CBYuFiy', //DOT_USD
  'EQHf8ueSzJUPELF6yZkyGfwjbLsDmMwFrAYehmC15b6c', //XMR_USD
  'C5x5W7BHVY61ULtWQ3qkP7kpE6zHViWd4AHpKDuAywPw', //SRM_USD
  'HnbpTLbdv78hkVCDBZ52o5E6bkqtsZp4tUXBd2E8Sw9x', //PORT_USD
  'EbpMMgMkC4Jt2oipUBc2GPL4XQo5uxKT8NpF8NEZWvqL', //PAI_USD
];
export const MAINNET_PRICE_FEEDS = [
  '8SXvChNYFhRq4EZuZvnhjrB3jJRQCv4k3P4W6hesH3Ee', //BTC
  'E3cqnoFvTeKKNsGmC8YitpMjo2E39hwfoyt2Aiem7dCb', //SOL
];
export const INITIALIZER_ID = new PublicKey(
  '62uPowNXr22WPw7XghajJkWMBJ2fnv1oGthxqHYYPHie'
);
export const PROGRAM_REGISTRY_ID = new PublicKey(
  '38pfsot7kCZkrttx1THEDXEz4JJXmCCcaDoDieRtVuy5'
);
export const SYSVAR_STAKE_HISTORY_ID = new PublicKey(
  'Team111111111111111111111111111111111111111'
);
export const INGL_CONFIG_SEED = 'ingl_config';
export const URIS_ACCOUNT_SEED = 'uris_account';
export const GENERAL_ACCOUNT_SEED = 'general_account';
export const INGL_NFT_COLLECTION_KEY = 'ingl_nft_collection';
export const INGL_MINT_AUTHORITY_KEY = 'ingl_mint_authority';
export const COLLECTION_HOLDER_KEY = 'collection_holder';
export const VOTE_ACCOUNT_KEY = 'vote_account';
export const AUTHORIZED_WITHDRAWER_KEY = 'authorized_withdrawer';
export const STAKE_ACCOUNT_KEY = 'stake_account';
export const PD_POOL_ACCOUNT_KEY = 'pd_pool_account';
export const NFT_ACCOUNT_CONST = 'nft_account';
export const INGL_PROGRAM_AUTHORITY_KEY = 'ingl_program_authority';
export const INGL_PROPOSAL_KEY = 'ingl_proposal';
export const VRF_STATE_KEY = 'ingl_vrf_state_key';
export const VALIDATOR_ID_SEED = 'validator_ID___________________';
export const T_STAKE_ACCOUNT_KEY = 't_stake_account_key';
export const T_WITHDRAW_KEY = 't_withdraw_key';

class FundsLocation {}
@variant(0)
export class Delegated extends FundsLocation {}

@variant(1)
export class Undelegated extends FundsLocation {}

export class Vote extends Map<number, boolean> {}

export class NftData {
  @field({ type: 'u32' })
  public validation_phrase!: number;

  @field({ type: option('u8') })
  public rarity?: number;

  @field({ type: option('u32') })
  public rarity_seed_time?: number;

  @field({ type: FundsLocation })
  public funds_location!: FundsLocation;

  @field({ type: 'u32' })
  public numeration!: number;

  @field({ type: 'u32' })
  public date_created!: number;

  @field({ type: option('u64') })
  public last_withdrawal_epoch?: BN;

  @field({ type: option('u64') })
  public last_delegation_epoch?: BN;

  @field({ type: vec('u64') })
  public all_withdraws!: BN[];

  @field({ type: Vote })
  public all_votes!: Vote;

  constructor(properties?: {
    validation_phrase: number;
    date_created: number;
    class: number;
    redeemable_date: number;
    numeration: number;
    rarity: number;
    funds_location: FundsLocation;
    rarity_seed_time?: number;
    date_allocated?: number;
    last_voted_proposal?: PublicKey;
    last_withdrawal_epoch?: BN;
    last_delegation_epoch?: BN;
    can_auto_delegate?: boolean;
    all_withdraws: BN[];
    all_votes: Vote;
  }) {
    if (properties) {
      this.validation_phrase = properties.validation_phrase;
      this.date_created = properties.date_created;
      this.numeration = properties.numeration;
      this.rarity = properties.rarity;
      this.funds_location = properties.funds_location;
      this.rarity_seed_time = properties.rarity_seed_time;
      this.last_delegation_epoch = properties.last_delegation_epoch;
      this.last_withdrawal_epoch = properties.last_withdrawal_epoch;
      this.all_withdraws = properties.all_withdraws;
      this.all_votes = properties.all_votes;
    }
  }
}