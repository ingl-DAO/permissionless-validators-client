import { deserialize, serialize } from '@dao-xyz/borsh';
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

export const BACKEND_API = 'http://localhost:4000';
export class RegistryService {
  constructor(
    private readonly connection: Connection,
    private readonly walletContext: WalletContextState
  ) {}

  async getProgramId() {
    // return await (await fetch(`${BACKEND_API}/program-id`)).json();
    const programs = [
      {
        _id: '63d02eddb589c9d22b2b9772',
        program: '4qCW8PdxMBP5GjseJHqkiN6btj89HQYNEM5V6J95Wy8M',
        Is_used: false,
      },
      {
        _id: '63d02efcb589c9d22b2b9773',
        program: 'CMwUFz5UT7UsZuZwcdxnt9MrhuLwmrVddZ6mqygGAtMF',
        Is_used: false,
      },
      {
        _id: '63d02f18b589c9d22b2b9774',
        program: 'FSvobSyU9ZuzuG8XK5auY2L7e6TihiVZCeiGjuTiJfvS',
        Is_used: false,
      },
      {
        _id: '63d02f34b589c9d22b2b9775',
        program: 'xBHbsuJCRpecsyRtAGFT4JgdprQcbXY9ENMLBviFtPX',
        Is_used: false,
      },
      {
        _id: '63d02f52b589c9d22b2b9776',
        program: 'FcJMAbymXUtBThyrLMgCDwgPqVyUTGDvMymju41LaTdG',
        Is_used: false,
      },
      {
        _id: '63d02f70b589c9d22b2b9777',
        program: '9NbPygAqWDZcoeyTZH17CASSSDVL3zDiHUrryxBTh7uB',
        Is_used: false,
      },
      {
        _id: '63d02f8eb589c9d22b2b9778',
        program: 'Di6aytHkmtv1kynHX3TP3yMi45N2WFr4N1q77P4u1BdA',
        Is_used: false,
      },
      {
        _id: '63d02fb1b589c9d22b2b9779',
        program: '3ZesAKgZtpFKaefqMW8uJ8rvhubHpcPGwXFZYJpdxeRh',
        Is_used: false,
      },
      {
        _id: '63d02fd7b589c9d22b2b977a',
        program: '6N1BdpgcrG7phZoU83TbiPXp3PLFUhW9tr3nvBNHn98i',
        Is_used: false,
      },
      {
        _id: '63d03000b589c9d22b2b977b',
        program: 'Bzb7Lr2y4LPNLfmg4H865VLYSqPna8hwnBPh7H7AEvJt',
        Is_used: false,
      },
      {
        _id: '63d030584af89d11fd1845bf',
        program: 'GABTzqQ4pX7FSqbWUjQr75Q5NpWeC8hWRtXMrKsHVWNE',
        Is_used: false,
      },
      {
        _id: '63d0307e4af89d11fd1845c0',
        program: '8JDXsSySt8itV3q9EG9Ar2CM6zuhLQBBBV1XVNEs2kKJ',
        Is_used: false,
      },
      {
        _id: '63d0309f4af89d11fd1845c1',
        program: '2GBbr2WxvCj9HPMUzPMmVmA9sjwygEueK8AAhAxVgrkM',
        Is_used: false,
      },
      {
        _id: '63d030c24af89d11fd1845c2',
        program: 'BrcqvsuVfCSYi4hSpLJn94R2ebXrHiH9E1wdNoS6AUkp',
        Is_used: false,
      },
      {
        _id: '63d030e94af89d11fd1845c3',
        program: 'Edi5jHNT7MDJWdnd73PjmUp4pASUYXbwNAfcfZwwaPkP',
        Is_used: false,
      },
    ];
    let i = 0;
    while (i < programs.length) {
      const programId = programs[i].program;
      const [configAccountKey] = PublicKey.findProgramAddressSync(
        [Buffer.from(INGL_CONFIG_SEED)],
        new PublicKey(programId)
      );
      const accountInfo = await this.connection.getAccountInfo(
        new PublicKey(configAccountKey)
      );
      if (!accountInfo) break;
      i++;
    }
    if (i < programs.length) return { program_id: programs[i].program };
    else throw new Error('No deployed program is available');
  }

  async registerProgram(
    programId: PublicKey,
    validatorId: PublicKey,
    registrationData: ValidatorRegistration
  ) {
    const payerPubkey = this.walletContext.publicKey;
    if (!payerPubkey) throw new WalletNotConnectedError();

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
    console.log({ storageNumeration });
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
    // const uploadUriPayloads = rarities.map(
    //   (rarity, index) => new TransactionInstruction({
    //     programId,
    //     data: Buffer.from(serialize())
    //   })
    //     new UploadUris({
    //       log_level,
    //       rarity,
    //       uris: uris[index],
    //     })
    // );
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
      return await forwardLegacyTransaction(
        { connection: this.connection, wallet: this.walletContext },
        [initProgramInstruction],
        400_000
      );
    } catch (error) {
      throw new Error(
        'Validator program registration failed with the following errors:' +
          error
      );
    }
  }
}
