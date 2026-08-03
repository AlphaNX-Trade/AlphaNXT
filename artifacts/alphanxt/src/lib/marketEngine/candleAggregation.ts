import type { EngineTickPoint } from './types';
import type { CandlePoint } from '@/lib/marketDataService';

/**
 * Buckets a raw tick stream (price, timestampMs) into OHLC candles at the
 * given interval — used to render candlesticks when the user zooms in on
 * the normally-smooth line chart.
 */
export function ticksToCandles(ticks: EngineTickPoint[], intervalMs: number): CandlePoint[] {
  if (ticks.length === 0) return [];

  const buckets = new Map<number, number[]>();
  for (const { time, price } of ticks) {
    const bucketStart = Math.floor(time / intervalMs) * intervalMs;
    if (!buckets.has(bucketStart)) buckets.set(bucketStart, []);
    buckets.get(bucketStart)!.push(price);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a - b)
    .map(([bucketStartMs, prices]) => ({
      time: Math.floor(bucketStartMs / 1000),
      open: prices[0],
      high: Math.max(...prices),
      low: Math.min(...prices),
      close: prices[prices.length - 1],
      volume: 0,
    }));
}
