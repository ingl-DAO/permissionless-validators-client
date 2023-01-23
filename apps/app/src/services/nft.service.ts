import { deserialize, serialize } from '@dao-xyz/borsh';
import {
  AUTHORIZED_WITHDRAWER_KEY,
  createLookupTable,
  Delegated,
  DelegateNFT,
  forwardLegacyTransaction,
  forwardV0Transaction,
  GeneralData,
  GENERAL_ACCOUNT_SEED,
  ImprintRarity,
  INGL_CONFIG_SEED,
  INGL_MINT_AUTHORITY_KEY,
  INGL_NFT_COLLECTION_KEY,
  METAPLEX_PROGRAM_ID,
  MintNft,
  NftData,
  NFTWithdraw,
  NFT_ACCOUNT_CONST,
  PD_POOL_ACCOUNT_KEY,
  Redeem,
  UnDelegateNFT,
  URIS_ACCOUNT_SEED,
  VOTE_ACCOUNT_KEY,
} from '@ingl-permissionless/state';
import {
  Metaplex,
  Nft,
  JsonMetadata,
  Metadata,
  Sft,
} from '@metaplex-foundation/js';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import {
  WalletAdapterNetwork,
  WalletNotConnectedError,
} from '@solana/wallet-adapter-base';
import { WalletContextState } from '@solana/wallet-adapter-react';
import {
  AccountMeta,
  type Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import BN from 'bn.js';
import { InglNft, NftReward } from '../interfaces';

export type MetaplexNft = Metadata<JsonMetadata<string>> | Nft | Sft;

export class NftService {
  constructor(
    private readonly programId: PublicKey,
    private readonly connection: Connection,
    private readonly walletContext: WalletContextState,
    private readonly configAccountPDA = PublicKey.findProgramAddressSync(
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
    private readonly voteAccountPDA = PublicKey.findProgramAddressSync(
      [Buffer.from(VOTE_ACCOUNT_KEY)],
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

  async mintNft() {
    const payerAccount: AccountMeta = {
      pubkey: this.walletContext.publicKey as PublicKey,
      isSigner: true,
      isWritable: true,
    };

    const mintKeyPair = Keypair.generate();
    const nftMintAccount: AccountMeta = {
      pubkey: mintKeyPair.publicKey,
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

    const generalAccountAccount: AccountMeta = {
      pubkey: this.generalAccountPDA[0],
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

    const associatedTokenAccount: AccountMeta = {
      pubkey: getAssociatedTokenAddressSync(
        mintKeyPair.publicKey,
        payerAccount.pubkey
      ),
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
      pubkey: this.configAccountPDA[0],
    };

    const urisAccountAccount: AccountMeta = {
      isSigner: false,
      isWritable: false,
      pubkey: this.urisAccountPDA[0],
    };
    try {
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
      const signature = await forwardLegacyTransaction(
        { connection: this.connection, wallet: this.walletContext },
        [mintNftInstruction],
        1_000_000,
        [mintKeyPair]
      );
      return { tokenMint: mintKeyPair.publicKey, signature };
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
    if (!payerPubkey) throw new WalletNotConnectedError();

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
      pubkey: this.configAccountPDA[0],
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
      pubkey: this.voteAccountPDA[0],
      isSigner: false,
      isWritable: false,
    };
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

        systemProgramAccount,
        metaplexProgramAccount,
      ],
    });
    console.log(redeemInglGemInstruction.data, this.programId.toBase58());
    try {
      return await forwardLegacyTransaction(
        { connection: this.connection, wallet: this.walletContext },
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
    if (!payerPubkey) throw new WalletNotConnectedError();

    const payerAccount: AccountMeta = {
      pubkey: payerPubkey as PublicKey,
      isSigner: true,
      isWritable: true,
    };
    const configAccount: AccountMeta = {
      pubkey: this.configAccountPDA[0],
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
        { connection: this.connection, wallet: this.walletContext },
        [delegateSolInstruction]
      );
    } catch (error) {
      throw new Error('Failed to delegate nft sol with error ' + error);
    }
  }

  async undelegateNft(tokenMint: PublicKey) {
    const payerPubkey = this.walletContext.publicKey;
    if (!payerPubkey) throw new WalletNotConnectedError();

    const payerAccount: AccountMeta = {
      pubkey: payerPubkey as PublicKey,
      isSigner: true,
      isWritable: true,
    };

    const voteAccount: AccountMeta = {
      pubkey: this.voteAccountPDA[0],
      isSigner: false,
      isWritable: false,
    };

    const configAccount: AccountMeta = {
      pubkey: this.configAccountPDA[0],
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
      ],
    });
    try {
      return await forwardLegacyTransaction(
        { connection: this.connection, wallet: this.walletContext },
        [undelegateSolInstruction]
      );
    } catch (error) {
      throw new Error('Failed to undelegate gem  with error ' + error);
    }
  }

  async loadNFTs() {
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
      const { funds_location, numeration, rarity } = deserialize(
        accountInfo?.data as Buffer,
        NftData,
        { unchecked: true }
      );
      return {
        nft_mint_id: mintAddress.toBase58(),
        image_ref: jsonData?.image as string,
        is_delegated: funds_location instanceof Delegated,
        numeration,
        rarity: rarity
          ? jsonData?.attributes?.find((_) => _.trait_type === 'Rarity')?.value
          : undefined,
      };
    }
  }

  async claimRewards(tokenMints: PublicKey[]) {
    const payerPubkey = this.walletContext.publicKey;
    if (!payerPubkey) throw new WalletNotConnectedError();

    const payerAccount: AccountMeta = {
      pubkey: payerPubkey as PublicKey,
      isSigner: true,
      isWritable: true,
    };

    const voteAccount: AccountMeta = {
      pubkey: this.voteAccountPDA[0],
      isSigner: false,
      isWritable: true,
    };

    const generalAccount: AccountMeta = {
      pubkey: this.generalAccountPDA[0],
      isSigner: false,
      isWritable: true,
    };

    const authorizedWithdrawerAccount: AccountMeta = {
      pubkey: this.authorizedWithdrawerPDA[0],
      isSigner: false,
      isWritable: true,
    };

    const cntAccounts = tokenMints.reduce<AccountMeta[]>(
      (accounts, tokenMint) => {
        const [nftPubkey] = PublicKey.findProgramAddressSync(
          [Buffer.from(NFT_ACCOUNT_CONST), tokenMint.toBuffer()],
          this.programId
        );
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

    const systemProgramAccount: AccountMeta = {
      pubkey: SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    };

    const claimRewardInstruction = new TransactionInstruction({
      programId: this.programId,
      data: Buffer.from(serialize(new NFTWithdraw(tokenMints.length, 0))),
      keys: [
        payerAccount,
        voteAccount,
        generalAccount,
        authorizedWithdrawerAccount,
        //cntAccounts
        ...cntAccounts,

        systemProgramAccount,
      ],
    });

    try {
      return await forwardLegacyTransaction(
        { connection: this.connection, wallet: this.walletContext },
        [claimRewardInstruction]
      );
    } catch (error) {
      throw new Error('Failed to claim gems rewards  with error ' + error);
    }
  }

  async imprintRarity(tokenMint: PublicKey, network: WalletAdapterNetwork) {
    const payerPubkey = this.walletContext.publicKey;
    if (!payerPubkey) throw new WalletNotConnectedError();

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
      pubkey: this.configAccountPDA[0],
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
    console.log(this.programId.toBase58());
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
    const metaplex = new Metaplex(this.connection);
    const metaplexNft = metaplex.nfts();
    const payerPubkey = this.walletContext.publicKey;
    if (!payerPubkey) throw new WalletNotConnectedError();
    try {
      let ownerNfts = await metaplexNft.findAllByOwner({ owner: payerPubkey });
      ownerNfts = ownerNfts.filter(
        ({ collection }) =>
          collection?.address.toBase58() ===
          this.collectionEditionPDA[0].toBase58()
      );
      const generalAccountInfo = await this.connection.getAccountInfo(
        this.generalAccountPDA[0]
      );
      if (!generalAccountInfo)
        throw new Error(
          'Invalid program id. Could retrieve account info from general account PDA key'
        );
      const { vote_rewards: voteRewards } = deserialize(
        generalAccountInfo.data as Buffer,
        GeneralData,
        { unchecked: true }
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
          const comp = last_delegation_epoch?.cmp(
            (last_withdrawal_epoch ?? 0) as BN
          );
          const interestedEpoch =
            comp === 0
              ? last_delegation_epoch
              : comp === -1
              ? last_withdrawal_epoch
              : last_delegation_epoch;
          const interestedIndex = voteRewards.findIndex(
            ({ epoch_number }) => epoch_number.cmp(interestedEpoch as BN) !== -1
          );
          if (interestedIndex !== -1) {
            const totalRewards: BN = voteRewards
              .slice(interestedIndex)
              .reduce((total, { total_stake, nft_holders_reward }, i) => {
                return total.add(nft_holders_reward.div(total_stake));
              }, new BN(0));
            nftRewards.push({
              rewards: totalRewards,
              numeration: numeration,
              image_ref: jsonData?.image as string,
              nft_mint_id: mintAddress.toString(),
            });
          } else {
            nftRewards.push({
              rewards: new BN(0),
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
