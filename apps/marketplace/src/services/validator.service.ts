import { deserialize, serialize } from '@dao-xyz/borsh';
import { http, ProgramUsage, verifyVersion } from '@ingl-permissionless/axios';
import {
  BPF_LOADER_UPGRADEABLE_ID,
  Buy,
  DeList,
  ESCROW_ACCOUNT_SEED,
  forwardLegacyTransaction,
  getUniqueStakersOnVoteAccount,
  List,
  MARKETPLACE_STORAGE_SEED,
  PDA_AUTHORIZED_WITHDRAWER_SEED,
  PDA_UPGRADE_AUTHORITY_SEED,
  ProgramStorage,
  PROGRAM_STORAGE_SEED,
  REGISTRY_PROGRAM_ID,
  SecondaryItem,
  Storage,
  TEAM_ADDRESS,
  ValidateSecondaryItemsTransfers,
  WithdrawRewards,
} from '@ingl-permissionless/state';
import { PublicKey } from '@metaplex-foundation/js';
import {
  WalletAdapterNetwork,
  WalletNotConnectedError,
} from '@solana/wallet-adapter-base';
import { WalletContextState } from '@solana/wallet-adapter-react';
import {
  AccountMeta,
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKeyData,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
  VoteAccountInfo,
  VoteProgram,
} from '@solana/web3.js';
import BN from 'bn.js';
import { Validator, ValidatorDetails, ValidatorListing } from '../interfaces';

export class ValidatorService {
  constructor(
    private readonly connection = new Connection(
      clusterApiUrl(WalletAdapterNetwork.Devnet)
    ),
    private readonly walletContext: WalletContextState
  ) {}

  async getProgramId(usage: ProgramUsage) {
    const { data } = await http.get<{ program_id: string } | null>(
      '/programs/available',
      {
        params: { usage },
      }
    );
    if (data) return { program_id: data.program_id };
    else throw new Error('No deployed program is available');
  }

  async useProgramId(programId: string) {
    await http.put(`/programs/${programId}/use`);
  }

  async listValidator({
    vote_account_id,
    price,
    mediation_interval,
    secondary_items,
    ...newValidator
  }: ValidatorListing) {
    const payerPubkey = this.walletContext.publicKey;
    if (!payerPubkey)
      throw new WalletNotConnectedError('Please connect your wallet !!!');

    const voteAccountKey = new PublicKey(vote_account_id);
    const voteAccountInfo = await this.connection.getAccountInfo(
      voteAccountKey
    );
    if (!voteAccountInfo) throw new Error('Invalid vote account id');

    const { program_id } = await this.getProgramId(ProgramUsage.Marketplace);
    const programId = new PublicKey(program_id);
    const accounts = await this.getListingAccounts(
      programId,
      new PublicKey(vote_account_id)
    );
    const teamAccountMeta: AccountMeta = {
      pubkey: TEAM_ADDRESS,
      isSigner: false,
      isWritable: true,
    };
    const [marketplaceStorageAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from(MARKETPLACE_STORAGE_SEED)],
      REGISTRY_PROGRAM_ID
    );
    const registryStorageAccountMeta: AccountMeta = {
      pubkey: marketplaceStorageAddress,
      isSigner: false,
      isWritable: true,
    };
    const systemProgramAccountMeta: AccountMeta = {
      pubkey: SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    };
    const bpfloaderAccountMeta: AccountMeta = {
      pubkey: BPF_LOADER_UPGRADEABLE_ID,
      isSigner: false,
      isWritable: false,
    };
    const voteProgramAccountMeta: AccountMeta = {
      pubkey: VoteProgram.programId,
      isSigner: false,
      isWritable: false,
    };
    const registryProgramAccountMeta: AccountMeta = {
      pubkey: REGISTRY_PROGRAM_ID,
      isSigner: false,
      isWritable: false,
    };
    const listInstruction = new List({
      log_level: 0,
      ...newValidator,
      mediation_interval: mediation_interval * 86400,
      authorized_withdrawer_cost: new BN(price * LAMPORTS_PER_SOL),
      secondary_items: secondary_items.map(
        ({ price, name, description }) =>
          new SecondaryItem({
            name,
            description,
            cost: new BN(price * LAMPORTS_PER_SOL),
          })
      ),
    });

