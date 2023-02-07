import { http } from '@ingl-permissionless/axios';
import { forwardExistingTransactions } from '@ingl-permissionless/state';
import {
  SignerWalletAdapterProps,
  WalletNotConnectedError,
} from '@solana/wallet-adapter-base';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
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
    validatorId: PublicKey,
    { ...registrationData }: ValidatorRegistration
  ) {
    const payerPubkey = this.walletContext.publicKey;
    if (!payerPubkey)
      throw new WalletNotConnectedError('Please connect your wallet !!!');

    const {
      data: [programId, transaction],
    } = await http.post<[string, Buffer]>(`programs/new-validator`, {
      ...registrationData,
      payer_id: payerPubkey.toBase58(),
      validator_id: validatorId,
    });
    const { data: uploadUritransactions } = await http.post<Buffer[]>(
      `programs/${programId}/upload-uris`,
      { payer_id: payerPubkey.toBase58(), rarities: registrationData.rarities }
    );
    try {
      const signatures = await forwardExistingTransactions(
        {
          connection: this.connection,
          payerKey: payerPubkey,
          signAllTransactions: this.walletContext
            .signAllTransactions as SignerWalletAdapterProps['signAllTransactions'],
        },
        [transaction, ...uploadUritransactions].map((wireTransaction) =>
          Transaction.from(Buffer.from(wireTransaction))
        )
      );
      this.useProgramId(programId);
      return signatures;
    } catch (error) {
      throw new Error(
        'Validator program registration failed with the following errors:' +
          error
      );
    }
  }
}
