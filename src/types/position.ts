/**
 * DLMM position as used in the app (on-chain + API fee data merged).
 */
export interface PositionRange {
  minBinId: number;
  maxBinId: number;
  activeBinId: number;
  inRange: boolean;
  priceMin?: number;
  priceMax?: number;
  currentPrice?: number;
  /** Distance from current price to min edge as % of range width */
  distanceToMinPercent?: number;
  /** Distance from current price to max edge as % of range width */
  distanceToMaxPercent?: number;
}

export interface PositionValue {
  tokenXAmount: number;
  tokenYAmount: number;
  tokenXSymbol: string;
  tokenYSymbol: string;
  valueUsd: number;
  valueTokenXUsd: number;
  valueTokenYUsd: number;
}

export interface PositionFees {
  feeApr24h?: number;
  feeApy24h?: number;
  dailyFeeYield?: number;
  totalFeeUsdClaimed?: number;
  totalFeeXClaimed?: number;
  totalFeeYClaimed?: number;
  totalRewardUsdClaimed?: number;
  /** Fee growth over time periods (from tracking) */
  feePeriods?: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  /** Average fee growth rate (USD per day) */
  feeGrowthRatePerDay?: number;
}

export interface PositionPnL {
  totalPnlUsd: number;
  totalPnlPercent: number;
  feeIncomeUsd: number;
  impermanentLossUsd: number;
  impermanentLossPercent: number;
  netPnlUsd: number;
  holdValueUsd?: number;
  /** ROI % = (totalPnlUsd / initialValueUsd) * 100 */
  roiPercent?: number;
}

export interface AppPosition {
  publicKey: string;
  lbPair: string;
  owner: string;
  range: PositionRange;
  value: PositionValue;
  fees: PositionFees;
  pnl?: PositionPnL;
  createdAt?: number;
  pairName: string;
  shareOfPoolPercent?: number;
  /** Computed in services/analytics/risk.ts */
  riskScore?: { score: number; level: 'low' | 'medium' | 'high'; reasons?: string[] };
}
