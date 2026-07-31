/**
 * Live market data via our own Firebase Cloud Function (`nseQuote`), which
 * proxies NSE India's public JSON endpoints server-side.
 *
 * WHY A PROXY: NSE has no official key-based API and its endpoints require
 * session cookies + can't be called cross-origin from a browser. The Cloud
 * Function in /functions/src/index.ts handles that and returns clean JSON.
 *
 * HONESTY NOTE: This uses NSE's unofficial internal endpoints (community
 * reverse-engineered, not a published API), so it can break without notice.
 * It also only provides *intraday* data reconstructed from tick prices — NSE's
 * public feed has no historical daily/weekly/monthly candles, so those
 * timeframes intentionally throw a clear "not supported" error rather than
 * silently showing wrong data.
 */

const PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined;
const FUNCTION_REGION = 'us-central1';

function functionsBaseUrl(): string | null {
  if (!PROJECT_ID) return null;
  return `https://${FUNCTION_REGION}-${PROJECT_ID}.cloudfunctions.net`;
}

/** Internal symbols this proxy supports. SENSEX is excluded — it's a BSE index with no NSE endpoint. */
const SUPPORTED_SYMBOLS = new Set([
  'RELIANCE',
  'TCS',
  'INFY',
  'HDFCBANK',
  'ICICIBANK',
  'SBIN',
  'TATAMOTORS',
  'LT',
  'NIFTY50',
  'BANKNIFTY',
]);

export function isLiveDataConfigured(): boolean {
  return functionsBaseUrl() !== null;
}

export function toProviderSymbol(internalSymbol: string): string | null {
  return SUPPORTED_SYMBOLS.has(internalSymbol) ? internalSymbol : null;
}

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

/** Maps a UI timeframe to the candle-bucket size (in minutes) our Cloud Function aggregates ticks into. */
const TIMEFRAME_TO_MINUTES: Record<ChartTimeframe, number | null> = {
  '1min': 1,
  '5min': 5,
  '15min': 15,
  '1h': 60,
  '1day': null, // not available — see HONESTY NOTE above
  '1week': null,
  '1month': null,
};

interface NseProxyResponse {
  price?: number;
  change?: number;
  changePercent?: number;
  candles?: CandlePoint[];
  series?: PricePoint[];
  error?: string;
}

export async function fetchLiveQuote(
  internalSymbol: string,
  interval: ChartTimeframe = '5min',
  _outputsize = 60,
): Promise<LiveQuoteResult> {
  const baseUrl = functionsBaseUrl();
  if (!baseUrl) {
    throw new Error('Live market data is not configured (missing Firebase project ID).');
  }

  if (!SUPPORTED_SYMBOLS.has(internalSymbol)) {
    throw new Error(
      internalSymbol === 'SENSEX'
        ? 'SENSEX is a BSE index and has no free NSE data source — live data is unavailable for it.'
        : `No live data mapping for symbol "${internalSymbol}".`,
    );
  }

  const intervalMinutes = TIMEFRAME_TO_MINUTES[interval];
  if (intervalMinutes === null) {
    throw new Error(
      `The ${interval} timeframe isn't available — the free NSE proxy only provides intraday data reconstructed from today's tick prices, not historical daily/weekly/monthly candles.`,
    );
  }

  const url = `${baseUrl}/nseQuote?symbol=${encodeURIComponent(internalSymbol)}&interval=${intervalMinutes}`;
  console.log('[marketDataService] Requesting:', url);

  let res: Response;
  try {
    res = await fetch(url);
  } catch (networkErr) {
    console.error('[marketDataService] Network error calling nseQuote function:', networkErr);
    throw new Error(
      `Network error reaching the NSE proxy function: ${networkErr instanceof Error ? networkErr.message : String(networkErr)}`,
    );
  }

  const rawBody = await res.text();
  console.log('[marketDataService] nseQuote response status:', res.status);
  console.log('[marketDataService] nseQuote response body:', rawBody.slice(0, 500));

  let data: NseProxyResponse;
  try {
    data = JSON.parse(rawBody);
  } catch {
    throw new Error(
      `nseQuote function returned a non-JSON response (HTTP ${res.status}). Body: ${rawBody.slice(0, 300)}`,
    );
  }

  if (!res.ok || data.error) {
    throw new Error(data.error ?? `nseQuote function request failed (HTTP ${res.status}).`);
  }

  if (
    data.price === undefined ||
    data.change === undefined ||
    data.changePercent === undefined ||
    !data.candles
  ) {
    throw new Error('nseQuote function returned an incomplete response.');
  }

  return {
    price: data.price,
    change: data.change,
    changePercent: data.changePercent,
    series: data.series ?? [],
    candles: data.candles,
  };
}
