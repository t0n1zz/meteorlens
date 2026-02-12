import { useCallback } from 'react';
import { usePositionsStore } from '../store/positionsStore';
import { fetchUserPositions } from '../services/meteora/positions';
import { validateAddress } from '../services/solana/addressValidator';

export function usePositions() {
  const { positions, loading, error, setPositions, setLoading, setError, reset } = usePositionsStore();

  const loadPositions = useCallback(
    async (walletAddress: string) => {
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
    },
    [setPositions, setLoading, setError]
  );

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
