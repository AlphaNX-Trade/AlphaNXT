import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove, setDoc } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

interface UseWatchlistResult {
  watchlist: string[];
  watchlistLoading: boolean;
  watchlistError: string | null;
  addStock: (symbol: string) => Promise<void>;
  removeStock: (symbol: string) => Promise<void>;
  isInWatchlist: (symbol: string) => boolean;
}

export function useWatchlist(): UseWatchlistResult {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [watchlistLoading, setWatchlistLoading] = useState(true);
  const [watchlistError, setWatchlistError] = useState<string | null>(null);
  const initializing = useRef(false);

  useEffect(() => {
    if (!user) {
      setWatchlist([]);
      setWatchlistLoading(false);
      initializing.current = false;
      return;
    }

    const uid = user.uid;
    initializing.current = false;

    const ref = doc(db, 'watchlist', uid);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setWatchlist(Array.isArray(data.stocks) ? data.stocks : []);
          setWatchlistLoading(false);
        } else {
          // Auto-create watchlist doc if missing
          if (!initializing.current) {
            initializing.current = true;
            setDoc(ref, { stocks: [] })
              .catch((err) => setWatchlistError(err.message))
              .finally(() => setWatchlistLoading(false));
          }
        }
      },
      (err) => {
        setWatchlistError(err.message);
        setWatchlistLoading(false);
      },
    );

    return unsub;
  }, [user]);

  const addStock = async (symbol: string): Promise<void> => {
    if (!user) return;
    const ref = doc(db, 'watchlist', user.uid);
    await updateDoc(ref, { stocks: arrayUnion(symbol) });
  };

  const removeStock = async (symbol: string): Promise<void> => {
    if (!user) return;
    const ref = doc(db, 'watchlist', user.uid);
    await updateDoc(ref, { stocks: arrayRemove(symbol) });
  };

  const isInWatchlist = (symbol: string): boolean => watchlist.includes(symbol);

  return { watchlist, watchlistLoading, watchlistError, addStock, removeStock, isInWatchlist };
}
