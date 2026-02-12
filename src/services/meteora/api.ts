/**
 * Meteora DLMM REST API client.
 * Base URLs: dlmm.datapi.meteora.ag (pools), dlmm-api.meteora.ag (positions).
 */
import { METEORA_POOLS_API, METEORA_POSITION_API } from '../../utils/constants';

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Meteora API: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

/** GET /pools (paginated) */
export async function fetchPools(limit = 100, offset = 0): Promise<{ data?: unknown[]; [k: string]: unknown }> {
  const url = `${METEORA_POOLS_API}/pools?limit=${limit}&offset=${offset}`;
  return fetchJson(url);
}

/** GET /pools/{address} */
export async function fetchPool(address: string): Promise<Record<string, unknown>> {
  const url = `${METEORA_POOLS_API}/pools/${address}`;
  return fetchJson(url);
}

/** GET /pools/{address}/ohlcv */
export async function fetchPoolOhlcv(
  address: string,
  timeframe: '1m' | '1h' | '24h' = '1h'
): Promise<unknown> {
  const url = `${METEORA_POOLS_API}/pools/${address}/ohlcv?timeframe=${timeframe}`;
  return fetchJson(url);
}

/** GET /position/{position_address} - fee/APR data */
export async function fetchPosition(positionAddress: string): Promise<Record<string, unknown>> {
  const url = `${METEORA_POSITION_API}/position/${positionAddress}`;
  return fetchJson(url);
}

/** GET /wallet/{wallet}/{pair_address}/earning */
export async function fetchWalletEarning(
  walletAddress: string,
  pairAddress: string
): Promise<Record<string, unknown>> {
  const url = `${METEORA_POSITION_API}/wallet/${walletAddress}/${pairAddress}/earning`;
  return fetchJson(url);
}
