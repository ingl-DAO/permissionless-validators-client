import { deserialize, serialize } from '@dao-xyz/borsh';
import {
  AUTHORIZED_WITHDRAWER_KEY,
  createLookupTable,
  Delegated,
  DelegateNFT,
  forwardLegacyTransaction,
  forwardMultipleLegacyTransactions,
  forwardV0Transaction,
  GeneralData,
  GENERAL_ACCOUNT_SEED,
  getDeserializedAccountData,
  getTxSize,
  ImprintRarity,
  INGL_CONFIG_SEED,
  INGL_MINT_AUTHORITY_KEY,
  INGL_NFT_COLLECTION_KEY,
  INGL_PROPOSAL_KEY,
  isMaximumPrimaryStakeReached,
  METAPLEX_PROGRAM_ID,
  MintNft,
  NftData,
  NFTWithdraw,
  NFT_ACCOUNT_CONST,
  PD_POOL_ACCOUNT_KEY,
  Redeem,
  toBytesInt32,
  UnDelegateNFT,
  URIS_ACCOUNT_SEED,
  ValidatorConfig,
  willExceedMaximumPrimaryStake,
} from '@ingl-permissionless/state';
import {
  JsonMetadata,
  Metadata,
  Metaplex,
  Nft,
  Sft,
} from '@metaplex-foundation/js';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import {
  SignerWalletAdapterProps,
  WalletAdapterNetwork,
  WalletNotConnectedError,
} from '@solana/wallet-adapter-base';
import { WalletContextState } from '@solana/wallet-adapter-react';
import {
  AccountMeta,
  ComputeBudgetProgram,
  Keypair,
  LAMPORTS_PER_SOL,
  PACKET_DATA_SIZE,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction,
  type Connection,
} from '@solana/web3.js';
import BN from 'bn.js';
import { InglNft, NftReward } from '../interfaces';

export type MetaplexNft = Metadata<JsonMetadata<string>> | Nft | Sft;

