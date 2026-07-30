/**
 * Real market data integration via Twelve Data (https://twelvedata.com).
 * Free tier: 800 requests/day, 8 requests/minute — polling intervals in
 * useLiveAsset.ts are tuned to stay well under this budget.
 *
 * Requires VITE_TWELVE_DATA_API_KEY to be set (Replit: add it under the
 * Secrets tab, then STOP and RESTART the Repl — Vite only reads env vars
 * at server start, so a running dev server will not pick up a newly added
 * secret without a restart). Falls back gracefully — callers should keep
 * showing the static placeholder price/chart if this service reports an error.
 */

const API_BASE = 'https://api.twelvedata.com';
const API_KEY = import.meta.env.VITE_TWELVE_DATA_API_KEY as string | undefined;

/**
 * Maps our internal app symbols to Twelve Data's primary symbol format
 * (`SYMBOL:EXCHANGE`, e.g. "RELIANCE:NSE"). If that format 404s or errors,
 * fetchLiveQuote() automatically retries using separate `symbol` + `exchange`
 * query params, since Twelve Data has historically accepted both, and which
 * one resolves can depend on plan/account settings.
 */
const SYMBOL_MAP: Record<string, { symbol: string; exchange: string }> = {
  RELIANCE: { symbol: 'RELIANCE', exchange: 'NSE' },
  TCS: { symbol: 'TCS', exchange: 'NSE' },
  INFY: { symbol: 'INFY', exchange: 'NSE' },
  HDFCBANK: { symbol: 'HDFCBANK', exchange: 'NSE' },
  ICICIBANK: { symbol: 'ICICIBANK', exchange: 'NSE' },
  SBIN: { symbol: 'SBIN', exchange: 'NSE' },
  TATAMOTORS: { symbol: 'TATAMOTORS', exchange: 'NSE' },
  LT: { symbol: 'LT', exchange: 'NSE' },
  NIFTY50: { symbol: 'NIFTY 50', exchange: 'NSE' },
  BANKNIFTY: { symbol: 'NIFTY BANK', exchange: 'NSE' },
  SENSEX: { symbol: 'SENSEX', exchange: 'BSE' },
};

export function isLiveDataConfigured(): boolean {
  return Boolean(API_KEY);
}

export function toProviderSymbol(internalSymbol: string): string | null {
  const mapped = SYMBOL_MAP[internalSymbol];
  return mapped ? `${mapped.symbol}:${mapped.exchange}` : null;
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

/** Redacts the API key when logging a URL, so it never ends up in console history or bug reports. */
function redactApiKey(url: string): string {
  return url.replace(/apikey=[^&]+/, 'apikey=***REDACTED***');
}

/**
 * Performs one time_series request against a fully-built URL and returns the
 * raw parsed response, throwing a detailed error (including the actual
 * response body) on any failure. Always logs the request URL (key redacted)
 * and the raw response body for debugging, per the app's error-visibility
 * requirements.
 */
async function fetchTimeSeriesRaw(url: string): Promise<TwelveDataTimeSeriesResponse> {
  console.log('[marketDataService] Request URL:', redactApiKey(url));

  let res: Response;
  try {
    res = await fetch(url);
  } catch (networkErr) {
    console.error('[marketDataService] Network error calling Twelve Data:', networkErr);
    throw new Error(
      `Network error reaching Twelve Data: ${networkErr instanceof Error ? networkErr.message : String(networkErr)}`,
    );
  }

  // Read the raw body as text first — Twelve Data (and CDN-level errors in
  // front of it) don't always return valid JSON, so parsing blindly with
  // res.json() can itself throw and mask the real error.
  const rawBody = await res.text();
  console.log('[marketDataService] Response status:', res.status, res.statusText);
  console.log('[marketDataService] Response body:', rawBody);

  let data: TwelveDataTimeSeriesResponse;
  try {
    data = JSON.parse(rawBody);
  } catch {
    // Non-JSON response (e.g. an HTML error page from a CDN/proxy in front
    // of the API, or a wrong path). Surface the raw body so the real cause
    // is visible instead of a generic status code.
    throw new Error(
      `Twelve Data returned a non-JSON response (HTTP ${res.status} ${res.statusText}). Body: ${rawBody.slice(0, 300)}`,
    );
  }

  if (!res.ok) {
    // Twelve Data's own error format is { status: "error", code, message }.
    // Surface that message verbatim when present, since it's far more
    // useful than the bare HTTP status.
    const detail = data.message ?? rawBody.slice(0, 300);
    throw new Error(`Twelve Data request failed (HTTP ${res.status}): ${detail}`);
  }

  if (data.status === 'error') {
    throw new Error(data.message ?? 'Twelve Data returned an error with no message.');
  }

  return data;
}

function buildUrl(params: Record<string, string>): string {
  const query = new URLSearchParams({ ...params, apikey: API_KEY ?? '' });
  return `${API_BASE}/time_series?${query.toString()}`;
}

/**
 * Fetches recent candles for a symbol. The most recent candle's close
 * doubles as the "live" price, so one call covers both the chart and the
 * current price — minimizing API usage against the free-tier quota.
 *
 * Tries the combined `symbol=SYMBOL:EXCHANGE` format first; if that request
 * fails (non-2xx or a Twelve Data error payload — this is what commonly
 * surfaces as an HTTP 404/400 for exchange-suffixed symbols), it
 * automatically retries with `symbol` and `exchange` as separate params,
 * since Twelve Data has documented both forms and which one resolves can
 * vary by plan.
 */
export async function fetchLiveQuote(
  internalSymbol: string,
  interval: ChartTimeframe = '5min',
  outputsize = 60,
): Promise<LiveQuoteResult> {
  if (!API_KEY) {
    throw new Error(
      'Live market data is not configured: VITE_TWELVE_DATA_API_KEY is missing. Add it in Replit Secrets and restart the Repl.',
    );
  }

  const mapped = SYMBOL_MAP[internalSymbol];
  if (!mapped) {
    throw new Error(`No live data mapping for symbol "${internalSymbol}".`);
  }

  let data: TwelveDataTimeSeriesResponse;

  const combinedUrl = buildUrl({
    symbol: `${mapped.symbol}:${mapped.exchange}`,
    interval,
    outputsize: String(outputsize),
  });

  try {
    data = await fetchTimeSeriesRaw(combinedUrl);
  } catch (firstErr) {
    console.warn(
      `[marketDataService] "symbol:exchange" format failed for ${internalSymbol}, retrying with separate params. Reason:`,
      firstErr instanceof Error ? firstErr.message : firstErr,
    );

    const separateUrl = buildUrl({
      symbol: mapped.symbol,
      exchange: mapped.exchange,
      interval,
      outputsize: String(outputsize),
    });

    try {
      data = await fetchTimeSeriesRaw(separateUrl);
    } catch (secondErr) {
      // Both formats failed — surface the second (more specific) error,
      // but keep the first one visible in the console for full context.
      console.error('[marketDataService] Both symbol formats failed for', internalSymbol);
      throw secondErr;
    }
  }

  if (!data.values || data.values.length === 0) {
    throw new Error(`No market data returned for "${internalSymbol}".`);
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
