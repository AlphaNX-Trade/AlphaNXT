import { useState } from 'react';
import { useLocation } from 'wouter';
import {
  ChevronLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAssetBySymbol } from '@/data/marketData';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useHolding } from '@/hooks/useHolding';
import { useTrade } from '@/hooks/useTrade';
import { useLiveAsset } from '@/hooks/useLiveAsset';
import { LiveChart } from '@/components/markets/LiveChart';
import { BottomNav } from '@/components/dashboard/BottomNav';
import { OrderTypePicker } from '@/components/trade/OrderTypePicker';
import type { TradeSide } from '@/lib/tradingTypes';

interface TradePageProps {
  symbol?: string;
}

// ─── Select-asset screen (no symbol) ─────────────────────────────────────────

function SelectAssetScreen() {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-[100dvh] bg-background flex flex-col max-w-[480px] mx-auto">
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-background/95 backdrop-blur border-b border-border h-14 flex items-center justify-between px-4 z-40">
        <button
          onClick={() => setLocation('/dashboard')}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-semibold text-base">Trade</span>
        <div className="w-6" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center gap-5 px-6 pt-14 pb-20">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <TrendingUp className="w-8 h-8 text-primary" />
        </div>
        <div className="text-center space-y-1.5">
          <p className="font-semibold text-foreground">Select an asset to trade</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Browse the markets and tap an asset to start paper trading with your virtual ₹1,00,000.
          </p>
        </div>
        <button
          onClick={() => setLocation('/markets')}
          className="bg-primary text-background font-mono font-semibold text-sm px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
        >
          Browse Markets
        </button>
      </main>

      <BottomNav />
    </div>
  );
}

// ─── Main trade form ──────────────────────────────────────────────────────────

