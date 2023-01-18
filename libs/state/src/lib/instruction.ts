import { field, fixedArray, variant, vec } from '@dao-xyz/borsh';
import { PublicKey } from '@solana/web3.js';
import BN = require('bn.js');

export enum Instruction {
  MintNft,
  // {
  //     log_level: u8,
  // }
  ImprintRarity,
  //   {
  //     log_level: u8,
  // }
  Init,
  //   {
  //     log_level: u8,
  //     init_commission: u8,
  //     max_primary_stake: u64,
  //     nft_holders_share: u8,
  //     initial_redemption_fee: u8,
  //     is_validator_id_switchable: bool,
  //     unit_backing: u64,
  //     redemption_fee_duration: u32,
  //     program_upgrade_threshold: u8,
  //     creator_royalties: u16,
  //     rarities: Vec<u16>,
  //     rarity_names: Vec<String>,
  //     twitter_handle: String,
  //     discord_invite: String,
  //     validator_name: String,
  //     collection_uri: String,
  //     default_uri: string,
  //     website: String,
  // }
  Redeem,
  // {
  //     log_level: u8,
  // }
  NFTWithdraw,
  // {
  //     cnt: usize,
  //     log_level: u8,
  // }
  ProcessRewards,
  // {
  //     log_level: u8,
  // }
  InitRebalance,
  // {
  //     log_level: u8,
  // }
  FinalizeRebalance,
  // {
  //     log_level: u8,
  // },
  UploadUris,
  // {
  //     uris: Vec<String>,
  //     rarity: u8,
  //     log_level: u8,
  // },
  ResetUris,
  // {
  //     log_level: u8,
  // },
  UnDelegateNFT,
  // {
  //     log_level: u8,
  // },
  DelegateNFT,
  // {
  //     log_level: u8,
  // },
  CreateVoteAccount,
  // {
  //     log_level: u8,
  // },
  InitGovernance,
  // {
  //     governance_type: GovernanceType,
  //     log_level: u8,
  // },
  VoteGovernance,
  // {
  //     numeration: u32,
  //     vote: bool,
  //     log_level: u8,
  // },
  FinalizeGovernance,
  // {
  //     numeration: u32,
  //     log_level: u8,
  // },
  ExecuteGovernance,
  // {
  //     numeration: u32,
  //     log_level: u8,
  // },
}

abstract class InglInstruction {
  @field({ type: 'u8' })
  public log_level!: number;

  constructor(log_level: number) {
    this.log_level = log_level;
  }
}

@variant(0)
export class MintNft extends InglInstruction {}

@variant(1)
export class ImprintRarity extends InglInstruction {}

@variant(2)
export class Init extends InglInstruction {
  @field({ type: 'u8' })
  public init_commission!: number;

  @field({ type: 'u64' })
  public max_primary_stake!: number;

  @field({ type: 'u8' })
  public nft_holders_share!: number;

  @field({ type: 'u8' })
  public initial_redemption_fee!: number;

  @field({ type: 'bool' })
  public is_validator_id_switchable!: boolean;

  @field({ type: 'u64' })
  public unit_backing!: number;

  @field({ type: 'u32' })
  public redemption_fee_duration!: number;

  @field({ type: 'u8' })
  public proposal_quorum!: number;

  @field({ type: 'u16' })
  public creator_royalties!: number;

  @field({ type: 'u32' })
  public governance_expiration_time!: number;

  @field({ type: vec('u16') })
  public rarities!: number[];

  @field({ type: vec('string') })
  public rarity_names!: string[];

  @field({ type: 'string' })
  public twitter_handle!: string;

  @field({ type: 'string' })
  public discord_invite!: string;

  @field({ type: 'string' })
  public validator_name!: string;

  @field({ type: 'string' })
  public collection_uri!: string;

  @field({ type: 'string' })
  public website!: string;

  @field({ type: 'string' })
  public default_ui!: string;

  constructor(properties: Init) {
    super(properties.log_level);
    Object.assign(this, properties);
  }
}

@variant(3)
export class Redeem extends InglInstruction {}

@variant(4)
export class NFTWithdraw extends InglInstruction {
  @field({ type: 'u64' })
  public cnt!: BN;

