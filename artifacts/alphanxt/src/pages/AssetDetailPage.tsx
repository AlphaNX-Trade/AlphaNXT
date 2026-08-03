import { useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { ChevronLeft, Share2, Loader2, Sparkles, Newspaper, FileBarChart, TrendingUp, TrendingDown } from 'lucide-react';
import { getAssetBySymbol } from '@/data/marketData';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useMarketEngineStock } from '@/hooks/useMarketEngineStock';
import { ticksToCandles } from '@/lib/marketEngine/candleAggregation';
import type { ChartTimeframe } from '@/lib/marketDataService';
import { CandlestickChart } from '@/components/markets/CandlestickChart';
import { AssetTabs, type AssetTab } from '@/components/markets/AssetTabs';
import { RSIPanel, MACDPanel } from '@/components/markets/IndicatorPanel';
import { calculateRSI, calculateMACD, deriveTrendSummary } from '@/lib/technicalIndicators';

interface StatCellProps {
  label: string;
  value: string;
}

function StatCell({ label, value }: StatCellProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span className="font-mono text-sm text-foreground">{value}</span>
    </div>
  );
}

/** Text-based logo fallback — no external logo API is wired up, so this uses initials rather than a fake/broken image. */
function AssetLogo({ symbol }: { symbol: string }) {
  const initials = symbol.slice(0, 2).toUpperCase();
  return (
    <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
      <span className="font-mono text-xs font-bold text-primary">{initials}</span>
    </div>
  );
}

function ComingSoonTab({ icon: Icon, label }: { icon: typeof Newspaper; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
      <div className="w-12 h-12 rounded-full bg-secondary/40 flex items-center justify-center">
        <Icon className="w-5 h-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground">{label} — coming soon</p>
      <p className="text-xs text-muted-foreground max-w-[240px]">
        This section isn't connected to a data source yet.
      </p>
    </div>
  );
}

interface AssetDetailPageProps {
  symbol: string;
}

