import { useLocation } from 'wouter';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { INDICES } from '@/data/marketData';
import { useMarketEngineList } from '@/hooks/useMarketEngineList';

export function MarketOverview() {
  const [, setLocation] = useLocation();
  const engineSnapshots = useMarketEngineList();
  const engineBySymbol = new Map(engineSnapshots.map((s) => [s.symbol, s]));

  return (
    <div className="space-y-3">
      <h3 className="text-xs text-muted-foreground uppercase font-mono tracking-wider px-1">Markets</h3>
      <div className="flex overflow-x-auto gap-3 pb-2 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {INDICES.map((idx) => {
          const snap = engineBySymbol.get(idx.symbol);
          const price = snap?.price ?? idx.price;
          const change = snap ? snap.price - snap.prevClose : idx.change;
          const changePercent = snap && snap.prevClose !== 0 ? (change / snap.prevClose) * 100 : idx.changePercent;
          const isPositive = change >= 0;
          return (
            <button
              key={idx.symbol}
              onClick={() => setLocation(`/markets/${idx.symbol}`)}
              className="min-w-[160px] bg-card border border-border rounded-xl p-3 snap-start shrink-0 text-left hover:border-primary/30 transition-colors"
            >
              <div className="text-[10px] font-mono text-muted-foreground uppercase mb-1">{idx.name}</div>
              <div className="text-lg font-mono font-semibold text-foreground mb-1">
                {price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div
                className={`text-xs flex items-center font-mono ${isPositive ? 'text-success' : 'text-destructive'}`}
              >
                {isPositive ? (
                  <ArrowUpRight className="w-3 h-3 mr-0.5" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 mr-0.5" />
                )}
                {isPositive ? '+' : ''}
                {change.toFixed(2)} ({isPositive ? '+' : ''}
                {changePercent.toFixed(2)}%)
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
