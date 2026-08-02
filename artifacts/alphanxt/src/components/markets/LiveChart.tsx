import { AreaChart, Area, ResponsiveContainer, YAxis, Tooltip } from 'recharts';
import { Loader2, RadioTower, Activity } from 'lucide-react';
import type { PricePoint } from '@/lib/marketDataService';
import { useSimulatedPriceSeries } from '@/lib/simulatedPriceEngine';

interface LiveChartProps {
  series: PricePoint[];
  isLive: boolean;
  loading: boolean;
  error: string | null;
  /** True when the series is trending up (used for green/red coloring). */
  isPositive: boolean;
  /** Reference price used to seed the simulated fallback chart when live data is unavailable. */
  referencePrice: number;
}

/** Small tooltip shown on hover/touch — price only, no timestamp clutter. */
function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const price = payload[0].value as number;
  return (
    <div className="bg-card border border-border rounded-lg px-2.5 py-1.5 shadow-lg">
      <span className="font-mono text-xs text-foreground">
        ₹{price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
    </div>
  );
}

export function LiveChart({ series, isLive, loading, error, isPositive, referencePrice }: LiveChartProps) {
  const strokeColor = isPositive ? '#10b981' : '#ef4444';
  const gradientId = isPositive ? 'liveChartGradientUp' : 'liveChartGradientDown';

  // Falls back to a simulated series whenever real live data isn't available,
  // so the trade screen doesn't look static/dead. This is NEVER labeled
  // "Live" — always "Simulated" — so it can never be mistaken for real
  // market data.
  const useSimulated = !loading && (!isLive || error || series.length === 0);
  const simulatedSeries = useSimulatedPriceSeries(referencePrice, useSimulated);

  if (loading && series.length === 0) {
    return (
      <div className="h-48 bg-card border border-border rounded-xl flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
      </div>
    );
  }

  const displaySeries = useSimulated
    ? simulatedSeries.map((p) => ({ time: String(p.time), price: p.price }))
    : series;

  if (displaySeries.length === 0) {
    return (
      <div className="h-48 bg-card border border-border rounded-xl flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
      </div>
    );
  }

  const prices = displaySeries.map((p) => p.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const padding = (max - min) * 0.1 || 1;

  return (
    <div className="bg-card border border-border rounded-xl p-3 relative">
      <div className="absolute top-3 right-3 flex items-center gap-1 z-10">
        {useSimulated ? (
          <>
            <Activity className="w-3 h-3 text-muted-foreground animate-pulse" />
            <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              Simulated
            </span>
          </>
        ) : (
          <>
            <RadioTower className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span className="font-mono text-[9px] uppercase tracking-widest text-emerald-400">
              Live
            </span>
          </>
        )}
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={displaySeries} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity={0.3} />
              <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis domain={[min - padding, max + padding]} hide />
          <Tooltip content={<ChartTooltip />} />
          <Area
            type="monotone"
            dataKey="price"
            stroke={strokeColor}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
