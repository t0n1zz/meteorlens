import { useCallback, useEffect, useRef } from 'react';
import { usePositionsStore } from '../store/positionsStore';
import { useAddressesStore } from '../store/addressesStore';
import { fetchUserPositions } from '../services/meteora/positions';
import { validateAddress } from '../services/solana/addressValidator';

const POSITIONS_REFRESH_MS = 30_000;

export function usePositions() {
  const { positions, loading, error, setPositions, setLoading, setError, reset } = usePositionsStore();
  const activeAddress = useAddressesStore((s) => s.activeAddress);
  const loadPositionsRef = useRef<(addr: string) => Promise<void>>(() => Promise.resolve());

  loadPositionsRef.current = async (walletAddress: string) => {
    const { valid, normalized, error: validationError } = validateAddress(walletAddress);
    if (!valid || !normalized) {
      setError(validationError ?? 'Invalid address');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await fetchUserPositions(normalized);
      setPositions(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load positions');
      setPositions([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPositions = useCallback(async (walletAddress: string) => {
    await loadPositionsRef.current(walletAddress);
  }, []);

  useEffect(() => {
    if (!activeAddress) return;
    loadPositionsRef.current(activeAddress);
    const interval = setInterval(() => {
      loadPositionsRef.current(activeAddress);
    }, POSITIONS_REFRESH_MS);
    return () => clearInterval(interval);
  }, [activeAddress]);

  const clearPositions = useCallback(() => {
    reset();
  }, [reset]);

  return {
    positions,
    loading,
    error,
    loadPositions,
    clearPositions,
  };
}
