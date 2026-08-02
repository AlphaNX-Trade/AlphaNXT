import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import type { TransactionDoc } from '@/lib/tradingTypes';

export interface TransactionRow extends TransactionDoc {
  id: string;
}

interface UseTransactionHistoryResult {
  transactions: TransactionRow[];
  historyLoading: boolean;
  historyError: string | null;
}

/** Real-time subscription to the signed-in user's most recent trades. */
export function useTransactionHistory(maxResults = 100): UseTransactionHistoryResult {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setHistoryLoading(false);
      return;
    }

    const q = query(
      collection(db, 'transactions'),
      where('uid', '==', user.uid),
      orderBy('timestamp', 'desc'),
      limit(maxResults),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setTransactions(snap.docs.map((d) => ({ id: d.id, ...(d.data() as TransactionDoc) })));
        setHistoryLoading(false);
        setHistoryError(null);
      },
      (err) => {
        setHistoryError(err.message);
        setHistoryLoading(false);
      },
    );

    return unsub;
  }, [user, maxResults]);

  return { transactions, historyLoading, historyError };
}
