/**
 * Live market data via Yahoo Finance's public chart endpoint, called
 * DIRECTLY from the browser — no backend, no API key, no billing required.
 *
 * WHY THIS APPROACH: NSE has no free option that works without a paid Cloud
 * Functions plan (Blaze billing), which isn't available right now. Yahoo
 * Finance's v8/finance/chart endpoint is unofficial but has historically
 * allowed direct browser requests for basic price/chart data without
 * requiring the cookie+crumb dance that Yahoo's other endpoints need.
 *
 * HONESTY NOTE — read before relying on this: this is not a documented,
 * supported API. It can:
 *  - Get blocked by CORS at any time without notice (Yahoo doesn't publish
 *    a CORS policy commitment for this endpoint)
 *  - Change response shape or require auth in the future
 *  - Be rate-limited
 * If the direct request fails, this falls back to a free public CORS proxy
 * (allorigins.win) as a second attempt — also unofficial and could be slow,
 * rate-limited, or unavailable. There is no paid fallback wired in; if both
 * attempts fail, the UI shows its existing "live data unavailable" state
 * and falls back to static placeholder prices, exactly as before.
 */

export interface PricePoint {
  time: string;
  price: number;
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

export type ChartTimeframe = '1min' | '5min' | '15min' | '1h' | '1day' | '1week' | '1month';

/** Yahoo Finance suffix per exchange: NSE stocks/indices use .NS, BSE (Sensex) uses .BO. */
const SYMBOL_MAP: Record<string, string> = {
  RELIANCE: 'RELIANCE.NS',
  TCS: 'TCS.NS',
  INFY: 'INFY.NS',
  HDFCBANK: 'HDFCBANK.NS',
  ICICIBANK: 'ICICIBANK.NS',
  SBIN: 'SBIN.NS',
  TATAMOTORS: 'TATAMOTORS.NS',
  LT: 'LT.NS',
  NIFTY50: '%5ENSEI', // ^NSEI, URL-encoded
  BANKNIFTY: '%5ENSEBANK', // ^NSEBANK, URL-encoded
  SENSEX: '%5EBSESN', // ^BSESN, URL-encoded
};

/** Maps our timeframe names to Yahoo's `interval` + `range` query params. */
const TIMEFRAME_TO_YAHOO: Record<ChartTimeframe, { interval: string; range: string }> = {
  '1min': { interval: '1m', range: '1d' },
  '5min': { interval: '5m', range: '5d' },
  '15min': { interval: '15m', range: '5d' },
  '1h': { interval: '60m', range: '1mo' },
  '1day': { interval: '1d', range: '3mo' },
  '1week': { interval: '1wk', range: '2y' },
  '1month': { interval: '1mo', range: '5y' },
};

export function isLiveDataConfigured(): boolean {
  // No config/key needed for this approach — always "on", but individual
  // requests can still fail at runtime (handled per-call, see fetchLiveQuote).
  return true;
}

export function toProviderSymbol(internalSymbol: string): string | null {
  return SYMBOL_MAP[internalSymbol] ?? null;
}

interface YahooChartResponse {
  chart?: {
    result?: {
      meta?: { previousClose?: number; regularMarketPrice?: number };
      timestamp?: number[];
      indicators?: {
        quote?: { open: number[]; high: number[]; low: number[]; close: number[]; volume: number[] }[];
      };
    }[];
    error?: { code?: string; description?: string } | null;
  };
}

function buildYahooUrl(yahooSymbol: string, interval: string, range: string): string {
  return `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=${interval}&range=${range}&includePrePost=false`;
}

async function fetchAndParse(url: string): Promise<YahooChartResponse> {
  console.log('[marketDataService] Requesting:', url);
  const res = await fetch(url);
  const rawBody = await res.text();
  console.log('[marketDataService] Response status:', res.status, '— body preview:', rawBody.slice(0, 300));

  if (!res.ok) {
    throw new Error(`Yahoo Finance request failed (HTTP ${res.status}): ${rawBody.slice(0, 200)}`);
  }

  let data: YahooChartResponse;
  try {
    data = JSON.parse(rawBody);
  } catch {
    throw new Error(`Yahoo Finance returned a non-JSON response: ${rawBody.slice(0, 200)}`);
  }

  if (data.chart?.error) {
    throw new Error(data.chart.error.description ?? 'Yahoo Finance returned an error.');
  }

  return data;
}

export async function fetchLiveQuote(
  internalSymbol: string,
  interval: ChartTimeframe = '5min',
  _outputsize = 60,
): Promise<LiveQuoteResult> {
  const yahooSymbol = SYMBOL_MAP[internalSymbol];
  if (!yahooSymbol) {
    throw new Error(`No live data mapping for symbol "${internalSymbol}".`);
  }

  const { interval: yInterval, range } = TIMEFRAME_TO_YAHOO[interval];
  const directUrl = buildYahooUrl(yahooSymbol, yInterval, range);

  let data: YahooChartResponse;
  try {
    data = await fetchAndParse(directUrl);
  } catch (directErr) {
    console.warn(
      '[marketDataService] Direct Yahoo Finance request failed, retrying via CORS proxy. Reason:',
      directErr instanceof Error ? directErr.message : directErr,
    );
    try {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(directUrl)}`;
      data = await fetchAndParse(proxyUrl);
    } catch (proxyErr) {
      console.error('[marketDataService] CORS proxy fallback also failed for', internalSymbol);
      throw proxyErr;
    }
  }

  const result = data.chart?.result?.[0];
  if (!result || !result.timestamp || !result.indicators?.quote?.[0]) {
    throw new Error(`No chart data returned for "${internalSymbol}".`);
  }

  const { timestamp } = result;
  const quote = result.indicators.quote[0];

  const candles: CandlePoint[] = timestamp
    .map((t, i) => ({
      time: t,
      open: quote.open[i],
      high: quote.high[i],
      low: quote.low[i],
      close: quote.close[i],
      volume: quote.volume?.[i] ?? 0,
    }))
    // Yahoo sometimes includes null candles for illiquid/no-trade periods — drop them.
    .filter((c) => c.open != null && c.high != null && c.low != null && c.close != null);

  if (candles.length === 0) {
    throw new Error(`Yahoo Finance returned no usable candles for "${internalSymbol}".`);
  }

  const series: PricePoint[] = candles.map((c) => ({
    time: new Date(c.time * 1000).toISOString(),
    price: c.close,
  }));

  const latest = candles[candles.length - 1].close;
  const prevClose = result.meta?.previousClose ?? candles[0].close;
  const change = latest - prevClose;
  const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0;

  return { price: latest, change, changePercent, series, candles };
}
