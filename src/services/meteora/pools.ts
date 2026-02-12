/**
 * Pool data from Meteora API, normalized to app types.
 */
import { fetchPool, fetchPools } from './api';
import type { PoolMetrics, PoolToken } from '../../types/pool';

function toPoolToken(raw: unknown): PoolToken | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const o = raw as Record<string, unknown>;
  const symbol = typeof o.symbol === 'string' ? o.symbol : '';
  const address = typeof o.address === 'string' ? o.address : '';
  const decimals = typeof o.decimals === 'number' ? o.decimals : 6;
  return { symbol, address, decimals, name: typeof o.name === 'string' ? o.name : undefined };
}

function mapPoolFromApi(raw: Record<string, unknown>): PoolMetrics {
  return {
    address: typeof raw.address === 'string' ? raw.address : '',
    name: typeof raw.name === 'string' ? raw.name : undefined,
    token_x: toPoolToken(raw.token_x),
    token_y: toPoolToken(raw.token_y),
    current_price: typeof raw.current_price === 'number' ? raw.current_price : undefined,
    tvl: typeof raw.tvl === 'number' ? raw.tvl : undefined,
    apr: typeof raw.apr === 'number' ? raw.apr : undefined,
    apy: typeof raw.apy === 'number' ? raw.apy : undefined,
    volume: typeof raw.volume === 'object' && raw.volume !== null ? (raw.volume as Record<string, number>) : undefined,
    fee_tvl_ratio: typeof raw.fee_tvl_ratio === 'object' && raw.fee_tvl_ratio !== null ? (raw.fee_tvl_ratio as Record<string, number>) : undefined,
    bin_step: typeof raw.bin_step === 'number' ? raw.bin_step : undefined,
    active_bin_id: typeof raw.active_bin_id === 'number' ? raw.active_bin_id : undefined,
  };
}

export async function getPoolsList(limit = 100): Promise<PoolMetrics[]> {
  const data = await fetchPools(limit);
  const list = (data.data ?? data) as unknown;
  const arr = Array.isArray(list) ? list : [];
  return arr.map((p: Record<string, unknown>) => mapPoolFromApi(p));
}

export async function getPoolMetrics(poolAddress: string): Promise<PoolMetrics> {
  const raw = await fetchPool(poolAddress);
  return mapPoolFromApi(raw as Record<string, unknown>);
}
