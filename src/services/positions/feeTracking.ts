/**
 * Fee tracking over time: Store historical fee snapshots and calculate fees per day/week/month.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../utils/constants';

interface FeeSnapshot {
  totalFeeUsdClaimed: number;
  totalFeeXClaimed: number;
  totalFeeYClaimed: number;
  timestamp: number;
}

interface FeePeriod {
  daily: number;
  weekly: number;
  monthly: number;
}

const FEE_SNAPSHOTS_KEY = `${STORAGE_KEYS.SETTINGS}_fee_snapshots`;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_WEEK = 7 * MS_PER_DAY;
const MS_PER_MONTH = 30 * MS_PER_DAY;

let feeCache: Map<string, FeeSnapshot[]> | null = null;

async function loadFeeSnapshots(): Promise<Map<string, FeeSnapshot[]>> {
  if (feeCache) return feeCache;
  
  try {
    const stored = await AsyncStorage.getItem(FEE_SNAPSHOTS_KEY);
    if (stored) {
      const data = JSON.parse(stored) as Record<string, FeeSnapshot[]>;
      feeCache = new Map(Object.entries(data));
    } else {
      feeCache = new Map();
    }
  } catch {
    feeCache = new Map();
  }
  return feeCache;
}

async function saveFeeSnapshots(snapshots: Map<string, FeeSnapshot[]>): Promise<void> {
  feeCache = snapshots;
  const data = Object.fromEntries(snapshots);
  await AsyncStorage.setItem(FEE_SNAPSHOTS_KEY, JSON.stringify(data));
}

/**
 * Record a fee snapshot for a position.
 */
export async function recordFeeSnapshot(
  positionPubkey: string,
  totalFeeUsdClaimed: number,
  totalFeeXClaimed: number,
  totalFeeYClaimed: number
): Promise<void> {
  const snapshots = await loadFeeSnapshots();
  const existing = snapshots.get(positionPubkey) ?? [];
  
  // Add new snapshot
  const snapshot: FeeSnapshot = {
    totalFeeUsdClaimed,
    totalFeeXClaimed,
    totalFeeYClaimed,
    timestamp: Date.now(),
  };
  
  // Keep only last 90 days of snapshots
  const cutoff = Date.now() - (90 * MS_PER_DAY);
  const filtered = existing.filter((s) => s.timestamp > cutoff);
  filtered.push(snapshot);
  
  snapshots.set(positionPubkey, filtered);
  await saveFeeSnapshots(snapshots);
}

/**
 * Calculate fee growth over different time periods.
 */
export async function calculateFeePeriods(positionPubkey: string): Promise<FeePeriod | null> {
  const snapshots = await loadFeeSnapshots();
  const positionSnapshots = snapshots.get(positionPubkey) ?? [];
  
  if (positionSnapshots.length < 2) return null;
  
  // Sort by timestamp (oldest first)
  const sorted = [...positionSnapshots].sort((a, b) => a.timestamp - b.timestamp);
  const latest = sorted[sorted.length - 1];
  const now = Date.now();
  
  // Find snapshots within each period
  const dayAgo = now - MS_PER_DAY;
  const weekAgo = now - MS_PER_WEEK;
  const monthAgo = now - MS_PER_MONTH;
  
  const daySnapshot = sorted.find((s) => s.timestamp >= dayAgo) ?? sorted[0];
  const weekSnapshot = sorted.find((s) => s.timestamp >= weekAgo) ?? sorted[0];
  const monthSnapshot = sorted.find((s) => s.timestamp >= monthAgo) ?? sorted[0];
  
  return {
    daily: latest.totalFeeUsdClaimed - daySnapshot.totalFeeUsdClaimed,
    weekly: latest.totalFeeUsdClaimed - weekSnapshot.totalFeeUsdClaimed,
    monthly: latest.totalFeeUsdClaimed - monthSnapshot.totalFeeUsdClaimed,
  };
}

/**
 * Get fee growth rate (fees per day average).
 */
export async function getFeeGrowthRate(positionPubkey: string): Promise<number | null> {
  const periods = await calculateFeePeriods(positionPubkey);
  if (!periods) return null;
  
  // Use weekly average if available, else daily
  if (periods.weekly > 0) {
    return periods.weekly / 7;
  }
  return periods.daily;
}
