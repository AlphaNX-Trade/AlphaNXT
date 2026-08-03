export type MarketSentiment = 'Bullish' | 'Bearish' | 'Neutral';
export type RiskLevel = 'Low' | 'Medium' | 'High';
export type LiquidityTier = 'High' | 'Medium' | 'Low';

export type MarketCycleType = 'Bull' | 'Bear' | 'Sideways' | 'HighVolatility' | 'LowVolatility';

export type MarketEventType =
  | 'GoodEarnings'
  | 'BadEarnings'
  | 'GovernmentPolicy'
  | 'EconomicBoom'
  | 'Recession'
  | 'Bankruptcy'
  | 'IndustryNews';

export interface MarketEvent {
  id: string;
  type: MarketEventType;
  /** Symbol the event targets, or null for a market-wide macro event. */
  symbol: string | null;
  /** Initial trend push applied by this event; decays to 0 over its duration. */
  magnitude: number;
  startedAt: number;
  durationMs: number;
  headline: string;
}

export interface SimulatedStockState {
  symbol: string;
  name: string;
  sector: string;
  type: 'stock' | 'index';

  price: number;
  prevClose: number;
  open: number;
  dayHigh: number;
  dayLow: number;

  trend: number;
  momentum: number;
  volatility: number;
  support: number;
  resistance: number;

  sentiment: MarketSentiment;
  liquidity: LiquidityTier;
  risk: RiskLevel;

  lastUpdate: number;
}

export interface EngineTickPoint {
  time: number;
  price: number;
}
