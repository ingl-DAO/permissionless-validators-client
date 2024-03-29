import { deserialize } from '@dao-xyz/borsh';
import { ProgramUsage, verifyVersion } from '@ingl-permissionless/axios';
import {
  computeVoteAccountRewardAPY,
  GeneralData,
  GENERAL_ACCOUNT_SEED,
  INGL_CONFIG_SEED,
  INGL_NFT_COLLECTION_KEY,
  INGL_REGISTRY_PROGRAM_ID,
  ProgramStorage,
  REGISTRY_PROGRAM_ID,
  ValidatorConfig
} from '@ingl-permissionless/state';
import { Metaplex, Nft, Sft, SftWithToken } from '@metaplex-foundation/js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  AccountInfo,
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  VoteAccountInfo
} from '@solana/web3.js';
import { BN } from 'bn.js';
import { InglValidator, Validator } from '../interfaces';

export class ValidatorService {
  constructor(
    private readonly connection = new Connection(
      clusterApiUrl(WalletAdapterNetwork.Devnet)
    ),
    private readonly metaplex = new Metaplex(connection)
  ) {}

  async loadValidatorStats(programId: PublicKey) {
    const [configAccountKey] = PublicKey.findProgramAddressSync(
      [Buffer.from(INGL_CONFIG_SEED)],
      programId
    );
    const [generalAccountKey] = PublicKey.findProgramAddressSync(
      [Buffer.from(GENERAL_ACCOUNT_SEED)],
      programId
    );
    const configAccountInfo = await this.connection.getAccountInfo(
      configAccountKey
    );
    if (!configAccountInfo)
      throw new Error('Fractionalized validator instance not initialized.');
    const { vote_account_id } = deserialize(
      configAccountInfo.data,
      ValidatorConfig,
      {
        unchecked: true,
      }
    );
    const voteAccountKey = new PublicKey(vote_account_id);
    const [collectionkey] = PublicKey.findProgramAddressSync(
      [Buffer.from(INGL_NFT_COLLECTION_KEY)],
      programId
    );

    let validatorConfigAccountInfo: AccountInfo<Buffer> | null,
      generalAccountInfo: AccountInfo<Buffer> | null,
      collectionMetadata: Sft | SftWithToken | Nft,
      voteAccountInfo: VoteAccountInfo | null;
    try {
      const response = await Promise.all([
        this.connection.getAccountInfo(configAccountKey),
        this.connection.getAccountInfo(generalAccountKey),
        this.metaplex.nfts().findByMint({ mintAddress: collectionkey }),
        this.connection.getVoteAccounts(),
      ]);

      validatorConfigAccountInfo = response[0];
      generalAccountInfo = response[1];
      collectionMetadata = response[2];
      // eslint-disable-next-line prefer-const
      let { current, delinquent } = response[3];
      current = current.concat(delinquent);
      voteAccountInfo =
        current.find((voteAccount) => {
          return voteAccount.votePubkey === voteAccountKey.toString();
        }) ?? null;
    } catch (e) {
      throw new Error('Failed to config account info and general account info');
    }
    if (
      !validatorConfigAccountInfo ||
      !generalAccountInfo ||
      !collectionMetadata
    ) {
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
      console.log(' No vote account data found');
      // throw new Error(
      //   'Error: Vote account info not created yet. Please if your are the owner of this validator use the ingl cli to create one.'
      // );
    }
    const { uri, json, jsonLoaded } = collectionMetadata;
    let jsonData = json;
    if (!jsonLoaded) {
      jsonData = await (await fetch(uri)).json();
    }
    const programVersion = await verifyVersion(
      ProgramUsage.PermissionlessValidator,
      programId.toBase58(),
      'Program'
    );
    const result: InglValidator = {
      programVersion,
      collection_id: collectionkey.toString(),
      // eslint-disable-next-line no-constant-condition
      collection_uri: jsonData?.image as string,
      creator_royalties: validatorConfigAccountData.creator_royalties,
      // TODO: determine how to calculate current skip rate
      // current_skip_rate: 0,
      default_uri: validatorConfigAccountData.default_uri,
      governance_expiration_time:
        validatorConfigAccountData.governance_expiration_time / (24 * 3600), // in days
      init_commission: validatorConfigAccountData.commission,
      initial_redemption_fee: validatorConfigAccountData.initial_redemption_fee,
      is_validator_id_switchable:
        validatorConfigAccountData.is_validator_id_switchable,
      nft_holders_share: validatorConfigAccountData.nft_holders_share,
      proposal_quorum: validatorConfigAccountData.proposal_quorum,
      redemption_fee_duration:
        validatorConfigAccountData.redemption_fee_duration,
      total_delegated_count:
        new BN(generalAccountData.total_delegated).toNumber() /
        new BN(validatorConfigAccountData.unit_backing).toNumber(),
      max_primary_stake:
        new BN(validatorConfigAccountData.max_primary_stake).toNumber() /
        LAMPORTS_PER_SOL,
      total_secondary_stake:
        new BN(voteAccountInfo?.activatedStake ?? 0).toNumber() /
        LAMPORTS_PER_SOL,
      unit_backing:
        new BN(validatorConfigAccountData.unit_backing).toNumber() /
        LAMPORTS_PER_SOL,
      validator_apy: await computeVoteAccountRewardAPY(
        this.connection,
        generalAccountData
      ),
      validator_id: new PublicKey(
        validatorConfigAccountData.validator_id
      ).toString(),
      validator_name: validatorConfigAccountData.validator_name,
      vote_account_id: new PublicKey(
        validatorConfigAccountData.vote_account_id
      ).toString(),
      website: validatorConfigAccountData.website,
      discord_invite: validatorConfigAccountData.discord_invite,
      twitter_handle: validatorConfigAccountData.twitter_handle,
      total_minted_count: generalAccountData.mint_numeration,
      total_delegated_stake:
        new BN(generalAccountData.total_delegated).toNumber() /
        LAMPORTS_PER_SOL,
    };
    return result;
  }

