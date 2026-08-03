import { useLocation } from 'wouter';
import { Star, ChevronRight } from 'lucide-react';
import { useWatchlist } from '@/hooks/useWatchlist';
import { getAssetBySymbol } from '@/data/marketData';
import { useMarketEngineList } from '@/hooks/useMarketEngineList';

export function Watchlist() {
  const [, setLocation] = useLocation();
  const { watchlist, watchlistLoading } = useWatchlist();
  const engineSnapshots = useMarketEngineList();
  const engineBySymbol = new Map(engineSnapshots.map((s) => [s.symbol, s]));

  const assets = watchlist.map((symbol) => getAssetBySymbol(symbol)).filter((a) => a !== undefined);

  if (watchlistLoading) {
    return (
      <div className="space-y-3">
        <h3 className="text-xs text-muted-foreground uppercase font-mono tracking-wider px-1">Watchlist</h3>
        <div className="space-y-2">
          {[0, 1].map((i) => (
            <div key={i} className="h-16 bg-card border border-border rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="space-y-3">
        <h3 className="text-xs text-muted-foreground uppercase font-mono tracking-wider px-1">Watchlist</h3>
        <div className="bg-card border border-border rounded-xl p-6 text-center flex flex-col items-center justify-center">
          <Star className="w-8 h-8 text-primary/30 mb-3" />
          <h4 className="text-sm text-muted-foreground mb-1">No stocks in watchlist</h4>
          <p className="text-xs text-muted-foreground/60 mb-5">Add stocks to track their performance</p>
          <button
            onClick={() => setLocation('/markets')}
            className="px-5 py-2 border border-primary text-primary rounded-full text-xs font-mono hover:bg-primary/10 transition-colors"
            data-testid="button-add-stocks"
          >
            + Add Stocks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs text-muted-foreground uppercase font-mono tracking-wider">Watchlist</h3>
        <button
          onClick={() => setLocation('/markets')}
          className="text-[10px] font-mono text-primary flex items-center gap-0.5"
        >
          View all <ChevronRight className="w-3 h-3" />
        </button>
      </div>
      <div className="space-y-2">
        {assets.slice(0, 4).map((asset) => {
          const snap = engineBySymbol.get(asset!.symbol);
          const price = snap?.price ?? asset!.price;
          const change = snap ? snap.price - snap.prevClose : asset!.change;
          const changePercent = snap && snap.prevClose !== 0 ? (change / snap.prevClose) * 100 : asset!.changePercent;
          const isPositive = change >= 0;
          return (
            <button
              key={asset!.symbol}
              onClick={() => setLocation(`/markets/${asset!.symbol}`)}
              className="w-full flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3 hover:border-primary/30 transition-colors"
            >
              <div className="text-left">
                <p className="font-mono text-sm font-semibold text-foreground">{asset!.symbol}</p>
                <p className="text-[10px] text-muted-foreground truncate max-w-[160px]">{asset!.name}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm text-foreground">
                  ₹{price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className={`font-mono text-[10px] ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isPositive ? '+' : ''}
                  {changePercent.toFixed(2)}%
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
