import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import type { HoldingWithValue } from '@/hooks/useHoldings';

interface HoldingCardProps {
  holding: HoldingWithValue;
}

export function HoldingCard({ holding }: HoldingCardProps) {
  const [, setLocation] = useLocation();
  const isGain = holding.unrealizedPL >= 0;
  const plColor = isGain ? 'text-emerald-400' : 'text-red-400';
  const plSign = isGain ? '+' : '';

  const fmt = (n: number, decimals = 2) =>
    `₹${Math.abs(n).toLocaleString('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={() => setLocation(`/trade/${holding.symbol}`)}
      className="bg-card border border-border rounded-xl px-4 py-3.5 cursor-pointer hover:border-primary/30 transition-colors space-y-2"
    >
      {/* Row 1: symbol + unrealized P/L */}
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-xs font-semibold text-primary tracking-wide">
            {holding.symbol}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-[180px] truncate">
            {holding.companyName}
          </p>
        </div>
        <div className="text-right">
          <p className={`font-mono text-sm font-semibold ${plColor}`}>
            {plSign}{fmt(holding.unrealizedPL)}
          </p>
          <p className={`font-mono text-[10px] ${plColor}`}>
            {plSign}{holding.unrealizedPLPercent.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Row 2: qty / avg / current / value */}
      <div className="grid grid-cols-2 gap-y-1.5">
        <Stat label="Qty" value={`${holding.quantity} share${holding.quantity === 1 ? '' : 's'}`} />
        <Stat label="Avg Price" value={fmt(holding.avgBuyPrice)} align="right" />
        <Stat label="Current Price" value={fmt(holding.currentPrice)} />
        <Stat label="Current Value" value={fmt(holding.currentValue)} align="right" />
      </div>
    </motion.div>
  );
}

function Stat({
  label,
  value,
  align = 'left',
}: {
  label: string;
  value: string;
  align?: 'left' | 'right';
}) {
  return (
    <div className={align === 'right' ? 'text-right' : ''}>
      <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="font-mono text-xs text-foreground mt-0.5">{value}</p>
    </div>
  );
}
