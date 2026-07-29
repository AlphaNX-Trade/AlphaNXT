import type { Timestamp } from 'firebase/firestore';

export type TradeSide = 'BUY' | 'SELL';
export type OrderType = 'MARKET' | 'LIMIT' | 'STOP_LOSS' | 'TAKE_PROFIT';

/** holdings/{uid}/stocks/{symbol} */
export interface HoldingDoc {
  symbol: string;
  companyName: string;
  quantity: number;
  avgBuyPrice: number;
  totalInvested: number;
  /** Timestamp of the position's first BUY — used to compute holding duration for the AI Coach. */
  firstBuyAt?: Timestamp;
  /** Optional risk plan set at entry — informational only, not an auto-executed order. */
  plannedStopLoss?: number;
  plannedTakeProfit?: number;
}

/** transactions/{autoId} */
export interface TransactionDoc {
  uid: string;
  symbol: string;
  companyName: string;
  side: TradeSide;
  quantity: number;
  price: number;
  totalAmount: number;
  timestamp: Timestamp;
  // BUY-only (optional risk plan)
  plannedStopLoss?: number;
  plannedTakeProfit?: number;
  // SELL-only (completed-trade data for the AI Coach)
  entryPrice?: number;
  realizedPL?: number;
  holdingDurationMs?: number;
}

export interface TradeValidationError {
  field: 'quantity' | 'balance' | 'holding' | 'general';
  message: string;
}

export interface CompletedTradeData {
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  holdingDurationMs: number;
  plannedStopLoss?: number;
  plannedTakeProfit?: number;
}

export interface TradeResult {
  success: boolean;
  error?: TradeValidationError;
  /** Populated on a successful SELL — feeds the AI Trading Coach analysis. */
  completedTrade?: CompletedTradeData;
}

/** Internal error class used inside Firestore transactions */
export class TradeError extends Error {
  field: TradeValidationError['field'];
  constructor(message: string, field: TradeValidationError['field']) {
    super(message);
    this.name = 'TradeError';
    this.field = field;
  }
}
