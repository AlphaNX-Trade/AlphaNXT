import { collection, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { getAssetBySymbol } from '@/data/marketData';
import type { HoldingDoc } from '@/lib/tradingTypes';

export interface HoldingWithValue extends HoldingDoc {
  currentPrice: number;
  currentValue: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
}

export interface UseHoldingsResult {
  holdings: HoldingWithValue[];
  holdingsLoading: boolean;
  holdingsError: string | null;
  totalInvested: number;
  totalCurrentValue: number;
  totalUnrealizedPL: number;
}

export function useHoldings(): UseHoldingsResult {
  const { user } = useAuth();
  const [rawHoldings, setRawHoldings] = useState<HoldingDoc[]>([]);
  const [holdingsLoading, setHoldingsLoading] = useState(true);
  const [holdingsError, setHoldingsError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setRawHoldings([]);
      setHoldingsLoading(false);
      return;
    }

    const ref = collection(db, 'holdings', user.uid, 'stocks');
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setRawHoldings(snap.docs.map((d) => d.data() as HoldingDoc));
        setHoldingsLoading(false);
        setHoldingsError(null);
      },
      (err) => {
        setHoldingsError(err.message);
        setHoldingsLoading(false);
      },
    );
    return unsub;
  }, [user]);

  const holdings: HoldingWithValue[] = rawHoldings.map((h) => {
    const asset = getAssetBySymbol(h.symbol);
    const currentPrice = asset?.price ?? h.avgBuyPrice;
    const currentValue = currentPrice * h.quantity;
    const unrealizedPL = currentValue - h.totalInvested;
    const unrealizedPLPercent =
      h.totalInvested > 0 ? (unrealizedPL / h.totalInvested) * 100 : 0;
    return { ...h, currentPrice, currentValue, unrealizedPL, unrealizedPLPercent };
  });

  const totalInvested = holdings.reduce((s, h) => s + h.totalInvested, 0);
  const totalCurrentValue = holdings.reduce((s, h) => s + h.currentValue, 0);
  const totalUnrealizedPL = holdings.reduce((s, h) => s + h.unrealizedPL, 0);

  return {
    holdings,
    holdingsLoading,
    holdingsError,
    totalInvested,
    totalCurrentValue,
    totalUnrealizedPL,
  };
}
