import { useCallback, useState } from 'react';
import { getPoolMetrics } from '../services/meteora/pools';
import type { PoolMetrics } from '../types/pool';

export function usePoolData() {
  const [pool, setPool] = useState<PoolMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPool = useCallback(async (poolAddress: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPoolMetrics(poolAddress);
      setPool(data);
      return data;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load pool');
      setPool(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setPool(null);
    setError(null);
  }, []);

  return { pool, loading, error, fetchPool, clear };
}
