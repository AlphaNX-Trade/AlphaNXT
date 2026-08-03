import { marketEngine } from './engine';
import { ALL_ASSETS } from '@/data/marketData';

let initialized = false;

/**
 * Seeds the engine with AlphaNXT's real stock/index list (not fabricated
 * filler companies — see the conversation this was scoped in) and starts
 * continuous ticking. Idempotent — safe to call from multiple components
 * without double-starting the engine (important for Vite HMR in dev).
 */
export function ensureMarketEngineRunning(): void {
  if (initialized) return;
  initialized = true;

  marketEngine.seed(
    ALL_ASSETS.map((a) => ({
      symbol: a.symbol,
      name: a.name,
      price: a.price,
      sector: a.sector,
      type: a.type,
    })),
  );
  marketEngine.start();
}
