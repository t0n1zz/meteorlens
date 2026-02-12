/**
 * Risk score (0-100) for a DLMM position.
 * Weighted: IL risk 20%, pool health 25%, liquidity concentration 15%,
 * range management 15%, token risk 15%, money flow 10%.
 * Token risk and money flow use placeholders until Phase 3.
 */
import type { AppPosition } from '../../types/position';
import type { PoolMetrics } from '../../types/pool';
import type { RiskScore, RiskScoreBreakdown, RiskLevel } from '../../types/risk';
import { RISK_GREEN_MIN, RISK_YELLOW_MIN } from '../../utils/constants';
import { calculateMoneyFlowFromVolume, calculateMoneyFlowRiskComponent } from './moneyFlow';

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * IL risk 0-100: higher IL % = lower score.
 * 0% IL => 100, 5% => 50, 10%+ => 0.
 */
function scoreIlRisk(ilPercent: number): number {
  const abs = Math.abs(ilPercent);
  if (abs <= 0.5) return 100;
  return clamp(100 - abs * 10, 0, 100);
}

/**
 * Pool health from volume/TVL ratio. Healthy band 0.3-3x => 100.
 */
function scorePoolHealth(pool: PoolMetrics | null): number {
  if (!pool?.tvl || pool.tvl <= 0) return 50;
  const vol24 = pool.volume?.['24h'] ?? 0;
  const ratio = vol24 / pool.tvl;
  if (ratio >= 0.3 && ratio <= 3) return 100;
  if (ratio > 0 && ratio < 0.3) return 50 + (ratio / 0.3) * 50;
  if (ratio > 3) return clamp(100 - (ratio - 3) * 10, 0, 100);
  return 30; // no volume
}

/**
 * Liquidity concentration: user's share of pool. <10% = 100, >10% = lower.
 */
function scoreLiquidityConcentration(shareOfPoolPercent: number | undefined): number {
  if (shareOfPoolPercent == null || shareOfPoolPercent <= 0) return 100;
  if (shareOfPoolPercent <= 10) return 100 - shareOfPoolPercent * 2;
  return clamp(80 - (shareOfPoolPercent - 10) * 3, 0, 100);
}

/**
 * Range management: in range = 100, out = 40.
 */
function scoreRangeManagement(inRange: boolean): number {
  return inRange ? 100 : 40;
}

/**
 * Placeholder until token volatility/unlocks data in Phase 3.
 */
function scoreTokenRisk(): number {
  return 50;
}

/**
 * Money flow score: uses pool volume data to estimate flow.
 */
function scoreMoneyFlow(pool: PoolMetrics | null): number {
  if (!pool) return 50;
  const flow = calculateMoneyFlowFromVolume(pool, '24h');
  return calculateMoneyFlowRiskComponent(flow);
}

function getLevel(score: number): RiskLevel {
  if (score >= RISK_GREEN_MIN) return 'low';
  if (score >= RISK_YELLOW_MIN) return 'medium';
  return 'high';
}

/**
 * Compute risk score for a position. Uses pool when provided for TVL/volume.
 */
export function computeRiskScore(
  position: AppPosition,
  pool: PoolMetrics | null
): RiskScore {
  const ilPercent = position.pnl?.impermanentLossPercent ?? 0;
  const ilRisk = scoreIlRisk(ilPercent);
  const poolHealth = scorePoolHealth(pool);
  const liquidityConcentration = scoreLiquidityConcentration(position.shareOfPoolPercent);
  const rangeManagement = scoreRangeManagement(position.range.inRange);
  const tokenRisk = scoreTokenRisk();
  const moneyFlow = scoreMoneyFlow(pool);

  const breakdown: RiskScoreBreakdown = {
    ilRisk,
    poolHealth,
    liquidityConcentration,
    rangeManagement,
    tokenRisk,
    moneyFlow,
  };

  const score = Math.round(
    ilRisk * 0.2 +
      poolHealth * 0.25 +
      liquidityConcentration * 0.15 +
      rangeManagement * 0.15 +
      tokenRisk * 0.15 +
      moneyFlow * 0.1
  );

  const reasons: string[] = [];
  if (!position.range.inRange) reasons.push('Out of range');
  if (ilPercent < -5) reasons.push(`IL ${ilPercent.toFixed(1)}%`);
  if ((position.shareOfPoolPercent ?? 0) > 10) reasons.push('High pool share');
  if (poolHealth < 50) reasons.push('Low pool activity');

  return {
    score: clamp(score, 0, 100),
    level: getLevel(score),
    breakdown,
    reasons: reasons.length > 0 ? reasons : undefined,
  };
}
