import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import type { HoldingDoc } from '@/lib/tradingTypes';

interface UseHoldingResult {
  holding: HoldingDoc | null;
  holdingLoading: boolean;
}

/** Subscribes to a single holding: holdings/{uid}/stocks/{symbol} */
export function useHolding(symbol: string): UseHoldingResult {
  const { user } = useAuth();
  const [holding, setHolding] = useState<HoldingDoc | null>(null);
  const [holdingLoading, setHoldingLoading] = useState(true);

  useEffect(() => {
    if (!user || !symbol) {
      setHolding(null);
      setHoldingLoading(false);
      return;
    }
    const ref = doc(db, 'holdings', user.uid, 'stocks', symbol);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setHolding(snap.exists() ? (snap.data() as HoldingDoc) : null);
        setHoldingLoading(false);
      },
      () => {
        setHolding(null);
        setHoldingLoading(false);
      },
    );
    return unsub;
  }, [user, symbol]);

  return { holding, holdingLoading };
}
