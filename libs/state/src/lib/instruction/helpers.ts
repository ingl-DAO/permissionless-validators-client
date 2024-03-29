import { Constructor, deserialize } from '@dao-xyz/borsh';
import { http } from '@ingl-permissionless/axios';
import {
  SignerWalletAdapterProps,
  WalletAdapterNetwork,
} from '@solana/wallet-adapter-base';
import { WalletContextState } from '@solana/wallet-adapter-react';
import {
  AddressLookupTableAccount,
  AddressLookupTableProgram,
  clusterApiUrl,
  Commitment,
  ComputeBudgetProgram,
  Connection,
  Keypair,
  ParsedAccountData,
  PublicKey,
  Transaction,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';
import { BN } from 'bn.js';
import { GeneralData, STAKE_PROGRAM_ID, ValidatorConfig } from '../state';

export const forwardLegacyTransaction = async (
  walletConnection: {
    publicKey: PublicKey;
    connection: Connection;
    signTransaction?: SignerWalletAdapterProps['signTransaction'];
  },
  instructions: TransactionInstruction[],
  options?: {
    additionalUnits?: number;
    signingKeypairs?: Keypair[];
    isSignatureRequired?: boolean;
  }
) => {
  const { connection, publicKey: payerKey, signTransaction } = walletConnection;

  let transaction = new Transaction();
  if (options?.additionalUnits) {
    const additionalComputeBudgetInstruction =
      ComputeBudgetProgram.setComputeUnitLimit({
        units: options.additionalUnits,
      });
    transaction.add(additionalComputeBudgetInstruction);
  }
  transaction.add(...instructions).feePayer = payerKey as PublicKey;

  const blockhashObj = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhashObj.blockhash;
  if (options?.signingKeypairs && options?.signingKeypairs.length > 0)
    transaction.sign(...options.signingKeypairs);

  if (options?.isSignatureRequired) {
    const {
      data: { data },
    } = await http.post<{ data: Buffer }>(`/programs/sign-transaction`, {
      transaction: transaction.serialize({ requireAllSignatures: false }),
    });
    transaction = Transaction.from(data);
  }

  const signedTransaction = signTransaction
    ? await signTransaction(transaction)
    : null;

  if (!options?.signingKeypairs && !signTransaction)
    throw new Error(
      'Transaction must always be signed. Please use your browser wallet and/or your keypair to sign.'
    );
  const signature = await connection.sendRawTransaction(
    (signedTransaction as Transaction).serialize()
  );
  await connection.confirmTransaction({
    signature,
    ...blockhashObj,
  });
  return signature;
};

export const forwardMultipleLegacyTransactions = async (
  walletConnection: {
    publicKey: PublicKey;
    connection: Connection;
    signAllTransactions: SignerWalletAdapterProps['signAllTransactions'];
  },
  instructions: {
    instructions: TransactionInstruction[];
    additionalUnits?: number;
    signingKeypairs?: Keypair[];
  }[]
) => {
  const {
    connection,
    publicKey: payerKey,
    signAllTransactions,
  } = walletConnection;

  const blockhashObj = await connection.getLatestBlockhash();
  const transactions = instructions.map(
    ({ instructions, additionalUnits, signingKeypairs }) => {
      const transaction = new Transaction();
      if (additionalUnits) {
        const additionalComputeBudgetInstruction =
          ComputeBudgetProgram.setComputeUnitLimit({
            units: additionalUnits,
          });
        transaction.add(additionalComputeBudgetInstruction);
      }
      transaction.add(...instructions).feePayer = payerKey as PublicKey;
      transaction.recentBlockhash = blockhashObj.blockhash;
      if (signingKeypairs && signingKeypairs.length > 0)
        transaction.sign(...signingKeypairs);

      return transaction;
    }
  );

  const signedTransactions = signAllTransactions
    ? await signAllTransactions(transactions)
    : null;
  if (!signedTransactions) throw new Error('No signed transactions found');

  let index = 0;
  const allSignatures = [];
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const signedTransaction = signedTransactions[index];
    const signature = await connection.sendRawTransaction(
      (signedTransaction as Transaction).serialize()
    );
    allSignatures.push(signature);
    await connection.confirmTransaction({
      signature,
      ...blockhashObj,
    });
    index++;
    if (index > signedTransactions.length - 1) break;
  }
  return allSignatures;
};

