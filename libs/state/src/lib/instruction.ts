import { field, variant, vec } from '@dao-xyz/borsh';
import { GovernanceType } from './gov-type';
import BN = require('bn.js');

abstract class Instruction {
  @field({ type: 'u8' })
  public log_level!: number;

  constructor(log_level: number) {
    this.log_level = log_level;
  }
}

@variant(0)
export class MintNft extends Instruction {}

@variant(1)
export class ImprintRarity extends Instruction {}

@variant(2)
export class Init extends Instruction {
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
export class Redeem extends Instruction {}

@variant(4)
export class NFTWithdraw extends Instruction {
  @field({ type: 'u64' })
  public cnt!: BN;

  constructor(properties: { log_level: number; cnt: BN }) {
    super(properties.log_level);
    this.cnt = properties.cnt;
  }
}

@variant(5)
export class ProcessRewards extends Instruction {}

@variant(6)
export class InitRebalance extends Instruction {}

@variant(7)
export class FinalizeRebalance extends Instruction {}

@variant(8)
export class UploadUris extends Instruction {}

@variant(9)
export class ResetUris extends Instruction {}

@variant(10)
export class UnDelegateNFT extends Instruction {}

@variant(11)
export class DelegateNFT extends Instruction {}

@variant(12)
export class CreateVoteAccount extends Instruction {}
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

@variant(14)
export class VoteGovernance {
  @field({ type: 'u32' })
  public numeration!: number;

  @field({ type: 'bool' })
  public vote!: boolean;

  @field({ type: 'u8' })
  public cnt!: number;

  @field({ type: 'u8' })
  public log_level!: number;

  constructor(properties: VoteGovernance) {
    Object.assign(this, properties);
  }
}

@variant(15)
export class FinalizeGovernance {
  @field({ type: 'u32' })
  public numeration!: number;

  @field({ type: 'u8' })
  public log_level!: number;

  constructor(properties: FinalizeGovernance) {
    Object.assign(this, properties);
  }
}

@variant(16)
export class ExecuteGovernance {
  @field({ type: 'u32' })
  public numeration!: number;

  @field({ type: 'u8' })
  public log_level!: number;

  constructor(properties: ExecuteGovernance) {
    Object.assign(this, properties);
  }
}
