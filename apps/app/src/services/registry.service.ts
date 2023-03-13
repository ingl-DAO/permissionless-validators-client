import { http, ProgramUsage } from '@ingl-permissionless/axios';
import {
  AUTHORIZED_WITHDRAWER_KEY,
  BACKEND_ID,
  BPF_LOADER_UPGRADEABLE_ID,
  COLLECTION_HOLDER_KEY,
  createLookupTable,
  GENERAL_ACCOUNT_SEED,
  INGL_CONFIG_SEED,
  INGL_MINT_AUTHORITY_KEY,
  INGL_NFT_COLLECTION_KEY,
  INGL_REGISTRY_PROGRAM_ID,
  INGL_TEAM_ID,
  METAPLEX_PROGRAM_ID,
  URIS_ACCOUNT_SEED,
} from '@ingl-permissionless/state';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import {
  SignerWalletAdapterProps,
  WalletNotConnectedError,
} from '@solana/wallet-adapter-base';
import { WalletContextState } from '@solana/wallet-adapter-react';
import {
  AccountMeta,
  Connection,
  PublicKey,
  SIGNATURE_LENGTH_IN_BYTES,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  VersionedMessage,
  VersionedTransaction,
  VoteProgram,
} from '@solana/web3.js';
import { toast } from 'react-toastify';
import { CollectionJson, ValidatorRegistration } from '../interfaces';
export class RegistryService {
  constructor(
    private readonly connection: Connection,
    private readonly walletContext: WalletContextState
  ) {}

  async getProgramId(usage: ProgramUsage) {
    const { data } = await http.get<{ program_id: string } | null>(
      '/programs/available',
      { params: { usage } }
    );
    if (data) return { program_id: data.program_id };
    else throw new Error('No deployed program is available');
  }

  async useProgramId(programId: string) {
    await http.put(`/programs/${programId}/use`);
  }

  async registerProgram({
    vote_account_id,
    validator_id,
    rarities,
    creator_royalties,
    unit_backing,
    max_primary_stake,
    governance_expiration_time,
    ...registrationData
  }: ValidatorRegistration) {
    const payerPubkey = this.walletContext.publicKey;
    if (!payerPubkey)
      throw new WalletNotConnectedError('Please connect your wallet !!!');

    const program = await this.getProgramId(ProgramUsage.PermissionlessValidator);
    if (!program) throw new Error('No predeployed program available');
    const programPubkey = new PublicKey(program.program_id);

    const metaAccounts = await this.createInitMetaAccounts(
      payerPubkey,
      programPubkey,
      vote_account_id,
      validator_id
    );

    try {
      const lookupTableAddresses = await createLookupTable(
        this.connection,
        this.walletContext,
        metaAccounts.map((_) => _.pubkey)
      );

      const {
        data: { transaction: serializedTransaction, blockhashObj },
      } = await http.post<{
        transaction: Uint8Array;
        blockhashObj: Readonly<{
          blockhash: string;
          lastValidBlockHeight: number;
        }>;
      }>(`programs/validate-create`, {
        rarities,
        creator_royalties,
        unit_backing,
        max_primary_stake,
        governance_expiration_time,
        ...registrationData,
        payer_id: payerPubkey.toBase58(),
        program_id: programPubkey.toBase58(),
        has_vote_account: Boolean(vote_account_id),
        accounts: metaAccounts.map((account) => ({
          ...account,
          pubkey: account.pubkey.toBase58(),
        })),

        lookupTableAddresses,
      });
      const transactionV0 = this.deserializeVersionTransaction(
        Uint8Array.from(Object.values(serializedTransaction).map((v) => v))
      );

      const signTransaction = this.walletContext.signTransaction;
      const signedTransaction = signTransaction
        ? await signTransaction(transactionV0)
        : null;
      // const transaction = Transaction.from(Buffer.from(serializedTransaction));
      // const [signature] = await forwardExistingTransactions(
      //   {
      //     payerKey: payerPubkey,
      //     connection: this.connection,
      //     signAllTransactions: this.walletContext.signAllTransactions,
      //   },
      //   [transaction]
      // );
      // console.log(serializedTransaction);
      // const signedTransaction = signTransaction
      //   ? await signTransaction(transaction)
      //   : null;
      // const signMessage = this.walletContext.signMessage;
      // const signedMessage = signMessage ? await signMessage(txBuffer) : null;
      // console.log(txBuffer);
      // console.log('transaction', transaction, serializedMessage);
      // console.log(transaction, new MessageV0(transaction.message));
      const signature = await this.connection.sendTransaction(
        signedTransaction as VersionedTransaction
      );
      await this.connection.confirmTransaction({
        signature,
        blockhash: blockhashObj.blockhash,
        lastValidBlockHeight: blockhashObj.lastValidBlockHeight,
      });
      return { signature, program_id: programPubkey };
    } catch (error) {
      console.log(error);
      const errorMessage =
        typeof error === 'object'
          ? (error as { message: string }).message
          : error;
      throw new Error(
        'Validator program registration failed with the following errors:' +
          errorMessage
      );
    }
  }

