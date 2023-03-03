import { field, fixedArray, option, vec } from '@dao-xyz/borsh';
import { PublicKey } from '@solana/web3.js';
import * as BN from 'bn.js';

export * from './intructions';

export const PDA_AUTHORIZED_WITHDRAWER_SEED = 'authorized_withdrawer';
export const PROGRAM_STORAGE_SEED = 'program_storage';
export const PDA_UPGRADE_AUTHORITY_SEED = 'upgrade_authority';
export const ESCROW_ACCOUNT_SEED = 'escrow_account';

export const ESCROWED_BASIS_POINTS = 2000;
export const TEAM_FEES_BASIS_POINTS = 10;

export const STORAGE_VALIDATION_PHRASE = 838_927_652;

export const TEAM_ADDRESS = new PublicKey(
  'Et2tm6NsfBZJbEYXtWTv9k51V4tWtQvufexSgXoDRGVA'
);
export const MEDIATORS = [
  new PublicKey('Et2tm6NsfBZJbEYXtWTv9k51V4tWtQvufexSgXoDRGVA'),
];

export const INGL_MARKET_REGISTRY_PROGRAM_ID = new PublicKey(
  'InglMarketplace11111111111111111111111111111'
);

interface Space {
  getSpace(): number;
}

export class Purchase implements Space {
  @field({ type: fixedArray('u8', 32) })
  public buyer!: Uint8Array;

  @field({ type: 'u32' })
  public date!: number;

  @field({ type: option('u32') })
  public date_finalized?: number;

  constructor(porperties: Purchase) {
    Object.assign(porperties);
  }
  getSpace(): number {
    return 32 + 32 / 8 + 1 + 32 / 8;
  }
}

export class MediationShares implements Space {
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

export class StoredSecondaryItem implements Space {
  @field({ type: 'u64' })
  public cost!: BN;

  @field({ type: 'string' })
  public name!: string;

  @field({ type: 'string' })
  public decription!: string;

  @field({ type: option('u32') })
  public date_validated?: number;

  constructor(properties: MediationShares) {
    Object.assign(properties);
  }
  getSpace(): number {
    return 64 / 8 + 4 * this.name.length + 4 * this.decription.length + 1 + 4;
  }
}

export class Storage implements Space {
  @field({ type: 'u32' })
  public validation_phrase!: number;

  @field({ type: fixedArray('u8', 32) })
  public authorized_withdrawer!: Uint8Array;

  @field({ type: fixedArray('u8', 32) })
  public vote_account!: Uint8Array;

  @field({ type: 'u64' })
  public authorized_withdrawer_cost!: BN;

  @field({ type: 'u32' })
  public mediatable_date!: number;

  @field({ type: option(Purchase) })
  public purchase?: Purchase;

  @field({ type: option('u32') })
  public request_mediation_date?: number;

  @field({ type: option('u32') })
  public mediation_date: number;

  @field({ type: option(MediationShares) })
  public mediation_shares?: MediationShares;

  @field({ type: vec(StoredSecondaryItem) })
  public secondary_items!: StoredSecondaryItem[];

  @field({ type: 'string' })
  public description!: string;

  constructor(properties: Storage) {
    Object.assign(properties);
  }
  getSpace(): number {
    return (
      32 / 8 +
      32 * 2 +
      64 / 8 +
      32 / 8 +
      1 +
      this.purchase.getSpace() +
      (32 / 8) * 2 +
      1 +
      this.mediation_shares.getSpace() +
      4 +
      this.secondary_items.reduce((size, item) => size + item.getSpace(), 0)
    );
  }
}
