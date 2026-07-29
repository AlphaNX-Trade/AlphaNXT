import type { CandlePoint } from '@/lib/marketDataService';

export interface IndicatorPoint {
  time: number;
  value: number;
}

/** Exponential Moving Average over closing prices. */
export function calculateEMA(candles: CandlePoint[], period: number): IndicatorPoint[] {
  if (candles.length < period) return [];
  const k = 2 / (period + 1);
  const result: IndicatorPoint[] = [];

  // Seed with a simple average of the first `period` closes.
  const seed = candles.slice(0, period).reduce((sum, c) => sum + c.close, 0) / period;
  let prevEma = seed;
  result.push({ time: candles[period - 1].time, value: seed });

  for (let i = period; i < candles.length; i++) {
    const ema = candles[i].close * k + prevEma * (1 - k);
    result.push({ time: candles[i].time, value: ema });
    prevEma = ema;
  }

  return result;
}

/** Relative Strength Index (Wilder's smoothing), standard 14-period. */
export function calculateRSI(candles: CandlePoint[], period = 14): IndicatorPoint[] {
  if (candles.length < period + 1) return [];

  const result: IndicatorPoint[] = [];
  let gainSum = 0;
  let lossSum = 0;

  for (let i = 1; i <= period; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    if (diff >= 0) gainSum += diff;
    else lossSum -= diff;
  }

  let avgGain = gainSum / period;
  let avgLoss = lossSum / period;

  const rsiAt = (gain: number, loss: number): number => {
    if (loss === 0) return 100;
    const rs = gain / loss;
    return 100 - 100 / (1 + rs);
  };

  result.push({ time: candles[period].time, value: rsiAt(avgGain, avgLoss) });

  for (let i = period + 1; i < candles.length; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    result.push({ time: candles[i].time, value: rsiAt(avgGain, avgLoss) });
  }

  return result;
}

export interface MACDResult {
  macdLine: IndicatorPoint[];
  signalLine: IndicatorPoint[];
  histogram: IndicatorPoint[];
}

/** MACD (12, 26, 9) — standard settings. */
export function calculateMACD(candles: CandlePoint[]): MACDResult {
  const ema12 = calculateEMA(candles, 12);
  const ema26 = calculateEMA(candles, 26);

  if (ema12.length === 0 || ema26.length === 0) {
    return { macdLine: [], signalLine: [], histogram: [] };
  }

  // Align by time — ema26 starts later, so only compute where both exist.
  const ema12ByTime = new Map(ema12.map((p) => [p.time, p.value]));
  const macdLine: IndicatorPoint[] = ema26
    .filter((p) => ema12ByTime.has(p.time))
    .map((p) => ({ time: p.time, value: ema12ByTime.get(p.time)! - p.value }));

  // Signal line = 9-period EMA of the MACD line itself.
  const signalPeriod = 9;
  const signalLine: IndicatorPoint[] = [];
  if (macdLine.length >= signalPeriod) {
    const k = 2 / (signalPeriod + 1);
    const seed = macdLine.slice(0, signalPeriod).reduce((s, p) => s + p.value, 0) / signalPeriod;
    let prev = seed;
    signalLine.push({ time: macdLine[signalPeriod - 1].time, value: seed });
    for (let i = signalPeriod; i < macdLine.length; i++) {
      const v = macdLine[i].value * k + prev * (1 - k);
      signalLine.push({ time: macdLine[i].time, value: v });
      prev = v;
    }
  }

  const signalByTime = new Map(signalLine.map((p) => [p.time, p.value]));
  const histogram: IndicatorPoint[] = macdLine
    .filter((p) => signalByTime.has(p.time))
    .map((p) => ({ time: p.time, value: p.value - signalByTime.get(p.time)! }));

  return { macdLine, signalLine, histogram };
}

export interface BollingerBands {
  upper: IndicatorPoint[];
  middle: IndicatorPoint[];
  lower: IndicatorPoint[];
}

/** Bollinger Bands — 20-period SMA with 2 standard deviations. */
export function calculateBollingerBands(
  candles: CandlePoint[],
  period = 20,
  stdDevMultiplier = 2,
): BollingerBands {
  const upper: IndicatorPoint[] = [];
  const middle: IndicatorPoint[] = [];
  const lower: IndicatorPoint[] = [];

  for (let i = period - 1; i < candles.length; i++) {
    const window = candles.slice(i - period + 1, i + 1).map((c) => c.close);
    const mean = window.reduce((s, v) => s + v, 0) / period;
    const variance = window.reduce((s, v) => s + (v - mean) ** 2, 0) / period;
    const stdDev = Math.sqrt(variance);

    middle.push({ time: candles[i].time, value: mean });
    upper.push({ time: candles[i].time, value: mean + stdDevMultiplier * stdDev });
    lower.push({ time: candles[i].time, value: mean - stdDevMultiplier * stdDev });
  }

  return { upper, middle, lower };
}

/** Simple trend read from the latest EMA20 vs EMA50 relationship — used by the AI Analysis tab. */
export function deriveTrendSummary(candles: CandlePoint[]): {
  trend: 'Uptrend' | 'Downtrend' | 'Sideways';
  rsiLevel: 'Overbought' | 'Oversold' | 'Neutral';
  latestRsi: number | null;
} {
  const ema20 = calculateEMA(candles, 20);
  const ema50 = calculateEMA(candles, 50);
  const rsi = calculateRSI(candles);

  let trend: 'Uptrend' | 'Downtrend' | 'Sideways' = 'Sideways';
  if (ema20.length > 0 && ema50.length > 0) {
    const last20 = ema20[ema20.length - 1].value;
    const last50 = ema50[ema50.length - 1].value;
    const diffPercent = ((last20 - last50) / last50) * 100;
    if (diffPercent > 0.15) trend = 'Uptrend';
    else if (diffPercent < -0.15) trend = 'Downtrend';
  }

  const latestRsi = rsi.length > 0 ? rsi[rsi.length - 1].value : null;
  let rsiLevel: 'Overbought' | 'Oversold' | 'Neutral' = 'Neutral';
  if (latestRsi !== null) {
    if (latestRsi > 70) rsiLevel = 'Overbought';
    else if (latestRsi < 30) rsiLevel = 'Oversold';
  }

  return { trend, rsiLevel, latestRsi };
}
