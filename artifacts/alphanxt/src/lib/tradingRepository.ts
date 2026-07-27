import {
  doc,
  runTransaction,
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TradeError } from '@/lib/tradingTypes';
import type { HoldingDoc, TradeSide, TradeResult } from '@/lib/tradingTypes';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toTradeResult(err: unknown): TradeResult {
  if (err instanceof TradeError) {
    return { success: false, error: { field: err.field, message: err.message } };
  }
  const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
  return { success: false, error: { field: 'general', message: msg } };
}

async function writeTransaction(
  uid: string,
  symbol: string,
  companyName: string,
  side: TradeSide,
  quantity: number,
  price: number,
  totalAmount: number,
): Promise<void> {
  await addDoc(collection(db, 'transactions'), {
    uid,
    symbol,
    companyName,
    side,
    quantity,
    price,
    totalAmount,
    timestamp: serverTimestamp(),
  });
}

// ─── Buy ──────────────────────────────────────────────────────────────────────

export async function executeBuy(
  uid: string,
  symbol: string,
  companyName: string,
  quantity: number,
  price: number,
): Promise<TradeResult> {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return {
      success: false,
      error: { field: 'quantity', message: 'Quantity must be greater than zero.' },
    };
  }

  const totalCost = Math.round(quantity * price * 100) / 100;
  const portfolioRef = doc(db, 'portfolio', uid);
  const holdingRef = doc(db, 'holdings', uid, 'stocks', symbol);

  try {
    await runTransaction(db, async (tx) => {
      const [portfolioSnap, holdingSnap] = await Promise.all([
        tx.get(portfolioRef),
        tx.get(holdingRef),
      ]);

      if (!portfolioSnap.exists()) {
        throw new TradeError('Portfolio not found. Please restart the app.', 'general');
      }

      const virtualBalance = portfolioSnap.data().virtualBalance as number;

      if (virtualBalance < totalCost) {
        throw new TradeError(
          `Insufficient balance. You need ₹${totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} but have ₹${virtualBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`,
          'balance',
        );
      }

      if (holdingSnap.exists()) {
        const h = holdingSnap.data() as HoldingDoc;
        const newQty = h.quantity + quantity;
        const newTotalInvested = h.totalInvested + totalCost;
        tx.update(holdingRef, {
          quantity: newQty,
          avgBuyPrice: newTotalInvested / newQty,
          totalInvested: newTotalInvested,
        });
      } else {
        const newHolding: HoldingDoc = {
          symbol,
          companyName,
          quantity,
          avgBuyPrice: price,
          totalInvested: totalCost,
        };
        tx.set(holdingRef, newHolding);
      }

      tx.update(portfolioRef, {
        virtualBalance: virtualBalance - totalCost,
        updatedAt: serverTimestamp(),
      });
    });

    await writeTransaction(uid, symbol, companyName, 'BUY', quantity, price, totalCost);
    return { success: true };
  } catch (err) {
    return toTradeResult(err);
  }
}

// ─── Sell ─────────────────────────────────────────────────────────────────────

export async function executeSell(
  uid: string,
  symbol: string,
  companyName: string,
  quantity: number,
  price: number,
): Promise<TradeResult> {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return {
      success: false,
      error: { field: 'quantity', message: 'Quantity must be greater than zero.' },
    };
  }

  const totalAmount = Math.round(quantity * price * 100) / 100;
  const portfolioRef = doc(db, 'portfolio', uid);
  const holdingRef = doc(db, 'holdings', uid, 'stocks', symbol);

  try {
    await runTransaction(db, async (tx) => {
      const [portfolioSnap, holdingSnap] = await Promise.all([
        tx.get(portfolioRef),
        tx.get(holdingRef),
      ]);

      if (!holdingSnap.exists()) {
        throw new TradeError(
          'You do not own any shares of this stock.',
          'holding',
        );
      }

      const h = holdingSnap.data() as HoldingDoc;

      if (h.quantity < quantity) {
        throw new TradeError(
          `You only own ${h.quantity} share${h.quantity === 1 ? '' : 's'} of ${symbol}.`,
          'holding',
        );
      }

      if (!portfolioSnap.exists()) {
        throw new TradeError('Portfolio not found. Please restart the app.', 'general');
      }

      const virtualBalance = portfolioSnap.data().virtualBalance as number;
      const currentTotalPL = (portfolioSnap.data().totalProfitLoss as number) ?? 0;
      const realizedPL = (price - h.avgBuyPrice) * quantity;

      const newQty = h.quantity - quantity;
      if (newQty === 0) {
        tx.delete(holdingRef);
      } else {
        tx.update(holdingRef, {
          quantity: newQty,
          totalInvested: h.avgBuyPrice * newQty,
        });
      }

      tx.update(portfolioRef, {
        virtualBalance: virtualBalance + totalAmount,
        totalProfitLoss: currentTotalPL + realizedPL,
        updatedAt: serverTimestamp(),
      });
    });

    await writeTransaction(uid, symbol, companyName, 'SELL', quantity, price, totalAmount);
    return { success: true };
  } catch (err) {
    return toTradeResult(err);
  }
}
