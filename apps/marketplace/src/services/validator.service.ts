import { deserialize } from '@dao-xyz/borsh';
import { http } from '@ingl-permissionless/axios';
import {
  DeList,
  forwardLegacyTransaction,
  getUniqueStakersOnVoteAccount,
  List,
  MARKETPLACE_STORAGE_SEED,
  PDA_AUTHORIZED_WITHDRAWER_SEED,
  PDA_UPGRADE_AUTHORITY_SEED,
  ProgramStorage,
  PROGRAM_STORAGE_SEED,
  REGISTRY_PROGRAM_ID,
  Storage,
  TEAM_ADDRESS,
} from '@ingl-permissionless/state';
import { PublicKey } from '@metaplex-foundation/js';
import {
  WalletAdapterNetwork,
  WalletNotConnectedError,
} from '@solana/wallet-adapter-base';
import { WalletContextState } from '@solana/wallet-adapter-react';
import {
  AccountMeta,
  BPF_LOADER_PROGRAM_ID,
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
  VoteProgram,
} from '@solana/web3.js';
import BN from 'bn.js';
import {
  Validator,
  ValidatorDetails,
  ValidatorListing,
  ValidatorSecondaryItem,
} from '../interfaces';

enum ProgramUsage {
  Maketplace = 'Maketplace',
  Permissionless = 'Permissionless',
}

export class ValidatorService {
  constructor(
    private readonly connection = new Connection(
      clusterApiUrl(WalletAdapterNetwork.Devnet)
    ),
    private readonly walletContext: WalletContextState
  ) {}

  async getProgramId(usage: ProgramUsage) {
    const { data } = await http.get<{ program_id: string } | null>(
      '/program-id',
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
    secondary_items,
    ...newValidator
  }: ValidatorListing) {
    const payerPubkey = this.walletContext.publicKey;
    if (!payerPubkey)
      throw new WalletNotConnectedError('Please connect your wallet !!!');

    const voteAccounts = await this.connection.getVoteAccounts();
    const { current, delinquent } = voteAccounts;
    const voteAccountInfo =
      [...current, ...delinquent].find((voteAccount) => {
        return voteAccount.votePubkey === vote_account_id;
      }) ?? null;
    if (!voteAccountInfo) throw new Error('Invalid vote account id');

    const { program_id } = await this.getProgramId(ProgramUsage.Maketplace);
    const programId = new PublicKey(program_id);
    const listIntruction = new List({
      log_level: 0,
      ...newValidator,
      authorized_withdrawer_cost: new BN(price * LAMPORTS_PER_SOL),
      secondary_items: (secondary_items as ValidatorSecondaryItem[]).map(
        ({ price, ...item }) => ({
          cost: new BN(price * LAMPORTS_PER_SOL),
          ...item,
        })
      ),
    });
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
      pubkey: BPF_LOADER_PROGRAM_ID,
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
    const listTransactionInstruction = new TransactionInstruction({
      programId,
      data: Buffer.from(listIntruction.serialize()),
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

    try {
      const signature = await forwardLegacyTransaction(
        {
          publicKey: payerPubkey,
          connection: this.connection,
          signTransaction: this.walletContext.signTransaction,
        },
        [listTransactionInstruction]
      );
      this.useProgramId(programId.toBase58());
      return signature;
    } catch (error) {
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
      new PublicKey(vote_account)
    );
    const bpfloaderAccountMeta: AccountMeta = {
      pubkey: BPF_LOADER_PROGRAM_ID,
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
      data: Buffer.from(new DeList(0).serialize()),
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
      throw new Error(
        'Validator listing failed with the following error:' + error
      );
    }
  }

  private async getListingAccounts(
    programId: PublicKey,
    voteAccountPubkey: PublicKey
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
      isWritable: true,
    };
    const [programDataAddress] = PublicKey.findProgramAddressSync(
      [BPF_LOADER_PROGRAM_ID.toBuffer()],
      programId
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
      isSigner: false,
      isWritable: true,
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
    return [
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
    return programStorageAccountInfos
      .map((accounInfo, index) => {
        if (accounInfo) {
          const {
            validator_name,
            validator_logo_url,
            vote_account,
            authorized_withdrawer_cost,
          } = deserialize(accounInfo.data, Storage);
          const voteAccountInfo =
            [...current, ...delinquent].find((voteAccount) => {
              return (
                voteAccount.votePubkey ===
                new PublicKey(vote_account).toBase58()
              );
            }) ?? null;

          return {
            validator_name,
            validator_logo_url,
            seller_public_key: '',
            price:
              new BN(authorized_withdrawer_cost).toNumber() / LAMPORTS_PER_SOL,
            program_id: programPubkeys[index].toBase58(),
            vote_account_id: new PublicKey(vote_account).toBase58(),
            total_stake: voteAccountInfo?.activatedStake
              ? voteAccountInfo.activatedStake / LAMPORTS_PER_SOL
              : 0,
            //TODO @artemesian can you please handle this
            number_of_unique_stakers: 0,
          };
        }
        return null;
      })
      .filter((_) => _ !== null) as Validator[];
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
      mediatable_date,
      request_mediation_date,
      purchase,
      secondary_items,
      authorized_withdrawer_cost,
      authorized_withdrawer,
    } = deserialize(proramAccountInfo.data, Storage);

    const { current, delinquent } = await this.connection.getVoteAccounts();
    const voteAccountInfo =
      [...current, ...delinquent].find((voteAccount) => {
        return (
          voteAccount.votePubkey === new PublicKey(vote_account).toBase58()
        );
      }) ?? null;
    if (!voteAccountInfo) throw new Error('Vote account not found');
    const { nodePubkey: validator_id, activatedStake } = voteAccountInfo;
    const validatorAccount = await this.connection.getAccountInfo(
      new PublicKey(validator_id)
    );
    if (!validatorAccount) throw new Error('Validator account not found');
    const rentExempt = await this.connection.getMinimumBalanceForRentExemption(
      validatorAccount.data.length
    );

    return {
      description,
      validator_id,
      validator_name,
      mediatable_date,
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
        (validatorAccount.lamports - rentExempt) / LAMPORTS_PER_SOL,
      //TODO @manual test data shall be added here
      stake_per_epochs: [],
      validator_initial_epoch: 0,
    };
  }
}
