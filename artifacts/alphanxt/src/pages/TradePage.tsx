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
  ChevronDown,
  Shield,
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
import { AICoachCard } from '@/components/trade/AICoachCard';
import { analyzeTrade } from '@/lib/aiCoachService';
import type { TradeAnalysis } from '@/lib/aiCoachTypes';
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
  const [showRiskPlan, setShowRiskPlan] = useState(false);
  const [stopLossStr, setStopLossStr] = useState('');
  const [takeProfitStr, setTakeProfitStr] = useState('');
  const [tradeAnalysis, setTradeAnalysis] = useState<TradeAnalysis | null>(null);

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

    const plannedStopLoss = side === 'BUY' && stopLossStr ? parseFloat(stopLossStr) : undefined;
    const plannedTakeProfit = side === 'BUY' && takeProfitStr ? parseFloat(takeProfitStr) : undefined;

    const result = await executeTrade(
      side,
      asset.symbol,
      asset.name,
      qty,
      effectivePrice,
      plannedStopLoss,
      plannedTakeProfit,
    );

    if (result.success) {
      setShowSuccess(true);
      setQtyStr('1');
      setStopLossStr('');
      setTakeProfitStr('');
      setShowRiskPlan(false);

      if (side === 'SELL' && result.completedTrade) {
        const analysis = analyzeTrade({
          symbol: asset.symbol,
          companyName: asset.name,
          quantity: result.completedTrade.quantity,
          entryPrice: result.completedTrade.entryPrice,
          exitPrice: result.completedTrade.exitPrice,
          plannedStopLoss: result.completedTrade.plannedStopLoss,
          plannedTakeProfit: result.completedTrade.plannedTakeProfit,
          holdingDurationMs: result.completedTrade.holdingDurationMs,
        });
        setTradeAnalysis(analysis);
      }

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

      {/* Scrollable content — everything except the sticky trade panel */}
      <main className="flex-1 overflow-y-auto px-4 pt-[72px] pb-[340px] space-y-4">
        {/* AI Coach analysis — shown after a completed (SELL) trade */}
        <AnimatePresence>
          {tradeAnalysis && (
            <AICoachCard
              analysis={tradeAnalysis}
              symbol={asset.symbol}
              onDismiss={() => setTradeAnalysis(null)}
            />
          )}
        </AnimatePresence>

        {/* Live chart */}
        <LiveChart
          series={series}
          isLive={isLive}
          loading={liveLoading}
          error={liveError}
          isPositive={isPositive}
        />

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

        {/* Optional risk plan (BUY only) — informational, not an auto-executed order */}
        {side === 'BUY' && (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <button
              onClick={() => setShowRiskPlan((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Risk Plan (Optional)
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform ${showRiskPlan ? 'rotate-180' : ''}`}
              />
            </button>
            {showRiskPlan && (
              <div className="px-4 pb-4 space-y-3">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Set a target stop loss / take profit for your own reference. This isn't an
                  auto-executed order — it's used by the AI Trading Coach to analyze this trade
                  once you sell.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                      Stop Loss (₹)
                    </label>
                    <input
                      type="number"
                      value={stopLossStr}
                      onChange={(e) => setStopLossStr(e.target.value)}
                      placeholder={fmt(effectivePrice * 0.98)}
                      className="w-full mt-1 bg-secondary/40 border border-border rounded-lg px-2.5 py-2 font-mono text-xs text-foreground focus:outline-none focus:border-red-500/40"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                      Take Profit (₹)
                    </label>
                    <input
                      type="number"
                      value={takeProfitStr}
                      onChange={(e) => setTakeProfitStr(e.target.value)}
                      placeholder={fmt(effectivePrice * 1.03)}
                      className="w-full mt-1 bg-secondary/40 border border-border rounded-lg px-2.5 py-2 font-mono text-xs text-foreground focus:outline-none focus:border-emerald-500/40"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Holding details (SELL context) */}
        {side === 'SELL' && !holdingLoading && (
          <div className="bg-card border border-border rounded-xl px-4 py-4 space-y-2.5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Your Position
            </p>
            <div className="flex justify-between text-xs">
              <span className="font-mono text-muted-foreground">You own</span>
              <span className="font-mono text-foreground">
                {holding ? `${holding.quantity} share${holding.quantity === 1 ? '' : 's'}` : '—'}
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
                      <span className={`font-mono ${pl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
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

        <p className="text-center font-mono text-[10px] text-muted-foreground pb-2">
          Paper trading only — no real funds are used
        </p>
      </main>

      {/* ── Sticky Buy/Sell panel ─────────────────────────────────────── */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-background/98 backdrop-blur border-t border-border px-4 pt-3 pb-4 space-y-3 z-30 shadow-[0_-8px_30px_rgba(0,0,0,0.3)]">
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
                className={`flex items-center justify-center gap-2 py-3 rounded-xl font-mono font-bold text-sm transition-all border ${
                  isActive
                    ? isUp
                      ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_16px_rgba(16,185,129,0.35)]'
                      : 'bg-red-500 border-red-400 text-white shadow-[0_0_16px_rgba(239,68,68,0.35)]'
                    : isUp
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/15'
                      : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/15'
                }`}
              >
                {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {isUp ? 'UP' : 'DOWN'}
              </button>
            );
          })}
        </div>

        {/* Quantity + estimated cost, compact single row */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => adjustQty(-1)}
            disabled={qty <= 1}
            className="w-9 h-9 shrink-0 rounded-lg border border-border flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-30"
          >
            <Minus className="w-3.5 h-3.5 text-foreground" />
          </button>
          <input
            type="number"
            min="1"
            value={qtyStr}
            onChange={(e) => setQtyStr(e.target.value.replace(/[^0-9]/g, ''))}
            className="w-14 text-center font-mono font-semibold text-base bg-transparent text-foreground focus:outline-none"
          />
          <button
            onClick={() => adjustQty(1)}
            className="w-9 h-9 shrink-0 rounded-lg border border-border flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-foreground" />
          </button>
          <button
            onClick={handleMax}
            className="font-mono text-[10px] uppercase tracking-widest text-primary border border-primary/30 px-2 py-1 rounded shrink-0 hover:bg-primary/10 transition-colors"
          >
            MAX
          </button>

          <div className="flex-1 text-right">
            <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              Est. Cost
            </p>
            <p className="font-mono text-sm font-semibold text-primary">{fmt(totalAmount)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground px-0.5">
          <span>Balance: {fmt(virtualBalance)}</span>
          {side === 'BUY' && (
            <span className={virtualBalance - totalAmount < 0 ? 'text-red-400' : ''}>
              After: {fmt(Math.max(0, virtualBalance - totalAmount))}
            </span>
          )}
        </div>

        {/* Server error */}
        <AnimatePresence>
          {lastResult?.error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex items-start gap-2 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg px-3 py-2"
            >
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <p className="text-[11px] font-mono leading-relaxed">{lastResult.error.message}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {!lastResult?.error && clientError && qty > 0 && (
          <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg px-3 py-2">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <p className="text-[11px] font-mono leading-relaxed">{clientError}</p>
          </div>
        )}

        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg px-3 py-2"
            >
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <p className="text-[11px] font-mono">
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
      </div>
    </div>
  );
}
