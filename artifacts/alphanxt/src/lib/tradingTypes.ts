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
}

export interface TradeValidationError {
  field: 'quantity' | 'balance' | 'holding' | 'general';
  message: string;
}

export interface TradeResult {
  success: boolean;
  error?: TradeValidationError;
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
