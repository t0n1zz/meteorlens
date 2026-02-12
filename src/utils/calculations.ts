/**
 * PnL and impermanent loss calculations.
 * IL = ((LP_value - fees) / Hold_value - 1) * 100
 */

export interface PnLInput {
  currentValueUsd: number;
  initialValueUsd: number;
  feesEarnedUsd: number;
}

/**
 * Hold value = value if user had just held the initial token amounts.
 * We need initial token amounts and current prices; if not available we use initialValueUsd
 * as proxy for "value at entry" and currentValueUsd for "value now" (LP value before fees).
 */
export interface ILInput {
  /** Current position value (tokens at current price) before adding fees */
  currentLpValueUsd: number;
  /** Value if user had held initial amounts (initial_token_a * price_a + initial_token_b * price_b) now */
  holdValueUsd: number;
  feesEarnedUsd: number;
}

/**
 * Net PnL: (current value + fees) - initial investment.
 */
export function computeTotalPnl(input: PnLInput): { pnlUsd: number; pnlPercent: number } {
  const { currentValueUsd, initialValueUsd, feesEarnedUsd } = input;
  const totalNow = currentValueUsd + feesEarnedUsd;
  const pnlUsd = totalNow - initialValueUsd;
  const pnlPercent = initialValueUsd > 0 ? (pnlUsd / initialValueUsd) * 100 : 0;
  return { pnlUsd, pnlPercent };
}

/**
 * Impermanent loss (relative to holding).
 * IL % = ((LP_value_without_fees / Hold_value) - 1) * 100
 * So LP_value_without_fees = currentLpValueUsd (position value in tokens at current price).
 */
export function computeImpermanentLoss(input: ILInput): {
  ilUsd: number;
  ilPercent: number;
  netLpVsHold: number;
} {
  const { currentLpValueUsd, holdValueUsd, feesEarnedUsd } = input;
  if (holdValueUsd <= 0) {
    return { ilUsd: 0, ilPercent: 0, netLpVsHold: 0 };
  }
  const ilRatio = currentLpValueUsd / holdValueUsd;
  const ilPercent = (ilRatio - 1) * 100;
  const ilUsd = currentLpValueUsd - holdValueUsd;
  const netLpVsHold = currentLpValueUsd + feesEarnedUsd - holdValueUsd;
  return { ilUsd, ilPercent, netLpVsHold };
}

/**
 * Combined PnL with fee income and IL.
 */
export function computeFullPnl(
  currentValueUsd: number,
  initialValueUsd: number,
  feesEarnedUsd: number,
  holdValueUsd?: number
): {
  totalPnlUsd: number;
  totalPnlPercent: number;
  feeIncomeUsd: number;
  impermanentLossUsd: number;
  impermanentLossPercent: number;
  netPnlUsd: number;
  holdValueUsd: number;
} {
  const hold = holdValueUsd ?? initialValueUsd;
  const { pnlUsd: totalPnlUsd, pnlPercent: totalPnlPercent } = computeTotalPnl({
    currentValueUsd,
    initialValueUsd,
    feesEarnedUsd,
  });
  const { ilUsd: impermanentLossUsd, ilPercent: impermanentLossPercent } = computeImpermanentLoss({
    currentLpValueUsd: currentValueUsd,
    holdValueUsd: hold,
    feesEarnedUsd,
  });
  return {
    totalPnlUsd,
    totalPnlPercent,
    feeIncomeUsd: feesEarnedUsd,
    impermanentLossUsd,
    impermanentLossPercent,
    netPnlUsd: totalPnlUsd,
    holdValueUsd: hold,
  };
}
