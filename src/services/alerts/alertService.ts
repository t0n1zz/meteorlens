/**
 * Alert service: Check positions for alert conditions and generate alerts.
 */
import type { AppPosition } from '../../types/position';
import type { PoolMetrics } from '../../types/pool';

export type AlertType = 'out_of_range' | 'high_il' | 'high_risk' | 'tvl_drop' | 'low_fees';

export interface Alert {
  id: string;
  type: AlertType;
  positionKey: string;
  pairName: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: number;
}

interface AlertThresholds {
  ilPercentThreshold: number; // Alert if IL > this %
  riskScoreThreshold: number; // Alert if risk score < this
  tvlDropPercentThreshold: number; // Alert if TVL dropped > this %
  minFeeGrowthPerDay: number; // Alert if fee growth < this USD/day
}

const DEFAULT_THRESHOLDS: AlertThresholds = {
  ilPercentThreshold: -10, // Alert if IL worse than -10%
  riskScoreThreshold: 50, // Alert if risk score below 50
  tvlDropPercentThreshold: 20, // Alert if TVL dropped >20%
  minFeeGrowthPerDay: 0.01, // Alert if fees growing < $0.01/day
};

/**
 * Check a position for alert conditions.
 */
export function checkPositionAlerts(
  position: AppPosition,
  pool: PoolMetrics | null,
  thresholds: Partial<AlertThresholds> = {}
): Alert[] {
  const t = { ...DEFAULT_THRESHOLDS, ...thresholds };
  const alerts: Alert[] = [];
  const now = Date.now();

  // Out of range alert
  if (!position.range.inRange) {
    alerts.push({
      id: `${position.publicKey}-out-of-range-${now}`,
      type: 'out_of_range',
      positionKey: position.publicKey,
      pairName: position.pairName,
      message: `${position.pairName} position is out of range`,
      severity: 'medium',
      timestamp: now,
    });
  }

  // High IL alert
  if (position.pnl && position.pnl.impermanentLossPercent < t.ilPercentThreshold) {
    alerts.push({
      id: `${position.publicKey}-high-il-${now}`,
      type: 'high_il',
      positionKey: position.publicKey,
      pairName: position.pairName,
      message: `${position.pairName} has high impermanent loss: ${position.pnl.impermanentLossPercent.toFixed(1)}%`,
      severity: 'high',
      timestamp: now,
    });
  }

  // High risk alert
  if (position.riskScore && position.riskScore.score < t.riskScoreThreshold) {
    alerts.push({
      id: `${position.publicKey}-high-risk-${now}`,
      type: 'high_risk',
      positionKey: position.publicKey,
      pairName: position.pairName,
      message: `${position.pairName} has high risk score: ${position.riskScore.score}/100`,
      severity: position.riskScore.score < 30 ? 'high' : 'medium',
      timestamp: now,
    });
  }

  // Low fee growth alert (if tracking available)
  if (position.fees.feeGrowthRatePerDay != null && position.fees.feeGrowthRatePerDay < t.minFeeGrowthPerDay) {
    alerts.push({
      id: `${position.publicKey}-low-fees-${now}`,
      type: 'low_fees',
      positionKey: position.publicKey,
      pairName: position.pairName,
      message: `${position.pairName} has low fee growth: ${position.fees.feeGrowthRatePerDay.toFixed(2)} USD/day`,
      severity: 'low',
      timestamp: now,
    });
  }

  // TVL drop alert (if pool data available)
  if (pool?.tvl != null && position.shareOfPoolPercent != null) {
    // This would require historical TVL data - for now we skip
    // Could be implemented with TVL snapshots similar to fee tracking
  }

  return alerts;
}

/**
 * Check all positions and return all alerts.
 */
export function checkAllPositionsAlerts(
  positions: AppPosition[],
  pools: Map<string, PoolMetrics>,
  thresholds?: Partial<AlertThresholds>
): Alert[] {
  const allAlerts: Alert[] = [];
  
  for (const position of positions) {
    const pool = pools.get(position.lbPair) ?? null;
    const alerts = checkPositionAlerts(position, pool, thresholds);
    allAlerts.push(...alerts);
  }
  
  // Sort by severity (high first) then timestamp (newest first)
  return allAlerts.sort((a, b) => {
    const severityOrder = { high: 3, medium: 2, low: 1 };
    const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
    if (severityDiff !== 0) return severityDiff;
    return b.timestamp - a.timestamp;
  });
}
