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
  price: number;
}

export interface LiveQuoteResult {
  price: number;
  change: number;
  changePercent: number;
  series: PricePoint[];
}

interface TwelveDataTimeSeriesResponse {
  status?: 'ok' | 'error';
  code?: number;
  message?: string;
  values?: { datetime: string; close: string }[];
  meta?: { previous_close?: string };
}

/**
 * Fetches recent intraday candles for a symbol. The most recent candle's
 * close doubles as the "live" price, so one call covers both the chart
 * and the current price — minimizing API usage against the free-tier quota.
 */
export async function fetchLiveQuote(
  internalSymbol: string,
  interval: '1min' | '5min' = '5min',
  outputsize = 30,
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
  const series: PricePoint[] = [...data.values]
    .reverse()
    .map((v) => ({ time: v.datetime, price: parseFloat(v.close) }));

  const latest = series[series.length - 1].price;
  const prevClose = data.meta?.previous_close
    ? parseFloat(data.meta.previous_close)
    : series[0].price;

  const change = latest - prevClose;
  const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0;

  return { price: latest, change, changePercent, series };
}
