import { Star } from 'lucide-react';

export function Watchlist() {
  return (
    <div className="space-y-3">
      <h3 className="text-xs text-muted-foreground uppercase font-mono tracking-wider px-1">Watchlist</h3>
      <div className="bg-card border border-border rounded-xl p-6 text-center flex flex-col items-center justify-center">
        <Star className="w-8 h-8 text-primary/30 mb-3" />
        <h4 className="text-sm text-muted-foreground mb-1">No stocks in watchlist</h4>
        <p className="text-xs text-muted-foreground/60 mb-5">Add stocks to track their performance</p>
        <button className="px-5 py-2 border border-primary text-primary rounded-full text-xs font-mono hover:bg-primary/10 transition-colors" data-testid="button-add-stocks">
          + Add Stocks
        </button>
      </div>
    </div>
  );
}