  constructor(properties: { log_level: number; cnt: BN }) {
    super(properties.log_level);
    this.cnt = properties.cnt;
  }
}

@variant(5)
export class ProcessRewards extends InglInstruction {}

@variant(6)
export class InitRebalance extends InglInstruction {}

@variant(7)
export class FinalizeRebalance extends InglInstruction {}

@variant(8)
export class UploadUris extends InglInstruction {}

@variant(9)
export class ResetUris extends InglInstruction {}

@variant(10)
export class UnDelegateNFT extends InglInstruction {}

@variant(11)
export class DelegateNFT extends InglInstruction {}

@variant(12)
export class CreateVoteAccount extends InglInstruction {}

abstract class GovernanceType {}

@variant(0)
export class ConfigAccountType extends GovernanceType {}

@variant(0)
export class MaxPrimaryStake extends ConfigAccountType {
  @field({ type: 'u64' })
  public value!: BN;

  constructor(value: BN) {
    super();
    this.value = value;
  }
}

@variant(1)
export class NftHolderShare extends ConfigAccountType {
  @field({ type: 'u8' })
  public value!: number;

  constructor(value: number) {
    super();
    this.value = value;
  }
}

@variant(2)
export class InitialRedemptionFee extends ConfigAccountType {
  @field({ type: 'u8' })
  public value!: number;

  constructor(value: number) {
    super();
    this.value = value;
  }
}

@variant(3)
export class RedemptionFeeDuration extends ConfigAccountType {
  @field({ type: 'u8' })
  public value!: number;

  constructor(value: number) {
    super();
    this.value = value;
  }
}
@variant(4)
export class ValidatorName extends ConfigAccountType {
  @field({ type: 'string' })
  public value!: string;

  constructor(value: string) {
    super();
    this.value = value;
  }
}
@variant(4)
export class TwitterHandle extends ConfigAccountType {
  @field({ type: 'string' })
  public value!: string;

  constructor(value: string) {
    super();
    this.value = value;
  }
}
@variant(6)
export class DiscordInvite extends ConfigAccountType {
  @field({ type: 'string' })
  public value!: string;

  constructor(value: string) {
    super();
    this.value = value;
  }
}

@variant(1)
export class ProgramUpgrade extends GovernanceType {
  @field({ type: fixedArray('u8', 32) })
  public buffer_account!: PublicKey;

  @field({ type: 'string' })
  public code_link!: string;

  constructor(properties: ProgramUpgrade) {
    super();
    Object.assign(this, properties);
  }
}

@variant(2)
export class VoteAccountGovernance extends GovernanceType {}

@variant(0)
export class ValidatorID extends VoteAccountGovernance {
  @field({ type: fixedArray('u8', 32) })
  public value!: PublicKey;

  constructor(value: PublicKey) {
    super();
    this.value = value;
  }
}

@variant(1)
export class Commission extends VoteAccountGovernance {
  @field({ type: 'u8' })
  public value!: number;

  constructor(value: number) {
    super();
    this.value = value;
  }
}

@variant(13)
export class InitGovernance {
  @field({ type: GovernanceType })
  public governance_tpe!: GovernanceType;

  @field({ type: 'string' })
  public title!: string;

  @field({ type: 'string' })
  public description!: string;

  @field({ type: 'u8' })
  public log_level!: number;

  constructor(properties: InitGovernance) {
    Object.assign(this, properties);
  }
}

@variant(13)
export class VoteGovernance {
  @field({ type: 'u32' })
  public numeration!: number;

  @field({ type: 'bool' })
  public vote!: boolean;

  @field({ type: 'u8' })
  public cnt!: number;

  @field({ type: 'u8' })
  public log_level!: number;

  constructor(properties: InitGovernance) {
    Object.assign(this, properties);
  }
}

@variant(14)
export class FinalizeGovernance {
  @field({ type: 'u32' })
  public numeration!: number;

  @field({ type: 'u8' })
  public log_level!: number;

  constructor(properties: InitGovernance) {
    Object.assign(this, properties);
  }
}

@variant(15)
export class ExecuteGovernance {
  @field({ type: 'u32' })
  public numeration!: number;

  @field({ type: 'u8' })
  public log_level!: number;

  constructor(properties: InitGovernance) {
    Object.assign(this, properties);
  }
}
