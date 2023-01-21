import { WalletContextState } from '@solana/wallet-adapter-react';
import {
  AddressLookupTableAccount,
  AddressLookupTableProgram,
  Commitment,
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';

export const forwardLegacyTransaction = async (
  walletConnection: { connection: Connection; wallet: WalletContextState },
  instructions: TransactionInstruction[],
  signingKeypairs?: Keypair[],
  additionalUnits?: number
) => {
  const {
    connection,
    wallet: { publicKey: payerKey, signTransaction, sendTransaction },
  } = walletConnection;

  const transaction = new Transaction();
  if (additionalUnits) {
    const additionalComputeBudgetInstruction =
      ComputeBudgetProgram.setComputeUnitLimit({
        units: additionalUnits,
      });
    transaction.add(additionalComputeBudgetInstruction);
  }
  transaction.add(...instructions).feePayer = payerKey as PublicKey;

  const blockhashObj = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhashObj.blockhash;

  if (signingKeypairs && signingKeypairs.length > 0)
    transaction.sign(...signingKeypairs);
  const signedTransaction = signTransaction
    ? await signTransaction(transaction)
    : null;

  const signature = await sendTransaction(
    signedTransaction as Transaction,
    connection
  );
  return signature;
};

export async function forwardV0Transaction(
  {
    connection,
    wallet: { publicKey, signTransaction },
  }: {
    connection: Connection;
    wallet: WalletContextState;
  },
  instructions: TransactionInstruction[],
  options?: {
    commitment?: Commitment;
    signerKeypairs?: Keypair[];
    additionalUnits?: number;
    lookupTableAddresses?: PublicKey[];
  }
) {
  const lookupTableAccounts: AddressLookupTableAccount[] = [];
  if (options?.lookupTableAddresses) {
    for (let i = 0; i < options.lookupTableAddresses.length; i++) {
      const lookupTableAccount = await connection
        .getAddressLookupTable(options?.lookupTableAddresses[i])
        .then((res) => res.value);
      if (lookupTableAccount) lookupTableAccounts.push(lookupTableAccount);
      else throw new Error(`Sorry, No Lookup table was found`);
    }
  }
  if (options?.additionalUnits) {
    const additionalComputeBudgetInstruction =
      ComputeBudgetProgram.setComputeUnitLimit({
        units: options?.additionalUnits,
      });
    instructions.unshift(additionalComputeBudgetInstruction);
  }

  const blockhashObj = await connection.getLatestBlockhash();
  const messageV0 = new TransactionMessage({
    recentBlockhash: blockhashObj.blockhash,
    payerKey: publicKey as PublicKey,
    instructions,
  }).compileToV0Message(lookupTableAccounts);

  const transactionV0 = new VersionedTransaction(messageV0);

  if (options?.signerKeypairs && options?.signerKeypairs.length > 0)
    transactionV0.sign(options?.signerKeypairs);

  const signedTransaction = signTransaction
    ? await signTransaction(transactionV0)
    : null;

  const signature = await connection.sendTransaction(
    signedTransaction as VersionedTransaction
  );
  await connection.confirmTransaction(
    {
      signature,
      blockhash: blockhashObj.blockhash,
      lastValidBlockHeight: blockhashObj.lastValidBlockHeight,
    },
    options?.commitment
  );
  return signature;
}

export function getCloseLookupTableInstructions(
  authority: PublicKey,
  lookupTableAddresses: PublicKey[]
) {
  return [
    ...lookupTableAddresses.map((address) =>
      AddressLookupTableProgram.deactivateLookupTable({
        authority,
        lookupTable: address,
      })
    ),
    ...lookupTableAddresses.map((address) =>
      AddressLookupTableProgram.closeLookupTable({
        authority,
        recipient: authority,
        lookupTable: address,
      })
    ),
  ];
}

export async function createLookupTable(
  connection: Connection,
  wallet: WalletContextState,
  addresses: PublicKey[]
) {
  const { publicKey: payerPubkey } = wallet;
  const lookupTableAddresses: PublicKey[] = [];
  let signature: string | null = null;
  while (addresses.length > 0) {
    const [lookupTableInst, lookupTableAddress] =
      AddressLookupTableProgram.createLookupTable({
        authority: payerPubkey as PublicKey,
        payer: payerPubkey as PublicKey,
        recentSlot: await connection.getSlot(),
      });
    lookupTableAddresses.push(lookupTableAddress);
    signature = await forwardV0Transaction(
      { connection, wallet },
      [
        lookupTableInst,
        AddressLookupTableProgram.extendLookupTable({
          addresses: addresses.splice(0, 20),
          payer: payerPubkey as PublicKey,
          authority: payerPubkey as PublicKey,
          lookupTable: lookupTableAddress,
        }),
      ],
      { commitment: 'single' }
    );
  }
  if (signature) await connection.confirmTransaction(signature, 'finalized');
  return lookupTableAddresses;
}
