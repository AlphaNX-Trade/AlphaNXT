import { useEffect, useState } from 'react';
import { ALL_ASSETS, type Asset } from '@/data/marketData';
import { subscribeToAdminStocks, type AdminStockDoc } from '@/lib/adminStocksService';
import { marketEngine } from '@/lib/marketEngine/engine';

let adminAssetsCache: Asset[] = [];
const cacheListeners = new Set<() => void>();
let subscribed = false;

export function ensureAdminStocksSubscribed() {
  if (subscribed) return;
  subscribed = true;
  subscribeToAdminStocks((docs: AdminStockDoc[]) => {
    const newlyAdded = docs.filter((d) => !adminAssetsCache.some((a) => a.symbol === d.symbol));
    adminAssetsCache = docs.map(({ addedBy, createdAt, ...asset }) => asset);
    cacheListeners.forEach((cb) => cb());

    // Feed any newly-added stock into the running simulation engine so it
    // starts ticking immediately, without needing a page reload.
    for (const stock of newlyAdded) {
      marketEngine.addStock({
        symbol: stock.symbol,
        name: stock.name,
        price: stock.price,
        sector: stock.sector,
        type: stock.type,
      });
    }
  });
}

/** All assets = your original static 26 + any admin-added stocks, live. */
export function useAllAssets(): Asset[] {
  const [assets, setAssets] = useState<Asset[]>([...ALL_ASSETS, ...adminAssetsCache]);

  useEffect(() => {
    ensureAdminStocksSubscribed();
    const listener = () => setAssets([...ALL_ASSETS, ...adminAssetsCache]);
    cacheListeners.add(listener);
    listener();
    return () => {
      cacheListeners.delete(listener);
    };
  }, []);

  return assets;
}

export function getAssetBySymbolMerged(symbol: string): Asset | undefined {
  return ALL_ASSETS.find((a) => a.symbol === symbol) ?? adminAssetsCache.find((a) => a.symbol === symbol);
}
