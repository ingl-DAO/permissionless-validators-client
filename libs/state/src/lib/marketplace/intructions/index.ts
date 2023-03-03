import {
  field,
  serialize as serializeData,
  variant,
  vec,
} from '@dao-xyz/borsh';
import * as BN from 'bn.js';
import { MediationShares } from '..';

export abstract class Instruction {
  @field({ type: 'u8' })
  log_level!: number;

  constructor(log_level: number) {
    this.log_level == log_level;
  }

  serialize() {
    return serializeData(this);
  }
}

export class SecondaryItem {
  @field({ type: 'u64' })
  public cost!: BN;

  @field({ type: 'string' })
  public name!: string;

  @field({ type: 'string' })
  public decription!: string;
}

@variant(0)
export class List extends Instruction {
  @field({ type: 'u64' })
  public authorized_withdrawer_cost!: BN;

  @field({ type: 'u32' })
  public mediatable_date!: number;

  @field({ type: vec(SecondaryItem) })
  public secondary_items: SecondaryItem[];

  constructor({ log_level, ...properties }: List) {
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
