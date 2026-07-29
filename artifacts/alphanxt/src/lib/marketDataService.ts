/**
 * Real market data integration via Twelve Data
 */

const API_BASE = "https://api.twelvedata.com";
const API_KEY = import.meta.env.VITE_TWELVE_DATA_API_KEY as string | undefined;

const SYMBOL_MAP: Record<string, string> = {
  RELIANCE: "RELIANCE:NSE",
  TCS: "TCS:NSE",
  INFY: "INFY:NSE",
  HDFCBANK: "HDFCBANK:NSE",
  ICICIBANK: "ICICIBANK:NSE",
  SBIN: "SBIN:NSE",
  TATAMOTORS: "TATAMOTORS:NSE",
  LT: "LT:NSE",
};

export function isLiveDataConfigured() {
  return !!API_KEY;
}

export function toProviderSymbol(symbol: string) {
  return SYMBOL_MAP[symbol] ?? null;
}

export interface PricePoint {
  time: string;
  price: number;
}

export interface CandlePoint {
  time: number;
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

export type ChartTimeframe =
  | "1min"
  | "5min"
  | "15min"
  | "1h"
  | "1day"
  | "1week"
  | "1month";

interface TwelveResponse {
  status?: string;
  message?: string;
  values?: any[];
  meta?: {
    previous_close?: string;
  };
}

export async function fetchLiveQuote(
  internalSymbol: string,
  interval: ChartTimeframe = "5min",
  outputsize = 60
): Promise<LiveQuoteResult> {

  if (!API_KEY) {
    throw new Error("Missing Twelve Data API Key");
  }

  const symbol = toProviderSymbol(internalSymbol);

  if (!symbol) {
    throw new Error("Unsupported Symbol");
  }

  const url =
    `${API_BASE}/time_series` +
    `?symbol=${encodeURIComponent(symbol)}` +
    `&interval=${interval}` +
    `&outputsize=${outputsize}` +
    `&apikey=${API_KEY}`;

  console.log(url);

  const response = await fetch(url);

  const text = await response.text();

  console.log(text);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data: TwelveResponse = JSON.parse(text);

  if (!data.values?.length) {
    throw new Error(data.message || "No Data");
  }

  const values = [...data.values].reverse();

  const series = values.map(v => ({
    time: v.datetime,
    price: Number(v.close)
  }));

  const candles = values.map(v => ({
    time: Math.floor(new Date(v.datetime).getTime() / 1000),
    open: Number(v.open),
    high: Number(v.high),
    low: Number(v.low),
    close: Number(v.close),
    volume: Number(v.volume || 0)
  }));

  const latest = candles[candles.length - 1].close;

  const previous =
    data.meta?.previous_close
      ? Number(data.meta.previous_close)
      : candles[0].close;

  const change = latest - previous;

  return {
    price: latest,
    change,
    changePercent: (change / previous) * 100,
    series,
    candles
  };
    }
