import { useState } from 'react';
import { useLocation } from 'wouter';
import { ChevronLeft } from 'lucide-react';
import { STOCKS, INDICES, ALL_ASSETS } from '@/data/marketData';
import type { Asset } from '@/data/marketData';
import { useWatchlist } from '@/hooks/useWatchlist';
import { AssetCard } from '@/components/markets/AssetCard';
import { SearchBar } from '@/components/markets/SearchBar';
import { MarketSkeleton } from '@/components/markets/MarketSkeleton';
import { BottomNav } from '@/components/dashboard/BottomNav';

type Tab = 'all' | 'stocks' | 'indices';

const TAB_LABELS: { id: Tab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'stocks', label: 'Stocks' },
  { id: 'indices', label: 'Indices' },
];

function filterAssets(assets: Asset[], query: string): Asset[] {
  if (!query.trim()) return assets;
  const q = query.toLowerCase();
  return assets.filter(
    (a) => a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q),
  );
}

export default function MarketsPage() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const { watchlistLoading, addStock, removeStock, isInWatchlist } = useWatchlist();

  const baseList = activeTab === 'all' ? ALL_ASSETS : activeTab === 'stocks' ? STOCKS : INDICES;
  const isSearching = search.trim().length > 0;
  const filtered = filterAssets(baseList, search);

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col max-w-[480px] mx-auto pb-16">
      {/* Fixed header */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-background/95 backdrop-blur border-b border-border h-14 flex items-center justify-between px-4 z-40">
        <button
          onClick={() => setLocation('/dashboard')}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1"
          aria-label="Back to dashboard"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-semibold text-base text-foreground">Markets</span>
        <div className="w-6" aria-hidden />
      </header>

      {/* Scrollable content */}
      <main className="flex-1 overflow-y-auto px-4 pt-[72px] pb-4 space-y-4">
        <SearchBar value={search} onChange={setSearch} />

        {/* Tab bar */}
        <div className="flex gap-2">
          {TAB_LABELS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`font-mono text-xs px-4 py-1.5 rounded-full transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-background font-semibold'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Asset list */}
        {watchlistLoading ? (
          <MarketSkeleton count={5} />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-16 gap-2 text-muted-foreground">
            <p className="text-sm">No results for</p>
            <p className="font-mono text-xs text-primary">"{search}"</p>
          </div>
        ) : activeTab === 'all' && !isSearching ? (
          /* Grouped view with section headers */
          <>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground pt-1">
              Stocks
            </p>
            <div className="space-y-2">
              {STOCKS.map((asset) => (
                <AssetCard
                  key={asset.symbol}
                  asset={asset}
                  onPress={() => setLocation(`/markets/${asset.symbol}`)}
                  isInWatchlist={isInWatchlist(asset.symbol)}
                  onWatchlistToggle={() =>
                    isInWatchlist(asset.symbol)
                      ? removeStock(asset.symbol)
                      : addStock(asset.symbol)
                  }
                />
              ))}
            </div>

            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground pt-1">
              Indices
            </p>
            <div className="space-y-2">
              {INDICES.map((asset) => (
                <AssetCard
                  key={asset.symbol}
                  asset={asset}
                  onPress={() => setLocation(`/markets/${asset.symbol}`)}
                  isInWatchlist={isInWatchlist(asset.symbol)}
                  onWatchlistToggle={() =>
                    isInWatchlist(asset.symbol)
                      ? removeStock(asset.symbol)
                      : addStock(asset.symbol)
                  }
                />
              ))}
            </div>
          </>
        ) : (
          /* Flat list (filtered or single-tab) */
          <div className="space-y-2">
            {filtered.map((asset) => (
              <AssetCard
                key={asset.symbol}
                asset={asset}
                onPress={() => setLocation(`/markets/${asset.symbol}`)}
                isInWatchlist={isInWatchlist(asset.symbol)}
                onWatchlistToggle={() =>
                  isInWatchlist(asset.symbol)
                    ? removeStock(asset.symbol)
                    : addStock(asset.symbol)
                }
              />
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
