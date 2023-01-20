import { field, variant, vec } from '@dao-xyz/borsh';
import { GovernanceType } from './gov-type';

export * from './helpers';

abstract class Instruction {
  @field({ type: 'u8' })
  public instruction!: number;

  @field({ type: 'u8' })
  public log_level!: number;

  constructor(properties: Instruction) {
    Object.assign(this, properties);
  }
}

@variant(0)
export class MintNft extends Instruction {
  constructor(log_level: number) {
    super({ log_level, instruction: 0 });
  }
}

@variant(1)
export class ImprintRarity extends Instruction {
  constructor(log_level: number) {
    super({ log_level, instruction: 1 });
  }
}

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

  constructor({ log_level, ...properties }: Omit<Init, 'instruction'>) {
    super({ log_level, instruction: 2 });
    Object.assign(this, properties);
  }
}

@variant(3)
export class Redeem extends Instruction {
  constructor(log_level: number) {
    super({ log_level, instruction: 3 });
  }
}

@variant(4)
export class NFTWithdraw extends Instruction {
  @field({ type: 'u8' })
  public cnt!: number;

  constructor(cnt: number, log_level: number) {
    super({ log_level, instruction: 4 });
    this.cnt = cnt;
  }
}

@variant(5)
export class ProcessRewards extends Instruction {
  constructor(log_level: number) {
    super({ log_level, instruction: 5 });
  }
}

@variant(6)
export class InitRebalance extends Instruction {
  constructor(log_level: number) {
    super({ log_level, instruction: 6 });
  }
}

@variant(7)
export class FinalizeRebalance extends Instruction {
  constructor(log_level: number) {
    super({ log_level, instruction: 7 });
  }
}

@variant(8)
export class UploadUris extends Instruction {
  constructor(log_level: number) {
    super({ log_level, instruction: 8 });
  }
}

@variant(9)
export class ResetUris extends Instruction {
  constructor(log_level: number) {
    super({ log_level, instruction: 9 });
  }
}

@variant(10)
export class UnDelegateNFT extends Instruction {
  constructor(log_level: number) {
    super({ log_level, instruction: 10 });
  }
}

@variant(11)
export class DelegateNFT extends Instruction {
  constructor(log_level: number) {
    super({ log_level, instruction: 11 });
  }
}

@variant(12)
export class CreateVoteAccount extends Instruction {
  constructor(log_level: number) {
    super({ log_level, instruction: 12 });
  }
}
@variant(13)
export class InitGovernance {
  @field({ type: 'u8' })
  public instruction!: number;

  @field({ type: GovernanceType })
  public governance_tpe!: GovernanceType;

  @field({ type: 'string' })
  public title!: string;

  @field({ type: 'string' })
  public description!: string;

  @field({ type: 'u8' })
  public log_level!: number;

  constructor(properties: Omit<InitGovernance, 'instruction'>) {
    this.instruction = 13;
    Object.assign(this, properties);
  }
}

@variant(14)
export class VoteGovernance {
  @field({ type: 'u8' })
  public instruction!: number;

  @field({ type: 'u32' })
  public numeration!: number;

  @field({ type: 'bool' })
  public vote!: boolean;

  @field({ type: 'u8' })
  public cnt!: number;

  @field({ type: 'u8' })
  public log_level!: number;

  constructor(properties: Omit<VoteGovernance, 'instruction'>) {
    this.instruction = 14;
    Object.assign(this, properties);
  }
}

@variant(15)
export class FinalizeGovernance {
  @field({ type: 'u8' })
  public instruction!: number;

  @field({ type: 'u32' })
  public numeration!: number;

  @field({ type: 'u8' })
  public log_level!: number;

  constructor(properties: Omit<FinalizeGovernance, 'instruction'>) {
    this.instruction = 15;
    Object.assign(this, properties);
  }
}

@variant(16)
export class ExecuteGovernance {
  @field({ type: 'u8' })
  public instruction!: number;

  @field({ type: 'u32' })
  public numeration!: number;

  @field({ type: 'u8' })
  public log_level!: number;

  constructor(properties: Omit<ExecuteGovernance, 'instruction'>) {
    this.instruction = 16;
    Object.assign(this, properties);
  }
}
