/**
 * Risk score and components for a position or pool.
 */
export type RiskLevel = 'low' | 'medium' | 'high';

export interface RiskScoreBreakdown {
  ilRisk: number;
  poolHealth: number;
  liquidityConcentration: number;
  rangeManagement: number;
  tokenRisk: number;
  moneyFlow: number;
}

export interface RiskScore {
  score: number;
  level: RiskLevel;
  breakdown?: RiskScoreBreakdown;
  reasons?: string[];
}
