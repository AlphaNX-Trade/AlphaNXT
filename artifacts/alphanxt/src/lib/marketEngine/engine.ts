import type {
  SimulatedStockState,
  MarketCycleType,
  MarketEvent,
  MarketEventType,
  EngineTickPoint,
  MarketSentiment,
  RiskLevel,
  LiquidityTier,
} from './types';

/**
 * Original implementation of a continuous market simulation — not a copy of
 * any proprietary game's code. Prices follow a smoothed trend+momentum walk
 * with mean-reverting support/resistance bands, periodic market-wide cycles,
 * and occasional decaying news events. This is clearly-simulated data for a
 * paper-trading education app, seeded from AlphaNXT's real stock list (see
 * seedMarketEngine.ts) — it is never presented to the user as real live
 * market data.
 */

const TICK_INTERVAL_MS = 750; // within the 0.5-1s spec range
const HISTORY_LENGTH = 400; // ~5 minutes of ticks kept per symbol for charting
const CYCLE_MIN_MS = 2 * 60_000;
const CYCLE_MAX_MS = 5 * 60_000;
const EVENT_MIN_GAP_MS = 20_000;
const EVENT_MAX_GAP_MS = 45_000;

const CYCLE_PROFILES: Record<MarketCycleType, { bias: number; volMultiplier: number }> = {
  Bull: { bias: 0.018, volMultiplier: 1.0 },
  Bear: { bias: -0.018, volMultiplier: 1.0 },
  Sideways: { bias: 0, volMultiplier: 0.55 },
  HighVolatility: { bias: 0, volMultiplier: 2.2 },
  LowVolatility: { bias: 0, volMultiplier: 0.4 },
};

const EVENT_PROFILES: { type: MarketEventType; marketWide: boolean; magnitudeRange: [number, number]; headline: (symbol: string) => string }[] = [
  { type: 'GoodEarnings', marketWide: false, magnitudeRange: [0.05, 0.2], headline: (s) => `${s} beats earnings estimates` },
  { type: 'BadEarnings', marketWide: false, magnitudeRange: [-0.2, -0.05], headline: (s) => `${s} misses earnings estimates` },
  { type: 'IndustryNews', marketWide: false, magnitudeRange: [-0.08, 0.08], headline: (s) => `Industry news affecting ${s}` },
  { type: 'Bankruptcy', marketWide: false, magnitudeRange: [-0.35, -0.15], headline: (s) => `Solvency concerns raised for ${s}` },
  { type: 'GovernmentPolicy', marketWide: true, magnitudeRange: [-0.1, 0.1], headline: () => 'New government policy announced' },
  { type: 'EconomicBoom', marketWide: true, magnitudeRange: [0.06, 0.15], headline: () => 'Economic growth data beats expectations' },
  { type: 'Recession', marketWide: true, magnitudeRange: [-0.15, -0.06], headline: () => 'Recession fears grip markets' },
];

function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export interface SeedStock {
  symbol: string;
  name: string;
  price: number;
  sector: string;
  type: 'stock' | 'index';
}

type StockListener = (state: SimulatedStockState) => void;
type TickListener = () => void;

export class MarketSimulationEngine {
  private stocks = new Map<string, SimulatedStockState>();
  private history = new Map<string, EngineTickPoint[]>();
  private stockListeners = new Map<string, Set<StockListener>>();
  private globalListeners = new Set<TickListener>();

  private cycle: MarketCycleType = 'Sideways';
  private cycleEndsAt = 0;
  private nextEventAt = 0;
  private activeEvents: MarketEvent[] = [];
  private recentEvents: MarketEvent[] = [];

  private intervalId: ReturnType<typeof setInterval> | null = null;
  private tickCount = 0;

  seed(stocks: SeedStock[]): void {
    const now = Date.now();
    for (const s of stocks) {
      const volatility = Math.max(0.05, s.price * 0.0015);
      const state: SimulatedStockState = {
        symbol: s.symbol,
        name: s.name,
        sector: s.sector,
        type: s.type,
        price: s.price,
        prevClose: s.price,
        open: s.price,
        dayHigh: s.price,
        dayLow: s.price,
        trend: 0,
        momentum: 0,
        volatility,
        support: s.price * 0.9,
        resistance: s.price * 1.1,
        sentiment: 'Neutral',
        liquidity: volatility > s.price * 0.003 ? 'Low' : s.price > 1000 ? 'High' : 'Medium',
        risk: volatility > s.price * 0.0025 ? 'High' : volatility > s.price * 0.0012 ? 'Medium' : 'Low',
        lastUpdate: now,
      };
      this.stocks.set(s.symbol, state);
      this.history.set(s.symbol, [{ time: now, price: s.price }]);
    }
    this.rollCycle(now);
    this.scheduleNextEvent(now);
  }

