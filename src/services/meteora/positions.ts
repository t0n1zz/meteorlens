/**
 * Fetches user DLMM positions via SDK + Meteora position API.
 * Merges on-chain position data with fee/APR from REST API.
 */
import { PublicKey } from '@solana/web3.js';
import { getConnection } from '../solana/rpc';

// Use require() for web compatibility - Metro bundler may not handle ESM named exports correctly
// eslint-disable-next-line @typescript-eslint/no-require-imports
const MeteoraSDK = require('@meteora-ag/dlmm');
const DLMM = MeteoraSDK.DLMM || MeteoraSDK.default?.DLMM || MeteoraSDK;

if (!DLMM || typeof DLMM.getAllLbPairPositionsByUser !== 'function') {
  console.error('[positions.ts] DLMM import failed. SDK keys:', Object.keys(MeteoraSDK));
  throw new Error('Failed to import DLMM from @meteora-ag/dlmm. SDK may not be compatible with web bundler.');
}
import { fetchPosition } from './api';
import { getPoolMetrics } from './pools';
import type { AppPosition, PositionRange, PositionValue, PositionFees, PositionPnL } from '../../types/position';
import type { PoolMetrics } from '../../types/pool';
import { computeFullPnl } from '../../utils/calculations';
import { computeRiskScore } from '../analytics/risk';
import { getOrCreateEntrySnapshot } from '../positions/entrySnapshot';
import { calculateDistanceToEdges } from '../../utils/rangeUtils';
import { recordFeeSnapshot, calculateFeePeriods } from '../positions/feeTracking';
import { recordPnLHistory } from '../positions/pnlHistory';

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
  currentPrice?: number,
  binStep?: number
): PositionRange {
  const inRange = activeBinId >= minBinId && activeBinId <= maxBinId;
  const range: PositionRange = {
    minBinId,
    maxBinId,
    activeBinId,
    inRange,
    currentPrice,
  };
  
  // Calculate distance to edges if we have price and binStep
  if (currentPrice != null && binStep != null && currentPrice > 0) {
    const distances = calculateDistanceToEdges(
      currentPrice,
      minBinId,
      maxBinId,
      activeBinId,
      currentPrice,
      binStep
    );
    range.distanceToMinPercent = distances.distanceToMinPercent;
    range.distanceToMaxPercent = distances.distanceToMaxPercent;
    range.priceMin = distances.priceAtMin;
    range.priceMax = distances.priceAtMax;
  }
  
  return range;
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
 * Uses entry snapshot for accurate IL calculation.
 */
async function toAppPosition(
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
  const binStep = pool.bin_step ?? 25; // Default bin step if not provided
  const range = buildRange(minBinId, maxBinId, activeBinId, price, binStep);

  const value: PositionValue = {
    tokenXAmount,
    tokenYAmount,
    tokenXSymbol,
    tokenYSymbol,
    valueUsd,
    valueTokenXUsd,
    valueTokenYUsd,
  };

  // Get or create entry snapshot for accurate IL calculation
  const entrySnapshot = await getOrCreateEntrySnapshot(
    positionPubkey,
    valueUsd,
    tokenXAmount,
    tokenYAmount,
    price
  );
  
  const feesUsd = fees.totalFeeUsdClaimed ?? 0;
  const initialUsd = entrySnapshot.valueUsd;
  
  // Record fee snapshot for tracking over time
  if (fees.totalFeeUsdClaimed != null) {
    await recordFeeSnapshot(
      positionPubkey,
      fees.totalFeeUsdClaimed,
      fees.totalFeeXClaimed ?? 0,
      fees.totalFeeYClaimed ?? 0
    );
  }
  
  // Calculate fee periods (daily/weekly/monthly growth)
  const feePeriods = await calculateFeePeriods(positionPubkey);
  if (feePeriods) {
    fees.feePeriods = feePeriods;
    // Calculate average growth rate per day
    fees.feeGrowthRatePerDay = feePeriods.weekly > 0 
      ? feePeriods.weekly / 7 
      : feePeriods.daily;
  }
  
  // Calculate hold value: what if user held initial token amounts at current price
  const holdValueUsd = entrySnapshot.price > 0 && price > 0
    ? (entrySnapshot.tokenXAmount * price) + entrySnapshot.tokenYAmount
    : initialUsd; // Fallback to initial value if prices unavailable
  
  const pnl: PositionPnL | undefined =
    initialUsd > 0
      ? {
          ...computeFullPnl(valueUsd, initialUsd, feesUsd, holdValueUsd),
          roiPercent: (feesUsd > 0 || valueUsd !== initialUsd)
            ? ((valueUsd + feesUsd - initialUsd) / initialUsd) * 100
            : 0,
        }
      : undefined;

  if (pnl) {
    await recordPnLHistory(positionPubkey, valueUsd, pnl.totalPnlUsd, pnl.totalPnlPercent);
  }

  let shareOfPoolPercent: number | undefined;
  if (pool.tvl != null && pool.tvl > 0 && valueUsd > 0) {
    shareOfPoolPercent = (valueUsd / pool.tvl) * 100;
  }

  const appPos: AppPosition = {
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
  appPos.riskScore = computeRiskScore(appPos, pool);
  return appPos;
}

/**
 * Fetch all DLMM positions for a wallet and normalize to AppPosition[].
 * Uses Meteora SDK getAllLbPairPositionsByUser with explicit mainnet cluster and chunked fetch options per SDK docs.
 * @see https://docs.meteora.ag/developer-guide/guides/dlmm/typescript-sdk/sdk-functions
 */
export async function fetchUserPositions(walletAddress: string): Promise<AppPosition[]> {
  const connection = getConnection();
  const userPubkey = new PublicKey(walletAddress);

  const opt = { cluster: 'mainnet-beta' as const };
  const getPositionsOpt = { chunkSize: 100 };

  try {
    // Test connection first
    const slot = await connection.getSlot();
    console.log('[fetchUserPositions] Connection OK, slot:', slot);

    console.log('[fetchUserPositions] Fetching positions for:', walletAddress);
    const positionMap = await DLMM.getAllLbPairPositionsByUser(
      connection,
      userPubkey,
      opt,
      getPositionsOpt
    );
    
    console.log('[fetchUserPositions] SDK returned', positionMap.size, 'pools');
    const results: AppPosition[] = [];

    for (const [lbPairAddress, info] of positionMap.entries()) {
      console.log('[fetchUserPositions] Processing pool:', lbPairAddress, 'positions:', info.lbPairPositionsData?.length ?? 0);
      const pool = await getPoolCached(lbPairAddress);
      const tokenXDecimals = pool.token_x?.decimals ?? 6;
      const tokenYDecimals = pool.token_y?.decimals ?? 6;

      const positions = info.lbPairPositionsData ?? [];
      console.log('[fetchUserPositions] Found', positions.length, 'positions in pool', lbPairAddress);
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
        const appPos = await toAppPosition(
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

    console.log('[fetchUserPositions] Total positions found:', results.length);
    return results;
  } catch (e) {
    console.error('[fetchUserPositions] Error:', e);
    const msg = e instanceof Error ? e.message : String(e);
    const stack = e instanceof Error ? e.stack : undefined;
    console.error('[fetchUserPositions] Error message:', msg);
    console.error('[fetchUserPositions] Error stack:', stack);
    
    if (/feeAmountXPerTokenStored|undefined/.test(msg)) {
      throw new Error('Meteora SDK failed to parse positions for this wallet. Try again or use a different RPC.');
    }
    // Re-throw with more context
    throw new Error(`Failed to fetch positions: ${msg}${stack ? `\n${stack}` : ''}`);
  }
}

export function clearPoolCache(): void {
  poolCache.clear();
}
