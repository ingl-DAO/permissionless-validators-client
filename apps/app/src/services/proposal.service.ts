import { deserialize, serialize } from '@dao-xyz/borsh';
import {
  AUTHORIZED_WITHDRAWER_KEY,
  BPF_LOADER_UPGRADEABLE_ID,
  Commission,
  DiscordInvite,
  ExecuteGovernance,
  FinalizeGovernance,
  forwardLegacyTransaction,
  forwardMultipleLegacyTransactions,
  GeneralData,
  GENERAL_ACCOUNT_SEED,
  GovernanceData,
  GovernanceType,
  GOVERNANCE_SAFETY_LEEWAY,
  INGL_CONFIG_SEED,
  INGL_PROGRAM_AUTHORITY_KEY,
  INGL_PROPOSAL_KEY,
  InitGovernance,
  InitialRedemptionFee,
  MaxPrimaryStake,
  NftHolderShare,
  NFT_ACCOUNT_CONST,
  ProgramUpgrade,
  RedemptionFeeDuration,
  toBytesInt32,
  TwitterHandle,
  ValidatorConfig,
  ValidatorID,
  ValidatorName,
  VoteAccountGovernance,
  VoteGovernance
} from '@ingl-permissionless/state';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import {
  SignerWalletAdapterProps,
  WalletNotConnectedError
} from '@solana/wallet-adapter-base';
import { WalletContextState } from '@solana/wallet-adapter-react';
import {
  AccountMeta,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction
} from '@solana/web3.js';
import BN from 'bn.js';
import {
  ConfigAccountEnum,
  CreateProposal,
  GovernanceInterface,
  InglNft,
  VoteAccountEnum
} from '../interfaces';

export class ProposalService {
  constructor(
    private readonly programId: PublicKey,
    private readonly connection: Connection,
    private readonly walletContext: WalletContextState
  ) {}