export async function forwardV0Transaction(
  {
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
  const connection = new Connection(clusterApiUrl(WalletAdapterNetwork.Devnet));

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
  await connection.confirmTransaction({
    signature,
    blockhash: blockhashObj.blockhash,
    lastValidBlockHeight: blockhashObj.lastValidBlockHeight,
  });
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
  connection = new Connection(clusterApiUrl(WalletAdapterNetwork.Devnet));
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
          addresses: addresses.splice(0, 33),
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

export async function computeVoteAccountRewardAPY(
  connection: Connection,
  generalData: GeneralData
) {
  const latestVoteRewards = (function () {
    const voteRewards = generalData?.vote_rewards;

    if (!voteRewards || voteRewards.length === 0) return [];
    const finalVoteReward = [voteRewards[voteRewards.length - 1]];
    const latestEpoch = Number(finalVoteReward[0]?.epoch_number);
    const diffEpoch = 20; // 20 epochs difference

    for (let i = voteRewards.length - 2; i >= 0; i--) {
      const currentEpoch = Number(voteRewards[i].epoch_number);
      if (
        latestEpoch - currentEpoch >= 0 &&
        latestEpoch - currentEpoch <= diffEpoch + 5 // 5 epochs margin at most
      ) {
        finalVoteReward.push(voteRewards[i]);
      }
    }
    return finalVoteReward;
  })();

  const rewardPerPrimaryLamportPerEpoch =
    latestVoteRewards.length === 0
      ? 0
      : latestVoteRewards.reduce(
          (acc, curr) =>
            acc +
            Number(new BN(curr?.nft_holders_reward)) /
              Number(new BN(generalData.total_delegated)),
          0
        ) / latestVoteRewards.length;

  const numberOfSlotsInCurrentEpoch = (await connection.getEpochInfo())
    .slotsInEpoch;

  const timePerSlot = 0.4; //400 milliseconds
  const timePerEpoch =
    (numberOfSlotsInCurrentEpoch * timePerSlot) / (60 * 60 * 24);

  const rewardPerYear = rewardPerPrimaryLamportPerEpoch * (365 / timePerEpoch);
  let apy = rewardPerYear * 100;
  apy = Math.trunc(apy * 100) / 100; // just truncating apy to 2 decimal places here
  return apy;
}

export const isMaximumPrimaryStakeReached = async (
  errorMessage: string,
  validatorConfigID: PublicKey,
  generalDataID: PublicKey,
  connection: Connection
) => {
  const [validatorConfigAccountInfo, generalAccountInfo] = await Promise.all([
    connection.getAccountInfo(validatorConfigID),
    connection.getAccountInfo(generalDataID),
  ]);

  if (!validatorConfigAccountInfo)
    throw new Error('Validator config not found');
  if (!generalAccountInfo) throw new Error('General account not found');
  const validatorConfigData = deserialize<ValidatorConfig>(
    validatorConfigAccountInfo.data,
    ValidatorConfig
  );
  const generalAccountData = deserialize<GeneralData>(
    generalAccountInfo.data,
    GeneralData
  );
  if (
    validatorConfigData.max_primary_stake === generalAccountData.total_delegated
  )
    throw new Error(errorMessage);
};

export const willExceedMaximumPrimaryStake = async (
  errorMessage: string,
  numberOfNfts: number,
  validatorConfigID: PublicKey,
  generalDataID: PublicKey,
  connection: Connection
) => {
  const [validatorConfigAccountInfo, generalAccountInfo] = await Promise.all([
    connection.getAccountInfo(validatorConfigID),
    connection.getAccountInfo(generalDataID),
  ]);

  if (!validatorConfigAccountInfo)
    throw new Error('Validator config not found');
  if (!generalAccountInfo) throw new Error('General account not found');

  const validatorConfigData = deserialize<ValidatorConfig>(
    validatorConfigAccountInfo.data,
    ValidatorConfig
  );
  const generalAccountData = deserialize<GeneralData>(
    generalAccountInfo.data,
    GeneralData
  );
  const amountOfNFTsDelegable = Number(
    new BN(validatorConfigData.max_primary_stake)
      .sub(new BN(generalAccountData.total_delegated))
      .div(new BN(validatorConfigData.unit_backing))
      .toString(10)
  );
  if (amountOfNFTsDelegable < numberOfNfts)
    throw new Error(
      errorMessage +
        ' || Only ' +
        amountOfNFTsDelegable +
        ' NFTs can be currently.'
    );
};

export async function forwardExistingTransactions(
  walletConnection: {
    payerKey: PublicKey;
    connection: Connection;
    signAllTransactions?: SignerWalletAdapterProps['signAllTransactions'];
  },
  transactions: Transaction[],
  additionalUnits?: number
) {
  const { connection, signAllTransactions } = walletConnection;

  if (additionalUnits) {
    transactions = transactions.map((transaction) => {
      const additionalComputeBudgetInstruction =
        ComputeBudgetProgram.setComputeUnitLimit({
          units: additionalUnits,
        });
      return transaction.add(additionalComputeBudgetInstruction);
    });
  }
  const signedTransactions = signAllTransactions
    ? await signAllTransactions(transactions)
    : null;
  if (!signedTransactions) throw new Error('No transactions could be signed');
  return Promise.all(
    signedTransactions.map(async (signedTransaction) => {
      const signature = await connection.sendRawTransaction(
        (signedTransaction as Transaction).serialize()
      );
      await connection.confirmTransaction({
        signature,
        blockhash: signedTransaction.recentBlockhash as string,
        lastValidBlockHeight: signedTransaction.lastValidBlockHeight as number,
      });
      return signature;
    })
  );
}

export const getTxSize = (tx: Transaction, feePayer: PublicKey): number => {
  const feePayerPk = [feePayer.toBase58()];

  const signers = new Set<string>(feePayerPk);
  const accounts = new Set<string>(feePayerPk);

  const ixsSize = tx.instructions.reduce((acc, ix) => {
    ix.keys.forEach(({ pubkey, isSigner }) => {
      const pk = pubkey.toBase58();
      if (isSigner) signers.add(pk);
      accounts.add(pk);
    });

    accounts.add(ix.programId.toBase58());

    const nIndexes = ix.keys.length;
    const opaqueData = ix.data.length;

    return (
      acc +
      1 + // PID index
      compactArraySize(nIndexes, 1) +
      compactArraySize(opaqueData, 1)
    );
  }, 0);

  return (
    compactArraySize(signers.size, 64) + // signatures
    3 + // header
    compactArraySize(accounts.size, 32) + // accounts
    32 + // blockhash
    compactHeader(tx.instructions.length) + // instructions
    ixsSize
  );
};

const LOW_VALUE = 127; // 0x7f
const HIGH_VALUE = 16383; // 0x3fff

/**
 * Compact u16 array header size
 * @param n elements in the compact array
 * @returns size in bytes of array header
 */
const compactHeader = (n: number) =>
  n <= LOW_VALUE ? 1 : n <= HIGH_VALUE ? 2 : 3;

/**
 * Compact u16 array size
 * @param n elements in the compact array
 * @param size bytes per each element
 * @returns size in bytes of array
 */
const compactArraySize = (n: number, size: number) =>
  compactHeader(n) + n * size;

export async function getDeserializedAccountData<T>(
  connection: Connection,
  publicKey: PublicKey,
  schema: Constructor<T>
): Promise<T> {
  const accountInfo = await connection.getAccountInfo(publicKey);
  if (!accountInfo) {
    throw new Error('Account not found');
  }

  return deserialize(accountInfo.data as Buffer, schema, { unchecked: true });
}

export const getDelegatedStakeAccountOnVoteAccount = async (
  connection: Connection,
  vote_pubkey: PublicKey
) => {
  const accounts = await connection.getParsedProgramAccounts(STAKE_PROGRAM_ID, {
    filters: [
      {
        dataSize: 200,
      },
      {
        memcmp: {
          offset: 124,
          bytes: vote_pubkey.toString(),
        },
      },
    ],
  });
  return accounts;
};

export const getUniqueStakersOnVoteAccount = async (
  connection: Connection,
  vote_pubkey: PublicKey
) => {
  const accounts = await getDelegatedStakeAccountOnVoteAccount(
    connection,
    vote_pubkey
  );
  const UniqueStakers = new Set();
  for (let i = 0; i < accounts.length; i++) {
    const staker = (accounts[i].account.data as ParsedAccountData).parsed[
      'info'
    ]['meta']['authorized']['withdrawer'];
    if (!UniqueStakers.has(staker)) {
      UniqueStakers.add(staker);
    }
  }
  return UniqueStakers;
};
