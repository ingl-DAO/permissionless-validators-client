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
  TransactionSignature,
  VersionedTransaction,
} from '@solana/web3.js';
import { BN } from 'bn.js';
import { GeneralData, ValidatorConfig } from '../state';

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
  await connection.confirmTransaction({
    signature,
    ...blockhashObj,
  });
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
  console.log(blockhashObj, signature);
  await connection.confirmTransaction(
    {
      ...blockhashObj,
      abortSignal: void 0,
      signature,
    },
    'confirmed'
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
  let signature: TransactionSignature | null = null;
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

export async function computeVoteAccountRewardAPY(
  generalData: GeneralData,
  validatorConfig: ValidatorConfig,
  connection: Connection
) {
  const latestVoteRewards =
    generalData?.vote_rewards.length <= 10
      ? generalData?.vote_rewards
      : generalData?.vote_rewards.slice(-1, 10);
  const rewardPerPrimaryLamportPerEpoch =
    latestVoteRewards.length === 0
      ? 0
      : latestVoteRewards.reduce(
          (acc, curr) =>
            acc +
            Number(
              new BN(curr.nft_holders_reward)
                .div(new BN(validatorConfig.max_primary_stake))
                .toString(10)
            ),
          0
        ) / latestVoteRewards.length;

  const numberOfSlotsInCurrentEpoch = (await connection.getEpochInfo())
    .slotsInEpoch;

  const timePerSlot = 0.4; //400 milliseconds
  const timePerEpoch =
    (numberOfSlotsInCurrentEpoch * timePerSlot) / (60 * 60 * 24);

  const rewardPerYear = rewardPerPrimaryLamportPerEpoch * (365 / timePerEpoch);
  const apy = rewardPerYear * 100;
  // console.log('latestVoteRewards', latestVoteRewards);
  // console.log(
  //   'rewardPerPrimaryLamportPerEpoch',
  //   rewardPerPrimaryLamportPerEpoch
  // );
  // console.log('numberOfSlotsInCurrentEpoch', numberOfSlotsInCurrentEpoch);
  // console.log('timePerSlot', timePerSlot);
  // console.log('timePerEpoch', timePerEpoch);
  // console.log('rewardPerYear', rewardPerYear);
  // console.log('APY', apy);
  return apy;
}
