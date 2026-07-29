import { useEffect, useRef, useState } from 'react';
import {
  fetchLiveQuote,
  isLiveDataConfigured,
  type LiveQuoteResult,
  type ChartTimeframe,
} from '@/lib/marketDataService';

const POLL_INTERVAL_MS = 20_000; // 3 requests/min per open screen — safe under the 8/min free-tier cap

interface UseLiveAssetResult {
  /** Live price if available, otherwise null (caller should fall back to static data). */
  livePrice: number | null;
  liveChange: number | null;
  liveChangePercent: number | null;
  series: LiveQuoteResult['series'];
  candles: LiveQuoteResult['candles'];
  isLive: boolean;
  liveLoading: boolean;
  liveError: string | null;
}

/**
 * Polls Twelve Data for a symbol's latest price + candle series at the given
 * timeframe. Silently reports `liveError` on failure — callers should keep
 * showing placeholder data rather than blocking the UI when live data fails.
 */
export function useLiveAsset(
  symbol: string | undefined,
  timeframe: ChartTimeframe = '5min',
): UseLiveAssetResult {
  const [result, setResult] = useState<LiveQuoteResult | null>(null);
  const [liveLoading, setLiveLoading] = useState(true);
  const [liveError, setLiveError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!symbol || !isLiveDataConfigured()) {
      setLiveLoading(false);
      setResult(null);
      return;
    }

    let cancelled = false;
    setLiveLoading(true);

    const poll = async () => {
      try {
        const data = await fetchLiveQuote(symbol, timeframe);
        if (!cancelled) {
          setResult(data);
          setLiveError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setLiveError(err instanceof Error ? err.message : 'Failed to load live data.');
        }
      } finally {
        if (!cancelled) setLiveLoading(false);
      }
    };

    poll();
    // Slower timeframes don't need fast polling — every 20s is plenty for
    // a 1-day candle, but even a 1-minute chart only needs a new candle
    // roughly once a minute, so a fixed 20s poll comfortably covers all of them.
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [symbol, timeframe]);

  return {
    livePrice: result?.price ?? null,
    liveChange: result?.change ?? null,
    liveChangePercent: result?.changePercent ?? null,
    series: result?.series ?? [],
    candles: result?.candles ?? [],
    isLive: result !== null && !liveError,
    liveLoading,
    liveError,
  };
}
