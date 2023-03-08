import {
  field, variant,
  vec
} from '@dao-xyz/borsh';
import * as BN from 'bn.js';

export class Instruction {
  @field({ type: 'u8' })
  log_level!: number;

  constructor(log_level: number) {
    this.log_level = log_level;
  }
}

export class SecondaryItem {
  @field({ type: 'u64' })
  public cost!: BN;

  @field({ type: 'string' })
  public name!: string;

  @field({ type: 'string' })
  public description!: string;
}

export class MediationShares {
  @field({ type: 'u64' })
  public buyer!: BN;

  @field({ type: 'u64' })
  public seller!: BN;

  @field({ type: 'u64' })
  public team!: BN;

  constructor(properties: MediationShares) {
    Object.assign(properties);
  }
  getSpace(): number {
    return 64 / 8 + 64 / 8 + 64 / 8;
  }
}

@variant(0)
export class List extends Instruction {
  @field({ type: 'u64' })
  public authorized_withdrawer_cost!: BN;

  @field({ type: 'u32' })
  public mediatable_date!: number;

  @field({ type: vec(SecondaryItem) })
  public secondary_items!: SecondaryItem[];

  @field({ type: 'string' })
  validator_name!: string;

  @field({ type: 'string' })
  description!: string;

  @field({ type: 'string' })
  validator_logo_url!: string;

  constructor({ log_level, ...properties }: Omit<List, 'serialize'>) {
    super(log_level);
    Object.assign(this, properties);
  }
}

@variant(1)
export class DeList extends Instruction {}

@variant(2)
export class Buy extends Instruction {}

@variant(3)
export class WithdrawRewards extends Instruction {}

@variant(4)
export class RequestMediation extends Instruction {}

@variant(5)
export class Mediate extends Instruction {
  @field({ type: MediationShares })
  public mediate_shares!: MediationShares;

  constructor({ log_level, ...properties }: Mediate) {
    super(log_level);
    Object.assign(this, properties);
  }
}

@variant(6)
export class ValidateSecondaryItemsTransfers extends Instruction {
  @field({ type: 'u32' })
  public item_index!: number;

  constructor({ log_level, ...properties }: Mediate) {
    super(log_level);
    Object.assign(this, properties);
  }
}
