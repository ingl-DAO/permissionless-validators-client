import { deserialize, serialize } from '@dao-xyz/borsh';
import { http } from '@ingl-permissionless/axios';
import {
  COLLECTION_HOLDER_KEY,
  Config,
  forwardLegacyTransaction,
  GENERAL_ACCOUNT_SEED,
  INGL_CONFIG_SEED,
  INGL_MINT_AUTHORITY_KEY,
  INGL_NFT_COLLECTION_KEY,
  INGL_REGISTRY_PROGRAM_ID,
  INGL_TEAM_ID,
  Init,
  MAX_PROGRAMS_PER_STORAGE_ACCOUNT,
  METAPLEX_PROGRAM_ID,
  toBytesInt32,
  URIS_ACCOUNT_SEED,
} from '@ingl-permissionless/state';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { WalletContextState } from '@solana/wallet-adapter-react';
import {
  AccountMeta,
  Connection,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import { ValidatorRegistration } from '../interfaces';

export const BACKEND_API = process.env['NX_MONITOR_BASE_URL'];
export class RegistryService {
  constructor(
    private readonly connection: Connection,
    private readonly walletContext: WalletContextState
  ) {}

  async getProgramId() {
    const { data } = await http.get<{ program_id: string } | null>(
      '/program-id'
    );
    if (data) return { program_id: data.program_id };
    else throw new Error('No deployed program is available');
  }

  async useProgramId(programId: string) {
    await http.put(`/${programId}/use`);
  }

  async registerProgram(
    programId: PublicKey,
    validatorId: PublicKey,
    registrationData: ValidatorRegistration
  ) {
    const payerPubkey = this.walletContext.publicKey;
    if (!payerPubkey)
      throw new WalletNotConnectedError('Please connect your wallet !!!');

    const payerAccount: AccountMeta = {
      pubkey: payerPubkey,
      isSigner: true,
      isWritable: true,
    };

    const validatorAccount: AccountMeta = {
      pubkey: validatorId,
      isWritable: false,
      isSigner: false,
    };

    const [inglConfigKey] = PublicKey.findProgramAddressSync(
      [Buffer.from(INGL_CONFIG_SEED)],
      programId
    );
    const configAccount: AccountMeta = {
      pubkey: inglConfigKey,
      isSigner: false,
      isWritable: true,
    };
    const [urisAccountKey] = PublicKey.findProgramAddressSync(
      [Buffer.from(URIS_ACCOUNT_SEED)],
      programId
    );
    const urisAccountAccount: AccountMeta = {
      isSigner: false,
      isWritable: true,
      pubkey: urisAccountKey,
    };

    const [inglNftCollectionMintKey] = PublicKey.findProgramAddressSync(
      [Buffer.from(INGL_NFT_COLLECTION_KEY)],
      programId
    );

    const collectionMintAccount: AccountMeta = {
      pubkey: inglNftCollectionMintKey,
      isSigner: false,
      isWritable: true,
    };

    const [collectionAutorityKey] = PublicKey.findProgramAddressSync(
      [Buffer.from(INGL_MINT_AUTHORITY_KEY)],
      programId
    );

    const mintAuthorityAccount: AccountMeta = {
      pubkey: collectionAutorityKey,
      isSigner: false,
      isWritable: true,
    };

    const splTokenProgramAccount: AccountMeta = {
      pubkey: TOKEN_PROGRAM_ID,
      isSigner: false,
      isWritable: false,
    };

    const sysvarRentAccount: AccountMeta = {
      pubkey: SYSVAR_RENT_PUBKEY,
      isSigner: false,
      isWritable: false,
    };

    const systemProgramAccount: AccountMeta = {
      pubkey: SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    };

    const [metaplexAccountKey] = await PublicKey.findProgramAddress(
      [
        Buffer.from('metadata'),
        METAPLEX_PROGRAM_ID.toBuffer(),
        collectionMintAccount.pubkey.toBuffer(),
      ],
      METAPLEX_PROGRAM_ID
    );

    const collectionMetadataAccount: AccountMeta = {
      pubkey: metaplexAccountKey,
      isSigner: false,
      isWritable: true,
    };

    const [generalAccountPubkey] = PublicKey.findProgramAddressSync(
      [Buffer.from(GENERAL_ACCOUNT_SEED)],
      programId
    );

    const generalAccount: AccountMeta = {
      pubkey: generalAccountPubkey,
      isSigner: false,
      isWritable: true,
    };

    const metaplexProgramAccount: AccountMeta = {
      pubkey: METAPLEX_PROGRAM_ID,
      isSigner: false,
      isWritable: false,
    };

    const [inglCollectionHolderKey] = PublicKey.findProgramAddressSync(
      [Buffer.from(COLLECTION_HOLDER_KEY)],
      programId
    );
    const collectionHolderAccount: AccountMeta = {
      pubkey: inglCollectionHolderKey,
      isSigner: false,
      isWritable: true,
    };
    const associatedTokenAccount: AccountMeta = {
      pubkey: getAssociatedTokenAddressSync(
        inglNftCollectionMintKey,
        inglCollectionHolderKey,
        true
      ),
      isSigner: false,
      isWritable: true,
    };

    const [editionKey] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        METAPLEX_PROGRAM_ID.toBuffer(),
        inglNftCollectionMintKey.toBuffer(),
        Buffer.from('edition'),
      ],
      METAPLEX_PROGRAM_ID
    );
    const collectionEditionAccount: AccountMeta = {
      pubkey: editionKey,
      isSigner: false,
      isWritable: true,
    };

    const associatedTokeProgramAccount: AccountMeta = {
      pubkey: ASSOCIATED_TOKEN_PROGRAM_ID,
      isSigner: false,
      isWritable: false,
    };
    const InglRegistryProgramAccount: AccountMeta = {
      pubkey: INGL_REGISTRY_PROGRAM_ID,
      isSigner: false,
      isWritable: false,
    };
    const [registryConfigKey] = PublicKey.findProgramAddressSync(
      [Buffer.from('config')],
      INGL_REGISTRY_PROGRAM_ID
    );
    const registryConfigAccount: AccountMeta = {
      pubkey: registryConfigKey,
      isSigner: false,
      isWritable: true,
    };
    const registryAccountInfo = await this.connection.getAccountInfo(
      registryConfigKey
    );
    if (!registryAccountInfo)
      throw Error('Vlidator registration not possible yet.');
    const { validation_number } = deserialize(registryAccountInfo.data, Config);
    const storageNumeration = Math.floor(
      validation_number / MAX_PROGRAMS_PER_STORAGE_ACCOUNT
    );
    const [storageKey] = PublicKey.findProgramAddressSync(
      [Buffer.from('storage'), toBytesInt32(storageNumeration)],
      INGL_REGISTRY_PROGRAM_ID
    );
    const storageAccount: AccountMeta = {
      pubkey: storageKey,
      isSigner: false,
      isWritable: true,
    };

    const teamAccount: AccountMeta = {
      pubkey: INGL_TEAM_ID,
      isSigner: false,
      isWritable: true,
    };

    const programAccount: AccountMeta = {
      pubkey: programId,
      isSigner: false,
      isWritable: false,
    };

    const log_level = 0;
    const initProgramPayload = new Init({
      ...registrationData,
      log_level,
    });
    const initProgramInstruction = new TransactionInstruction({
      programId,
      data: Buffer.from(serialize(initProgramPayload)),
      keys: [
        payerAccount,
        configAccount,
        generalAccount,
        urisAccountAccount,
        sysvarRentAccount,
        validatorAccount,
        collectionHolderAccount,
        collectionMintAccount,
        mintAuthorityAccount,
        associatedTokenAccount,
        collectionMetadataAccount,
        collectionEditionAccount,
        splTokenProgramAccount,
        systemProgramAccount,
        registryConfigAccount,
        programAccount,
        teamAccount,
        storageAccount,

        systemProgramAccount,
        splTokenProgramAccount,
        associatedTokeProgramAccount,
        metaplexProgramAccount,
        InglRegistryProgramAccount,
      ],
    });
    try {
      const signature = await forwardLegacyTransaction(
        { connection: this.connection, wallet: this.walletContext },
        [initProgramInstruction],
        400_000
      );
      this.useProgramId(programId.toBase58());
      return signature;
    } catch (error) {
      throw new Error(
        'Validator program registration failed with the following errors:' +
          error
      );
    }
  }
}
