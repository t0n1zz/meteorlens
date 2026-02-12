/**
 * Entry snapshot service: Store first-seen position value for accurate IL calculation.
 * Persisted per position (by publicKey) in AsyncStorage.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../utils/constants';

interface EntrySnapshot {
  valueUsd: number;
  tokenXAmount: number;
  tokenYAmount: number;
  price: number;
  timestamp: number;
}

const ENTRY_SNAPSHOTS_KEY = STORAGE_KEYS.ENTRY_SNAPSHOTS;

let snapshotCache: Map<string, EntrySnapshot> | null = null;

async function loadSnapshots(): Promise<Map<string, EntrySnapshot>> {
  if (snapshotCache) return snapshotCache;
  
  try {
    const stored = await AsyncStorage.getItem(ENTRY_SNAPSHOTS_KEY);
    if (stored) {
      const data = JSON.parse(stored) as Record<string, EntrySnapshot>;
      snapshotCache = new Map(Object.entries(data));
    } else {
      snapshotCache = new Map();
    }
  } catch {
    snapshotCache = new Map();
  }
  return snapshotCache;
}

async function saveSnapshots(snapshots: Map<string, EntrySnapshot>): Promise<void> {
  snapshotCache = snapshots;
  const data = Object.fromEntries(snapshots);
  await AsyncStorage.setItem(ENTRY_SNAPSHOTS_KEY, JSON.stringify(data));
}

/**
 * Get entry snapshot for a position, or create one if it doesn't exist.
 */
export async function getOrCreateEntrySnapshot(
  positionPubkey: string,
  currentValueUsd: number,
  tokenXAmount: number,
  tokenYAmount: number,
  currentPrice: number
): Promise<EntrySnapshot> {
  const snapshots = await loadSnapshots();
  const existing = snapshots.get(positionPubkey);
  
  if (existing) {
    return existing;
  }
  
  // Create new snapshot
  const snapshot: EntrySnapshot = {
    valueUsd: currentValueUsd,
    tokenXAmount,
    tokenYAmount,
    price: currentPrice,
    timestamp: Date.now(),
  };
  
  snapshots.set(positionPubkey, snapshot);
  await saveSnapshots(snapshots);
  return snapshot;
}

/**
 * Get entry snapshot for a position (returns null if not found).
 */
export async function getEntrySnapshot(positionPubkey: string): Promise<EntrySnapshot | null> {
  const snapshots = await loadSnapshots();
  return snapshots.get(positionPubkey) ?? null;
}

/**
 * Clear entry snapshot for a position (e.g., when position is closed).
 */
export async function clearEntrySnapshot(positionPubkey: string): Promise<void> {
  const snapshots = await loadSnapshots();
  snapshots.delete(positionPubkey);
  await saveSnapshots(snapshots);
}

/**
 * Clear all entry snapshots (for testing or reset).
 */
export async function clearAllEntrySnapshots(): Promise<void> {
  snapshotCache = new Map();
  await AsyncStorage.removeItem(ENTRY_SNAPSHOTS_KEY);
}
