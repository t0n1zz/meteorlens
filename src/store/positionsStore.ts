/**
 * Zustand store for current wallet positions and loading state.
 */
import { create } from 'zustand';
import type { AppPosition } from '../types/position';

interface PositionsState {
  positions: AppPosition[];
  loading: boolean;
  error: string | null;
  lastFetchedAt: number | null;
  setPositions: (positions: AppPosition[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const usePositionsStore = create<PositionsState>((set) => ({
  positions: [],
  loading: false,
  error: null,
  lastFetchedAt: null,

  setPositions: (positions) => set({ positions, error: null, lastFetchedAt: Date.now() }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
  reset: () => set({ positions: [], error: null, lastFetchedAt: null }),
}));
