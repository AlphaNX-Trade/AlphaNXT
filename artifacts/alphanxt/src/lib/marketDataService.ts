/**
 * Real market data integration via Twelve Data (https://twelvedata.com).
 * Free tier: 800 requests/day, 8 requests/minute — polling intervals in
 * useLiveAsset.ts are tuned to stay well under this budget.
 *
 * Requires VITE_TWELVE_DATA_API_KEY to be set (Replit: add it under the
 * Secrets tab). Falls back gracefully — callers should keep showing the
 * static placeholder price/chart if this service reports an error.
 */

const API_BASE = 'https://api.twelvedata.com';
const API_KEY = import.meta.env.VITE_TWELVE_DATA_API_KEY as string | undefined;

/**
 * Maps our internal app symbols to Twelve Data's `symbol:exchange` format.
 * Extend this as more assets are added to marketData.ts.
 */
const SYMBOL_MAP: Record<string, string> = {
  RELIANCE: 'RELIANCE:NSE',
  TCS: 'TCS:NSE',
  INFY: 'INFY:NSE',
  HDFCBANK: 'HDFCBANK:NSE',
  ICICIBANK: 'ICICIBANK:NSE',
  SBIN: 'SBIN:NSE',
  TATAMOTORS: 'TATAMOTORS:NSE',
  LT: 'LT:NSE',
  NIFTY50: 'NIFTY 50:NSE',
  BANKNIFTY: 'NIFTY BANK:NSE',
  SENSEX: 'SENSEX:BSE',
};

export function isLiveDataConfigured(): boolean {
  return Boolean(API_KEY);
}

export function toProviderSymbol(internalSymbol: string): string | null {
  return SYMBOL_MAP[internalSymbol] ?? null;
}

export interface PricePoint {
  time: string; // ISO-ish timestamp string as returned by the provider
  price: number; // close — kept for backwards compatibility with the area chart
}

export interface CandlePoint {
  time: number; // unix seconds — required format for lightweight-charts
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface LiveQuoteResult {
  price: number;
  change: number;
  changePercent: number;
  series: PricePoint[];
  candles: CandlePoint[];
}

interface TwelveDataTimeSeriesResponse {
  status?: 'ok' | 'error';
  code?: number;
  message?: string;
  values?: { datetime: string; open: string; high: string; low: string; close: string; volume?: string }[];
  meta?: { previous_close?: string };
}

export type ChartTimeframe = '1min' | '5min' | '15min' | '1h' | '1day' | '1week' | '1month';

/**
 * Fetches recent candles for a symbol. The most recent candle's close
 * doubles as the "live" price, so one call covers both the chart and the
 * current price — minimizing API usage against the free-tier quota.
 */
export async function fetchLiveQuote(
  internalSymbol: string,
  interval: ChartTimeframe = '5min',
  outputsize = 60,
): Promise<LiveQuoteResult> {
  if (!API_KEY) {
    throw new Error('Live market data is not configured (missing API key).');
  }

  const providerSymbol = toProviderSymbol(internalSymbol);
  if (!providerSymbol) {
    throw new Error(`No live data mapping for symbol "${internalSymbol}".`);
  }

  const url = `${API_BASE}/time_series?symbol=${encodeURIComponent(providerSymbol)}&interval=${interval}&outputsize=${outputsize}&apikey=${API_KEY}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Market data request failed (${res.status}).`);
  }

  const data: TwelveDataTimeSeriesResponse = await res.json();

  if (data.status === 'error' || !data.values || data.values.length === 0) {
    throw new Error(data.message ?? 'No market data returned for this symbol.');
  }

  // Twelve Data returns newest-first; reverse to chronological order for charting.
  const chronological = [...data.values].reverse();

  const series: PricePoint[] = chronological.map((v) => ({
    time: v.datetime,
    price: parseFloat(v.close),
  }));

  const candles: CandlePoint[] = chronological.map((v) => ({
    time: Math.floor(new Date(v.datetime.replace(' ', 'T')).getTime() / 1000),
    open: parseFloat(v.open),
    high: parseFloat(v.high),
    low: parseFloat(v.low),
    close: parseFloat(v.close),
    volume: v.volume ? parseFloat(v.volume) : 0,
  }));

  const latest = series[series.length - 1].price;
  const prevClose = data.meta?.previous_close
    ? parseFloat(data.meta.previous_close)
    : series[0].price;

  const change = latest - prevClose;
  const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0;

  return { price: latest, change, changePercent, series, candles };
}
