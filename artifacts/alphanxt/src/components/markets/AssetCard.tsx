import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import type { Asset } from '@/data/marketData';

interface AssetCardProps {
  asset: Asset;
  onPress: () => void;
  isInWatchlist: boolean;
  onWatchlistToggle: () => void;
}

export function AssetCard({ asset, onPress, isInWatchlist, onWatchlistToggle }: AssetCardProps) {
  const isPositive = asset.change >= 0;
  const changeColor = isPositive ? 'text-emerald-400' : 'text-red-400';
  const changeSign = isPositive ? '+' : '';

  const formattedPrice = `₹${asset.price.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onPress}
      className="bg-card border border-border rounded-xl px-4 py-3 flex items-center justify-between gap-3 cursor-pointer transition-colors hover:border-primary/30 active:scale-[0.99]"
    >
      {/* Left: symbol + name */}
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="font-mono text-xs font-semibold text-primary tracking-wide">
          {asset.symbol}
        </span>
        <span className="text-xs text-muted-foreground truncate max-w-[160px]">
          {asset.name}
        </span>
      </div>

      {/* Right: price + change + watchlist */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex flex-col items-end gap-0.5">
          <span className="font-mono font-semibold text-sm text-foreground">
            {formattedPrice}
          </span>
          <span className={`font-mono text-xs ${changeColor}`}>
            {changeSign}{asset.changePercent.toFixed(2)}%
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onWatchlistToggle();
          }}
          className="p-0.5 transition-colors"
          aria-label={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
        >
          <Star
            className={`w-4 h-4 ${
              isInWatchlist
                ? 'text-primary fill-primary'
                : 'text-muted-foreground fill-transparent'
            }`}
          />
        </button>
      </div>
    </motion.div>
  );
}
