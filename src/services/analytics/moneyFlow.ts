/**
 * Money flow analytics: Track in/out flows, large transactions, buy/sell pressure.
 * Phase 3 foundation - can be extended with RPC transaction history or Meteora API data.
 */
import type { PoolMetrics } from '../../types/pool';

export interface MoneyFlowMetrics {
  /** Net flow (in - out) in USD over period */
  netFlowUsd: number;
  /** Total inflow USD */
  totalInflowUsd: number;
  /** Total outflow USD */
  totalOutflowUsd: number;
  /** Number of large transactions (>$10k) */
  largeTxCount: number;
  /** Buy pressure score (0-100) - higher = more buying */
  buyPressureScore: number;
  /** Accumulation/distribution score (-100 to +100) */
  accumulationScore: number;
}

export interface FlowPeriod {
  '24h': MoneyFlowMetrics;
  '7d': MoneyFlowMetrics;
  '30d': MoneyFlowMetrics;
}

/**
 * Calculate money flow metrics from pool volume data.
 * This is a simplified version - full implementation would analyze swap transactions.
 */
export function calculateMoneyFlowFromVolume(
  pool: PoolMetrics | null,
  period: '24h' | '7d' | '30d' = '24h'
): MoneyFlowMetrics {
  if (!pool?.volume) {
    return {
      netFlowUsd: 0,
      totalInflowUsd: 0,
      totalOutflowUsd: 0,
      largeTxCount: 0,
      buyPressureScore: 50, // Neutral
      accumulationScore: 0,
    };
  }

  const volume = pool.volume[period] ?? pool.volume['24h'] ?? 0;
  
  // Simplified: assume volume indicates activity
  // In a full implementation, we'd analyze swap direction (X->Y vs Y->X)
  // For now, use volume/TVL ratio as a proxy for flow intensity
  const tvl = pool.tvl ?? 1;
  const volumeRatio = volume / tvl;
  
  // Estimate: higher volume ratio = more flow activity
  // This is a placeholder - real implementation needs transaction analysis
  const estimatedInflow = volume * 0.5; // Assume 50% is inflow
  const estimatedOutflow = volume * 0.5; // Assume 50% is outflow
  const netFlow = estimatedInflow - estimatedOutflow;
  
  // Estimate large transactions (assume 1% of volume is large tx)
  const largeTxCount = Math.floor(volume / 10000);
  
  // Buy pressure: higher volume with price increase = buying pressure
  // Simplified: use volume ratio as proxy
  const buyPressureScore = Math.min(100, Math.max(0, 50 + (volumeRatio * 10)));
  
  // Accumulation score: positive net flow = accumulation
  const accumulationScore = Math.min(100, Math.max(-100, (netFlow / tvl) * 100));

  return {
    netFlowUsd: netFlow,
    totalInflowUsd: estimatedInflow,
    totalOutflowUsd: estimatedOutflow,
    largeTxCount,
    buyPressureScore,
    accumulationScore,
  };
}

/**
 * Get money flow for all periods.
 */
export function getFlowPeriods(pool: PoolMetrics | null): FlowPeriod {
  return {
    '24h': calculateMoneyFlowFromVolume(pool, '24h'),
    '7d': calculateMoneyFlowFromVolume(pool, '7d'),
    '30d': calculateMoneyFlowFromVolume(pool, '30d'),
  };
}

/**
 * Calculate money flow component for risk score (0-100).
 * Higher flow = lower risk (more liquidity).
 */
export function calculateMoneyFlowRiskComponent(flow: MoneyFlowMetrics): number {
  // Higher buy pressure = lower risk
  // Higher accumulation = lower risk
  // More large tx = higher risk (volatility)
  
  const buyPressureScore = flow.buyPressureScore;
  const accumulationScore = Math.max(0, flow.accumulationScore); // Only positive accumulation reduces risk
  const largeTxPenalty = Math.min(30, flow.largeTxCount * 2); // Penalize for many large tx
  
  let score = (buyPressureScore * 0.6) + (accumulationScore * 0.4);
  score = Math.max(0, score - largeTxPenalty);
  
  return Math.round(Math.min(100, score));
}
