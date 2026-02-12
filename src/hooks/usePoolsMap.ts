import { useEffect, useState } from 'react';
import { getPoolMetrics } from '../services/meteora/pools';
import type { PoolMetrics } from '../types/pool';
import type { AppPosition } from '../types/position';

/**
 * Hook to fetch and cache pool metrics for all positions.
 */
export function usePoolsMap(positions: AppPosition[]): Map<string, PoolMetrics> {
  const [poolsMap, setPoolsMap] = useState<Map<string, PoolMetrics>>(new Map());

  useEffect(() => {
    const fetchPools = async () => {
      const map = new Map<string, PoolMetrics>();
      const uniquePoolAddresses = new Set(positions.map((p) => p.lbPair));

      await Promise.all(
        Array.from(uniquePoolAddresses).map(async (address) => {
          try {
            const pool = await getPoolMetrics(address);
            map.set(address, pool);
          } catch (error) {
            console.warn(`Failed to fetch pool ${address}:`, error);
          }
        })
      );

      setPoolsMap(map);
    };

    if (positions.length > 0) {
      fetchPools();
    } else {
      setPoolsMap(new Map());
    }
  }, [positions.map((p) => p.lbPair).join(',')]); // Re-fetch if pool addresses change

  return poolsMap;
}
