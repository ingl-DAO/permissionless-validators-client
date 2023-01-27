import { deserialize, serialize } from '@dao-xyz/borsh';
import {
  COLLECTION_HOLDER_KEY,
  Config,
  CreateVoteAccount,
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
  STAKE_ACCOUNT_KEY,
  toBytesInt32,
  UploadUris,
  URIS_ACCOUNT_SEED,
  VOTE_ACCOUNT_KEY,
} from '@ingl-permissionless/state';
import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  AccountMeta,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import BN from 'bn.js';
import { Rarity, RegisterValidatorDto } from './app.dto';

@Injectable()
export class AppService {
  private readonly headers = {
    'Content-Type': 'application/json',
    'api-key': process.env.REGISTRY_PROGRAMS_API_KEY,
  };
  private readonly requestBody = {
    collection: 'program_list',
    database: 'programs',
    dataSource: 'Cluster0',
    filter: {
      Is_used: false,
    },
  };
  constructor(
    private readonly httpService: HttpService,
    private readonly connection = new Connection(WalletAdapterNetwork.Devnet)
  ) {
    if (!this.headers['api-key'])
      throw new HttpException('No API key found', HttpStatus.FAILED_DEPENDENCY);
  }

  getData(): { message: string } {
    return { message: 'Welcome to Ingl monitor!' };
  }

  async findPrograms() {
    const { data } = await this.httpService.axiosRef.post<{
      documents: {
        _id: string;
        program: string;
        Is_used: boolean;
      }[];
    }>(
      'https://data.mongodb-api.com/app/data-ywjjx/endpoint/data/v1/action/find',
      this.requestBody,
      {
        headers: this.headers,
      }
    );
    return data.documents;
  }

  async findProgramId() {
    const { data } = await this.httpService.axiosRef.post<{
      document?: {
        _id: string;
        program: string;
        Is_used: boolean;
      };
    }>(
      'https://data.mongodb-api.com/app/data-ywjjx/endpoint/data/v1/action/findOne',
      this.requestBody,
      {
        headers: this.headers,
      }
    );
    return data.document?.program;
  }

  async useProgramId(programId: string) {
    await this.httpService.axiosRef.post<{
      document?: {
        _id: string;
        program: string;
        Is_used: boolean;
      };
    }>(
      'https://data.mongodb-api.com/app/data-ywjjx/endpoint/data/v1/action/updateOne',
      {
        ...this.requestBody,
        filter: {
          program: programId,
        },
        update: {
          $set: {
            Is_used: true,
          },
        },
      },
      {
        headers: this.headers,
      }
    );
  }

  async registerValidator(
    programId: PublicKey,
    { validator_id, ...newValidator }: RegisterValidatorDto
  ) {
    const keypairBuffer = Buffer.from(
      JSON.parse(process.env.BACKEND_KEYPAIR as string)
    );
    const payerKeypair = Keypair.fromSecretKey(keypairBuffer);

    const payerAccount: AccountMeta = {
      pubkey: payerKeypair.publicKey,
      isSigner: true,
      isWritable: true,
    };

    const validatorAccount: AccountMeta = {
      pubkey: new PublicKey(validator_id),
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
    const urisAccount: AccountMeta = {
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

    const [metaplexAccountKey] = PublicKey.findProgramAddressSync(
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

    const {
      unit_backing: solBacking,
      max_primary_stake,
      governance_expiration_time,
      creator_royalties,
      rarities,
      ...registratioData
    } = newValidator;

    const log_level = 0;
    const initProgramPayload = new Init({
      log_level,
      ...registratioData,
      rarities: rarities.map((_) => _.rarity),
      creator_royalties: creator_royalties * 100,
      unit_backing: new BN(solBacking * LAMPORTS_PER_SOL),
      max_primary_stake: new BN(max_primary_stake * LAMPORTS_PER_SOL),
      governance_expiration_time: governance_expiration_time * (24 * 3600),
    });
    const initProgramInstruction = new TransactionInstruction({
      programId,
      data: Buffer.from(serialize(initProgramPayload)),
      keys: [
        payerAccount,
        configAccount,
        generalAccount,
        urisAccount,
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
    const uploadUrisInstructions = this.createUploadUriInst(
      programId,
      [payerAccount, configAccount, urisAccount],
      rarities
    );
    const [voteAccountKey] = PublicKey.findProgramAddressSync(
      [Buffer.from(VOTE_ACCOUNT_KEY)],
      programId
    );
    const voteAccount: AccountMeta = {
      pubkey: voteAccountKey,
      isSigner: false,
      isWritable: false,
    };
    const sysvarClockAccount: AccountMeta = {
      pubkey: SYSVAR_CLOCK_PUBKEY,
      isSigner: false,
      isWritable: false,
    };
    const [stakeAccountKey] = PublicKey.findProgramAddressSync(
      [Buffer.from(STAKE_ACCOUNT_KEY)],
      programId
    );
    const stakeAccount: AccountMeta = {
      pubkey: stakeAccountKey,
      isSigner: false,
      isWritable: false,
    };
    const createVoteAccountIntruction = new TransactionInstruction({
      keys: [
        validatorAccount,
        voteAccount,
        sysvarRentAccount,
        sysvarClockAccount,
        splTokenProgramAccount,
        stakeAccount,
        configAccount,
        generalAccount,
      ],
      programId,
      data: Buffer.from(serialize(new CreateVoteAccount(0))),
    });
    try {
      const signature = await forwardLegacyTransaction(
        {
          publicKey: payerKeypair.publicKey,
          connection: this.connection,
        },
        [initProgramInstruction],
        {
          additionalUnits: 400_000,
          signingKeypairs: [payerKeypair],
        }
      );
      this.useProgramId(programId.toBase58());
      const uriSignatures = await Promise.all(
        uploadUrisInstructions.map((instruction) =>
          forwardLegacyTransaction(
            {
              publicKey: payerKeypair.publicKey,
              connection: this.connection,
            },
            [instruction],
            {
              additionalUnits: 400_000,
              signingKeypairs: [payerKeypair],
            }
          )
        )
      );
      const voteSignature = await forwardLegacyTransaction(
        { connection: this.connection, publicKey: payerKeypair.publicKey },
        [createVoteAccountIntruction],
        {
          signingKeypairs: [payerKeypair],
        }
      );
      return [signature, ...uriSignatures, voteSignature];
    } catch (error) {
      throw new HttpException(
        `Validator program registration failed with the following errors: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  createUploadUriInst(
    programId: PublicKey,
    accounts: [AccountMeta, AccountMeta, AccountMeta],
    rarities: Rarity[]
  ) {
    return rarities.map(({ rarity, uris }) => {
      const uploadInst = new UploadUris({
        uris,
        rarity,
        log_level: 0,
      });
      return new TransactionInstruction({
        programId,
        data: Buffer.from(serialize(uploadInst)),
        keys: accounts,
      });
    });
  }
}