  decodeLength(bytes: number[]) {
    let len = 0;
    let size = 0;

    for (;;) {
      if (bytes.length === 0) break;
      const elem = bytes.shift();
      if (elem) {
        len |= (elem & 0x7f) << (size * 7);
        size += 1;

        if ((elem & 0x80) === 0) {
          break;
        }
      }
    }

    return len;
  }

  deserializeVersionTransaction(serializedTransaction: Uint8Array) {
    const byteArray = [...serializedTransaction];
    const signatures = [];
    const signaturesLength = this.decodeLength(byteArray);

    for (let i = 0; i < signaturesLength; i++) {
      signatures.push(
        new Uint8Array(byteArray.splice(0, SIGNATURE_LENGTH_IN_BYTES))
      );
    }

    const message = VersionedMessage.deserialize(new Uint8Array(byteArray));
    const transactionV0 = new VersionedTransaction(message);
    transactionV0.signatures = signatures;
    return transactionV0;
  }

  async uploadUris(
    programPubkey: PublicKey,
    { uris, rarities, rarity_names }: CollectionJson
  ) {
    const payerPubkey = this.walletContext.publicKey;
    if (!payerPubkey)
      throw new WalletNotConnectedError('Please connect your wallet !!!');

    const { data: uploadUriTransactions } = await http.post<
      { transaction: Buffer; rarity: number }[]
    >(`programs/${programPubkey.toBase58()}/upload-uris`, {
      payer_id: payerPubkey.toBase58(),
      rarities: rarities.map((rarity, index) => ({
        rarity,
        uris: uris[index],
      })),
    });
    const transactions = uploadUriTransactions.map(
      ({ transaction: wireTransaction, rarity }) => {
        const transaction = Transaction.from(Buffer.from(wireTransaction));
        return { rarity, transaction };
      }
    );
    const signAllTransactions = this.walletContext
      .signAllTransactions as SignerWalletAdapterProps['signAllTransactions'];
    const signedTransactions = signAllTransactions
      ? await signAllTransactions(transactions.map((_) => _.transaction))
      : null;
    if (!signedTransactions) throw new Error('No transactions could be signed');

    let count = 0;
    const signatures: { rarity_name: string; signature: string }[] = [];
    while (count < signedTransactions.length) {
      const blockhashObj = await this.connection.getLatestBlockhash();
      const signedTransaction = signedTransactions[count];
      const signature = await this.connection.sendRawTransaction(
        (signedTransaction as Transaction).serialize()
      );
      await this.connection.confirmTransaction({
        signature,
        ...blockhashObj,
      });
      const rarity_name = rarity_names[transactions[count].rarity];
      toast.info(`Transaction ${count}: ${rarity_name} uris upload`);
      signatures.push({ signature, rarity_name });
      count++;
    }
    return signatures;
  }

