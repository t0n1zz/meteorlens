/**
 * PnL history: Store position value and PnL over time for charts.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../utils/constants';

export interface PnLHistoryPoint {
  timestamp: number;
  valueUsd: number;
  totalPnlUsd: number;
  totalPnlPercent: number;
}

const PNL_HISTORY_KEY = `${STORAGE_KEYS.SETTINGS}_pnl_history`;
const MAX_POINTS_PER_POSITION = 200;
const MIN_INTERVAL_MS = 60 * 60 * 1000; // 1 hour between points

let historyCache: Map<string, PnLHistoryPoint[]> | null = null;

async function loadHistory(): Promise<Map<string, PnLHistoryPoint[]>> {
  if (historyCache) return historyCache;
  try {
    const stored = await AsyncStorage.getItem(PNL_HISTORY_KEY);
    if (stored) {
      const data = JSON.parse(stored) as Record<string, PnLHistoryPoint[]>;
      historyCache = new Map(Object.entries(data));
    } else {
      historyCache = new Map();
    }
  } catch {
    historyCache = new Map();
  }
  return historyCache;
}

async function saveHistory(map: Map<string, PnLHistoryPoint[]>): Promise<void> {
  historyCache = map;
  const data = Object.fromEntries(map);
  await AsyncStorage.setItem(PNL_HISTORY_KEY, JSON.stringify(data));
}

/**
 * Record a PnL snapshot for a position (throttled to ~1 per hour).
 */
export async function recordPnLHistory(
  positionPubkey: string,
  valueUsd: number,
  totalPnlUsd: number,
  totalPnlPercent: number
): Promise<void> {
  const map = await loadHistory();
  const points = map.get(positionPubkey) ?? [];
  const now = Date.now();
  const last = points[points.length - 1];

  if (last && now - last.timestamp < MIN_INTERVAL_MS) return;

  points.push({
    timestamp: now,
    valueUsd,
    totalPnlUsd,
    totalPnlPercent,
  });

  if (points.length > MAX_POINTS_PER_POSITION) {
    points.splice(0, points.length - MAX_POINTS_PER_POSITION);
  }

  map.set(positionPubkey, points);
  await saveHistory(map);
}

/**
 * Get PnL history for a position (last N points).
 */
export async function getPnLHistory(
  positionPubkey: string,
  limit = 30
): Promise<PnLHistoryPoint[]> {
  const map = await loadHistory();
  const points = map.get(positionPubkey) ?? [];
  return points.slice(-limit);
}

/**
 * Get portfolio-level PnL history (aggregate all positions by timestamp bucket).
 */
export async function getPortfolioPnLHistory(
  positionPubkeys: string[],
  limit = 30
): Promise<PnLHistoryPoint[]> {
  if (positionPubkeys.length === 0) return [];
  const map = await loadHistory();
  const byTime = new Map<number, { valueUsd: number; totalPnlUsd: number }>();

  for (const pubkey of positionPubkeys) {
    const points = map.get(pubkey) ?? [];
    for (const p of points) {
      const bucket = Math.floor(p.timestamp / MIN_INTERVAL_MS) * MIN_INTERVAL_MS;
      const existing = byTime.get(bucket) ?? { valueUsd: 0, totalPnlUsd: 0 };
      byTime.set(bucket, {
        valueUsd: existing.valueUsd + p.valueUsd,
        totalPnlUsd: existing.totalPnlUsd + p.totalPnlUsd,
      });
    }
  }

  const sorted = Array.from(byTime.entries())
    .sort((a, b) => a[0] - b[0])
    .slice(-limit)
    .map(([timestamp, { valueUsd, totalPnlUsd }]) => ({
      timestamp,
      valueUsd,
      totalPnlUsd,
      totalPnlPercent: valueUsd > 0 ? (totalPnlUsd / (valueUsd - totalPnlUsd)) * 100 : 0,
    }));

  return sorted;
}
