import { useLocation } from 'wouter';
import { ChevronLeft, PieChart, History } from 'lucide-react';
import { motion } from 'framer-motion';
import { useHoldings } from '@/hooks/useHoldings';
import { useUserProfile } from '@/hooks/useUserProfile';
import { HoldingCard } from '@/components/portfolio/HoldingCard';
import { BottomNav } from '@/components/dashboard/BottomNav';
import { MarketSkeleton } from '@/components/markets/MarketSkeleton';

function SummaryStatCell({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className={`font-mono text-sm font-semibold ${color ?? 'text-foreground'}`}>{value}</p>
    </div>
  );
}

export default function PortfolioPage() {
  const [, setLocation] = useLocation();
  const { profile, profileLoading } = useUserProfile();
  const { holdings, holdingsLoading, totalInvested, totalCurrentValue, totalUnrealizedPL } =
    useHoldings();

  const virtualBalance = profile?.virtualBalance ?? 0;
  const realizedPL = profile?.totalProfitLoss ?? 0;
  const portfolioValue = virtualBalance + totalCurrentValue;

  const fmt = (n: number, showSign = false) => {
    const sign = showSign ? (n >= 0 ? '+' : '') : '';
    const abs = `₹${Math.abs(n).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
    return n < 0 ? `${sign}-${abs}` : `${sign}${abs}`;
  };

  const unrealizedColor =
    totalUnrealizedPL > 0
      ? 'text-emerald-400'
      : totalUnrealizedPL < 0
        ? 'text-red-400'
        : 'text-muted-foreground';

  const realizedColor =
    realizedPL > 0
      ? 'text-emerald-400'
      : realizedPL < 0
        ? 'text-red-400'
        : 'text-muted-foreground';

  const isLoading = profileLoading || holdingsLoading;

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col max-w-[480px] mx-auto pb-16">
      {/* Fixed header */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-background/95 backdrop-blur border-b border-border h-14 flex items-center justify-between px-4 z-40">
        <button
          onClick={() => setLocation('/dashboard')}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-semibold text-base text-foreground">Portfolio</span>
        <button
          onClick={() => setLocation('/history')}
          className="text-muted-foreground hover:text-foreground transition-colors p-1"
          aria-label="Trade history"
        >
          <History className="w-5 h-5" />
        </button>
      </header>

      {/* Scrollable content */}
      <main className="flex-1 overflow-y-auto px-4 pt-[72px] pb-4 space-y-4">
        {/* Summary card */}
        {isLoading ? (
          <div className="bg-card border border-primary/20 rounded-xl p-4 animate-pulse space-y-3">
            <div className="h-3 w-32 bg-secondary/50 rounded" />
            <div className="h-8 w-48 bg-secondary/50 rounded" />
            <div className="grid grid-cols-2 gap-3 pt-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-1">
                  <div className="h-2 w-20 bg-secondary/50 rounded" />
                  <div className="h-4 w-28 bg-secondary/50 rounded" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-primary/20 rounded-xl p-4 shadow-[0_0_30px_rgba(0,210,210,0.06)] relative"
          >
            <div className="absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
              Portfolio Value
            </p>
            <p className="font-mono font-bold text-2xl text-primary mb-4">
              {fmt(portfolioValue)}
            </p>

            <div className="grid grid-cols-2 gap-y-4 gap-x-3">
              <SummaryStatCell
                label="Cash Balance"
                value={fmt(virtualBalance)}
              />
              <SummaryStatCell
                label="Invested"
                value={fmt(totalInvested)}
              />
              <SummaryStatCell
                label="Unrealized P/L"
                value={fmt(totalUnrealizedPL, true)}
                color={unrealizedColor}
              />
              <SummaryStatCell
                label="Realized P/L"
                value={fmt(realizedPL, true)}
                color={realizedColor}
              />
            </div>
          </motion.div>
        )}

        {/* Holdings section */}
        <div className="space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Holdings ({holdingsLoading ? '—' : holdings.length})
          </p>

          {holdingsLoading ? (
            <MarketSkeleton count={3} />
          ) : holdings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-muted-foreground">
              <div className="w-14 h-14 rounded-full bg-secondary/50 flex items-center justify-center">
                <PieChart className="w-7 h-7 text-muted-foreground/50" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm text-foreground font-medium">No holdings yet</p>
                <p className="text-xs text-muted-foreground">
                  Start paper trading from the Markets tab.
                </p>
              </div>
              <button
                onClick={() => setLocation('/markets')}
                className="font-mono text-xs bg-primary text-background px-5 py-2.5 rounded-xl font-semibold hover:opacity-90 transition-opacity"
              >
                Browse Markets
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {holdings.map((h) => (
                <HoldingCard key={h.symbol} holding={h} />
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
