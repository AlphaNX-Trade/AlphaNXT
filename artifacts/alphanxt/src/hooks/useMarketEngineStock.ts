import { useEffect, useState } from 'react';
import { marketEngine } from '@/lib/marketEngine/engine';
import type { SimulatedStockState, EngineTickPoint } from '@/lib/marketEngine/types';

interface UseMarketEngineStockResult {
  state: SimulatedStockState | undefined;
  history: EngineTickPoint[];
}

/**
 * Subscribes to a single symbol's continuous simulated price updates.
 * Only this component re-renders on each tick — other stocks' subscribers
 * are unaffected, which is what makes this scale to hundreds of symbols.
 */
export function useMarketEngineStock(symbol: string | undefined): UseMarketEngineStockResult {
  const [state, setState] = useState<SimulatedStockState | undefined>(
    symbol ? marketEngine.getSnapshot(symbol) : undefined,
  );
  const [history, setHistory] = useState<EngineTickPoint[]>(symbol ? marketEngine.getHistory(symbol) : []);

  useEffect(() => {
    if (!symbol) return;

    // Sync immediately in case the engine ticked between initial state and this effect running.
    setState(marketEngine.getSnapshot(symbol));
    setHistory(marketEngine.getHistory(symbol));

    const unsubscribe = marketEngine.subscribe(symbol, (next) => {
      setState({ ...next });
      setHistory(marketEngine.getHistory(symbol));
    });

    return unsubscribe;
  }, [symbol]);

  return { state, history };
}