export default function TradePage({ symbol }: TradePageProps) {
  const [, setLocation] = useLocation();
  const [side, setSide] = useState<TradeSide>('BUY');
  const [qtyStr, setQtyStr] = useState('1');
  const [showSuccess, setShowSuccess] = useState(false);

  const { profile } = useUserProfile();
  const { holding, holdingLoading } = useHolding(symbol ?? '');
  const { executeTrade, isSubmitting, lastResult, reset } = useTrade();
  const { livePrice, liveChange, liveChangePercent, series, isLive, liveLoading, liveError } =
    useLiveAsset(symbol);

  const asset = symbol ? getAssetBySymbol(symbol) : undefined;

  // Show select-asset screen when no valid symbol
  if (!symbol || !asset) return <SelectAssetScreen />;

  // Use live price when available; fall back to static placeholder data otherwise.
  // This is the price actually used for order calculation and validation, so
  // P/L reflects the real market when a live feed is connected.
  const effectivePrice = livePrice ?? asset.price;
  const effectiveChangePercent = liveChangePercent ?? asset.changePercent;

  const qty = Math.max(0, parseInt(qtyStr, 10) || 0);
  const totalAmount = Math.round(qty * effectivePrice * 100) / 100;
  const virtualBalance = profile?.virtualBalance ?? 0;
  const isPositive = (liveChange ?? asset.change) >= 0;

  // Client-side validation (preview only — server validates too)
  const validationError = (): string | null => {
    if (qty <= 0) return 'Enter a quantity greater than zero.';
    if (side === 'BUY' && totalAmount > virtualBalance)
      return 'Insufficient balance for this order.';
    if (side === 'SELL') {
      if (!holding) return 'You do not own any shares of this stock.';
      if (qty > holding.quantity)
        return `You only own ${holding.quantity} share${holding.quantity === 1 ? '' : 's'}.`;
    }
    return null;
  };

  const clientError = validationError();
  const canSubmit = !clientError && !isSubmitting && !showSuccess;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const result = await executeTrade(side, asset.symbol, asset.name, qty, effectivePrice);
    if (result.success) {
      setShowSuccess(true);
      setQtyStr('1');
      setTimeout(() => {
        setShowSuccess(false);
        reset();
      }, 2500);
    }
  };

  const adjustQty = (delta: number) => {
    setQtyStr(String(Math.max(1, (parseInt(qtyStr, 10) || 0) + delta)));
  };

  const handleMax = () => {
    if (side === 'BUY') {
      const maxQty = Math.floor(virtualBalance / effectivePrice);
      setQtyStr(String(Math.max(1, maxQty)));
    } else {
      setQtyStr(String(holding?.quantity ?? 1));
    }
  };

  const fmt = (n: number) =>
    `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col max-w-[480px] mx-auto">
      {/* Fixed header */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-background/95 backdrop-blur border-b border-border h-14 flex items-center justify-between px-4 z-40">
        <button
          onClick={() => setLocation(`/markets/${symbol}`)}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col items-center">
          <span className="font-mono text-sm font-semibold text-foreground">{asset.symbol}</span>
          <span className="text-[10px] text-muted-foreground max-w-[180px] truncate">{asset.name}</span>
        </div>
        <div className="w-6" />
      </header>

      {/* Scrollable content */}
      <main className="flex-1 overflow-y-auto px-4 pt-[72px] pb-8 space-y-4">
        {/* Live chart */}
        <LiveChart
          series={series}
          isLive={isLive}
          loading={liveLoading}
          error={liveError}
          isPositive={isPositive}
        />

        {/* UP / DOWN toggle */}
        <div className="grid grid-cols-2 gap-3">
          {(['BUY', 'SELL'] as TradeSide[]).map((s) => {
            const isUp = s === 'BUY';
            const isActive = side === s;
            return (
              <button
                key={s}
                onClick={() => {
                  setSide(s);
                  reset();
                  setQtyStr('1');
                }}
                className={`flex items-center justify-center gap-2 py-4 rounded-xl font-mono font-bold text-base transition-all border ${
                  isActive
                    ? isUp
                      ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.35)]'
                      : 'bg-red-500 border-red-400 text-white shadow-[0_0_20px_rgba(239,68,68,0.35)]'
                    : isUp
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/15'
                      : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/15'
                }`}
              >
                {isUp ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                {isUp ? 'UP' : 'DOWN'}
              </button>
            );
          })}
        </div>

        {/* Order type */}
        <OrderTypePicker />

        {/* Market price */}
        <div className="bg-card border border-border rounded-xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Market Price
            </span>
            {isLive && (
              <span className="font-mono text-[9px] uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                Live
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono font-semibold text-foreground">{fmt(effectivePrice)}</span>
            <span className={`font-mono text-xs ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {isPositive ? '+' : ''}
              {effectiveChangePercent.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Quantity input */}
        <div className="bg-card border border-border rounded-xl px-4 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Quantity (Shares)
            </span>
            <button
              onClick={handleMax}
              className="font-mono text-[10px] uppercase tracking-widest text-primary border border-primary/30 px-2 py-0.5 rounded hover:bg-primary/10 transition-colors"
            >
              MAX
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => adjustQty(-1)}
              disabled={qty <= 1}
              className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-30"
            >
              <Minus className="w-4 h-4 text-foreground" />
            </button>
            <input
              type="number"
              min="1"
              value={qtyStr}
              onChange={(e) => setQtyStr(e.target.value.replace(/[^0-9]/g, ''))}
              className="flex-1 text-center font-mono font-semibold text-2xl bg-transparent text-foreground focus:outline-none"
            />
            <button
              onClick={() => adjustQty(1)}
              className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <Plus className="w-4 h-4 text-foreground" />
            </button>
          </div>
        </div>

        {/* Order summary */}
        <div className="bg-card border border-border rounded-xl px-4 py-4 space-y-2.5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Order Summary
          </p>

          <div className="flex justify-between text-sm">
            <span className="font-mono text-muted-foreground">Price per share</span>
            <span className="font-mono text-foreground">{fmt(effectivePrice)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-mono text-muted-foreground">Quantity</span>
            <span className="font-mono text-foreground">{qty}</span>
          </div>

          <div className="h-px bg-border" />

          <div className="flex justify-between">
            <span className="font-mono text-sm font-semibold text-foreground">Total Amount</span>
            <span className="font-mono text-sm font-semibold text-primary">{fmt(totalAmount)}</span>
          </div>

          {/* BUY — balance details */}
          {side === 'BUY' && (
            <div className="pt-1 space-y-1.5 border-t border-border/50">
              <div className="flex justify-between text-xs">
                <span className="font-mono text-muted-foreground">Available Balance</span>
                <span className="font-mono text-foreground">{fmt(virtualBalance)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="font-mono text-muted-foreground">After Trade</span>
                <span
                  className={`font-mono ${virtualBalance - totalAmount < 0 ? 'text-red-400' : 'text-foreground'}`}
                >
                  {fmt(Math.max(0, virtualBalance - totalAmount))}
                </span>
              </div>
            </div>
          )}

          {/* SELL — holding details */}
          {side === 'SELL' && !holdingLoading && (
            <div className="pt-1 space-y-1.5 border-t border-border/50">
              <div className="flex justify-between text-xs">
                <span className="font-mono text-muted-foreground">You own</span>
                <span className="font-mono text-foreground">
                  {holding
                    ? `${holding.quantity} share${holding.quantity === 1 ? '' : 's'}`
                    : '—'}
                </span>
              </div>
              {holding && (
                <>
                  <div className="flex justify-between text-xs">
                    <span className="font-mono text-muted-foreground">Avg Buy Price</span>
                    <span className="font-mono text-foreground">{fmt(holding.avgBuyPrice)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="font-mono text-muted-foreground">Est. Realized P/L</span>
                    {(() => {
                      const pl = (effectivePrice - holding.avgBuyPrice) * qty;
                      const sign = pl >= 0 ? '+' : '';
                      return (
                        <span
                          className={`font-mono ${pl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
                        >
                          {sign}
                          {fmt(pl)}
                        </span>
                      );
                    })()}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Server error */}
        <AnimatePresence>
          {lastResult?.error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex items-start gap-2.5 bg-destructive/10 border border-destructive/30 text-destructive rounded-xl px-4 py-3"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <p className="text-xs font-mono leading-relaxed">{lastResult.error.message}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Client-side warning (only show when qty is filled) */}
        {!lastResult?.error && clientError && qty > 0 && (
          <div className="flex items-start gap-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p className="text-xs font-mono leading-relaxed">{clientError}</p>
          </div>
        )}

        {/* Success */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl px-4 py-3"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <p className="text-xs font-mono">
                {side === 'BUY' ? 'Up' : 'Down'} order placed successfully!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`w-full h-12 rounded-xl font-mono font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-40 ${
            side === 'BUY'
              ? 'bg-emerald-500 text-white hover:bg-emerald-600'
              : 'bg-red-500 text-white hover:bg-red-600'
          }`}
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            `Place ${side === 'BUY' ? 'Up' : 'Down'} Order`
          )}
        </button>

        <p className="text-center font-mono text-[10px] text-muted-foreground pb-2">
          Paper trading only — no real funds are used
        </p>
      </main>
    </div>
  );
}
