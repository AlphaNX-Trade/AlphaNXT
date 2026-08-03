import { useEffect, useState } from 'react';
import { marketEngine } from '@/lib/marketEngine/engine';
import type { SimulatedStockState } from '@/lib/marketEngine/types';

/** Subscribes to every stock's state at once — for list/grid views (Markets, Dashboard indices). */
export function useMarketEngineList(): SimulatedStockState[] {
  const [snapshots, setSnapshots] = useState<SimulatedStockState[]>(marketEngine.getAllSnapshots());

  useEffect(() => {
    setSnapshots(marketEngine.getAllSnapshots());
    const unsubscribe = marketEngine.subscribeAll(() => {
      setSnapshots(marketEngine.getAllSnapshots());
    });
    return unsubscribe;
  }, []);

  return snapshots;
}