  async loadValidators(): Promise<Validator[]> {
    const [registryConfigKey] = PublicKey.findProgramAddressSync(
      [Buffer.from('config')],
      INGL_REGISTRY_PROGRAM_ID
    );
    const registryAccountInfo = await this.connection.getAccountInfo(
      registryConfigKey
    );
    if (!registryAccountInfo)
      throw Error(
        `Validator registry with id ${registryConfigKey.toBase58()} was not found.`
      );
    const [permissionlessSorageAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from('storage')],
      REGISTRY_PROGRAM_ID
    );
    const permissionlessStorageAccountInfo =
      await this.connection.getAccountInfo(permissionlessSorageAddress);
    if (!permissionlessStorageAccountInfo) return [];

    const { programs } = deserialize(
      permissionlessStorageAccountInfo.data,
      ProgramStorage,
      { unchecked: true }
    );
    const configAccountKeys: PublicKey[] = [];
    const collectionAccountKeys: PublicKey[] = [];
    const generalDataAccountKeys: PublicKey[] = [];
    const configAccountInfoPromises = await Promise.all(
      programs.map((program) => {
        const programId = new PublicKey(program);
        const [configAccountKey] = PublicKey.findProgramAddressSync(
          [Buffer.from(INGL_CONFIG_SEED)],
          new PublicKey(programId)
        );
        const [collectionAccountKey] = PublicKey.findProgramAddressSync(
          [Buffer.from(INGL_NFT_COLLECTION_KEY)],
          new PublicKey(programId)
        );
        const [generalDataAccountKey] = PublicKey.findProgramAddressSync(
          [Buffer.from(GENERAL_ACCOUNT_SEED)],
          new PublicKey(programId)
        );
        configAccountKeys.push(configAccountKey);
        collectionAccountKeys.push(collectionAccountKey);
        generalDataAccountKeys.push(generalDataAccountKey);
        return this.connection.getAccountInfo(configAccountKey);
      })
    );
    const collectionNfts = await Promise.all(
      collectionAccountKeys.map((collectionkey) =>
        this.metaplex.nfts().findByMint({ mintAddress: collectionkey })
      )
    );
    const generalDataAccountInfos = await Promise.all(
      generalDataAccountKeys.map((accountKey) =>
        this.connection.getAccountInfo(accountKey)
      )
    );

    const configAccountInfos = await Promise.all(configAccountInfoPromises);
    return await Promise.all(
      configAccountInfos.map(async (accountInfo, index) => {
        const {
          validator_name,
          website,
          nft_holders_share,
          max_primary_stake,
          unit_backing,
          vote_account_id: vote_account,
        } = deserialize(accountInfo?.data as Buffer, ValidatorConfig, {
          unchecked: true,
        });
        const generalData = deserialize(
          generalDataAccountInfos[index]?.data as Buffer,
          GeneralData,
          { unchecked: true }
        );
        const { uri, json, jsonLoaded } = collectionNfts[index];
        let jsonData = json;
        if (!jsonLoaded) {
          jsonData = await (await fetch(uri)).json();
        }

        return {
          validator_name,
          validator_website: website,
          nft_share: nft_holders_share,
          unit_backing: new BN(unit_backing),
          image_ref: jsonData?.image as string,
          total_requested_stake: max_primary_stake,
          vote_account_id: new PublicKey(vote_account).toString(),
          validator_program_id: new PublicKey(programs[index]).toBase58(),
          apy: await computeVoteAccountRewardAPY(this.connection, generalData),
        };
      })
    );
  }
}