  async validateGovernanceInput({
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
      const bufferAccount = await this.connection.getAccountInfo(
        bufferAccountKey
      );
      if (!bufferAccount) throw new Error("Buffer account info doesn't exist");
      if (
        bufferAccount.owner.toBase58() !== BPF_LOADER_UPGRADEABLE_ID.toBase58()
      )
        throw new Error(
          'Buffer account must be owned by the bpf ugradeable program address'
        );
      const [expectedAuthority] = PublicKey.findProgramAddressSync(
        [Buffer.from(INGL_PROGRAM_AUTHORITY_KEY)],
        this.programId
      );
      const currentAuthority = new PublicKey(bufferAccount.data.slice(5, 37));
      if (expectedAuthority.toBase58() !== currentAuthority.toBase58())
        throw new Error(
          'The buffer excepted authority does not match the provided one'
        );
      governanceType = new ProgramUpgrade({
        buffer_account: bufferAccountKey.toBuffer(),
        code_link,
      });
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
        config_type === ConfigAccountEnum.TwitterHandle &&
        !(value as string).match(/^(@)?[A-Za-z0-9_]{1,15}$/)
      )
        throw new Error(`Invalid TwitterHandle`);
      if (
        config_type === ConfigAccountEnum.DiscordInvite &&
        !(value as string).match(
          /https:\/\/(www.)?discord\.com\/[A-Za-z0-9_]{1,15}$/
        )
      )
        throw new Error(`DiscordInvite value most be a valid url links`);
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

    const governanceType = await this.validateGovernanceInput(newProposal);
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
      isWritable: true,
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
    const configAccountInfo = await this.connection.getAccountInfo(
      inglConfigKey
    );
    if (!configAccountInfo)
      throw new Error('Fractionalized validator instance not initialized.');
    const { vote_account_id } = deserialize(
      configAccountInfo.data,
      ValidatorConfig,
      {
        unchecked: true,
      }
    );
    const voteAccount: AccountMeta = {
      pubkey: new PublicKey(vote_account_id),
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
      [Buffer.from(NFT_ACCOUNT_CONST), mintAccount.pubkey.toBuffer()],
      this.programId
    );
    const nftAccount: AccountMeta = {
      pubkey: nftPubkey,
      isSigner: false,
      isWritable: false,
    };
    const instructionAccounts = [
      payerAccount,
      voteAccount,
      proposalAccount,
      generalAccount,
      mintAccount,
      associatedTokenAccount,
      nftAccount,
      configAccount,
    ];
    if (governanceType instanceof ProgramUpgrade)
      instructionAccounts.push({
        pubkey: new PublicKey(governanceType.buffer_account),
        isSigner: false,
        isWritable: false,
      });
    const systemProgramAccount: AccountMeta = {
      pubkey: SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    };
    const initGovernanaceInstruction = new TransactionInstruction({
      keys: [...instructionAccounts, systemProgramAccount],
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
    try {
      return forwardLegacyTransaction(
        {
          connection: this.connection,
          publicKey: payerPubkey,
          signTransaction: this.walletContext.signTransaction,
        },
        [initGovernanaceInstruction]
      );
    } catch (error) {
      throw new Error(
        `Sorry, an error occured on init governance process: ${error}`
      );
    }
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
      [...new Array(proposal_numeration)].map(async (_, numeration) => {
        const proposal = await this.deserializeProposal(numeration);
        return {
          ...proposal,
          proposal_quorum,
        };
      })
    );
  }

  async loadProposalDetail(
    proposalNumeration: number
  ): Promise<GovernanceInterface> {
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
    const { governance_type, ...proposal } = await this.deserializeProposal(
      proposalNumeration
    );
    return {
      ...proposal,
      proposal_quorum,
      programUpgrade:
        governance_type instanceof ProgramUpgrade
          ? {
              buffer_account: new PublicKey(
                governance_type.buffer_account
              ).toBase58(),
              code_link: governance_type.code_link,
            }
          : undefined,
      voteAccount:
        governance_type instanceof ValidatorID
          ? {
              vote_type: VoteAccountEnum.ValidatorID,
              value: new PublicKey(governance_type.value).toBase58(),
            }
          : governance_type instanceof Commission
          ? {
              vote_type: VoteAccountEnum.Commission,
              value: governance_type.value,
            }
          : undefined,
      configAccount:
        governance_type instanceof MaxPrimaryStake
          ? {
              config_type: ConfigAccountEnum.MaxPrimaryStake,
              value:
                new BN(governance_type.value).toNumber() / LAMPORTS_PER_SOL,
            }
          : governance_type instanceof NftHolderShare
          ? {
              config_type: ConfigAccountEnum.NftHolderShare,
              value: governance_type.value,
            }
          : governance_type instanceof InitialRedemptionFee
          ? {
              config_type: ConfigAccountEnum.InitialRedemptionFee,
              value: governance_type.value,
            }
          : governance_type instanceof RedemptionFeeDuration
          ? {
              config_type: ConfigAccountEnum.RedemptionFeeDuration,
              value: governance_type.value * (24 * 3600),
            }
          : governance_type instanceof ValidatorName
          ? {
              config_type: ConfigAccountEnum.ValidatorName,
              value: governance_type.value,
            }
          : governance_type instanceof TwitterHandle
          ? {
              config_type: ConfigAccountEnum.TwitterHandle,
              value: governance_type.value,
            }
          : governance_type instanceof DiscordInvite
          ? {
              config_type: ConfigAccountEnum.DiscordInvite,
              value: governance_type.value,
            }
          : undefined,
    };
  }

  private async deserializeProposal(proposal_numeration: number) {
    const [proposalAccountKey] = PublicKey.findProgramAddressSync(
      [Buffer.from(INGL_PROPOSAL_KEY), toBytesInt32(proposal_numeration)],
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
    console.log(proposal);
    let number_of_no_votes = 0;
    let number_of_yes_votes = 0;
    votes.forEach(({ vote }) =>
      vote ? number_of_yes_votes++ : number_of_no_votes++
    );
    return {
      ...proposal,
      governance_type,
      number_of_no_votes,
      number_of_yes_votes,
      proposal_numeration,
      program_id: this.programId.toBase58(),
      proposal_id: proposalAccountKey.toBase58(),
    };
  }

  async voteGovernance(
    proposal_numeration: number,
    vote: boolean,
    governancePower: InglNft[]
  ) {
    if (governancePower.find((_) => !_.is_delegated))
      throw new Error(
        'Each Nft constituting the governance power must be delegated'
      );
    const tokenMints = governancePower.map((_) => new PublicKey(_.nft_mint_id));
    const payerPubkey = this.walletContext.publicKey;
    if (!payerPubkey)
      throw new WalletNotConnectedError('Please connect your wallet !!!');
    const [proposalAccountKey] = PublicKey.findProgramAddressSync(
      [Buffer.from(INGL_PROPOSAL_KEY), toBytesInt32(proposal_numeration)],
      this.programId
    );
    const proposalAccountInfo = await this.connection.getAccountInfo(
      proposalAccountKey
    );
    const { is_still_ongoing, expiration_time } = deserialize(
      proposalAccountInfo?.data as Buffer,
      GovernanceData,
      { unchecked: true }
    );
    if (!is_still_ongoing) throw new Error('This proposal is currently closed');
    if (new Date(expiration_time * 1000) < new Date())
      throw new Error('This proposal has expired');

    const payerAccount: AccountMeta = {
      pubkey: payerPubkey,
      isSigner: true,
      isWritable: true,
    };
    const proposalAccount: AccountMeta = {
      pubkey: proposalAccountKey,
      isSigner: false,
      isWritable: true,
    };

    if (tokenMints.length === 0)
      throw new Error('Insufficient governance power');
    const voteInstructions: TransactionInstruction[] = [];
    const cntAccounts = tokenMints.reduce<AccountMeta[]>(
      (accounts, tokenMint) => {
        const mintAccount: AccountMeta = {
          pubkey: tokenMint,
          isSigner: false,
          isWritable: false,
        };
        const associatedTokenAccount: AccountMeta = {
          pubkey: getAssociatedTokenAddressSync(tokenMint, payerPubkey),
          isSigner: false,
          isWritable: false,
        };
        const [nftPubkey] = PublicKey.findProgramAddressSync(
          [Buffer.from(NFT_ACCOUNT_CONST), mintAccount.pubkey.toBuffer()],
          this.programId
        );
        const nftAccount: AccountMeta = {
          pubkey: nftPubkey,
          isSigner: false,
          isWritable: true,
        };
        return [...accounts, nftAccount, mintAccount, associatedTokenAccount];
      },
      []
    );

    const systemProgramAccount: AccountMeta = {
      pubkey: SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    };
    while (cntAccounts.length > 0) {
      const accounts = cntAccounts.splice(0, 21);
      voteInstructions.push(
        new TransactionInstruction({
          programId: this.programId,
          data: Buffer.from(
            serialize(
              new VoteGovernance({
                vote,
                log_level: 0,
                cnt: accounts.length / 3,
                numeration: proposal_numeration,
              })
            )
          ),
          keys: [
            payerAccount,
            proposalAccount,
            ...accounts,

            systemProgramAccount,
          ],
        })
      );
    }

    try {
      return forwardMultipleLegacyTransactions(
        {
          connection: this.connection,
          publicKey: payerPubkey,
          signAllTransactions: this.walletContext
            .signAllTransactions as SignerWalletAdapterProps['signAllTransactions'],
        },
        voteInstructions.map((instruction) => ({
          instructions: [instruction],
          additionalUnits: 1_400_000,
        }))
      );
    } catch (error) {
      throw new Error(
        `Sorry, an error occured on vote governanace process: ${error}`
      );
    }
  }

  async finalizeGovernance(proposal_numeration: number) {
    const payerPubkey = this.walletContext.publicKey;
    if (!payerPubkey)
      throw new WalletNotConnectedError('Please connect your wallet !!!');

    const payerAccount: AccountMeta = {
      pubkey: payerPubkey,
      isSigner: true,
      isWritable: true,
    };

    const sysvarClockAccount: AccountMeta = {
      pubkey: SYSVAR_CLOCK_PUBKEY,
      isSigner: false,
      isWritable: false,
    };

    const sysvarRentAccount: AccountMeta = {
      pubkey: SYSVAR_RENT_PUBKEY,
      isSigner: false,
      isWritable: false,
    };

    const [proposalAccountKey] = PublicKey.findProgramAddressSync(
      [Buffer.from(INGL_PROPOSAL_KEY), toBytesInt32(proposal_numeration)],
      this.programId
    );

    const proposalAccount: AccountMeta = {
      pubkey: proposalAccountKey,
      isSigner: false,
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

    const [inglConfigKey] = PublicKey.findProgramAddressSync(
      [Buffer.from(INGL_CONFIG_SEED)],
      this.programId
    );
    const configAccount: AccountMeta = {
      pubkey: inglConfigKey,
      isSigner: false,
      isWritable: false,
    };
    const finalizeGovernanceInstruction = new TransactionInstruction({
      programId: this.programId,
      data: Buffer.from(
        serialize(
          new FinalizeGovernance({
            log_level: 0,
            numeration: proposal_numeration,
          })
        )
      ),
      keys: [
        payerAccount,
        sysvarRentAccount,
        sysvarClockAccount,
        proposalAccount,
        configAccount,
        generalAccount,
      ],
    });
    try {
      return forwardLegacyTransaction(
        {
          publicKey: payerPubkey,
          connection: this.connection,
          signTransaction: this.walletContext.signTransaction,
        },
        [finalizeGovernanceInstruction]
      );
    } catch (error) {
      throw new Error(
        `Sorry, an error ocuured on finalize govenance process: ${error}`
      );
    }
  }

  async executeGovernance(proposal_numeration: number) {
    const payerPubkey = this.walletContext.publicKey;
    if (!payerPubkey)
      throw new WalletNotConnectedError('Please connect your wallet !!!');

    const payerAccount: AccountMeta = {
      pubkey: payerPubkey,
      isSigner: true,
      isWritable: true,
    };

    const sysvarClockAccount: AccountMeta = {
      pubkey: SYSVAR_CLOCK_PUBKEY,
      isSigner: false,
      isWritable: false,
    };

    const [proposalAccountKey] = PublicKey.findProgramAddressSync(
      [Buffer.from(INGL_PROPOSAL_KEY), toBytesInt32(proposal_numeration)],
      this.programId
    );
    const proposalAccountInfo = await this.connection.getAccountInfo(
      proposalAccountKey
    );
    const {
      date_finalized,
      governance_type,
      is_still_ongoing,
      did_proposal_pass,
      is_proposal_executed,
    } = deserialize(proposalAccountInfo?.data as Buffer, GovernanceData, {
      unchecked: true,
    });
    if (is_still_ongoing)
      throw new Error('This proposal is currently still ongoing');
    if (
      !date_finalized ||
      new Date() < new Date(date_finalized + GOVERNANCE_SAFETY_LEEWAY)
    )
      throw new Error('Proposal must be finalized');
    if (is_proposal_executed)
      throw new Error('This proposal has already been executed');
    if (!did_proposal_pass) throw new Error('This proposal was not passed.');

    const proposalAccount: AccountMeta = {
      pubkey: proposalAccountKey,
      isSigner: false,
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

    const [inglConfigKey] = PublicKey.findProgramAddressSync(
      [Buffer.from(INGL_CONFIG_SEED)],
      this.programId
    );
    const configAccount: AccountMeta = {
      pubkey: inglConfigKey,
      isSigner: false,
      isWritable: false,
    };
    const instructionAccounts = [
      payerAccount,
      sysvarClockAccount,
      proposalAccount,
      configAccount,
      generalAccount,
    ];
    if (governance_type instanceof ProgramUpgrade) {
      const upgradedProgramAccount: AccountMeta = {
        pubkey: this.programId,
        isSigner: false,
        isWritable: false,
      };
      const bufferAddressAccount: AccountMeta = {
        pubkey: new PublicKey(governance_type.buffer_account),
        isSigner: false,
        isWritable: true,
      };
      const [programdataKey] = PublicKey.findProgramAddressSync(
        [this.programId.toBuffer()],
        BPF_LOADER_UPGRADEABLE_ID
      );
      const programdataAccount: AccountMeta = {
        pubkey: programdataKey,
        isSigner: false,
        isWritable: true,
      };
      const [upgradeAuthorityKey] = PublicKey.findProgramAddressSync(
        [Buffer.from(INGL_PROGRAM_AUTHORITY_KEY), this.programId.toBuffer()],
        this.programId
      );
      const upgradeAuthorityAccount: AccountMeta = {
        pubkey: upgradeAuthorityKey,
        isSigner: false,
        isWritable: true,
      };
      const sysvarRentAccount: AccountMeta = {
        pubkey: SYSVAR_RENT_PUBKEY,
        isSigner: false,
        isWritable: false,
      };
      instructionAccounts.push(
        upgradedProgramAccount,
        bufferAddressAccount,
        payerAccount,
        programdataAccount,
        upgradeAuthorityAccount,
        sysvarRentAccount,
        sysvarClockAccount
      );
    } else if (governance_type instanceof VoteAccountGovernance) {
      const configAccountInfo = await this.connection.getAccountInfo(
        inglConfigKey
      );
      if (!configAccountInfo)
        throw new Error('Fractionalized validator instance not initialized.');
      const { vote_account_id } = deserialize(
        configAccountInfo.data,
        ValidatorConfig,
        {
          unchecked: true,
        }
      );
      const voteAccount: AccountMeta = {
        pubkey: new PublicKey(vote_account_id),
        isSigner: false,
        isWritable: true,
      };
      const [authorizedWithdrawerKey] = PublicKey.findProgramAddressSync(
        [Buffer.from(AUTHORIZED_WITHDRAWER_KEY)],
        this.programId
      );
      const authorizedWithdrawerAccount: AccountMeta = {
        pubkey: authorizedWithdrawerKey,
        isSigner: false,
        isWritable: false,
      };
      instructionAccounts.push(voteAccount, authorizedWithdrawerAccount);
      if (governance_type instanceof ValidatorID) {
        instructionAccounts.push(sysvarClockAccount, payerAccount);
      }
    }
    const executeGovernanceInstruction = new TransactionInstruction({
      programId: this.programId,
      data: Buffer.from(
        serialize(
          new ExecuteGovernance({
            log_level: 0,
            numeration: proposal_numeration,
          })
        )
      ),
      keys: instructionAccounts,
    });
    try {
      return forwardLegacyTransaction(
        {
          publicKey: payerPubkey,
          connection: this.connection,
          signTransaction: this.walletContext.signTransaction,
        },
        [executeGovernanceInstruction]
      );
    } catch (error) {
      throw new Error(
        `Sorry, an error ocuured on finalize govenance process: ${error}`
      );
    }
  }
}
