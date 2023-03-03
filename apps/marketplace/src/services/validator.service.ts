import { deserialize } from '@dao-xyz/borsh';
import { http } from '@ingl-permissionless/axios';
import {
  DeList,
  forwardLegacyTransaction,
  List,
  MARKETPLACE_STORAGE_SEED,
  PDA_AUTHORIZED_WITHDRAWER_SEED,
  PDA_UPGRADE_AUTHORITY_SEED,
  ProgramStorage,
  PROGRAM_STORAGE_SEED, REGISTRY_PROGRAM_ID,
  Storage
} from '@ingl-permissionless/state';
import { PublicKey } from '@metaplex-foundation/js';
import {
  WalletAdapterNetwork,
  WalletNotConnectedError
} from '@solana/wallet-adapter-base';
import { WalletContextState } from '@solana/wallet-adapter-react';
import {
  AccountMeta,
  BPF_LOADER_PROGRAM_ID,
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction
} from '@solana/web3.js';
import BN from 'bn.js';
import {
  Validator,
  ValidatorListing,
  ValidatorSecondaryItem
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
    const listTransactionInstruction = new TransactionInstruction({
      programId,
      data: Buffer.from(listIntruction.serialize()),
      keys: accounts,
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
    const delistTransactionInstruction = new TransactionInstruction({
      programId,
      data: Buffer.from(new DeList(0).serialize()),
      keys: accounts,
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
    if (!marketplaceStorageAccountInfo)
      throw new Error('Marketplace registry storage account not found');

    const { programs } = deserialize(
      marketplaceStorageAccountInfo.data,
      ProgramStorage,
      { unchecked: true }
    );
    const programStorageAccountInfos = await Promise.all(
      programs.map((program) => {
        const [programStorageAddress] = PublicKey.findProgramAddressSync(
          [Buffer.from(PROGRAM_STORAGE_SEED)],
          new PublicKey(program)
        );
        return this.connection.getAccountInfo(programStorageAddress);
      })
    );
    return programStorageAccountInfos
      .filter((_) => _ !== null)
      .map((accounInfo) => {
        const {
          validator_name,
          validator_logo_url,
          vote_account,
          authorized_withdrawer_cost,
        } = deserialize(accounInfo?.data as Buffer, Storage);
        return {
          validator_name,
          validator_logo_url,
          price:
            new BN(authorized_withdrawer_cost).toNumber() / LAMPORTS_PER_SOL,
          vote_account_id: new PublicKey(vote_account).toBase58(),
          //TODO @artemesian can you please handle this
          total_stake: 0,
          number_of_unique_stakers: 0,
        };
      });
  }
}
