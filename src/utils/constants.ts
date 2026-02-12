/**
 * API base URLs and app constants.
 */
export const METEORA_POOLS_API = 'https://dlmm.datapi.meteora.ag';
export const METEORA_POSITION_API = 'https://dlmm-api.meteora.ag';

export const SOLANA_ADDRESS_MIN_LEN = 32;
export const SOLANA_ADDRESS_MAX_LEN = 44;

export const RISK_GREEN_MIN = 80;
export const RISK_YELLOW_MIN = 50;

export const REFRESH_POSITION_VALUE_MS = 30_000;
export const REFRESH_POOL_METRICS_MS = 5 * 60_000;
export const REFRESH_RISK_MS = 60 * 60_000;

export const STORAGE_KEYS = {
  SAVED_ADDRESSES: '@dlmm/saved_addresses',
  ACTIVE_ADDRESS: '@dlmm/active_address',
  SETTINGS: '@dlmm/settings',
  ENTRY_SNAPSHOTS: '@dlmm/entry_snapshots',
} as const;
