/**
 * Meteora DLMM pool (lb pair) metadata and metrics from API.
 */
export interface PoolToken {
  symbol: string;
  name?: string;
  address: string;
  decimals: number;
}

export interface PoolMetrics {
  address: string;
  name?: string;
  token_x?: PoolToken;
  token_y?: PoolToken;
  current_price?: number;
  tvl?: number;
  apr?: number;
  apy?: number;
  volume?: Record<string, number>;
  fee_tvl_ratio?: Record<string, number>;
  fee_tier?: number;
  bin_step?: number;
  active_bin_id?: number;
  fees_24h?: number;
}