  start(): void {
    if (this.intervalId) return; // already running (guards against HMR double-start)
    this.intervalId = setInterval(() => this.tick(), TICK_INTERVAL_MS);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  getSnapshot(symbol: string): SimulatedStockState | undefined {
    return this.stocks.get(symbol);
  }

  getAllSnapshots(): SimulatedStockState[] {
    return Array.from(this.stocks.values());
  }

  getHistory(symbol: string): EngineTickPoint[] {
    return this.history.get(symbol) ?? [];
  }

  getRecentEvents(): MarketEvent[] {
    return this.recentEvents.slice(-10);
  }

  getCurrentCycle(): MarketCycleType {
    return this.cycle;
  }

  subscribe(symbol: string, listener: StockListener): () => void {
    if (!this.stockListeners.has(symbol)) this.stockListeners.set(symbol, new Set());
    this.stockListeners.get(symbol)!.add(listener);
    return () => this.stockListeners.get(symbol)?.delete(listener);
  }

  subscribeAll(listener: TickListener): () => void {
    this.globalListeners.add(listener);
    return () => this.globalListeners.delete(listener);
  }

  // ─── Internal simulation step ──────────────────────────────────────────────

  private rollCycle(now: number): void {
    const cycles: MarketCycleType[] = ['Bull', 'Bear', 'Sideways', 'HighVolatility', 'LowVolatility'];
    this.cycle = cycles[Math.floor(Math.random() * cycles.length)];
    this.cycleEndsAt = now + randomRange(CYCLE_MIN_MS, CYCLE_MAX_MS);
  }

  private scheduleNextEvent(now: number): void {
    this.nextEventAt = now + randomRange(EVENT_MIN_GAP_MS, EVENT_MAX_GAP_MS);
  }

  private maybeTriggerEvent(now: number): void {
    if (now < this.nextEventAt) return;
    this.scheduleNextEvent(now);

    const profile = EVENT_PROFILES[Math.floor(Math.random() * EVENT_PROFILES.length)];
    const symbols = Array.from(this.stocks.keys());
    if (symbols.length === 0) return;

    const targetSymbol = profile.marketWide ? null : symbols[Math.floor(Math.random() * symbols.length)];
    const magnitude = randomRange(profile.magnitudeRange[0], profile.magnitudeRange[1]);
    const headlineSymbol = targetSymbol ?? 'the market';

    const event: MarketEvent = {
      id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
      type: profile.type,
      symbol: targetSymbol,
      magnitude,
      startedAt: now,
      durationMs: randomRange(15_000, 40_000),
      headline: profile.headline(headlineSymbol),
    };

    this.activeEvents.push(event);
    this.recentEvents.push(event);
    if (this.recentEvents.length > 30) this.recentEvents.shift();
  }

  private eventInfluenceFor(symbol: string, now: number): number {
    let influence = 0;
    this.activeEvents = this.activeEvents.filter((e) => now - e.startedAt < e.durationMs);
    for (const e of this.activeEvents) {
      if (e.symbol !== null && e.symbol !== symbol) continue;
      const lifeFraction = 1 - (now - e.startedAt) / e.durationMs; // 1 -> 0 over its life
      influence += e.magnitude * lifeFraction;
    }
    return influence;
  }

  private tick(): void {
    const now = Date.now();
    this.tickCount += 1;

    if (now > this.cycleEndsAt) this.rollCycle(now);
    this.maybeTriggerEvent(now);

    const { bias, volMultiplier } = CYCLE_PROFILES[this.cycle];

    for (const state of this.stocks.values()) {
      const eventInfluence = this.eventInfluenceFor(state.symbol, now);

      // Core formula (trend/momentum/noise), per spec.
      state.trend += randomRange(-0.03, 0.03) + bias * 0.05 + eventInfluence * 0.02;
      state.trend = clamp(state.trend, -1.5, 1.5);

      state.momentum = state.momentum * 0.95 + state.trend * 0.05;

      const effectiveVolatility = state.volatility * volMultiplier;
      const noise = randomRange(-effectiveVolatility, effectiveVolatility);

      let nextPrice = state.price + state.momentum + noise;

      if (nextPrice < state.support) {
        state.trend += randomRange(0.5, 1.0);
      }
      if (nextPrice > state.resistance) {
        state.trend -= randomRange(0.5, 1.0);
      }

      nextPrice = Math.max(1, nextPrice);

      // Support/resistance trail the price slowly (smoothed), so bands
      // follow sustained trends instead of trapping price in a stale range
      // forever, while still triggering reversion on short-term breaches.
      const targetSupport = nextPrice * 0.9;
      const targetResistance = nextPrice * 1.1;
      state.support = state.support * 0.995 + targetSupport * 0.005;
      state.resistance = state.resistance * 0.995 + targetResistance * 0.005;

      state.price = nextPrice;
      state.dayHigh = Math.max(state.dayHigh, nextPrice);
      state.dayLow = Math.min(state.dayLow, nextPrice);
      state.sentiment = this.deriveSentiment(state.trend);
      state.lastUpdate = now;

      const hist = this.history.get(state.symbol)!;
      hist.push({ time: now, price: nextPrice });
      if (hist.length > HISTORY_LENGTH) hist.shift();

      this.stockListeners.get(state.symbol)?.forEach((cb) => cb(state));
    }

    this.globalListeners.forEach((cb) => cb());
  }

  private deriveSentiment(trend: number): MarketSentiment {
    if (trend > 0.15) return 'Bullish';
    if (trend < -0.15) return 'Bearish';
    return 'Neutral';
  }
}

export const marketEngine = new MarketSimulationEngine();
