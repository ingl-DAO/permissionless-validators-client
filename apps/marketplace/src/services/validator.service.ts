import { http } from '@ingl-permissionless/axios';
import {
  forwardLegacyTransaction, List,
  PDA_AUTHORIZED_WITHDRAWER_SEED,
  PDA_UPGRADE_AUTHORITY_SEED,
  PROGRAM_STORAGE_SEED
} from '@ingl-permissionless/state';
import { PublicKey } from '@metaplex-foundation/js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletContextState } from '@solana/wallet-adapter-react';
import {
  AccountMeta,
  BPF_LOADER_PROGRAM_ID,
  clusterApiUrl,
  Connection,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction
} from '@solana/web3.js';
import { ValidatorListing, ValidatorSecondaryItem } from '../interfaces';

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
    authorized_withdrawer_id,
    description,
    mediation_time,
    price,
    validator_secondary_item,
    ...newValidator
  }: ValidatorListing) {
    const voteAccounts = await this.connection.getVoteAccounts();
    const { current, delinquent } = voteAccounts;
    const voteAccountInfo =
      [...current, ...delinquent].find((voteAccount) => {
        return voteAccount.votePubkey === vote_account_id;
      }) ?? null;
    if (!voteAccountInfo) throw new Error('Invalid vote account id');
    const authorizedWithdrawerAccountMeta: AccountMeta = {
      pubkey: new PublicKey(authorized_withdrawer_id),
      isSigner: true,
      isWritable: true,
    };

    const voteAccountMeta: AccountMeta = {
      pubkey: new PublicKey(vote_account_id),
      isSigner: false,
      isWritable: true,
    };
    const { program_id } = await this.getProgramId(ProgramUsage.Maketplace);
    const programId = new PublicKey(program_id);
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
    const listIntruction = new List({
      log_level: 0,
      authorized_withdrawer_cost: price,
      mediatable_date: mediation_time as number,
      secondary_items: (
        validator_secondary_item as ValidatorSecondaryItem[]
      ).map(({ price: cost, ...item }) => ({
        cost,
        ...item,
      })),
    });
    const listTransactionInstruction = new TransactionInstruction({
      programId,
      data: Buffer.from(listIntruction.serialize()),
      keys: [
        authorizedWithdrawerAccountMeta,
        voteAccountMeta,
        pdaAuthorizedWithdrawerAccountMeta,
        storageAccountMeta,
        programAccountMeta,
        programDataAccountMeta,
        currentAuthorityAccountMeta,
        pdaAuthorityAccountMeta,
        sysvarClockAccountMeta,
      ],
    });

    try {
      const signature = await forwardLegacyTransaction(
        {
          publicKey: authorizedWithdrawerAccountMeta.pubkey,
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
}
