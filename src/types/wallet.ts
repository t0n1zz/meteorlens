/**
 * Saved wallet/address entry for read-only tracking.
 * Stored locally only; never sent to external servers.
 */
export interface SavedAddress {
  address: string;
  label: string;
  addedAt: number;
}

export type WalletState = {
  addresses: SavedAddress[];
  activeAddress: string | null;
};
