import { useState } from 'react';
import { useLocation } from 'wouter';
import { ChevronLeft, Share2, Loader2 } from 'lucide-react';
import { getAssetBySymbol } from '@/data/marketData';
import { useWatchlist } from '@/hooks/useWatchlist';

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

interface AssetDetailPageProps {
  symbol: string;
}

export default function AssetDetailPage({ symbol }: AssetDetailPageProps) {
  const [, setLocation] = useLocation();
  const [isToggling, setIsToggling] = useState(false);
  const { isInWatchlist, addStock, removeStock, watchlistLoading } = useWatchlist();

  const asset = getAssetBySymbol(symbol);
  const inWatchlist = isInWatchlist(symbol);

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

  // Asset not found
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

  const isPositive = asset.change >= 0;
  const changeColor = isPositive ? 'text-emerald-400' : 'text-red-400';
  const changeSign = isPositive ? '+' : '';

  const fmt = (n: number) =>
    `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col max-w-[480px] mx-auto">
      {/* Fixed header */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-background/95 backdrop-blur border-b border-border h-14 flex items-center justify-between px-4 z-40">
        <button
          onClick={() => setLocation('/markets')}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1"
          aria-label="Back to markets"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Center: symbol + name */}
        <div className="flex flex-col items-center">
          <span className="font-mono text-sm font-semibold text-foreground leading-tight">
            {asset.symbol}
          </span>
          <span className="text-[10px] text-muted-foreground leading-tight max-w-[180px] truncate">
            {asset.name}
          </span>
        </div>

        <button
          className="text-muted-foreground hover:text-foreground transition-colors p-1 -mr-1"
          aria-label="Share"
        >
          <Share2 className="w-4.5 h-4.5" />
        </button>
      </header>

      {/* Scrollable content */}
      <main className="flex-1 overflow-y-auto px-4 pt-[72px] pb-8 space-y-5">
        {/* Price hero */}
        <section className="pt-2">
          <p className="font-mono font-bold text-3xl text-foreground tracking-tight">
            {fmt(asset.price)}
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`font-mono text-sm ${changeColor}`}>
              {changeSign}₹{Math.abs(asset.change).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className={`font-mono text-sm ${changeColor}`}>
              ({changeSign}{asset.changePercent.toFixed(2)}%)
            </span>
          </div>
          <p className="font-mono text-[10px] text-muted-foreground mt-1.5">
            As of today's close
          </p>
        </section>

        {/* Market data stats */}
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

        {/* Watchlist button */}
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
      </main>
    </div>
  );
}
