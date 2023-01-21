import { deserialize } from '@dao-xyz/borsh';
import {
  AUTHORIZED_WITHDRAWER_KEY,
  computeVoteAccountRewardAPY,
  GeneralData,
  GENERAL_ACCOUNT_SEED,
  INGL_CONFIG_SEED,
  INGL_MINT_AUTHORITY_KEY,
  INGL_NFT_COLLECTION_KEY,
  PD_POOL_ACCOUNT_KEY,
  URIS_ACCOUNT_SEED,
  ValidatorConfig,
  VOTE_ACCOUNT_KEY,
} from '@ingl-permissionless/state';
import { Metaplex } from '@metaplex-foundation/js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletContextState } from '@solana/wallet-adapter-react';
import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
} from '@solana/web3.js';
import { BN } from 'bn.js';
import { InglValidator } from '../interfaces';

export class ValidatorService {
  constructor(
    private readonly programId: PublicKey,
    private readonly walletContext: WalletContextState,
    private readonly connection = new Connection(
      clusterApiUrl(WalletAdapterNetwork.Devnet)
    ),
    private readonly metaplex = new Metaplex(connection),
    private readonly configAccountPDA = PublicKey.findProgramAddressSync(
      [Buffer.from(INGL_CONFIG_SEED)],
      programId
    ),
    private readonly generalAccountPDA = PublicKey.findProgramAddressSync(
      [Buffer.from(GENERAL_ACCOUNT_SEED)],
      programId
    ),
    private readonly mintingPoolPDA = PublicKey.findProgramAddressSync(
      [Buffer.from(PD_POOL_ACCOUNT_KEY)],
      programId
    ),
    private readonly voteAccountPDA = PublicKey.findProgramAddressSync(
      [Buffer.from(VOTE_ACCOUNT_KEY)],
      programId
    ),
    private readonly urisAccountPDA = PublicKey.findProgramAddressSync(
      [Buffer.from(URIS_ACCOUNT_SEED)],
      programId
    ),
    private readonly mintAuthorityPDA = PublicKey.findProgramAddressSync(
      [Buffer.from(INGL_MINT_AUTHORITY_KEY)],
      programId
    ),
    private readonly authorizedWithdrawerPDA = PublicKey.findProgramAddressSync(
      [Buffer.from(AUTHORIZED_WITHDRAWER_KEY)],
      programId
    ),
    private readonly collectionPDA = PublicKey.findProgramAddressSync(
      [Buffer.from(INGL_NFT_COLLECTION_KEY)],
      programId
    )
  ) {}

  async loadValidatorStats() {
    let validatorConfigAccountInfo,
      generalAccountInfo,
      collectionMetadata,
      voteAccountInfo;
    try {
      const response = await Promise.all([
        this.connection.getAccountInfo(this.configAccountPDA[0]),
        this.connection.getAccountInfo(this.generalAccountPDA[0]),
        this.metaplex.nfts().findByMint({ mintAddress: this.collectionPDA[0] }),
        this.connection.getVoteAccounts(),
      ]);
      validatorConfigAccountInfo = response[0];
      generalAccountInfo = response[1];
      collectionMetadata = response[2];
      // eslint-disable-next-line prefer-const
      let { current, delinquent } = response[3];
      current = current.concat(delinquent);

      voteAccountInfo = current.find((voteAccount) => {
        return voteAccount.votePubkey === this.voteAccountPDA[0].toString();
      });
      voteAccountInfo = voteAccountInfo ?? null;
    } catch (e) {
      console.log(
        "message: 'Failed to config account info and general account info"
      );
      console.log('error: ', e);
      throw new Error('Failed to config account info and general account info');
    }
    // console.log('voteAccountData: ', voteAccountInfo);
    if (
      !validatorConfigAccountInfo ||
      !generalAccountInfo ||
      !collectionMetadata
    ) {
      console.log(
        'message: Either config account info or general account info is null'
      );
      throw new Error('Could not load validator stats');
    }

    const validatorConfigAccountData = deserialize(
      validatorConfigAccountInfo?.data,
      ValidatorConfig,
      { unchecked: true }
    );
    const generalAccountData = deserialize(
      generalAccountInfo?.data,
      GeneralData,
      { unchecked: true }
    );

    if (!voteAccountInfo) {
      console.log('Error: Vote account info is null');
    }
    console.log(validatorConfigAccountData.default_uri);
    const result: InglValidator = {
      collection_id: this.collectionPDA[0].toString(),
      // eslint-disable-next-line no-constant-condition
      collection_uri: validatorConfigAccountData.default_uri,
      creator_royalties: validatorConfigAccountData.creator_royalties,
      // TODO: determine how to calculate current skip rate
      // current_skip_rate: 0,
      default_uri: validatorConfigAccountData.default_uri,
      governance_expiration_time:
        validatorConfigAccountData.governance_expiration_time / 360, // in hours
      init_commission: validatorConfigAccountData.commission,
      initial_redemption_fee: validatorConfigAccountData.initial_redemption_fee,
      is_validator_id_switchable:
        validatorConfigAccountData.is_validator_id_switchable,
      nft_holders_share: validatorConfigAccountData.nft_holders_share,
      proposal_quorum: validatorConfigAccountData.proposal_quorum,
      redemption_fee_duration:
        validatorConfigAccountData.redemption_fee_duration,
      total_delegated_count: Number(
        new BN(generalAccountData.total_delegated)
          .div(new BN(validatorConfigAccountData.unit_backing))
          .toString(10)
      ),
      max_primary_stake: new BN(
        Number(validatorConfigAccountData.max_primary_stake.toString(10)) /
          LAMPORTS_PER_SOL
      ),
      total_secondary_stake: new BN(voteAccountInfo?.activatedStake ?? 0),
      unit_backing: new BN(
        Number(validatorConfigAccountData.unit_backing.toString(10)) /
          LAMPORTS_PER_SOL
      ),
      validator_apy: await computeVoteAccountRewardAPY(
        generalAccountData,
        validatorConfigAccountData,
        this.connection
      ),
      validator_id: new PublicKey(
        validatorConfigAccountData.validator_id
      ).toString(),
      validator_name: validatorConfigAccountData.validator_name,
      vote_account_id: this.voteAccountPDA[0].toString(),
      website: validatorConfigAccountData.website,
      discord_invite: validatorConfigAccountData.discord_invite,
      twitter_handle: validatorConfigAccountData.twitter_handle,
      total_minted_count: generalAccountData.mint_numeration,
      total_delegated_stake: new BN(
        Number(generalAccountData.total_delegated.toString(10)) /
          LAMPORTS_PER_SOL
      ),
    };

    return result;
  }
}
