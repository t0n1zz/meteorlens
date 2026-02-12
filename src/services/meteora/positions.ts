/**
 * Fetches user DLMM positions via SDK + Meteora position API.
 * Merges on-chain position data with fee/APR from REST API.
 */
import { PublicKey } from '@solana/web3.js';
import { DLMM } from '@meteora-ag/dlmm';
import { getConnection } from '../solana/rpc';
import { fetchPosition } from './api';
import { getPoolMetrics } from './pools';
import type { AppPosition, PositionRange, PositionValue, PositionFees, PositionPnL } from '../../types/position';
import type { PoolMetrics } from '../../types/pool';
import { computeFullPnl } from '../../utils/calculations';

/** LbPair address -> pool metrics cache to avoid repeated API calls */
const poolCache = new Map<string, PoolMetrics>();

function getPairName(pool: PoolMetrics): string {
  const x = pool.token_x?.symbol ?? 'X';
  const y = pool.token_y?.symbol ?? 'Y';
  return `${x}/${y}`;
}

function buildRange(
  minBinId: number,
  maxBinId: number,
  activeBinId: number,
  currentPrice?: number
): PositionRange {
  const inRange = activeBinId >= minBinId && activeBinId <= maxBinId;
  return {
    minBinId,
    maxBinId,
    activeBinId,
    inRange,
    currentPrice,
  };
}

/**
 * Fetch fee/APR for a position from Meteora position API.
 */
async function getPositionFees(positionPubkey: string): Promise<PositionFees> {
  try {
    const raw = await fetchPosition(positionPubkey);
    const getNum = (k: string) => (typeof (raw as Record<string, unknown>)[k] === 'number' ? (raw as Record<string, unknown>)[k] as number : undefined);
    return {
      feeApr24h: getNum('fee_apr_24h'),
      feeApy24h: getNum('fee_apy_24h'),
      dailyFeeYield: getNum('daily_fee_yield'),
      totalFeeUsdClaimed: getNum('total_fee_usd_claimed'),
      totalFeeXClaimed: getNum('total_fee_x_claimed'),
      totalFeeYClaimed: getNum('total_fee_y_claimed'),
      totalRewardUsdClaimed: getNum('total_reward_usd_claimed'),
    };
  } catch {
    return {};
  }
}

/**
 * Get pool metrics (from cache or API). Cache is in-memory for the session.
 */
async function getPoolCached(lbPairAddress: string): Promise<PoolMetrics> {
  let pool = poolCache.get(lbPairAddress);
  if (!pool) {
    pool = await getPoolMetrics(lbPairAddress);
    poolCache.set(lbPairAddress, pool);
  }
  return pool;
}

/**
 * Convert SDK position + pool + fee API data into AppPosition.
 * Token amounts from SDK are in raw decimals; we need to scale and get USD from pool prices.
 */
function toAppPosition(
  positionPubkey: string,
  owner: string,
  lbPairAddress: string,
  minBinId: number,
  maxBinId: number,
  tokenXAmountRaw: number,
  tokenYAmountRaw: number,
  tokenXDecimals: number,
  tokenYDecimals: number,
  pool: PoolMetrics,
  fees: PositionFees
): AppPosition {
  const tokenXSymbol = pool.token_x?.symbol ?? 'X';
  const tokenYSymbol = pool.token_y?.symbol ?? 'Y';
  const price = pool.current_price ?? 0;
  const tokenXAmount = tokenXAmountRaw / Math.pow(10, tokenXDecimals);
  const tokenYAmount = tokenYAmountRaw / Math.pow(10, tokenYDecimals);
  // Assume token X is base, token Y is quote; price = Y per X (e.g. USDC per SOL)
  const valueTokenXUsd = price > 0 ? tokenXAmount * price : 0;
  const valueTokenYUsd = tokenYAmount; // if Y is USDC, 1:1
  const valueUsd = valueTokenXUsd + valueTokenYUsd;

  const activeBinId = pool.active_bin_id ?? Math.floor((minBinId + maxBinId) / 2);
  const range = buildRange(minBinId, maxBinId, activeBinId, price);

  const value: PositionValue = {
    tokenXAmount,
    tokenYAmount,
    tokenXSymbol,
    tokenYSymbol,
    valueUsd,
    valueTokenXUsd,
    valueTokenYUsd,
  };

  const feesUsd = fees.totalFeeUsdClaimed ?? 0;
  const initialUsd = valueUsd; // Approximate: we don't have entry price; use current as proxy for MVP
  const pnl: PositionPnL | undefined =
    initialUsd > 0
      ? computeFullPnl(valueUsd, initialUsd, feesUsd, initialUsd) as PositionPnL
      : undefined;

  let shareOfPoolPercent: number | undefined;
  if (pool.tvl != null && pool.tvl > 0 && valueUsd > 0) {
    shareOfPoolPercent = (valueUsd / pool.tvl) * 100;
  }

  return {
    publicKey: positionPubkey,
    lbPair: lbPairAddress,
    owner,
    range,
    value,
    fees,
    pnl,
    pairName: getPairName(pool),
    shareOfPoolPercent,
  };
}

/**
 * Fetch all DLMM positions for a wallet and normalize to AppPosition[].
 */
export async function fetchUserPositions(walletAddress: string): Promise<AppPosition[]> {
  const connection = getConnection();
  const userPubkey = new PublicKey(walletAddress);

  const positionMap = await DLMM.getAllLbPairPositionsByUser(connection, userPubkey);
  const results: AppPosition[] = [];

  for (const [lbPairAddress, info] of positionMap.entries()) {
    const pool = await getPoolCached(lbPairAddress);
    const tokenXDecimals = pool.token_x?.decimals ?? 6;
    const tokenYDecimals = pool.token_y?.decimals ?? 6;

    const positions = info.lbPairPositionsData ?? [];
    for (const pos of positions) {
      const pubkey = pos.publicKey.toBase58();
      const data = pos.positionData as { lowerBinId: number; upperBinId: number; totalXAmount?: string; totalYAmount?: string; [k: string]: unknown };
      const minBinId = typeof data.lowerBinId === 'number' ? data.lowerBinId : Number(data.lowerBinId ?? 0);
      const maxBinId = typeof data.upperBinId === 'number' ? data.upperBinId : Number(data.upperBinId ?? 0);

      let amountX = 0;
      let amountY = 0;
      if (typeof data.totalXAmount === 'string') amountX = parseFloat(data.totalXAmount) || 0;
      if (typeof data.totalYAmount === 'string') amountY = parseFloat(data.totalYAmount) || 0;

      const fees = await getPositionFees(pubkey);
      const appPos = toAppPosition(
        pubkey,
        walletAddress,
        lbPairAddress,
        minBinId,
        maxBinId,
        amountX,
        amountY,
        tokenXDecimals,
        tokenYDecimals,
        pool,
        fees
      );
      results.push(appPos);
    }
  }

  return results;
}

export function clearPoolCache(): void {
  poolCache.clear();
}
