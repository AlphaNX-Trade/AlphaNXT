import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { executeBuy, executeSell } from '@/lib/tradingRepository';
import type { TradeSide, TradeResult } from '@/lib/tradingTypes';

interface UseTradeResult {
  executeTrade: (
    side: TradeSide,
    symbol: string,
    companyName: string,
    quantity: number,
    price: number,
  ) => Promise<TradeResult>;
  isSubmitting: boolean;
  lastResult: TradeResult | null;
  reset: () => void;
}

export function useTrade(): UseTradeResult {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<TradeResult | null>(null);

  const executeTrade = async (
    side: TradeSide,
    symbol: string,
    companyName: string,
    quantity: number,
    price: number,
  ): Promise<TradeResult> => {
    if (!user) {
      const result: TradeResult = {
        success: false,
        error: { field: 'general', message: 'Not authenticated.' },
      };
      setLastResult(result);
      return result;
    }

    setIsSubmitting(true);
    setLastResult(null);

    try {
      const result =
        side === 'BUY'
          ? await executeBuy(user.uid, symbol, companyName, quantity, price)
          : await executeSell(user.uid, symbol, companyName, quantity, price);
      setLastResult(result);
      return result;
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => setLastResult(null);

  return { executeTrade, isSubmitting, lastResult, reset };
}
