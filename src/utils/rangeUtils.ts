/**
 * Range utilities: Calculate distance to range edges, bin prices, etc.
 */

/**
 * Calculate approximate price for a bin ID.
 * Price formula: price = (1 + binStep/10000) ^ (binId - activeBinId) * activePrice
 * Simplified: price ≈ activePrice * (1 + binStep/10000) ^ (binId - activeBinId)
 */
export function calculateBinPrice(
  binId: number,
  activeBinId: number,
  activePrice: number,
  binStep: number
): number {
  if (binId === activeBinId) return activePrice;
  const stepRatio = 1 + binStep / 10000;
  const diff = binId - activeBinId;
  return activePrice * Math.pow(stepRatio, diff);
}

/**
 * Calculate distance from current price to range edges.
 * Returns percentage distance to min and max bin prices.
 */
export function calculateDistanceToEdges(
  currentPrice: number,
  minBinId: number,
  maxBinId: number,
  activeBinId: number,
  activePrice: number,
  binStep: number
): {
  distanceToMinPercent: number;
  distanceToMaxPercent: number;
  priceAtMin: number;
  priceAtMax: number;
} {
  const priceAtMin = calculateBinPrice(minBinId, activeBinId, activePrice, binStep);
  const priceAtMax = calculateBinPrice(maxBinId, activeBinId, activePrice, binStep);
  
  // Distance as percentage of range width
  const rangeWidth = priceAtMax - priceAtMin;
  const distanceToMin = currentPrice - priceAtMin;
  const distanceToMax = priceAtMax - currentPrice;
  
  const distanceToMinPercent = rangeWidth > 0 ? (distanceToMin / rangeWidth) * 100 : 0;
  const distanceToMaxPercent = rangeWidth > 0 ? (distanceToMax / rangeWidth) * 100 : 0;
  
  return {
    distanceToMinPercent,
    distanceToMaxPercent,
    priceAtMin,
    priceAtMax,
  };
}