export class NftService {
  constructor(
    private readonly programId: PublicKey,
    private readonly connection: Connection,
    private readonly walletContext: WalletContextState,
    private readonly validatorConfigAccountPDA = PublicKey.findProgramAddressSync(
      [Buffer.from(INGL_CONFIG_SEED)],
      programId
    ),
    private readonly generalAccountPDA = PublicKey.findProgramAddressSync(
      [Buffer.from(GENERAL_ACCOUNT_SEED)],
      programId
    ),
    private readonly mintingPoolPDA = PublicKey.findProgramAddressSync(
      [Buffer.from(PD_POOL_ACCOUNT_KEY)],
      programId
    ),
    private readonly urisAccountPDA = PublicKey.findProgramAddressSync(
      [Buffer.from(URIS_ACCOUNT_SEED)],
      programId
    ),
    private readonly mintAuthorityPDA = PublicKey.findProgramAddressSync(
      [Buffer.from(INGL_MINT_AUTHORITY_KEY)],
      programId
    ),
    private readonly authorizedWithdrawerPDA = PublicKey.findProgramAddressSync(
      [Buffer.from(AUTHORIZED_WITHDRAWER_KEY)],
      programId
    ),
    private readonly collectionPDA = PublicKey.findProgramAddressSync(
      [Buffer.from(INGL_NFT_COLLECTION_KEY)],
      programId
    ),
    private readonly collectionMetadataPDA = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        METAPLEX_PROGRAM_ID.toBuffer(),
        collectionPDA[0].toBuffer(),
      ],
      METAPLEX_PROGRAM_ID
    ),
    private readonly collectionEditionPDA = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        METAPLEX_PROGRAM_ID.toBuffer(),
        collectionPDA[0].toBuffer(),
        Buffer.from('edition'),
      ],
      METAPLEX_PROGRAM_ID
    )
  ) {}

  async mintNft(numberOfNfts?: number) {
    numberOfNfts = numberOfNfts ?? 1; // default to 1

    const payerPubkey = this.walletContext.publicKey;
    if (!payerPubkey)
      throw new WalletNotConnectedError('Please connect your wallet !!!');
    console.log('0');
    // Check if max primary stake already reached
    await isMaximumPrimaryStakeReached(
      'You can not mint anymore, the maximum delegable stake is currently attained',
      this.validatorConfigAccountPDA[0],
      this.generalAccountPDA[0],
      this.connection
    );
    console.log('1');
    await willExceedMaximumPrimaryStake(
      "All the NFTs can't be minted, it will exceed the maximum delegable stake",
      numberOfNfts,
      this.validatorConfigAccountPDA[0],
      this.generalAccountPDA[0],
      this.connection
    );
    console.log('2');

    const payerAccount: AccountMeta = {
      pubkey: this.walletContext.publicKey as PublicKey,
      isSigner: true,
      isWritable: true,
    };

    const mintAuthorityAccount: AccountMeta = {
      pubkey: this.mintAuthorityPDA[0],
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

    const generalAccountAccount: AccountMeta = {
      pubkey: this.generalAccountPDA[0],
      isSigner: false,
      isWritable: true,
    };

    const metaplexProgramAccount: AccountMeta = {
      pubkey: METAPLEX_PROGRAM_ID,
      isSigner: false,
      isWritable: false,
    };

    const mintingPoolAccount: AccountMeta = {
      pubkey: this.mintingPoolPDA[0],
      isSigner: false,
      isWritable: true,
    };

    const inglCollectionMintAccount: AccountMeta = {
      pubkey: this.collectionPDA[0],
      isSigner: false,
      isWritable: false,
    };

    const inglCollectionAccount: AccountMeta = {
      pubkey: this.collectionMetadataPDA[0],
      isSigner: false,
      isWritable: false,
    };

    const collectionEditionAccount: AccountMeta = {
      pubkey: this.collectionEditionPDA[0],
      isSigner: false,
      isWritable: true,
    };

    const associatedTokeProgramAccount: AccountMeta = {
      pubkey: ASSOCIATED_TOKEN_PROGRAM_ID,
      isSigner: false,
      isWritable: false,
    };

    const inglConfigAccount: AccountMeta = {
      isSigner: false,
      isWritable: false,
      pubkey: this.validatorConfigAccountPDA[0],
    };

    const urisAccountAccount: AccountMeta = {
      isSigner: false,
      isWritable: false,
      pubkey: this.urisAccountPDA[0],
    };
    const instructions = [];
    const mintKeyPairs = [];

    try {
      for (let i = 0; i < numberOfNfts; i++) {
        const mintKeyPair = Keypair.generate();
        mintKeyPairs.push(mintKeyPair);

        const nftMintAccount: AccountMeta = {
          pubkey: mintKeyPair.publicKey,
          isSigner: true,
          isWritable: true,
        };

        const [nftMetaplexAccountKey] = PublicKey.findProgramAddressSync(
          [
            Buffer.from('metadata'),
            METAPLEX_PROGRAM_ID.toBuffer(),
            nftMintAccount.pubkey.toBuffer(),
          ],
          METAPLEX_PROGRAM_ID
        );

        const nftMetadataAccount: AccountMeta = {
          pubkey: nftMetaplexAccountKey,
          isSigner: false,
          isWritable: true,
        };

        const [nftPubkey] = PublicKey.findProgramAddressSync(
          [Buffer.from(NFT_ACCOUNT_CONST), mintKeyPair.publicKey.toBuffer()],
          this.programId
        );

        const nftAccount: AccountMeta = {
          pubkey: nftPubkey,
          isSigner: false,
          isWritable: true,
        };

        const associatedTokenAccount: AccountMeta = {
          pubkey: getAssociatedTokenAddressSync(
            mintKeyPair.publicKey,
            payerAccount.pubkey
          ),
          isSigner: false,
          isWritable: true,
        };

        const [nftEditionKey] = PublicKey.findProgramAddressSync(
          [
            Buffer.from('metadata'),
            METAPLEX_PROGRAM_ID.toBuffer(),
            nftMintAccount.pubkey.toBuffer(),
            Buffer.from('edition'),
          ],
          METAPLEX_PROGRAM_ID
        );
        const nftEditionAccount: AccountMeta = {
          pubkey: nftEditionKey,
          isSigner: false,
          isWritable: true,
        };

        const instructionAccounts = [
          payerAccount,
          nftMintAccount,
          mintAuthorityAccount,
          associatedTokenAccount,
          splTokenProgramAccount,
          sysvarRentAccount,
          systemProgramAccount,
          nftMetadataAccount,
          mintingPoolAccount,
          nftAccount,
          collectionEditionAccount,
          nftEditionAccount,
          inglCollectionMintAccount,
          inglCollectionAccount,
          inglConfigAccount,
          urisAccountAccount,
          generalAccountAccount,

          systemProgramAccount,
          splTokenProgramAccount,
          associatedTokeProgramAccount,
          metaplexProgramAccount,
        ];
        const mintNftInstruction = new TransactionInstruction({
          programId: this.programId,
          data: Buffer.from(serialize(new MintNft(2))),
          keys: instructionAccounts,
        });

        instructions.push({
          instructions: [mintNftInstruction],
          additionalUnits: 1_000_000,
          signingKeypairs: [mintKeyPair],
        });
      }
      const result = await forwardMultipleLegacyTransactions(
        {
          publicKey: payerPubkey,
          connection: this.connection,
          signAllTransaction: this.walletContext
            .signAllTransactions as SignerWalletAdapterProps['signAllTransactions'],
        },
        instructions
      );
      console.log('all transaction IDs: ', result);
      return {
        tokenMints: mintKeyPairs.map((keypair) => keypair.publicKey),
        signature: result[result.length - 1],
      };
    } catch (error) {
      throw new Error('NFT Minting transaction failed with error ' + error);
    }
  }

  getFeedAccountInfos(network: WalletAdapterNetwork) {
    return (
      network === WalletAdapterNetwork.Devnet
        ? [
            '9ATrvi6epR5hVYtwNs7BB7VCiYnd4WM7e8MfafWpfiXC', //BTC
            '7LLvRhMs73FqcLkA8jvEE1AM2mYZXTmqfUv8GAEurymx', //SOL
            '6fhxFvPocWapZ5Wa2miDnrX2jYRFKvFqYnX11GGkBo2f', //ETH
            'DR6PqK15tD21MEGSLmDpXwLA7Fw47kwtdZeUMdT7vd7L', //BNB
            'HPRYVJQ3DcTqszvorS4gCwbJvvNeWMgaCCoF3Lj3sAgC', //ADA
            '2qcLzR7FatMnfCbiB9BdhGsd6SxDgEqWq7xkD62n3xoT', //BCH
            'Bux82YCH8DgqFAQTKBxuQHDp3cud5AhD1Kibhjadz22D', //SBR
            '9gGvxPErkRubNj1vKE19smLa4Kp89kkzMVyA6TMvmKEZ', //ZEC
            '3WNhN4RJwRui4R3k1S9agGzyMZkCwKQkWjoEHbDeAF8J', //LUNA
            'CNzjdKHfXqyAeGd2APpzvwLcuPACrFdHb3k6SLsod6Ao', //TRX
            '6cBTHY4HQ4PABmhUqVLT4n4bNpmZAi2br5VnqTQoVRUo', //SUSHI
            'GRGMtrTszsoNzjqwTxsvkHVAPq5Snju2UzaAws5KBPed', //DOGE
            'C9CeLP5B4Lqq7cFppRBUZjt6hrvd99YR3Sk4EPPuAoAC', //LTC
            'FReW6u9YPpGQNaeEHNkVqA4KGA2WzbcT87NThwFb7fwm', //XLM
            'GEp5pZFjFPqn1teMmx9sLPyADf9N9aQsRn9TE17PwmmL', //LINK
            'Fd3UQMqmKCA6SNf6To97PdC2H3EfzYWR5bxr5CBYuFiy', //DOT
            'EQHf8ueSzJUPELF6yZkyGfwjbLsDmMwFrAYehmC15b6c', //XMR
            'C5x5W7BHVY61ULtWQ3qkP7kpE6zHViWd4AHpKDuAywPw', //SRM
            'HnbpTLbdv78hkVCDBZ52o5E6bkqtsZp4tUXBd2E8Sw9x', //PORT
            'EbpMMgMkC4Jt2oipUBc2GPL4XQo5uxKT8NpF8NEZWvqL', //PAI
          ]
        : [
            '8SXvChNYFhRq4EZuZvnhjrB3jJRQCv4k3P4W6hesH3Ee', //BTC
            'E3cqnoFvTeKKNsGmC8YitpMjo2E39hwfoyt2Aiem7dCb', //SOL
          ]
    ).map<AccountMeta>((address) => ({
      pubkey: new PublicKey(address),
      isSigner: false,
      isWritable: false,
    }));
  }

  async redeemNft(tokenMint: PublicKey) {
    const payerPubkey = this.walletContext.publicKey;
    if (!payerPubkey)
      throw new WalletNotConnectedError('Please connect your wallet !!!');

    const payerAccount: AccountMeta = {
      pubkey: payerPubkey as PublicKey,
      isSigner: true,
      isWritable: true,
    };

    const mintAccount: AccountMeta = {
      pubkey: tokenMint,
      isSigner: false,
      isWritable: true,
    };

    const mintingPoolAccount: AccountMeta = {
      pubkey: this.mintingPoolPDA[0],
      isSigner: false,
      isWritable: true,
    };

    const mintAuthorityAccount: AccountMeta = {
      pubkey: this.mintAuthorityPDA[0],
      isSigner: false,
      isWritable: true,
    };

    const associatedTokenAccount: AccountMeta = {
      pubkey: getAssociatedTokenAddressSync(tokenMint, payerAccount.pubkey),
      isSigner: false,
      isWritable: true,
    };

    const [nftPubkey] = PublicKey.findProgramAddressSync(
      [Buffer.from(NFT_ACCOUNT_CONST), tokenMint.toBuffer()],
      this.programId
    );
    const nftAccount: AccountMeta = {
      pubkey: nftPubkey,
      isSigner: false,
      isWritable: true,
    };

    const [nftMetadataAccountKey] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        METAPLEX_PROGRAM_ID.toBuffer(),
        tokenMint.toBuffer(),
      ],
      METAPLEX_PROGRAM_ID
    );

    const nftMetadataAccount: AccountMeta = {
      pubkey: nftMetadataAccountKey,
      isSigner: false,
      isWritable: true,
    };

    const [nftEditionKey] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        METAPLEX_PROGRAM_ID.toBuffer(),
        tokenMint.toBuffer(),
        Buffer.from('edition'),
      ],
      METAPLEX_PROGRAM_ID
    );
    const nftEditionAccount: AccountMeta = {
      pubkey: nftEditionKey,
      isSigner: false,
      isWritable: true,
    };

    const collectionMetadataAccount: AccountMeta = {
      pubkey: this.collectionMetadataPDA[0],
      isSigner: false,
      isWritable: true,
    };

    const splTokenProgramAccount: AccountMeta = {
      pubkey: TOKEN_PROGRAM_ID,
      isSigner: false,
      isWritable: false,
    };

    const configAccount: AccountMeta = {
      pubkey: this.validatorConfigAccountPDA[0],
      isSigner: false,
      isWritable: false,
    };

    const generalAccount: AccountMeta = {
      pubkey: this.generalAccountPDA[0],
      isSigner: false,
      isWritable: false,
    };

    const systemProgramAccount: AccountMeta = {
      pubkey: SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    };
    const metaplexProgramAccount: AccountMeta = {
      pubkey: METAPLEX_PROGRAM_ID,
      isSigner: false,
      isWritable: false,
    };
    const voteAccount: AccountMeta = {
      pubkey: new PublicKey(
        (
          await getDeserializedAccountData(
            this.connection,
            this.validatorConfigAccountPDA[0],
            ValidatorConfig
          )
        )?.vote_account
      ),
      isSigner: false,
      isWritable: true,
    };
    console.log('voteAccount: ', voteAccount);
    console.log('creating redeem instruction...');
    const redeemInglGemInstruction = new TransactionInstruction({
      programId: this.programId,
      data: Buffer.from(serialize(new Redeem(0))),
      keys: [
        payerAccount,
        mintAccount,
        mintingPoolAccount,
        associatedTokenAccount,
        nftAccount,
        nftMetadataAccount,
        nftEditionAccount,
        collectionMetadataAccount,
        splTokenProgramAccount,
        configAccount,
        generalAccount,
        voteAccount,
        mintAuthorityAccount,

        systemProgramAccount,
        metaplexProgramAccount,
      ],
    });
    try {
      return await forwardLegacyTransaction(
        {
          publicKey: payerPubkey,
          connection: this.connection,
          signTransaction: this.walletContext.signTransaction,
        },
        [redeemInglGemInstruction]
      );
    } catch (error) {
      throw new Error(
        'Failed to redeem NFT for the following reason: ' + error
      );
    }
  }

  async delegateNft(tokenMint: PublicKey) {
    const payerPubkey = this.walletContext.publicKey;
    if (!payerPubkey)
      throw new WalletNotConnectedError('Please connect your wallet !!!');

    // Check if max primary stake already reached
    await isMaximumPrimaryStakeReached(
      'You can not delegate anymore, the maximum delegable stake is currently attained',
      this.validatorConfigAccountPDA[0],
      this.generalAccountPDA[0],
      this.connection
    );

    const payerAccount: AccountMeta = {
      pubkey: payerPubkey as PublicKey,
      isSigner: true,
      isWritable: true,
    };
    const configAccount: AccountMeta = {
      pubkey: this.validatorConfigAccountPDA[0],
      isSigner: false,
      isWritable: false,
    };

    const mintAccount: AccountMeta = {
      pubkey: tokenMint,
      isSigner: false,
      isWritable: false,
    };

    const [nftPubkey] = PublicKey.findProgramAddressSync(
      [Buffer.from(NFT_ACCOUNT_CONST), tokenMint.toBuffer()],
      this.programId
    );
    const nftAccount: AccountMeta = {
      pubkey: nftPubkey,
      isSigner: false,
      isWritable: true,
    };

    const associatedTokenAccount: AccountMeta = {
      pubkey: getAssociatedTokenAddressSync(
        mintAccount.pubkey,
        payerAccount.pubkey
      ),
      isSigner: false,
      isWritable: false,
    };
    const generalAccount: AccountMeta = {
      pubkey: this.generalAccountPDA[0],
      isSigner: false,
      isWritable: true,
    };

    const delegateSolInstruction = new TransactionInstruction({
      programId: this.programId,
      data: Buffer.from(serialize(new DelegateNFT(0))),
      keys: [
        payerAccount,
        configAccount,
        mintAccount,
        nftAccount,
        associatedTokenAccount,
        generalAccount,
      ],
    });

    try {
      return await forwardLegacyTransaction(
        {
          publicKey: payerPubkey,
          connection: this.connection,
          signTransaction: this.walletContext.signTransaction,
        },
        [delegateSolInstruction]
      );
    } catch (error) {
      throw new Error('Failed to delegate nft sol with error ' + error);
    }
  }

  async undelegateNft(tokenMint: PublicKey) {
    const payerPubkey = this.walletContext.publicKey;
    if (!payerPubkey)
      throw new WalletNotConnectedError('Please connect your wallet !!!');

    const payerAccount: AccountMeta = {
      pubkey: payerPubkey as PublicKey,
      isSigner: true,
      isWritable: true,
    };

    const voteAccount: AccountMeta = {
      pubkey: new PublicKey(
        (
          await getDeserializedAccountData(
            this.connection,
            this.validatorConfigAccountPDA[0],
            ValidatorConfig
          )
        )?.vote_account
      ),
      isSigner: false,
      isWritable: false,
    };

    const configAccount: AccountMeta = {
      pubkey: this.validatorConfigAccountPDA[0],
      isSigner: false,
      isWritable: true,
    };

    const mintAccount: AccountMeta = {
      pubkey: tokenMint,
      isSigner: false,
      isWritable: false,
    };

    const [nftPubkey] = PublicKey.findProgramAddressSync(
      [Buffer.from(NFT_ACCOUNT_CONST), tokenMint.toBuffer()],
      this.programId
    );
    const nftAccount: AccountMeta = {
      pubkey: nftPubkey,
      isSigner: false,
      isWritable: true,
    };

    const associatedTokenAccount: AccountMeta = {
      pubkey: getAssociatedTokenAddressSync(
        mintAccount.pubkey,
        payerAccount.pubkey
      ),
      isSigner: false,
      isWritable: false,
    };
    const generalAccount: AccountMeta = {
      pubkey: this.generalAccountPDA[0],
      isSigner: false,
      isWritable: true,
    };

    const systemProgramAccount: AccountMeta = {
      pubkey: SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    };

    const authorizedWithdrawerAccount: AccountMeta = {
      pubkey: this.authorizedWithdrawerPDA[0],
      isSigner: false,
      isWritable: true,
    };

    const generalData = await getDeserializedAccountData(
      this.connection,
      generalAccount.pubkey,
      GeneralData
    );
    const unfinalizedProposalAccounts: AccountMeta[] = [];
    if (generalData.unfinalized_proposals.length > 0) {
      for (let i = 0; i < generalData.unfinalized_proposals.length; i++) {
        unfinalizedProposalAccounts.push({
          pubkey: PublicKey.findProgramAddressSync(
            [
              Buffer.from(INGL_PROPOSAL_KEY),
              toBytesInt32(generalData.unfinalized_proposals[i]),
            ],
            this.programId
          )[0],
          isSigner: false,
          isWritable: true,
        });
      }
    }

    const undelegateSolInstruction = new TransactionInstruction({
      programId: this.programId,
      data: Buffer.from(serialize(new UnDelegateNFT(0))),
      keys: [
        payerAccount,
        voteAccount,
        configAccount,
        mintAccount,
        nftAccount,
        associatedTokenAccount,
        generalAccount,
        systemProgramAccount,
        authorizedWithdrawerAccount,
        ...unfinalizedProposalAccounts,
      ],
    });
    try {
      return await forwardLegacyTransaction(
        {
          publicKey: payerPubkey,
          connection: this.connection,
          signTransaction: this.walletContext.signTransaction,
        },
        [undelegateSolInstruction]
      );
    } catch (error) {
      throw new Error('Failed to undelegate gem  with error ' + error);
    }
  }

  async loadNFTs() {
    const payerPubkey = this.walletContext.publicKey;
    if (!payerPubkey)
      throw new WalletNotConnectedError('Please connect your wallet !!!');

    const metaplex = new Metaplex(this.connection);
    const metaplexNft = metaplex.nfts();

    try {
      const ownerNfts = await metaplexNft.findAllByOwner({
        owner: this.walletContext.publicKey as PublicKey,
      });
      const validatorNfts: InglNft[] = [];

      for (let i = 0; i < ownerNfts.length; i++) {
        const ownerNft = ownerNfts[i] as Metadata;
        const nftData = await this.loadNftData(ownerNft.mintAddress, ownerNft);
        if (nftData) validatorNfts.push(nftData);
      }
      return validatorNfts.sort((a, b) => b.numeration - a.numeration);
    } catch (error) {
      throw new Error('Failed to load metadata with error ' + error);
    }
  }

  async loadNFTsByMint(tokenMints: PublicKey[]) {
    try {
      let promisesArray = await Promise.all(
        tokenMints.map((tokenMint) => this.loadNFT(tokenMint))
      );
      promisesArray = promisesArray.filter(
        (nft) => nft?.nft_mint_id !== undefined
      );
      return promisesArray;
    } catch (error) {
      throw new Error('Failed to load nfts by mints with error ' + error);
    }
  }

  async loadNFT(tokenMint: PublicKey) {
    const metaplex = new Metaplex(this.connection);
    const metaplexNft = metaplex.nfts();

    try {
      const inglNft = await metaplexNft.findByMint({ mintAddress: tokenMint });
      return this.loadNftData(inglNft.mint.address, inglNft);
    } catch (error) {
      throw new Error('Failed to load by mint with error ' + error);
    }
  }

  private async loadNftData(mintAddress: PublicKey, metaplexNft: MetaplexNft) {
    const { json, jsonLoaded, uri } = metaplexNft;
    const [nftPubkey] = PublicKey.findProgramAddressSync(
      [Buffer.from(NFT_ACCOUNT_CONST), mintAddress.toBuffer()],
      this.programId
    );
    let jsonData = json;
    if (!jsonLoaded) {
      jsonData = await (await fetch(uri)).json();
    }
    const accountInfo = await this.connection.getAccountInfo(nftPubkey);
    if (accountInfo) {
      const { funds_location, numeration, rarity, all_votes } = deserialize(
        accountInfo?.data as Buffer,
        NftData,
        { unchecked: true }
      );
      return {
        numeration,
        votes: all_votes,
        nft_mint_id: mintAddress.toBase58(),
        image_ref: jsonData?.image as string,
        is_delegated: funds_location instanceof Delegated,
        rarity: rarity
          ? jsonData?.attributes?.find((_) => _.trait_type === 'Rarity')?.value
          : undefined,
      };
    }
  }

  async claimRewards(tokenMints: PublicKey[], expectedRewards: number) {
    const payerPubkey = this.walletContext.publicKey;
    if (!payerPubkey)
      throw new WalletNotConnectedError('Please connect your wallet !!!');

    if (expectedRewards === 0) throw new Error('No rewards to claim');
    const payerAccount: AccountMeta = {
      pubkey: payerPubkey as PublicKey,
      isSigner: true,
      isWritable: true,
    };

    const voteAccount: AccountMeta = {
      pubkey: new PublicKey(
        (
          await getDeserializedAccountData(
            this.connection,
            this.validatorConfigAccountPDA[0],
            ValidatorConfig
          )
        )?.vote_account
      ),
      isSigner: false,
      isWritable: true,
    };

    const generalAccount: AccountMeta = {
      pubkey: this.generalAccountPDA[0],
      isSigner: false,
      isWritable: true,
    };

    const validatorConfigAccount: AccountMeta = {
      pubkey: this.validatorConfigAccountPDA[0],
      isSigner: false,
      isWritable: true,
    };

    const authorizedWithdrawerAccount: AccountMeta = {
      pubkey: this.authorizedWithdrawerPDA[0],
      isSigner: false,
      isWritable: true,
    };
    const systemProgramAccount: AccountMeta = {
      pubkey: SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    };

    const cntAccounts = tokenMints.reduce<AccountMeta[]>(
      (accounts, tokenMint, index) => {
        const [nftPubkey] = PublicKey.findProgramAddressSync(
          [Buffer.from(NFT_ACCOUNT_CONST), tokenMint.toBuffer()],
          this.programId
        );
        console.log(index, nftPubkey.toString());
        console.log(getAssociatedTokenAddressSync(tokenMint, payerPubkey));
        return [
          ...accounts,
          {
            pubkey: getAssociatedTokenAddressSync(tokenMint, payerPubkey),
            isSigner: false,
            isWritable: false,
          },
          { pubkey: tokenMint, isSigner: false, isWritable: false },
          { pubkey: nftPubkey, isSigner: false, isWritable: true },
        ];
      },
      []
    );

    const emptyInstruction = {
      instructions: [
        new TransactionInstruction({
          programId: this.programId,
          data: Buffer.from(serialize(new NFTWithdraw(0, 0))),
          keys: [
            payerAccount,
            voteAccount,
            generalAccount,
            validatorConfigAccount,
            authorizedWithdrawerAccount,
            //cnt accounts normally here
            systemProgramAccount,
          ],
        }),
      ],
      additionalUnits: 0,
      signingKeypairs: [],
    };
    const sizeOfEmptyTransaction = await (async function (
      connection: Connection,
      transactionInstruction: {
        instructions: TransactionInstruction[];
        additionalUnits?: number;
        signingKeypairs?: Keypair[];
      },
      payerPubkey: PublicKey
    ) {
      const blockhashObj = await connection.getLatestBlockhash();
      const { instructions, additionalUnits, signingKeypairs } =
        transactionInstruction;
      const transaction = new Transaction();
      if (additionalUnits) {
        const additionalComputeBudgetInstruction =
          ComputeBudgetProgram.setComputeUnitLimit({
            units: additionalUnits,
          });
        transaction.add(additionalComputeBudgetInstruction);
      }
      transaction.add(...instructions).feePayer = payerPubkey as PublicKey;
      transaction.recentBlockhash = blockhashObj.blockhash;
      if (signingKeypairs && signingKeypairs.length > 0)
        transaction.sign(...signingKeypairs);

      return getTxSize(transaction, payerPubkey);
    })(this.connection, emptyInstruction, payerPubkey);

    const maxNumberOfNftsPerClaim = Math.round(
      Math.round((PACKET_DATA_SIZE - sizeOfEmptyTransaction - 64) / 33) / 3
    );

    let splittedCntAccountsPerClaim = [];
    const numberOfClaims = Math.ceil(
      tokenMints.length / maxNumberOfNftsPerClaim
    );
    if (numberOfClaims === 0) throw new Error('No rewards to claim');

    if (numberOfClaims === 1) {
      splittedCntAccountsPerClaim = [cntAccounts];
    } else {
      let count = 0;
      splittedCntAccountsPerClaim = new Array(numberOfClaims);
      const copyCntAccounts = [...cntAccounts];
      while (count < numberOfClaims) {
        if (copyCntAccounts.length >= maxNumberOfNftsPerClaim * 3) {
          splittedCntAccountsPerClaim[count] = copyCntAccounts.splice(
            0,
            maxNumberOfNftsPerClaim * 3
          );
        } else {
          splittedCntAccountsPerClaim[count] = copyCntAccounts;
        }
        count++;
      }
    }
    const claimRewardInstructions = [];
    for (let i = 0; i < numberOfClaims; i++) {
      claimRewardInstructions.push({
        instructions: [
          new TransactionInstruction({
            programId: this.programId,
            data: Buffer.from(
              serialize(
                new NFTWithdraw(splittedCntAccountsPerClaim[i].length / 3, 0)
              )
            ),
            keys: [
              payerAccount,
              voteAccount,
              generalAccount,
              validatorConfigAccount,
              authorizedWithdrawerAccount,
              ...splittedCntAccountsPerClaim[i],
              systemProgramAccount,
            ],
          }),
        ],
        additionalUnits: 400_000,
        signingKeypairs: [],
      });
    }
    try {
      const result = await forwardMultipleLegacyTransactions(
        {
          publicKey: payerPubkey,
          connection: this.connection,
          signAllTransaction: this.walletContext
            .signAllTransactions as SignerWalletAdapterProps['signAllTransactions'],
        },
        claimRewardInstructions
      );
      return result[result.length - 1];
    } catch (error) {
      throw new Error('Claim reward transaction failed with error ' + error);
    }
  }

  async imprintRarity(tokenMint: PublicKey, network: WalletAdapterNetwork) {
    const payerPubkey = this.walletContext.publicKey;
    if (!payerPubkey)
      throw new WalletNotConnectedError('Please connect your wallet !!!');

    const payerAccount: AccountMeta = {
      pubkey: payerPubkey as PublicKey,
      isSigner: true,
      isWritable: true,
    };
    const [nftPubkey] = PublicKey.findProgramAddressSync(
      [Buffer.from(NFT_ACCOUNT_CONST), tokenMint.toBuffer()],
      this.programId
    );

    const accountInfo = await this.connection.getAccountInfo(nftPubkey);
    if (
      !accountInfo ||
      accountInfo?.owner.toBase58() !== this.programId.toBase58()
    )
      throw new Error(
        `No account info was found with the provided token mint: ${tokenMint}`
      );
    const nftAccount: AccountMeta = {
      pubkey: nftPubkey,
      isSigner: false,
      isWritable: true,
    };

    const mintAccount: AccountMeta = {
      pubkey: tokenMint,
      isSigner: false,
      isWritable: false,
    };
    const associatedTokenAccount: AccountMeta = {
      pubkey: getAssociatedTokenAddressSync(
        mintAccount.pubkey,
        payerAccount.pubkey
      ),
      isSigner: false,
      isWritable: true,
    };

    const mintAuthorityAccount: AccountMeta = {
      pubkey: this.mintAuthorityPDA[0],
      isSigner: false,
      isWritable: true,
    };
    const [nftEditionKey] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        METAPLEX_PROGRAM_ID.toBuffer(),
        tokenMint.toBuffer(),
        Buffer.from('edition'),
      ],
      METAPLEX_PROGRAM_ID
    );
    const nftEditionAccount: AccountMeta = {
      pubkey: nftEditionKey,
      isSigner: false,
      isWritable: false,
    };

    const [nftMetadataAccountKey] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        METAPLEX_PROGRAM_ID.toBuffer(),
        tokenMint.toBuffer(),
      ],
      METAPLEX_PROGRAM_ID
    );

    const metadataAccount: AccountMeta = {
      pubkey: nftMetadataAccountKey,
      isSigner: false,
      isWritable: true,
    };

    const metaplexProgramAccount: AccountMeta = {
      pubkey: METAPLEX_PROGRAM_ID,
      isSigner: false,
      isWritable: false,
    };

    const configAccount: AccountMeta = {
      pubkey: this.validatorConfigAccountPDA[0],
      isSigner: false,
      isWritable: false,
    };

    const urisAccount: AccountMeta = {
      pubkey: this.urisAccountPDA[0],
      isSigner: false,
      isWritable: false,
    };

    const tokenProgramAccount: AccountMeta = {
      pubkey: TOKEN_PROGRAM_ID,
      isSigner: false,
      isWritable: false,
    };

    const feedAccountInfos = this.getFeedAccountInfos(network);

    const instructionAccounts = [
      payerAccount,
      nftAccount,
      mintAccount,
      associatedTokenAccount,
      mintAuthorityAccount,
      metadataAccount,
      nftEditionAccount,
      configAccount,
      urisAccount,
      tokenProgramAccount,
      //switchbord history buffer account infos
      ...feedAccountInfos,

      metaplexProgramAccount,
    ];

    const lookupTableAddresses = await createLookupTable(
      this.connection,
      this.walletContext,
      instructionAccounts.map((_) => _.pubkey)
    );
    const imprintRarityInstruction = new TransactionInstruction({
      programId: this.programId,
      data: Buffer.from(serialize(new ImprintRarity(0))),
      keys: instructionAccounts,
    });

    try {
      //   const closeLookupTableInstructions = getCloseLookupTableInstructions(
      //     this.walletContext.publicKey as PublicKey,
      //     lookupTableAddresses
      //   );
      return await new Promise<string>((resolve, reject) => {
        setTimeout(async () => {
          try {
            const transactionId = await forwardV0Transaction(
              { connection: this.connection, wallet: this.walletContext },
              [imprintRarityInstruction],
              { lookupTableAddresses, additionalUnits: 600_000 }
            );
            resolve(transactionId);
          } catch (error) {
            reject(error);
          }
        }, 5000);
      });
    } catch (error) {
      throw new Error('Failed to imprint rarity with error ' + error);
    }
  }

  async loadRewards() {
    const payerPubkey = this.walletContext.publicKey;
    if (!payerPubkey)
      throw new WalletNotConnectedError('Please connect your wallet !!!');

    const metaplex = new Metaplex(this.connection);
    const metaplexNft = metaplex.nfts();
    try {
      let ownerNfts = await metaplexNft.findAllByOwner({
        owner: payerPubkey,
      });
      const nftsOwnByProgram = [];

      for (let i = 0; i < ownerNfts.length; i++) {
        const ownerNft = ownerNfts[i] as Metadata;
        const nftData = await this.loadNftData(ownerNft.mintAddress, ownerNft);
        if (nftData) {
          nftsOwnByProgram.push(ownerNft);
        }
      }

      ownerNfts = nftsOwnByProgram;
      const [generalAccountInfo, validatorConfigAccountInfo] =
        await Promise.all([
          this.connection.getAccountInfo(this.generalAccountPDA[0]),
          this.connection.getAccountInfo(this.validatorConfigAccountPDA[0]),
        ]);

      if (!generalAccountInfo || !validatorConfigAccountInfo)
        throw new Error(
          'Invalid program id. Could retrieve account info from general account PDA key or validator config account PDA key'
        );
      const { vote_rewards: voteRewards } = deserialize(
        generalAccountInfo.data as Buffer,
        GeneralData,
        { unchecked: true }
      );
      const { unit_backing } = deserialize(
        validatorConfigAccountInfo.data as Buffer,
        ValidatorConfig
      );

      const nftRewards: NftReward[] = [];
      for (let i = 0; i < ownerNfts.length; i++) {
        const { json, uri, jsonLoaded, mintAddress } = ownerNfts[i] as Metadata;
        let jsonData = json;
        if (!jsonLoaded) {
          jsonData = await (await fetch(uri)).json();
        }
        const [nftPubkey] = PublicKey.findProgramAddressSync(
          [Buffer.from(NFT_ACCOUNT_CONST), mintAddress.toBuffer()],
          this.programId
        );
        const accountInfo = await this.connection.getAccountInfo(nftPubkey);
        const {
          funds_location,
          last_withdrawal_epoch,
          last_delegation_epoch,
          numeration,
        } = deserialize(accountInfo?.data as Buffer, NftData, {
          unchecked: true,
        });
        if (funds_location instanceof Delegated) {
          const comp = (left?: BN, right?: BN) => {
            const temp_left = Number(left?.toString(10));
            const temp_right = Number(right?.toString(10));
            if (left == null) {
              return 0;
            } else if (right == null) {
              return 1;
            } else if (temp_left > temp_right) {
              return 1;
            } else {
              return 0;
            }
          };

          const interestedEpoch =
            comp(last_delegation_epoch, last_withdrawal_epoch) === 1
              ? last_delegation_epoch
              : last_withdrawal_epoch;

          const interestedIndex = voteRewards.findIndex(
            ({ epoch_number }) => comp(epoch_number, interestedEpoch) === 1
          );
          if (interestedIndex !== -1) {
            const totalRewards: number = voteRewards
              .slice(interestedIndex)
              .reduce((total, { total_stake, nft_holders_reward }, i) => {
                return (
                  total +
                  Number(new BN(unit_backing).toString(10)) *
                    (Number(nft_holders_reward.toString(10)) /
                      Number(total_stake.toString(10)))
                );
              }, 0);
            nftRewards.push({
              rewards: totalRewards / LAMPORTS_PER_SOL,
              numeration: numeration,
              image_ref: jsonData?.image as string,
              nft_mint_id: mintAddress.toString(),
            });
          } else {
            nftRewards.push({
              rewards: 0,
              numeration: numeration,
              image_ref: jsonData?.image as string,
              nft_mint_id: mintAddress.toString(),
            });
          }
        }
      }
      return nftRewards;
    } catch (error) {
      throw new Error('Failed to load gems rewards  with error ' + error);
    }
  }
}
