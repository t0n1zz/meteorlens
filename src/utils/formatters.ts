/**
 * Number and currency formatting for UI.
 */

export function formatUsd(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  if (value >= 1) return `$${value.toFixed(2)}`;
  if (value >= 0.01) return `$${value.toFixed(4)}`;
  if (value === 0) return '$0.00';
  return `$${value.toFixed(6)}`;
}

export function formatPercent(value: number, decimals = 2): string {
  const fixed = value.toFixed(decimals);
  const sign = value > 0 ? '+' : '';
  return `${sign}${fixed}%`;
}

export function formatNumber(value: number, decimals = 2): string {
  if (Math.abs(value) >= 1e6) return value.toExponential(decimals);
  return value.toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: 0 });
}

export function formatTokenAmount(amount: number, symbol: string, decimals = 4): string {
  return `${formatNumber(amount, decimals)} ${symbol}`;
}