  private async createInitMetaAccounts(
    payerPubkey: PublicKey,
    programPubkey: PublicKey,
    vote_account_id?: string,
    validator_id?: string
  ) {
    if (
      (!validator_id && !vote_account_id) ||
      (validator_id && vote_account_id)
    )
      throw new Error(
        'Please only provide a vote account key in case you have one, otherwise send your validator account key.'
      );

    const payerAccount: AccountMeta = {
      pubkey: payerPubkey,
      isSigner: true,
      isWritable: true,
    };

    let validatorAccount: AccountMeta;
    const existingValidatorAccounts: AccountMeta[] = [];

    if (validator_id) {
      validatorAccount = {
        pubkey: new PublicKey(validator_id),
        isWritable: false,
        isSigner: false,
      };
    } else {
      const voteAccountKey = new PublicKey(vote_account_id as string);
      const voteAccountInfo = await this.connection.getAccountInfo(
        voteAccountKey
      );
      if (!voteAccountInfo) throw new Error('Invalid vote account ID.');
      //The first four bytes are used to represent the vote account version
      const validatorId = new PublicKey(voteAccountInfo.data.slice(4, 36));
      const authorizedWithdrawer = new PublicKey(
        voteAccountInfo.data.slice(36, 68)
      );
      if (authorizedWithdrawer.toBase58() !== payerAccount.pubkey.toBase58())
        throw new Error('The authorized withdrawer must be the payer');
      const [pdaAuthorityKey] = PublicKey.findProgramAddressSync(
        [Buffer.from(AUTHORIZED_WITHDRAWER_KEY)],
        programPubkey
      );
      existingValidatorAccounts.push(
        payerAccount,
        { pubkey: pdaAuthorityKey, isSigner: false, isWritable: false },
        { pubkey: voteAccountKey, isSigner: false, isWritable: true },
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false }
      );

      validatorAccount = {
        pubkey: validatorId,
        isWritable: false,
        isSigner: false,
      };
    }

    const [inglConfigKey] = PublicKey.findProgramAddressSync(
      [Buffer.from(INGL_CONFIG_SEED)],
      programPubkey
    );
    const configAccount: AccountMeta = {
      pubkey: inglConfigKey,
      isSigner: false,
      isWritable: true,
    };
    const [urisAccountKey] = PublicKey.findProgramAddressSync(
      [Buffer.from(URIS_ACCOUNT_SEED)],
      programPubkey
    );
    const urisAccount: AccountMeta = {
      isSigner: false,
      isWritable: true,
      pubkey: urisAccountKey,
    };

    const [inglNftCollectionMintKey] = PublicKey.findProgramAddressSync(
      [Buffer.from(INGL_NFT_COLLECTION_KEY)],
      programPubkey
    );

    const collectionMintAccount: AccountMeta = {
      pubkey: inglNftCollectionMintKey,
      isSigner: false,
      isWritable: true,
    };

    const [collectionAutorityKey] = PublicKey.findProgramAddressSync(
      [Buffer.from(INGL_MINT_AUTHORITY_KEY)],
      programPubkey
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

    const [metaplexAccountKey] = PublicKey.findProgramAddressSync(
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
      programPubkey
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
      programPubkey
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
    const [nameStorageKey] = PublicKey.findProgramAddressSync(
      [Buffer.from('name_storage')],
      INGL_REGISTRY_PROGRAM_ID
    );
    const nameStorageAccount: AccountMeta = {
      pubkey: nameStorageKey,
      isSigner: false,
      isWritable: true,
    };
    const [storageKey] = PublicKey.findProgramAddressSync(
      [Buffer.from('storage')],
      INGL_REGISTRY_PROGRAM_ID
    );
    const storageAccount: AccountMeta = {
      pubkey: storageKey,
      isSigner: false,
      isWritable: true,
    };

    const upgradeAuthorityAccount: AccountMeta = {
      pubkey: BACKEND_ID,
      isSigner: true,
      isWritable: true,
    };

    //This could change in the future but are the same acounts for now
    const teamAccount: AccountMeta = {
      pubkey: INGL_TEAM_ID,
      isSigner: false,
      isWritable: true,
    };

    const programAccount: AccountMeta = {
      pubkey: programPubkey,
      isSigner: false,
      isWritable: false,
    };
    const [programDataKey] = PublicKey.findProgramAddressSync(
      [programPubkey.toBuffer()],
      BPF_LOADER_UPGRADEABLE_ID
    );
    const programDataAccount: AccountMeta = {
      pubkey: programDataKey,
      isSigner: false,
      isWritable: false,
    };
    const voteProgramAccount: AccountMeta = {
      pubkey: VoteProgram.programId,
      isSigner: false,
      isWritable: false,
    };
    return [
      payerAccount,
      configAccount,
      generalAccount,
      urisAccount,
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
      programDataAccount,
      upgradeAuthorityAccount,

      ...existingValidatorAccounts,

      programAccount,
      teamAccount,
      storageAccount,
      nameStorageAccount,

      ...(vote_account_id ? [voteProgramAccount] : []),
      systemProgramAccount,
      splTokenProgramAccount,
      associatedTokeProgramAccount,
      metaplexProgramAccount,
      InglRegistryProgramAccount,
    ];
  }
}
