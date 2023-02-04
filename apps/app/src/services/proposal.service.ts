import { deserialize, serialize } from '@dao-xyz/borsh';
import { http } from '@ingl-permissionless/axios';
import {
  Commission,
  DiscordInvite, GeneralData,
  GENERAL_ACCOUNT_SEED,
  GovernanceData, GovernanceType, INGL_CONFIG_SEED,
  INGL_PROPOSAL_KEY,
  InitGovernance, InitialRedemptionFee,
  MaxPrimaryStake,
  NftHolderShare, NFT_ACCOUNT_CONST, ProgramUpgrade,
  RedemptionFeeDuration, toBytesInt32, TwitterHandle, ValidatorConfig, ValidatorID,
  ValidatorName, VOTE_ACCOUNT_KEY
} from '@ingl-permissionless/state';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { WalletContextState } from '@solana/wallet-adapter-react';
import {
  AccountMeta,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  TransactionInstruction
} from '@solana/web3.js';
import BN from 'bn.js';
import {
  ConfigAccountEnum,
  CreateProposal,
  GovernanceInterface,
  VoteAccountEnum
} from '../interfaces';

export enum VersionStatus {
  Deprecated = 'Deprecated',
  Unsafe = 'Unsafe',
  Safe = 'Safe',
}

export interface ProgramVersion {
  program_data_hash: string;
  version: number;
  status: VersionStatus;
  released_on: Date;
}

export class ProposalService {
  constructor(
    private readonly programId: PublicKey,
    private readonly connection: Connection,
    private readonly walletContext: WalletContextState
  ) {}

  async verifyProgramVersion(programId: PublicKey) {
    const { data: programVersion } = await http.get<ProgramVersion | null>(
      `/program-versions/verify?program_id=${programId.toBase58()}`
    );
    return programVersion;
  }

  async validate({
    voteAccount,
    configAccount,
    programUpgrade,
  }: CreateProposal) {
    if (!configAccount && !programUpgrade && !voteAccount)
      throw new Error(
        'One of the following fields most be provided: `programUpgrade`, `voteAccount` or `configAccount`.'
      );
    else if (
      [configAccount, programUpgrade, voteAccount].filter((_) => _).length > 1
    )
      throw new Error(
        'Your can only provide value for one field among the followings: `programUpgrade`, `voteAccount` or `configAccount`'
      );
    let governanceType = new GovernanceType();
    if (voteAccount) {
      const { vote_type, value } = voteAccount;
      if (vote_type === VoteAccountEnum.ValidatorID) {
        const validatorId = new PublicKey(value);
        governanceType = new ValidatorID(validatorId.toBuffer());
      } else {
        if (typeof value !== 'number')
          throw new Error(
            `VoteAccount commission value most be a number string`
          );
        governanceType = new Commission(value);
      }
    } else if (programUpgrade) {
      const { buffer_account, code_link } = programUpgrade;
      const bufferAccountKey = new PublicKey(buffer_account);
      const isBufferProgramVerified = await this.verifyProgramVersion(
        bufferAccountKey
      );
      if (isBufferProgramVerified) {
        governanceType = new ProgramUpgrade({
          buffer_account: bufferAccountKey.toBuffer(),
          code_link,
        });
      }
    } else if (configAccount) {
      const { config_type, value } = configAccount;
      if (
        [
          ConfigAccountEnum.MaxPrimaryStake,
          ConfigAccountEnum.NftHolderShare,
          ConfigAccountEnum.InitialRedemptionFee,
          ConfigAccountEnum.RedemptionFeeDuration,
        ].includes(config_type) &&
        typeof value !== 'number'
      )
        throw new Error(
          `MaxPrimaryStake, NftHolderShare, InitialRedemptionFee and RedemptionFeeDuration values most be number strings`
        );
      if (
        [
          ConfigAccountEnum.TwitterHandle,
          ConfigAccountEnum.DiscordInvite,
        ].includes(config_type)
      )
        throw new Error(
          `TwitterHandle and DiscordInvite value most be url links`
        );
      switch (config_type) {
        case ConfigAccountEnum.MaxPrimaryStake: {
          governanceType = new MaxPrimaryStake(
            new BN(Number(value) * LAMPORTS_PER_SOL)
          );
          break;
        }
        case ConfigAccountEnum.NftHolderShare: {
          governanceType = new NftHolderShare(Number(value));
          break;
        }
        case ConfigAccountEnum.InitialRedemptionFee: {
          governanceType = new InitialRedemptionFee(Number(value));
          break;
        }
        case ConfigAccountEnum.RedemptionFeeDuration: {
          governanceType = new RedemptionFeeDuration(Number(value));
          break;
        }
        case ConfigAccountEnum.ValidatorName: {
          governanceType = new ValidatorName(value as string);
          break;
        }
        case ConfigAccountEnum.TwitterHandle: {
          governanceType = new TwitterHandle(value as string);
          break;
        }
        case ConfigAccountEnum.DiscordInvite: {
          governanceType = new DiscordInvite(value as string);
          break;
        }
      }
    }
    return governanceType;
  }

