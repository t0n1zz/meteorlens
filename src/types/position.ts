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
}

export interface PositionPnL {
  totalPnlUsd: number;
  totalPnlPercent: number;
  feeIncomeUsd: number;
  impermanentLossUsd: number;
  impermanentLossPercent: number;
  netPnlUsd: number;
  holdValueUsd?: number;
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
}
