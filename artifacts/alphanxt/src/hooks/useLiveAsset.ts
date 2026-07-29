import { useEffect, useRef, useState } from 'react';
import {
  fetchLiveQuote,
  isLiveDataConfigured,
  type LiveQuoteResult,
} from '@/lib/marketDataService';

const POLL_INTERVAL_MS = 20_000; // 3 requests/min per open screen — safe under the 8/min free-tier cap

interface UseLiveAssetResult {
  /** Live price if available, otherwise null (caller should fall back to static data). */
  livePrice: number | null;
  liveChange: number | null;
  liveChangePercent: number | null;
  series: LiveQuoteResult['series'];
  isLive: boolean;
  liveLoading: boolean;
  liveError: string | null;
}

/**
 * Polls Twelve Data for a symbol's latest price + intraday series.
 * Silently reports `liveError` on failure — callers should keep showing
 * placeholder data rather than blocking the UI when live data is unavailable.
 */
export function useLiveAsset(symbol: string | undefined): UseLiveAssetResult {
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

    const poll = async () => {
      try {
        const data = await fetchLiveQuote(symbol);
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
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [symbol]);

  return {
    livePrice: result?.price ?? null,
    liveChange: result?.change ?? null,
    liveChangePercent: result?.changePercent ?? null,
    series: result?.series ?? [],
    isLive: result !== null && !liveError,
    liveLoading,
    liveError,
  };
}
