import { useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { ChevronLeft } from 'lucide-react';
import { STOCKS, INDICES, ALL_ASSETS } from '@/data/marketData';
import type { Asset } from '@/data/marketData';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useMarketEngineList } from '@/hooks/useMarketEngineList';
import { AssetCard } from '@/components/markets/AssetCard';
import { SearchBar } from '@/components/markets/SearchBar';
import { MarketSkeleton } from '@/components/markets/MarketSkeleton';
import { BottomNav } from '@/components/dashboard/BottomNav';

type TabId =
  | 'all'
  | 'watchlist'
  | 'banking'
  | 'it'
  | 'auto'
  | 'pharma'
  | 'fmcg'
  | 'energy'
  | 'infra'
  | 'gainers'
  | 'losers'
  | 'active';

// Sector-based and computed tabs are built only from real data already in
// marketData.ts. "Trending" from the original spec is still intentionally
// left out — there's no real trending signal (e.g. view/watchlist-add counts)
// in the current dataset, and a fake "trending" tab would be worse than
// no tab at all. Add them once real data backs them.
const TABS: { id: TabId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'watchlist', label: 'Watchlist' },
  { id: 'banking', label: 'Banking' },
  { id: 'it', label: 'IT' },
  { id: 'auto', label: 'Auto' },
  { id: 'pharma', label: 'Pharma' },
  { id: 'fmcg', label: 'FMCG' },
  { id: 'energy', label: 'Energy' },
  { id: 'infra', label: 'Infrastructure' },
  { id: 'gainers', label: 'Top Gainers' },
  { id: 'losers', label: 'Top Losers' },
  { id: 'active', label: 'Most Active' },
];

const SECTOR_BY_TAB: Partial<Record<TabId, string>> = {
  banking: 'Banking',
  it: 'Information Technology',
  auto: 'Automobile',
  pharma: 'Pharma',
  fmcg: 'FMCG',
  energy: 'Energy',
  infra: 'Infrastructure',
};

/** Parses volume strings like "8.4M" or "1.2B" into a comparable number. */
function parseVolume(volume: string): number {
  const match = volume.match(/^([\d.]+)([MBK]?)$/i);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  const suffix = match[2].toUpperCase();
  if (suffix === 'B') return num * 1_000_000_000;
  if (suffix === 'M') return num * 1_000_000;
  if (suffix === 'K') return num * 1_000;
  return num;
}

function exchangeLabel(asset: Asset): string {
  return asset.type === 'index' ? 'INDEX' : 'NSE';
}

function filterBySearch(assets: Asset[], query: string): Asset[] {
  if (!query.trim()) return assets;
  const q = query.toLowerCase();
  return assets.filter(
    (a) =>
      a.symbol.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.sector.toLowerCase().includes(q) ||
      exchangeLabel(a).toLowerCase().includes(q),
  );
}

export default function MarketsPage() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const { watchlistLoading, addStock, removeStock, isInWatchlist } = useWatchlist();
  const engineSnapshots = useMarketEngineList();

  const engineBySymbol = useMemo(
    () => new Map(engineSnapshots.map((s) => [s.symbol, s])),
    [engineSnapshots],
  );

  const liveChangePercent = (symbol: string, fallback: number): number => {
    const snap = engineBySymbol.get(symbol);
    if (!snap || snap.prevClose === 0) return fallback;
    return ((snap.price - snap.prevClose) / snap.prevClose) * 100;
  };

  const isSearching = search.trim().length > 0;

  const tabFiltered = useMemo(() => {
    switch (activeTab) {
      case 'all':
        return ALL_ASSETS;
      case 'watchlist':
        return ALL_ASSETS.filter((a) => isInWatchlist(a.symbol));
      case 'gainers':
        return [...STOCKS].sort(
          (a, b) => liveChangePercent(b.symbol, b.changePercent) - liveChangePercent(a.symbol, a.changePercent),
        );
      case 'losers':
        return [...STOCKS].sort(
          (a, b) => liveChangePercent(a.symbol, a.changePercent) - liveChangePercent(b.symbol, b.changePercent),
        );
      case 'active':
        return [...STOCKS].sort((a, b) => parseVolume(b.volume) - parseVolume(a.volume));
      default: {
        const sector = SECTOR_BY_TAB[activeTab];
        return sector ? STOCKS.filter((a) => a.sector === sector) : ALL_ASSETS;
      }
    }
    // isInWatchlist reference changes on every hook render, but its
    // underlying data only changes when the watchlist itself changes —
    // recomputing per keystroke elsewhere is fine for a list this small.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isInWatchlist, engineBySymbol]);

  const filtered = filterBySearch(tabFiltered, search);
  const showGrouped = activeTab === 'all' && !isSearching;

  const renderCard = (asset: Asset) => {
    const snap = engineBySymbol.get(asset.symbol);
    return (
      <AssetCard
        key={asset.symbol}
        asset={asset}
        onPress={() => setLocation(`/markets/${asset.symbol}`)}
        isInWatchlist={isInWatchlist(asset.symbol)}
        onWatchlistToggle={() =>
          isInWatchlist(asset.symbol) ? removeStock(asset.symbol) : addStock(asset.symbol)
        }
        livePrice={snap?.price}
        liveChangePercent={snap ? liveChangePercent(asset.symbol, asset.changePercent) : undefined}
      />
    );
  };

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

        {/* Tab bar — horizontally scrollable, more categories than fit on screen */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 font-mono text-xs px-4 py-1.5 rounded-full transition-colors ${
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
          <div className="flex flex-col items-center justify-center pt-16 gap-2 text-muted-foreground text-center px-6">
            {isSearching ? (
              <>
                <p className="text-sm">No results for</p>
                <p className="font-mono text-xs text-primary">"{search}"</p>
              </>
            ) : activeTab === 'watchlist' ? (
              <p className="text-sm">Your watchlist is empty — add stocks from their detail page.</p>
            ) : (
              <p className="text-sm">No assets in this category yet.</p>
            )}
          </div>
        ) : showGrouped ? (
          /* Grouped view with section headers */
          <>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground pt-1">
              Stocks
            </p>
            <div className="space-y-2">{STOCKS.map(renderCard)}</div>

            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground pt-1">
              Indices
            </p>
            <div className="space-y-2">{INDICES.map(renderCard)}</div>
          </>
        ) : (
          /* Flat list (filtered, category tab, or search) */
          <div className="space-y-2">{filtered.map(renderCard)}</div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
