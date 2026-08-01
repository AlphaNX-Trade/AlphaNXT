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
import { todayDateString, currentWeekString } from '@/lib/dateUtils';
import { syncLeaderboardEntry } from '@/lib/leaderboardService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toTradeResult(err: unknown): TradeResult {
  if (err instanceof TradeError) {
    return { success: false, error: { field: err.field, message: err.message } };
  }
  const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
  return { success: false, error: { field: 'general', message: msg } };
}

/**
 * Heuristic 0-100 risk score, blended over time (not a rigorous statistical
 * measure). Rises with larger position sizes relative to portfolio value and
 * with trades that have no stop loss defined; smoothed against the previous
 * score so a single trade doesn't swing it drastically.
 */
function blendRiskScore(previousScore: number, positionSizePercent: number, hasStopLoss: boolean): number {
  const clampedPositionSize = Math.min(100, Math.max(0, positionSizePercent));
  const noStopLossPenalty = hasStopLoss ? 0 : 15;
  const tradeRisk = Math.min(100, clampedPositionSize * 2 + noStopLossPenalty);
  const blended = previousScore * 0.7 + tradeRisk * 0.3;
  return Math.round(Math.min(100, Math.max(0, blended)));
}

async function writeTransaction(
  uid: string,
  symbol: string,
  companyName: string,
  side: TradeSide,
  quantity: number,
  price: number,
  totalAmount: number,
  extra?: Record<string, number>,
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
    ...extra,
  });
}

// ─── Buy ──────────────────────────────────────────────────────────────────────

