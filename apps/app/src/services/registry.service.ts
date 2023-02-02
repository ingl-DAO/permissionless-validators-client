import { http } from '@ingl-permissionless/axios';
import { forwardExistingTransactions } from '@ingl-permissionless/state';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
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
    programId: PublicKey,
    validatorId: PublicKey,
    { ...registrationData }: ValidatorRegistration
  ) {
    const payerPubkey = this.walletContext.publicKey;
    if (!payerPubkey)
      throw new WalletNotConnectedError('Please connect your wallet !!!');

    const { data: transaction } = await http.post<Transaction>(
      `programs/new-validator`,
      {
        ...registrationData,
        validator_id: validatorId,
      }
    );
    try {
      const signatures = await forwardExistingTransactions(
        {
          connection: this.connection,
          payerKey: payerPubkey,
          signAllTransactions: this.walletContext.signAllTransactions,
        },
        [transaction]
      );
      this.useProgramId(programId.toBase58());
      return signatures[0];
    } catch (error) {
      throw new Error(
        'Validator program registration failed with the following errors:' +
          error
      );
    }
  }
}