export default function AssetDetailPage({ symbol }: AssetDetailPageProps) {
  const [, setLocation] = useLocation();
  const [isToggling, setIsToggling] = useState(false);
  const [activeTab, setActiveTab] = useState<AssetTab>('overview');
  const [timeframe, setTimeframe] = useState<ChartTimeframe>('5min');
  const { isInWatchlist, addStock, removeStock, watchlistLoading } = useWatchlist();

  const asset = getAssetBySymbol(symbol);
  const inWatchlist = isInWatchlist(symbol);
  const { state: engineState, history } = useMarketEngineStock(symbol);

  // Bucket size for the candle view, tied to the selected timeframe tab.
  const TIMEFRAME_TO_BUCKET_MS: Record<ChartTimeframe, number> = {
    '1min': 1_000,
    '5min': 5_000,
    '15min': 15_000,
    '1h': 60_000,
    '1day': 60_000,
    '1week': 60_000,
    '1month': 60_000,
  };
  const candles = useMemo(
    () => ticksToCandles(history, TIMEFRAME_TO_BUCKET_MS[timeframe]),
    [history, timeframe],
  );

  const rsiData = useMemo(() => calculateRSI(candles), [candles]);
  const macdData = useMemo(() => calculateMACD(candles), [candles]);
  const trendSummary = useMemo(() => deriveTrendSummary(candles), [candles]);

  const handleWatchlistToggle = async () => {
    if (isToggling || !asset) return;
    setIsToggling(true);
    try {
      if (inWatchlist) {
        await removeStock(symbol);
      } else {
        await addStock(symbol);
      }
    } finally {
      setIsToggling(false);
    }
  };

  if (!asset) {
    return (
      <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center gap-4 px-6 max-w-[480px] mx-auto">
        <p className="text-muted-foreground text-sm">Asset not found</p>
        <button
          onClick={() => setLocation('/markets')}
          className="font-mono text-xs bg-primary text-background px-5 py-2.5 rounded-xl font-semibold"
        >
          Back to Markets
        </button>
      </div>
    );
  }

  const displayPrice = engineState?.price ?? asset.price;
  const displayChange = engineState ? engineState.price - engineState.prevClose : asset.change;
  const displayChangePercent =
    engineState && engineState.prevClose !== 0
      ? (displayChange / engineState.prevClose) * 100
      : asset.changePercent;
  const isPositive = displayChange >= 0;
  const changeColor = isPositive ? 'text-emerald-400' : 'text-red-400';
  const changeSign = isPositive ? '+' : '';

  const fmt = (n: number) =>
    `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col max-w-[480px] mx-auto">
      {/* Fixed header */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-background/95 backdrop-blur border-b border-border z-40">
        <div className="h-14 flex items-center justify-between px-4">
          <button
            onClick={() => setLocation('/markets')}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1"
            aria-label="Back to markets"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <AssetLogo symbol={asset.symbol} />
            <div className="flex flex-col items-start">
              <span className="font-mono text-sm font-semibold text-foreground leading-tight">
                {asset.symbol}
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight max-w-[160px] truncate">
                {asset.name} · {asset.type === 'index' ? 'INDEX' : 'NSE'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleWatchlistToggle}
              disabled={isToggling}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
              aria-label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
            >
              {isToggling ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span className={`text-lg leading-none ${inWatchlist ? 'text-primary' : ''}`}>
                  {inWatchlist ? '★' : '☆'}
                </span>
              )}
            </button>
            <button
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
              aria-label="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        <AssetTabs active={activeTab} onChange={setActiveTab} />
      </header>

      {/* Scrollable content */}
      <main className="flex-1 overflow-y-auto px-4 pt-[104px] pb-24 space-y-5">
        {/* Price hero — shown above every tab */}
        <section className="pt-2">
          <p className="font-mono font-bold text-3xl text-foreground tracking-tight">
            {fmt(displayPrice)}
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`font-mono text-sm ${changeColor}`}>
              {changeSign}₹{Math.abs(displayChange).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className={`font-mono text-sm ${changeColor}`}>
              ({changeSign}{displayChangePercent.toFixed(2)}%)
            </span>
          </div>
          <p className="font-mono text-[10px] text-muted-foreground mt-1.5">
            Simulated market · updates continuously
          </p>
        </section>

        {/* ── Overview tab ───────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <>
            <section>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                Market Data
              </p>
              <div className="bg-card border border-border rounded-xl p-4 grid grid-cols-2 gap-y-4">
                <StatCell label="Day High" value={fmt(asset.dayHigh)} />
                <StatCell label="Day Low" value={fmt(asset.dayLow)} />
                <StatCell label="Open" value={fmt(asset.open)} />
                <StatCell label="Prev. Close" value={fmt(asset.prevClose)} />
                <StatCell label="Volume" value={asset.volume} />
                <StatCell label="Market Cap" value={asset.marketCap} />
                <StatCell label="Sector" value={asset.sector} />
              </div>
            </section>

            <section>
              {watchlistLoading ? (
                <div className="w-full h-12 bg-card border border-border rounded-xl flex items-center justify-center animate-pulse">
                  <div className="w-24 h-3 rounded bg-secondary/50" />
                </div>
              ) : (
                <button
                  onClick={handleWatchlistToggle}
                  disabled={isToggling}
                  className={`w-full h-12 rounded-xl font-mono text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                    inWatchlist
                      ? 'border border-red-500/40 text-red-400 bg-red-500/5 hover:bg-red-500/10'
                      : 'bg-primary text-background hover:opacity-90'
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  {isToggling && <Loader2 className="w-4 h-4 animate-spin" />}
                  {inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                </button>
              )}
            </section>
          </>
        )}

        {/* ── Chart tab ──────────────────────────────────────────────── */}
        {activeTab === 'chart' && (
          <div className="space-y-3">
            <CandlestickChart
              candles={candles}
              loading={candles.length === 0}
              error={null}
              timeframe={timeframe}
              onTimeframeChange={setTimeframe}
            />
            <RSIPanel data={rsiData} />
            <MACDPanel histogram={macdData.histogram} />
            <p className="text-[10px] text-muted-foreground text-center">
              Blue line on the price chart is the 20-period EMA.
            </p>
          </div>
        )}

        {/* ── News tab ───────────────────────────────────────────────── */}
        {activeTab === 'news' && <ComingSoonTab icon={Newspaper} label="News" />}

        {/* ── Financials tab ─────────────────────────────────────────── */}
        {activeTab === 'financials' && <ComingSoonTab icon={FileBarChart} label="Financials" />}

        {/* ── AI Analysis tab ────────────────────────────────────────── */}
        {activeTab === 'ai' && (
          <div className="space-y-3">
            {candles.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-5 text-center">
                <p className="text-xs text-muted-foreground">
                  Gathering enough simulated price history to analyze — check back in a few seconds.
                </p>
              </div>
            ) : (
              <>
                <div className="bg-card border border-primary/20 rounded-xl p-4 flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div className="space-y-2">
                    <p className="text-sm text-foreground leading-relaxed">
                      Based on the {timeframe} chart, {asset.symbol} is showing a{' '}
                      <span className="font-semibold">{trendSummary.trend.toLowerCase()}</span> with
                      RSI reading{' '}
                      <span className="font-semibold">
                        {trendSummary.latestRsi?.toFixed(1) ?? '—'}
                      </span>{' '}
                      (
                      <span className="font-semibold">{trendSummary.rsiLevel.toLowerCase()}</span>
                      ).
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      This is a computed technical read from EMA and RSI — not a prediction or
                      recommendation. It does not guarantee future price movement.
                    </p>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-4 space-y-2.5">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Signal Summary
                  </p>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Trend (EMA 20 vs 50)</span>
                    <span
                      className={`font-medium ${
                        trendSummary.trend === 'Uptrend'
                          ? 'text-emerald-400'
                          : trendSummary.trend === 'Downtrend'
                            ? 'text-red-400'
                            : 'text-foreground'
                      }`}
                    >
                      {trendSummary.trend}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">RSI (14)</span>
                    <span
                      className={`font-medium ${
                        trendSummary.rsiLevel === 'Overbought'
                          ? 'text-red-400'
                          : trendSummary.rsiLevel === 'Oversold'
                            ? 'text-emerald-400'
                            : 'text-foreground'
                      }`}
                    >
                      {trendSummary.rsiLevel}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Sticky Up/Down CTA — was missing entirely after the tabs redesign */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-background/98 backdrop-blur border-t border-border px-4 py-3 z-30 shadow-[0_-8px_30px_rgba(0,0,0,0.3)]">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setLocation(`/trade/${symbol}`)}
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-mono font-bold text-sm bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
          >
            <TrendingUp className="w-4 h-4" /> BUY
          </button>
          <button
            onClick={() => setLocation(`/trade/${symbol}`)}
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-mono font-bold text-sm bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            <TrendingDown className="w-4 h-4" /> SELL
          </button>
        </div>
      </div>
    </div>
  );
}
