import { field, variant, vec } from '@dao-xyz/borsh';
import * as BN from 'bn.js';

export class SecondaryItem {
  @field({ type: 'u64' })
  public cost!: BN;

  @field({ type: 'string' })
  public name!: string;

  @field({ type: 'string' })
  public description!: string;

  constructor(properties: SecondaryItem) {
    Object.assign(this, properties);
  }
}

export class MediationShares {
  @field({ type: 'u8' })
  public buyer!: number;

  @field({ type: 'u8' })
  public seller!: number;

  @field({ type: 'u8' })
  public team!: number;

  constructor(properties: MediationShares) {
    Object.assign(properties);
  }
  getSpace(): number {
    return 64 / 8 + 64 / 8 + 64 / 8;
  }
}

abstract class Instruction {}

@variant(0)
export class List extends Instruction {
  @field({ type: 'u8' })
  public log_level!: number;

  @field({ type: 'u64' })
  public authorized_withdrawer_cost!: BN;

  @field({ type: 'u32' })
  public mediation_interval!: number;

  @field({ type: vec(SecondaryItem) })
  public secondary_items!: SecondaryItem[];

  @field({ type: 'string' })
  description!: string;

  @field({ type: 'string' })
  validator_name!: string;

  @field({ type: 'string' })
  validator_logo_url!: string;

  constructor(properties: List) {
    super();
    Object.assign(this, properties);
  }
}

@variant(1)
export class DeList extends Instruction {
  @field({ type: 'u8' })
  public log_level!: number;

  constructor(log_level: number) {
    super();
    this.log_level = log_level;
  }
}

@variant(2)
export class Buy extends Instruction {
  @field({ type: 'u8' })
  public log_level!: number;

  constructor(log_level: number) {
    super();
    this.log_level = log_level;
  }
}

@variant(3)
export class WithdrawRewards extends Instruction {
  @field({ type: 'u8' })
  public log_level!: number;

  constructor(log_level: number) {
    super();
    this.log_level = log_level;
  }
}

@variant(4)
export class RequestMediation extends Instruction {
  @field({ type: 'u8' })
  public log_level!: number;

  constructor(log_level: number) {
    super();
    this.log_level = log_level;
  }
}

@variant(5)
export class Mediate extends Instruction {
  @field({ type: 'u8' })
  public log_level!: number;

  @field({ type: MediationShares })
  public mediate_shares!: MediationShares;

  constructor(properties: Mediate) {
    super();
    Object.assign(this, properties);
  }
}

@variant(6)
export class ValidateSecondaryItemsTransfers extends Instruction {
  @field({ type: 'u8' })
  public log_level!: number;

  @field({ type: 'u32' })
  public item_index!: number;

  constructor(properties: ValidateSecondaryItemsTransfers) {
    super();
    Object.assign(this, properties);
  }
}