    try {
      const listTransactionInstruction = new TransactionInstruction({
        programId,
        data: Buffer.from(serialize(listInstruction)),
        keys: [
          ...accounts,
          teamAccountMeta,
          registryStorageAccountMeta,
          systemProgramAccountMeta,

          bpfloaderAccountMeta,
          voteProgramAccountMeta,
          registryProgramAccountMeta,
        ],
      });
      const signature = await forwardLegacyTransaction(
        {
          publicKey: payerPubkey,
          connection: this.connection,
          signTransaction: this.walletContext.signTransaction,
        },
        [listTransactionInstruction],
        {
          isSignatureRequired: true,
        }
      );
      this.useProgramId(programId.toBase58());
      return signature;
    } catch (error) {
      console.log(error);
      throw new Error(
        'Validator listing failed with the following error:' + error
      );
    }
  }

  async delistValidator(programId: PublicKey) {
    const payerPubkey = this.walletContext.publicKey;
    if (!payerPubkey)
      throw new WalletNotConnectedError('Please connect your wallet !!!');

    const [storageAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from(PROGRAM_STORAGE_SEED)],
      programId
    );
    const storage = await this.connection.getAccountInfo(storageAddress);
    const { vote_account } = deserialize(storage?.data as Buffer, Storage, {
      unchecked: true,
    });
    const accounts = await this.getListingAccounts(
      programId,
      new PublicKey(vote_account),
      true
    );
    const bpfloaderAccountMeta: AccountMeta = {
      pubkey: BPF_LOADER_UPGRADEABLE_ID,
      isSigner: false,
      isWritable: false,
    };
    const voteProgramAccountMeta: AccountMeta = {
      pubkey: VoteProgram.programId,
      isSigner: false,
      isWritable: false,
    };
    const delistTransactionInstruction = new TransactionInstruction({
      programId,
      data: Buffer.from(serialize(new DeList(0))),
      keys: [...accounts, bpfloaderAccountMeta, voteProgramAccountMeta],
    });

    try {
      const signature = await forwardLegacyTransaction(
        {
          publicKey: payerPubkey,
          connection: this.connection,
          signTransaction: this.walletContext.signTransaction,
        },
        [delistTransactionInstruction]
      );
      return signature;
    } catch (error) {
      console.log(error);
      throw new Error(
        'Validator listing failed with the following error:' + error
      );
    }
  }

  private async getListingAccounts(
    programId: PublicKey,
    voteAccountPubkey: PublicKey,
    isForDelisting = false
  ) {
    const authorizedWithdrawerAccountMeta: AccountMeta = {
      pubkey: this.walletContext.publicKey as PublicKey,
      isSigner: true,
      isWritable: true,
    };

    const voteAccountMeta: AccountMeta = {
      pubkey: voteAccountPubkey,
      isSigner: false,
      isWritable: true,
    };
    const [pdaAuhorizedWithdrawer] = PublicKey.findProgramAddressSync(
      [Buffer.from(PDA_AUTHORIZED_WITHDRAWER_SEED)],
      programId
    );
    const pdaAuthorizedWithdrawerAccountMeta: AccountMeta = {
      pubkey: pdaAuhorizedWithdrawer,
      isSigner: false,
      isWritable: true,
    };
    const [storageAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from(PROGRAM_STORAGE_SEED)],
      programId
    );
    const storageAccountMeta: AccountMeta = {
      pubkey: storageAddress,
      isSigner: false,
      isWritable: true,
    };
    const programAccountMeta: AccountMeta = {
      pubkey: programId,
      isSigner: false,
      isWritable: false,
    };
    const [programDataAddress] = PublicKey.findProgramAddressSync(
      [programId.toBuffer()],
      BPF_LOADER_UPGRADEABLE_ID
    );
    const programDataAccountMeta: AccountMeta = {
      pubkey: programDataAddress,
      isSigner: false,
      isWritable: true,
    };
    const programDataAccountInfo = await this.connection.getAccountInfo(
      programDataAddress
    );
    if (!programDataAccountInfo)
      throw new Error('Invalid program data account info');
    const currentAuthorityAccountMeta: AccountMeta = {
      pubkey: new PublicKey(programDataAccountInfo.data.slice(13, 45)),
      isSigner: true,
      isWritable: false,
    };
    const [pdaAuthority] = PublicKey.findProgramAddressSync(
      [Buffer.from(PDA_UPGRADE_AUTHORITY_SEED)],
      programId
    );
    const pdaAuthorityAccountMeta: AccountMeta = {
      pubkey: pdaAuthority,
      isSigner: false,
      isWritable: false,
    };
    const sysvarClockAccountMeta: AccountMeta = {
      pubkey: SYSVAR_CLOCK_PUBKEY,
      isSigner: false,
      isWritable: false,
    };
    return isForDelisting
      ? [
          authorizedWithdrawerAccountMeta,
          voteAccountMeta,
          pdaAuthorizedWithdrawerAccountMeta,
          storageAccountMeta,
          programAccountMeta,
          programDataAccountMeta,
          pdaAuthorityAccountMeta,
          sysvarClockAccountMeta,
        ]
      : [
          authorizedWithdrawerAccountMeta,
          voteAccountMeta,
          pdaAuthorizedWithdrawerAccountMeta,
          storageAccountMeta,
          programAccountMeta,
          programDataAccountMeta,
          currentAuthorityAccountMeta,
          pdaAuthorityAccountMeta,
          sysvarClockAccountMeta,
        ];
  }

  async loadValidators(): Promise<Validator[]> {
    const [marketplaceStorageAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from(MARKETPLACE_STORAGE_SEED)],
      REGISTRY_PROGRAM_ID
    );
    const marketplaceStorageAccountInfo = await this.connection.getAccountInfo(
      marketplaceStorageAddress
    );
    if (!marketplaceStorageAccountInfo) return [];
    // throw new Error('Marketplace registry storage account not found');

    const { programs } = deserialize(
      marketplaceStorageAccountInfo.data,
      ProgramStorage,
      { unchecked: true }
    );
    const programPubkeys: PublicKey[] = [];
    const programStorageAccountInfos = await Promise.all(
      programs.map((program) => {
        const programId = new PublicKey(program);
        const [programStorageAddress] = PublicKey.findProgramAddressSync(
          [Buffer.from(PROGRAM_STORAGE_SEED)],
          programId
        );
        programPubkeys.push(programId);
        return this.connection.getAccountInfo(programStorageAddress);
      })
    );
    const { current, delinquent } = await this.connection.getVoteAccounts();
    const validators: Validator[] = [];

    for (let i = 0; i < programStorageAccountInfos.length; i++) {
      const accountInfo = programStorageAccountInfos[i];
      if (accountInfo) {
        const {
          validator_name,
          validator_logo_url,
          vote_account,
          authorized_withdrawer_cost,
          authorized_withdrawer,
          secondary_items,
          purchase,
        } = deserialize(accountInfo.data, Storage, { unchecked: true });
        const voteAccountInfo =
          [...current, ...delinquent].find((voteAccount) => {
            return (
              voteAccount.votePubkey === new PublicKey(vote_account).toBase58()
            );
          }) ?? null;

        validators.push({
          validator_name,
          validator_logo_url,
          buyer_public_key: purchase
            ? new PublicKey(purchase.buyer).toBase58()
            : undefined,
          secondary_items: secondary_items.map(({ cost, ...item }) => ({
            price: new BN(cost).toNumber() / LAMPORTS_PER_SOL,
            ...item,
          })),
          seller_public_key: new PublicKey(authorized_withdrawer).toString(),
          price:
            new BN(authorized_withdrawer_cost).toNumber() / LAMPORTS_PER_SOL,
          program_id: programPubkeys[i].toBase58(),
          vote_account_id: new PublicKey(vote_account).toBase58(),
          total_stake: voteAccountInfo?.activatedStake
            ? voteAccountInfo.activatedStake / LAMPORTS_PER_SOL
            : 0,
          number_of_unique_stakers:
            (
              await getUniqueStakersOnVoteAccount(
                this.connection,
                new PublicKey(vote_account)
              )
            ).size ?? 0,
        });
      }
    }
    return validators;
  }

  async loadValidatorDetails(programId: PublicKey): Promise<ValidatorDetails> {
    const [programStorageAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from(PROGRAM_STORAGE_SEED)],
      programId
    );
    const proramAccountInfo = await this.connection.getAccountInfo(
      programStorageAddress
    );
    if (!proramAccountInfo) throw new Error('Program account info not found');

    const {
      validator_name,
      validator_logo_url,
      vote_account,
      description,
      mediation_interval,
      request_mediation_date,
      purchase,
      secondary_items,
      authorized_withdrawer_cost,
      authorized_withdrawer,
    } = deserialize(proramAccountInfo.data, Storage, { unchecked: true });

    const { current, delinquent } = await this.connection.getVoteAccounts();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let voteAccountInfoFromGeneral:
      | VoteAccountInfo
      | { nodePubkey: string; activatedStake: number }
      | null =
      [...current, ...delinquent].find((voteAccount) => {
        return (
          voteAccount.votePubkey === new PublicKey(vote_account).toBase58()
        );
      }) ?? null;
    const voteAccountInfo = await this.connection.getAccountInfo(
      new PublicKey(vote_account)
    );
    if (!voteAccountInfoFromGeneral) {
      voteAccountInfoFromGeneral = {
        nodePubkey: new PublicKey(
          voteAccountInfo?.data?.slice(4, 36) as PublicKeyData
        ).toBase58(),
        activatedStake: 0,
      };
    }
    const { nodePubkey: validator_id, activatedStake } =
      voteAccountInfoFromGeneral;

    const rentExempt = await this.connection.getMinimumBalanceForRentExemption(
      voteAccountInfo?.data.length ?? 0
    );
    const programVersion = await verifyVersion(
      ProgramUsage.Marketplace,
      programId.toBase58(),
      'Program'
    );

    return {
      programVersion,

      description,
      validator_id,
      validator_name,
      mediation_interval,
      validator_logo_url,
      seller_public_key: new PublicKey(authorized_withdrawer).toBase58(),
      date_validated: purchase?.date_finalized,
      secondary_items: secondary_items.map(({ cost, ...item }) => ({
        price: new BN(cost).toNumber() / LAMPORTS_PER_SOL,
        ...item,
      })),
      buyer_public_key: purchase
        ? new PublicKey(purchase.buyer).toBase58()
        : undefined,
      request_mediation_date,
      price: new BN(authorized_withdrawer_cost).toNumber() / LAMPORTS_PER_SOL,
      program_id: programId.toBase58(),
      vote_account_id: new PublicKey(vote_account).toBase58(),
      total_stake: activatedStake / LAMPORTS_PER_SOL,
      number_of_unique_stakers:
        (
          await getUniqueStakersOnVoteAccount(
            this.connection,
            new PublicKey(vote_account)
          )
        ).size ?? 0,
      total_validator_rewards:
        ((voteAccountInfo?.lamports ?? 0) - rentExempt > 0
          ? (voteAccountInfo?.lamports ?? 0) - rentExempt
          : 0) / LAMPORTS_PER_SOL,
      //TODO @manual test data shall be added here
      stake_per_epochs: [
        {
          epoch: 240,
          stake: 355,
        },
        {
          epoch: 241,
          stake: 23375,
        },
        {
          epoch: 242,
          stake: 33400,
        },
        {
          epoch: 243,
          stake: 34199,
        },
        {
          epoch: 244,
          stake: 35949,
        },
        {
          epoch: 245,
          stake: 39309,
        },
        {
          epoch: 246,
          stake: 34643,
        },
        {
          epoch: 247,
          stake: 38385,
        },
        {
          epoch: 248,
          stake: 42156,
        },
        {
          epoch: 249,
          stake: 66245,
        },
        {
          epoch: 250,
          stake: 68540,
        },
        {
          epoch: 251,
          stake: 76936,
        },
        {
          epoch: 252,
          stake: 77707,
        },
        {
          epoch: 253,
          stake: 83760,
        },
        {
          epoch: 254,
          stake: 118106,
        },
        {
          epoch: 255,
          stake: 113021,
        },
        {
          epoch: 256,
          stake: 120676,
        },
        {
          epoch: 257,
          stake: 124529,
        },
        {
          epoch: 258,
          stake: 126275,
        },
        {
          epoch: 259,
          stake: 138261,
        },
        {
          epoch: 260,
          stake: 141563,
        },
        {
          epoch: 261,
          stake: 141274,
        },
        {
          epoch: 262,
          stake: 142654,
        },
        {
          epoch: 263,
          stake: 145829,
        },
        {
          epoch: 264,
          stake: 149304,
        },
        {
          epoch: 265,
          stake: 173608,
        },
        {
          epoch: 266,
          stake: 170312,
        },
        {
          epoch: 267,
          stake: 202676,
        },
        {
          epoch: 268,
          stake: 227229,
        },
        {
          epoch: 269,
          stake: 229092,
        },
        {
          epoch: 270,
          stake: 234036,
        },
        {
          epoch: 271,
          stake: 234976,
        },
        {
          epoch: 272,
          stake: 238318,
        },
        {
          epoch: 273,
          stake: 201153,
        },
        {
          epoch: 274,
          stake: 202601,
        },
        {
          epoch: 275,
          stake: 205939,
        },
        {
          epoch: 276,
          stake: 265574,
        },
        {
          epoch: 277,
          stake: 270726,
        },
        {
          epoch: 278,
          stake: 293007,
        },
        {
          epoch: 279,
          stake: 326580,
        },
        {
          epoch: 280,
          stake: 310538,
        },
        {
          epoch: 281,
          stake: 264434,
        },
        {
          epoch: 282,
          stake: 284295,
        },
        {
          epoch: 283,
          stake: 291366,
        },
        {
          epoch: 284,
          stake: 318167,
        },
        {
          epoch: 285,
          stake: 306520,
        },
        {
          epoch: 286,
          stake: 370567,
        },
        {
          epoch: 287,
          stake: 361347,
        },
        {
          epoch: 288,
          stake: 364023,
        },
        {
          epoch: 289,
          stake: 388532,
        },
        {
          epoch: 290,
          stake: 392448,
        },
        {
          epoch: 291,
          stake: 422896,
        },
        {
          epoch: 292,
          stake: 446103,
        },
        {
          epoch: 293,
          stake: 435761,
        },
        {
          epoch: 294,
          stake: 437208,
        },
        {
          epoch: 295,
          stake: 423030,
        },
        {
          epoch: 296,
          stake: 424715,
        },
        {
          epoch: 297,
          stake: 425305,
        },
        {
          epoch: 298,
          stake: 428327,
        },
        {
          epoch: 299,
          stake: 757099,
        },
        {
          epoch: 300,
          stake: 455188,
        },
        {
          epoch: 301,
          stake: 527788,
        },
        {
          epoch: 302,
          stake: 531906,
        },
        {
          epoch: 303,
          stake: 525285,
        },
        {
          epoch: 305,
          stake: 684173,
        },
        {
          epoch: 306,
          stake: 731235,
        },
        {
          epoch: 307,
          stake: 735755,
        },
        {
          epoch: 308,
          stake: 726506,
        },
        {
          epoch: 309,
          stake: 817642,
        },
        {
          epoch: 310,
          stake: 814197,
        },
        {
          epoch: 311,
          stake: 845684,
        },
        {
          epoch: 312,
          stake: 680182,
        },
        {
          epoch: 313,
          stake: 689536,
        },
        {
          epoch: 314,
          stake: 646840,
        },
        {
          epoch: 315,
          stake: 671703,
        },
        {
          epoch: 316,
          stake: 670435,
        },
        {
          epoch: 317,
          stake: 687670,
        },
        {
          epoch: 318,
          stake: 660862,
        },
        {
          epoch: 319,
          stake: 654832,
        },
        {
          epoch: 320,
          stake: 637255,
        },
        {
          epoch: 321,
          stake: 634894,
        },
        {
          epoch: 322,
          stake: 637686,
        },
        {
          epoch: 323,
          stake: 647007,
        },
        {
          epoch: 324,
          stake: 677665,
        },
        {
          epoch: 325,
          stake: 679986,
        },
        {
          epoch: 326,
          stake: 677014,
        },
        {
          epoch: 327,
          stake: 685887,
        },
        {
          epoch: 328,
          stake: 687931,
        },
        {
          epoch: 329,
          stake: 701488,
        },
        {
          epoch: 330,
          stake: 708177,
        },
        {
          epoch: 331,
          stake: 720226,
        },
        {
          epoch: 332,
          stake: 710804,
        },
        {
          epoch: 333,
          stake: 756376,
        },
        {
          epoch: 334,
          stake: 757444,
        },
        {
          epoch: 335,
          stake: 787061,
        },
        {
          epoch: 336,
          stake: 878515,
        },
        {
          epoch: 337,
          stake: 886279,
        },
        {
          epoch: 338,
          stake: 900040,
        },
        {
          epoch: 339,
          stake: 940705,
        },
        {
          epoch: 340,
          stake: 953092,
        },
        {
          epoch: 341,
          stake: 959871,
        },
        {
          epoch: 342,
          stake: 962913,
        },
        {
          epoch: 343,
          stake: 1013000,
        },
        {
          epoch: 344,
          stake: 1016741,
        },
        {
          epoch: 345,
          stake: 534198,
        },
        {
          epoch: 347,
          stake: 1064873,
        },
        {
          epoch: 348,
          stake: 906963,
        },
        {
          epoch: 349,
          stake: 945860,
        },
        {
          epoch: 350,
          stake: 951086,
        },
        {
          epoch: 351,
          stake: 962617,
        },
        {
          epoch: 352,
          stake: 964961,
        },
        {
          epoch: 353,
          stake: 971435,
        },
        {
          epoch: 354,
          stake: 1195083,
        },
        {
          epoch: 357,
          stake: 1475417,
        },
        {
          epoch: 358,
          stake: 1476040,
        },
        {
          epoch: 359,
          stake: 1483754,
        },
        {
          epoch: 360,
          stake: 1491821,
        },
        {
          epoch: 361,
          stake: 1504662,
        },
        {
          epoch: 362,
          stake: 1501533,
        },
        {
          epoch: 363,
          stake: 1280734,
        },
        {
          epoch: 364,
          stake: 1278981,
        },
        {
          epoch: 365,
          stake: 1270567,
        },
        {
          epoch: 366,
          stake: 1271863,
        },
        {
          epoch: 367,
          stake: 1267407,
        },
        {
          epoch: 368,
          stake: 1265928,
        },
        {
          epoch: 369,
          stake: 1411393,
        },
        {
          epoch: 370,
          stake: 1419654,
        },
        {
          epoch: 371,
          stake: 1098865,
        },
        {
          epoch: 372,
          stake: 1123269,
        },
        {
          epoch: 373,
          stake: 1102011,
        },
        {
          epoch: 374,
          stake: 1246455,
        },
        {
          epoch: 375,
          stake: 1224304,
        },
        {
          epoch: 376,
          stake: 1378520,
        },
        {
          epoch: 377,
          stake: 1390231,
        },
        {
          epoch: 378,
          stake: 1405126,
        },
        {
          epoch: 379,
          stake: 1434808,
        },
        {
          epoch: 380,
          stake: 1562579,
        },
        {
          epoch: 381,
          stake: 1607974,
        },
        {
          epoch: 382,
          stake: 1648583,
        },
        {
          epoch: 383,
          stake: 1965738,
        },
        {
          epoch: 384,
          stake: 1975291,
        },
        {
          epoch: 385,
          stake: 1984658,
        },
        {
          epoch: 386,
          stake: 1986958,
        },
        {
          epoch: 387,
          stake: 2001983,
        },
        {
          epoch: 388,
          stake: 2008085,
        },
        {
          epoch: 389,
          stake: 2015207,
        },
        {
          epoch: 390,
          stake: 2158842,
        },
        {
          epoch: 391,
          stake: 2122921,
        },
        {
          epoch: 392,
          stake: 2071680,
        },
        {
          epoch: 393,
          stake: 2060035,
        },
        {
          epoch: 394,
          stake: 2072103,
        },
        {
          epoch: 395,
          stake: 2201840,
        },
        {
          epoch: 396,
          stake: 2233535,
        },
        {
          epoch: 397,
          stake: 2261502,
        },
        {
          epoch: 398,
          stake: 2279217,
        },
        {
          epoch: 399,
          stake: 2334609,
        },
        {
          epoch: 400,
          stake: 2355350,
        },
        {
          epoch: 401,
          stake: 2381086,
        },
        {
          epoch: 402,
          stake: 2459443,
        },
        {
          epoch: 403,
          stake: 2462722,
        },
        {
          epoch: 404,
          stake: 2460153,
        },
        {
          epoch: 405,
          stake: 2463274,
        },
        {
          epoch: 406,
          stake: 2488295,
        },
        {
          epoch: 407,
          stake: 2536346,
        },
        {
          epoch: 408,
          stake: 2537590,
        },
        {
          epoch: 409,
          stake: 2550885,
        },
        {
          epoch: 410,
          stake: 2563773,
        },
        {
          epoch: 411,
          stake: 2529282,
        },
        {
          epoch: 412,
          stake: 2484924,
        },
        {
          epoch: 413,
          stake: 2600227,
        },
        {
          epoch: 414,
          stake: 2755752,
        },
        {
          epoch: 415,
          stake: 2771340,
        },
        {
          epoch: 416,
          stake: 2780101,
        },
        {
          epoch: 417,
          stake: 2783903,
        },
        {
          epoch: 418,
          stake: 2823706,
        },
        {
          epoch: 419,
          stake: 2783899,
        },
        {
          epoch: 420,
          stake: 2827827,
        },
        {
          epoch: 421,
          stake: 2773656,
        },
      ],
      validator_initial_epoch: 0,
    };
  }

  async buyValidator(programId: PublicKey) {
    const payerPubkey = this.walletContext.publicKey;
    if (!payerPubkey)
      throw new WalletNotConnectedError('Please connect your wallet !!!');

    const payerAccountMeta: AccountMeta = {
      pubkey: payerPubkey,
      isSigner: true,
      isWritable: false,
    };

    const [storageAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from(PROGRAM_STORAGE_SEED)],
      programId
    );

    const storageAccountMeta: AccountMeta = {
      pubkey: storageAddress,
      isSigner: false,
      isWritable: true,
    };

    const storage = await this.connection.getAccountInfo(storageAddress);
    const { vote_account, authorized_withdrawer } = deserialize(
      storage?.data as Buffer,
      Storage,
      {
        unchecked: true,
      }
    );

    const registeredAuthorizedWithdrawerAccountMeta: AccountMeta = {
      pubkey: new PublicKey(authorized_withdrawer),
      isSigner: false,
      isWritable: true,
    };

    const voteAccountMeta: AccountMeta = {
      pubkey: new PublicKey(vote_account),
      isSigner: false,
      isWritable: true,
    };

    const sysvarClockAccountMeta: AccountMeta = {
      pubkey: SYSVAR_CLOCK_PUBKEY,
      isSigner: false,
      isWritable: false,
    };

    const pdaAuhorizedWithdrawerAccountMeta: AccountMeta = {
      pubkey: PublicKey.findProgramAddressSync(
        [Buffer.from(PDA_AUTHORIZED_WITHDRAWER_SEED)],
        programId
      )[0],
      isSigner: false,
      isWritable: true,
    };

    const escrowAccountMeta: AccountMeta = {
      pubkey: PublicKey.findProgramAddressSync(
        [Buffer.from(ESCROW_ACCOUNT_SEED)],
        programId
      )[0],
      isSigner: false,
      isWritable: true,
    };

    const teamAccountMeta: AccountMeta = {
      pubkey: TEAM_ADDRESS,
      isSigner: false,
      isWritable: true,
    };

    const systemProgramAccountMeta: AccountMeta = {
      pubkey: SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    };

    const voteProgramAccountMeta: AccountMeta = {
      pubkey: VoteProgram.programId,
      isSigner: false,
      isWritable: false,
    };

    const buyTransactionInstruction = new TransactionInstruction({
      keys: [
        payerAccountMeta,
        storageAccountMeta,
        registeredAuthorizedWithdrawerAccountMeta,
        voteAccountMeta,
        sysvarClockAccountMeta,
        pdaAuhorizedWithdrawerAccountMeta,
        escrowAccountMeta,
        teamAccountMeta,

        systemProgramAccountMeta,
        voteProgramAccountMeta,
      ],
      programId,
      data: Buffer.from(serialize(new Buy(0))),
    });

    try {
      const signature = await forwardLegacyTransaction(
        {
          publicKey: payerPubkey,
          connection: this.connection,
          signTransaction: this.walletContext.signTransaction,
        },
        [buyTransactionInstruction]
      );
      return signature;
    } catch (error) {
      console.log(error);
      throw new Error(
        'Validator purchase failed with the following error: ' + error
      );
    }
  }

  async withdrawRewards(programId: PublicKey) {
    const payerPubkey = this.walletContext.publicKey;
    if (!payerPubkey)
      throw new WalletNotConnectedError('Please connect your wallet !!!');

    const authorizedWithdrawerAccountMeta: AccountMeta = {
      pubkey: payerPubkey,
      isSigner: true,
      isWritable: true,
    };
    const [storageAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from(PROGRAM_STORAGE_SEED)],
      programId
    );

    const storageData = deserialize(
      (await this.connection.getAccountInfo(storageAddress))?.data as Buffer,
      Storage,
      { unchecked: true }
    );

    const voteAccountMeta: AccountMeta = {
      pubkey: new PublicKey(storageData.vote_account),
      isSigner: false,
      isWritable: true,
    };
    const pdaAuhorizedWithdrawerAccountMeta: AccountMeta = {
      pubkey: PublicKey.findProgramAddressSync(
        [Buffer.from(PDA_AUTHORIZED_WITHDRAWER_SEED)],
        programId
      )[0],
      isSigner: false,
      isWritable: false,
    };
    const storageAccountMeta: AccountMeta = {
      pubkey: storageAddress,
      isSigner: false,
      isWritable: false,
    };
    const voteProgramAccountMeta: AccountMeta = {
      pubkey: VoteProgram.programId,
      isSigner: false,
      isWritable: false,
    };

    const withdrawRewardsInstruction = new TransactionInstruction({
      programId,
      keys: [
        authorizedWithdrawerAccountMeta,
        voteAccountMeta,
        pdaAuhorizedWithdrawerAccountMeta,
        storageAccountMeta,

        voteProgramAccountMeta,
      ],
      data: Buffer.from(serialize(new WithdrawRewards(0))),
    });

    try {
      const transactionId = await forwardLegacyTransaction(
        {
          publicKey: payerPubkey,
          connection: this.connection,
          signTransaction: this.walletContext.signTransaction,
        },
        [withdrawRewardsInstruction]
      );
      return transactionId;
    } catch (error) {
      console.log(error);
      throw new Error(
        'Validator rewards withdrawing failed with the following error: ' +
          error
      );
    }
  }

  async validateSecondaryItemTransfer(
    secondary_item_index: number,
    programId: PublicKey
  ) {
    const payerPubkey = this.walletContext.publicKey;
    if (!payerPubkey)
      throw new WalletNotConnectedError('Please connect your wallet !!!');

    const buyerAccountMeta: AccountMeta = {
      pubkey: payerPubkey,
      isSigner: true,
      isWritable: false,
    };

    const [storageAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from(PROGRAM_STORAGE_SEED)],
      programId
    );

    const storageAccountMeta: AccountMeta = {
      pubkey: storageAddress,
      isSigner: false,
      isWritable: true,
    };
    const escrowAccountMeta: AccountMeta = {
      pubkey: PublicKey.findProgramAddressSync(
        [Buffer.from(ESCROW_ACCOUNT_SEED)],
        programId
      )[0],
      isSigner: false,
      isWritable: true,
    };

    const storageData = deserialize(
      (await this.connection.getAccountInfo(storageAddress))?.data as Buffer,
      Storage,
      { unchecked: true }
    );

    const authorizedWithdrawerAccountMeta: AccountMeta = {
      pubkey: new PublicKey(storageData.authorized_withdrawer),
      isSigner: false,
      isWritable: true,
    };
    const systemProgramAccountMeta: AccountMeta = {
      pubkey: SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    };

    const validateSecondaryItemTransferInstruction = new TransactionInstruction(
      {
        programId,
        keys: [
          buyerAccountMeta,
          storageAccountMeta,
          escrowAccountMeta,
          authorizedWithdrawerAccountMeta,

          systemProgramAccountMeta,
        ],
        data: Buffer.from(
          serialize(
            new ValidateSecondaryItemsTransfers({
              log_level: 0,
              item_index: secondary_item_index,
            })
          )
        ),
      }
    );

    try {
      const transactionId = forwardLegacyTransaction(
        {
          publicKey: payerPubkey,
          connection: this.connection,
          signTransaction: this.walletContext.signTransaction,
        },
        [validateSecondaryItemTransferInstruction]
      );
      return transactionId;
    } catch (error) {
      console.log(error);
      throw new Error(
        'Validator secondary items transfer failed with the error : ' + error
      );
    }
  }
}