  async initGovernanace(newProposal: CreateProposal) {
    const payerPubkey = this.walletContext.publicKey;
    if (!payerPubkey)
      throw new WalletNotConnectedError('Please connect your wallet !!!');

    const governanceType = await this.validate(newProposal);
    const payerAccount: AccountMeta = {
      pubkey: payerPubkey,
      isSigner: true,
      isWritable: true,
    };
    const [generalAccountPubkey] = PublicKey.findProgramAddressSync(
      [Buffer.from(GENERAL_ACCOUNT_SEED)],
      this.programId
    );

    const generalAccount: AccountMeta = {
      pubkey: generalAccountPubkey,
      isSigner: false,
      isWritable: true,
    };
    const generalAccountInfo = await this.connection.getAccountInfo(
      generalAccountPubkey
    );
    if (!generalAccountInfo)
      throw new Error(
        `No general account was found for program with address: ${this.programId.toBase58()}`
      );
    const { proposal_numeration } = deserialize(
      generalAccountInfo?.data as Buffer,
      GeneralData,
      { unchecked: true }
    );
    const [proposalAccountKey] = PublicKey.findProgramAddressSync(
      [Buffer.from(INGL_PROPOSAL_KEY), toBytesInt32(proposal_numeration)],
      this.programId
    );
    const proposalAccount: AccountMeta = {
      pubkey: proposalAccountKey,
      isSigner: false,
      isWritable: false,
    };

    const [inglConfigKey] = PublicKey.findProgramAddressSync(
      [Buffer.from(INGL_CONFIG_SEED)],
      this.programId
    );
    const configAccount: AccountMeta = {
      pubkey: inglConfigKey,
      isSigner: false,
      isWritable: true,
    };
    const [voteAccountKey] = PublicKey.findProgramAddressSync(
      [Buffer.from(VOTE_ACCOUNT_KEY)],
      this.programId
    );
    const voteAccount: AccountMeta = {
      pubkey: voteAccountKey,
      isSigner: false,
      isWritable: true,
    };

    const { nft_mint_id, title, description } = newProposal;
    const mintAccount: AccountMeta = {
      pubkey: new PublicKey(nft_mint_id),
      isSigner: false,
      isWritable: false,
    };
    const associatedTokenAccount: AccountMeta = {
      pubkey: getAssociatedTokenAddressSync(mintAccount.pubkey, payerPubkey),
      isSigner: false,
      isWritable: false,
    };
    const [nftPubkey] = PublicKey.findProgramAddressSync(
      [Buffer.from(NFT_ACCOUNT_CONST)],
      this.programId
    );
    const nftAccount: AccountMeta = {
      pubkey: nftPubkey,
      isSigner: false,
      isWritable: false,
    };
    return new TransactionInstruction({
      keys: [
        payerAccount,
        voteAccount,
        proposalAccount,
        generalAccount,
        mintAccount,
        associatedTokenAccount,
        nftAccount,
        configAccount,
      ],
      programId: this.programId,
      data: Buffer.from(
        serialize(
          new InitGovernance({
            title,
            description,
            log_level: 0,
            governance_type: governanceType,
          })
        )
      ),
    });
  }

  async loadProposals(): Promise<GovernanceInterface[]> {
    const [generalAccountPubkey] = PublicKey.findProgramAddressSync(
      [Buffer.from(GENERAL_ACCOUNT_SEED)],
      this.programId
    );
    const generalAccountInfo = await this.connection.getAccountInfo(
      generalAccountPubkey
    );
    const { proposal_numeration } = deserialize(
      generalAccountInfo?.data as Buffer,
      GeneralData,
      { unchecked: true }
    );
    const [inglConfigKey] = PublicKey.findProgramAddressSync(
      [Buffer.from(INGL_CONFIG_SEED)],
      this.programId
    );
    const configAccountInfo = await this.connection.getAccountInfo(
      inglConfigKey
    );
    const { proposal_quorum } = deserialize(
      configAccountInfo?.data as Buffer,
      ValidatorConfig,
      { unchecked: true }
    );
    return Promise.all(
      new Array(proposal_numeration).map(async (_, numeration) => {
        const [proposalAccountKey] = PublicKey.findProgramAddressSync(
          [Buffer.from(INGL_PROPOSAL_KEY), toBytesInt32(numeration)],
          this.programId
        );
        const proposalAccountInfo = await this.connection.getAccountInfo(
          proposalAccountKey
        );
        const { governance_type, votes, ...proposal } = deserialize(
          proposalAccountInfo?.data as Buffer,
          GovernanceData,
          { unchecked: true }
        );
        let number_of_no_votes = 0;
        let number_of_yes_votes = 0;
        new Map(votes).forEach((value) =>
          value ? number_of_yes_votes++ : number_of_no_votes++
        );
        return {
          ...proposal,
          proposal_quorum,
          number_of_no_votes,
          number_of_yes_votes,
          proposal_numeration: numeration,
          program_id: this.programId.toBase58(),
          proposal_id: proposalAccountKey.toBase58(),
        };
      })
    );
  }
}
