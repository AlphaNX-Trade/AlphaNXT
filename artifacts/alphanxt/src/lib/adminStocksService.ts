import { collection, doc, setDoc, deleteDoc, onSnapshot, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Asset } from '@/data/marketData';

/**
 * stocks/{symbol} — admin-added stocks only. Your original 26 stocks/
 * indices stay in marketData.ts unchanged; this collection is purely
 * additive, merged on top by useAllAssets(). Keeping the static list
 * as-is means nothing that already depends on it can break.
 */
export interface AdminStockDoc extends Asset {
  addedBy: string;
  createdAt: unknown;
}

export async function addAdminStock(
  adminEmail: string,
  stock: Asset,
): Promise<void> {
  const symbol = stock.symbol.trim().toUpperCase();
  if (!symbol) throw new Error('Symbol is required.');
  if (!stock.name.trim()) throw new Error('Company name is required.');
  if (!Number.isFinite(stock.price) || stock.price <= 0) throw new Error('Price must be greater than zero.');

  const docData: AdminStockDoc = {
    ...stock,
    symbol,
    addedBy: adminEmail,
    createdAt: serverTimestamp(),
  };

  await setDoc(doc(db, 'stocks', symbol), docData);
}

export async function removeAdminStock(symbol: string): Promise<void> {
  await deleteDoc(doc(db, 'stocks', symbol));
}

export function subscribeToAdminStocks(callback: (stocks: AdminStockDoc[]) => void): () => void {
  const q = query(collection(db, 'stocks'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => d.data() as AdminStockDoc));
  });
}
