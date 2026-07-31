import { onRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

/**
 * Proxies NSE India's public (unofficial) JSON endpoints.
 *
 * WHY THIS EXISTS: NSE does not publish an official, key-based REST API for
 * browser use, and its endpoints don't allow direct cross-origin requests
 * from a browser (no CORS headers) and require session cookies obtained by
 * first visiting the site — something a browser fetch from our own app's
 * origin cannot do. This function does that dance server-side and returns
 * clean JSON to the client.
 *
 * HONESTY NOTE: These are NSE's internal endpoints, not a documented public
 * API. The exact paths/response shapes below are based on well-established
 * community reverse-engineering (used by several open-source NSE libraries)
 * but NSE can change or block this at any time without notice. If this stops
 * working, check the Cloud Functions logs (firebase functions:log) — every
 * request/response is logged there for debugging.
 */

const NSE_BASE = 'https://www.nseindia.com';
const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
};

interface NseSession {
  cookieHeader: string;
}

/**
 * Visits the NSE homepage to obtain session cookies required by its API
 * endpoints. Re-fetched on every request rather than cached across
 * invocations — simpler and more robust for a low-traffic app, at the cost
 * of one extra round-trip per call.
 */
async function establishSession(): Promise<NseSession> {
  const res = await fetch(NSE_BASE, { headers: BROWSER_HEADERS });
  logger.info('[nseProxy] Session bootstrap status:', res.status);

  const setCookie =
    (res.headers as any).getSetCookie?.() ?? (res.headers.get('set-cookie') ? [res.headers.get('set-cookie') as string] : []);

  if (!setCookie || setCookie.length === 0) {
    logger.warn('[nseProxy] No cookies returned from NSE homepage — API calls will likely fail.');
  }

  const cookieHeader = setCookie.map((c: string) => c.split(';')[0]).join('; ');
  return { cookieHeader };
}

async function nseApiFetch(path: string, session: NseSession, referer: string): Promise<any> {
  const url = `${NSE_BASE}${path}`;
  logger.info('[nseProxy] Fetching:', url);

  const res = await fetch(url, {
    headers: {
      ...BROWSER_HEADERS,
      Cookie: session.cookieHeader,
      Referer: referer,
    },
  });

  const bodyText = await res.text();
  logger.info('[nseProxy] Response status:', res.status, '— body preview:', bodyText.slice(0, 200));

  if (!res.ok) {
    throw new Error(`NSE request to ${path} failed (HTTP ${res.status}): ${bodyText.slice(0, 200)}`);
  }

  try {
    return JSON.parse(bodyText);
  } catch {
    throw new Error(`NSE returned non-JSON response for ${path}: ${bodyText.slice(0, 200)}`);
  }
}

interface CandlePoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/** Buckets raw [timestampMs, price] ticks into OHLC candles at the given interval. */
function ticksToCandles(ticks: [number, number][], intervalMinutes: number): CandlePoint[] {
  if (ticks.length === 0) return [];

  const bucketMs = intervalMinutes * 60_000;
  const buckets = new Map<number, number[]>();

  for (const [tsMs, price] of ticks) {
    const bucketStart = Math.floor(tsMs / bucketMs) * bucketMs;
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
      volume: 0, // NSE's public intraday tick feed doesn't include per-tick volume
    }));
}

const INDEX_SYMBOLS: Record<string, string> = {
  NIFTY50: 'NIFTY 50',
  BANKNIFTY: 'NIFTY BANK',
};

export const nseQuote = onRequest(
  { cors: true, region: 'us-central1', timeoutSeconds: 20 },
  async (req, res) => {
    const symbol = String(req.query.symbol ?? '').toUpperCase();
    const intervalMinutes = Math.max(1, parseInt(String(req.query.interval ?? '5'), 10) || 5);

    if (!symbol) {
      res.status(400).json({ error: 'Missing required "symbol" query parameter.' });
      return;
    }

    if (symbol === 'SENSEX') {
      res.status(400).json({
        error: 'SENSEX is a BSE index — this proxy only covers NSE, which has no public endpoint for it.',
      });
      return;
    }

    try {
      const session = await establishSession();
      const isIndex = symbol in INDEX_SYMBOLS;
      const nseIndexName = INDEX_SYMBOLS[symbol];

      let price: number;
      let change: number;
      let changePercent: number;
      let ticks: [number, number][] = [];

      if (isIndex) {
        const referer = `${NSE_BASE}/market-data/live-market-indices`;
        const quoteData = await nseApiFetch(
          `/api/equity-stockIndices?index=${encodeURIComponent(nseIndexName)}`,
          session,
          referer,
        );
        const indexRow = quoteData?.data?.find((row: any) => row.index === nseIndexName) ?? quoteData?.data?.[0];
        if (!indexRow) throw new Error(`No index data found for ${symbol}.`);

        price = indexRow.last;
        change = indexRow.variation;
        changePercent = indexRow.percentChange;

        const chartData = await nseApiFetch(
          `/api/chart-databyindex?index=${encodeURIComponent(nseIndexName)}`,
          session,
          referer,
        );
        ticks = chartData?.grapthData ?? [];
      } else {
        const referer = `${NSE_BASE}/get-quotes/equity?symbol=${encodeURIComponent(symbol)}`;
        const quoteData = await nseApiFetch(`/api/quote-equity?symbol=${encodeURIComponent(symbol)}`, session, referer);
        const priceInfo = quoteData?.priceInfo;
        if (!priceInfo) throw new Error(`No price data found for ${symbol}.`);

        price = priceInfo.lastPrice;
        change = priceInfo.change;
        changePercent = priceInfo.pChange;

        const chartData = await nseApiFetch(
          `/api/chart-databyindex?index=${encodeURIComponent(symbol)}EQN`,
          session,
          referer,
        );
        ticks = chartData?.grapthData ?? [];
      }

      const candles = ticksToCandles(ticks, intervalMinutes);
      const series = candles.map((c) => ({ time: new Date(c.time * 1000).toISOString(), price: c.close }));

      res.status(200).json({ price, change, changePercent, candles, series });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error('[nseProxy] Failed:', message);
      res.status(502).json({ error: message });
    }
  },
);