export async function executeBuy(
  uid: string,
  symbol: string,
  companyName: string,
  quantity: number,
  price: number,
  plannedStopLoss?: number,
  plannedTakeProfit?: number,
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
      const currentTotalInvested = (portfolioSnap.data().totalInvested as number) ?? 0;
      const currentRiskScore = (portfolioSnap.data().riskScore as number) ?? 0;

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
          // Keep the original entry timestamp and risk plan — averaging in
          // more shares doesn't reset when the position was first opened.
        });
      } else {
        const newHolding: HoldingDoc = {
          symbol,
          companyName,
          quantity,
          avgBuyPrice: price,
          totalInvested: totalCost,
          firstBuyAt: serverTimestamp() as unknown as HoldingDoc['firstBuyAt'],
          ...(plannedStopLoss !== undefined ? { plannedStopLoss } : {}),
          ...(plannedTakeProfit !== undefined ? { plannedTakeProfit } : {}),
        };
        tx.set(holdingRef, newHolding);
      }

      const portfolioValueBeforeTrade = virtualBalance + currentTotalInvested;
      const positionSizePercent =
        portfolioValueBeforeTrade > 0 ? (totalCost / portfolioValueBeforeTrade) * 100 : 100;
      const newTotalInvested = currentTotalInvested + totalCost;
      const newVirtualBalance = virtualBalance - totalCost;

      const today = todayDateString();
      const currentTodayTradeCount = (portfolioSnap.data().todayTradeCount as number) ?? 0;
      const currentTodayTradeCountDate = portfolioSnap.data().todayTradeCountDate as string | undefined;
      const newTodayTradeCount = currentTodayTradeCountDate === today ? currentTodayTradeCount + 1 : 1;

      tx.update(portfolioRef, {
        virtualBalance: newVirtualBalance,
        totalInvested: newTotalInvested,
        portfolioValue: newVirtualBalance + newTotalInvested,
        riskScore: blendRiskScore(currentRiskScore, positionSizePercent, plannedStopLoss !== undefined),
        todayTradeCount: newTodayTradeCount,
        todayTradeCountDate: today,
        updatedAt: serverTimestamp(),
      });
    });

    await writeTransaction(uid, symbol, companyName, 'BUY', quantity, price, totalCost, {
      ...(plannedStopLoss !== undefined ? { plannedStopLoss } : {}),
      ...(plannedTakeProfit !== undefined ? { plannedTakeProfit } : {}),
    });
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

  let completedTrade: TradeResult['completedTrade'];

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
      const currentTotalInvested = (portfolioSnap.data().totalInvested as number) ?? 0;
      const currentTotalTrades = (portfolioSnap.data().totalTrades as number) ?? 0;
      const currentWinningTrades = (portfolioSnap.data().winningTrades as number) ?? 0;
      const currentTodayPL = (portfolioSnap.data().todayProfitLoss as number) ?? 0;
      const currentTodayDate = portfolioSnap.data().todayProfitLossDate as string | undefined;
      const currentWeekPL = (portfolioSnap.data().weekProfitLoss as number) ?? 0;
      const currentWeekPLWeek = portfolioSnap.data().weekProfitLossWeek as string | undefined;
      const currentTodayTradeCount = (portfolioSnap.data().todayTradeCount as number) ?? 0;
      const currentTodayTradeCountDate = portfolioSnap.data().todayTradeCountDate as string | undefined;
      const realizedPL = (price - h.avgBuyPrice) * quantity;

      const firstBuyMs = h.firstBuyAt?.toMillis?.() ?? Date.now();
      completedTrade = {
        entryPrice: h.avgBuyPrice,
        exitPrice: price,
        quantity,
        holdingDurationMs: Math.max(0, Date.now() - firstBuyMs),
        plannedStopLoss: h.plannedStopLoss,
        plannedTakeProfit: h.plannedTakeProfit,
      };

      const newQty = h.quantity - quantity;
      const costBasisRemoved = h.avgBuyPrice * quantity;
      if (newQty === 0) {
        tx.delete(holdingRef);
      } else {
        tx.update(holdingRef, {
          quantity: newQty,
          totalInvested: h.avgBuyPrice * newQty,
        });
      }

      const newTotalInvested = Math.max(0, currentTotalInvested - costBasisRemoved);
      const newVirtualBalance = virtualBalance + totalAmount;
      const newTotalTrades = currentTotalTrades + 1;
      const newWinningTrades = currentWinningTrades + (realizedPL >= 0 ? 1 : 0);

      const today = todayDateString();
      const newTodayPL = currentTodayDate === today ? currentTodayPL + realizedPL : realizedPL;

      const thisWeek = currentWeekString();
      const newWeekPL = currentWeekPLWeek === thisWeek ? currentWeekPL + realizedPL : realizedPL;

      const newTodayTradeCount = currentTodayTradeCountDate === today ? currentTodayTradeCount + 1 : 1;

      tx.update(portfolioRef, {
        virtualBalance: newVirtualBalance,
        totalProfitLoss: currentTotalPL + realizedPL,
        totalInvested: newTotalInvested,
        portfolioValue: newVirtualBalance + newTotalInvested,
        totalTrades: newTotalTrades,
        winningTrades: newWinningTrades,
        winRate: newTotalTrades > 0 ? (newWinningTrades / newTotalTrades) * 100 : 0,
        todayProfitLoss: newTodayPL,
        todayProfitLossDate: today,
        weekProfitLoss: newWeekPL,
        weekProfitLossWeek: thisWeek,
        todayTradeCount: newTodayTradeCount,
        todayTradeCountDate: today,
        updatedAt: serverTimestamp(),
      });
    });

    // Best-effort — the leaderboard is a supplementary feature, so a sync
    // failure here should never block the trade itself from succeeding.
    syncLeaderboardEntry(uid).catch((err) => {
      console.warn('[tradingRepository] Leaderboard sync failed:', err);
    });

    await writeTransaction(uid, symbol, companyName, 'SELL', quantity, price, totalAmount, {
      entryPrice: completedTrade!.entryPrice,
      realizedPL: (price - completedTrade!.entryPrice) * quantity,
      holdingDurationMs: completedTrade!.holdingDurationMs,
    });
    return { success: true, completedTrade };
  } catch (err) {
    return toTradeResult(err);
  }
}
