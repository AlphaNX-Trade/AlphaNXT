import { useMemo, useState } from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis, Tooltip } from 'recharts';
import { ZoomIn, ZoomOut, Radio } from 'lucide-react';
import type { EngineTickPoint } from '@/lib/marketEngine/types';
import { ticksToCandles } from '@/lib/marketEngine/candleAggregation';
import { CandlestickChart } from '@/components/markets/CandlestickChart';
import type { ChartTimeframe } from '@/lib/marketDataService';

interface EngineLiveChartProps {
  history: EngineTickPoint[];
  isPositive: boolean;
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

/**
 * Default view is a smooth, continuously-scrolling line fed by the market
 * engine's live tick stream — this never shows an "unavailable" state since
 * the engine always has data. Tapping "Zoom in" switches to a candlestick
 * view, aggregating the same tick stream into OHLC candles (true pinch-zoom
 * gesture detection is unreliable across mobile browsers, so this uses an
 * explicit zoom control instead — same end result, more reliable).
 */
export function EngineLiveChart({ history, isPositive }: EngineLiveChartProps) {
  const [zoomedIn, setZoomedIn] = useState(false);
  const [candleTimeframe, setCandleTimeframe] = useState<ChartTimeframe>('1min');

  const strokeColor = isPositive ? '#10b981' : '#ef4444';
  const gradientId = isPositive ? 'engineChartGradientUp' : 'engineChartGradientDown';

  const lineSeries = useMemo(() => history.map((p) => ({ time: p.time, price: p.price })), [history]);

  // Bucket size for the candle view — tied to the selected timeframe tab.
  const bucketMs: Record<ChartTimeframe, number> = {
    '1min': 1_000, // each engine tick is ~0.75s, so a few ticks per "candle" at the fastest zoom
    '5min': 5_000,
    '15min': 15_000,
    '1h': 60_000,
    '1day': 60_000,
    '1week': 60_000,
    '1month': 60_000,
  };

  const candles = useMemo(
    () => ticksToCandles(history, bucketMs[candleTimeframe]),
    [history, candleTimeframe],
  );

  if (lineSeries.length === 0) {
    return <div className="h-48 bg-card border border-border rounded-xl animate-pulse" />;
  }

  if (zoomedIn) {
    return (
      <div className="space-y-2">
        <CandlestickChart
          candles={candles}
          loading={false}
          error={null}
          timeframe={candleTimeframe}
          onTimeframeChange={setCandleTimeframe}
        />
        <button
          onClick={() => setZoomedIn(false)}
          className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
        >
          <ZoomOut className="w-3.5 h-3.5" /> Zoom out
        </button>
      </div>
    );
  }

  const prices = lineSeries.map((p) => p.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const padding = (max - min) * 0.15 || 1;

  return (
    <div className="bg-card border border-border rounded-xl p-3 relative">
      <div className="absolute top-3 left-3 flex items-center gap-1 z-10">
        <Radio className="w-3 h-3 text-primary animate-pulse" />
        <span className="font-mono text-[9px] uppercase tracking-widest text-primary">Market Open</span>
      </div>
      <button
        onClick={() => setZoomedIn(true)}
        className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground rounded-lg px-2 py-1 transition-colors"
      >
        <ZoomIn className="w-3 h-3" />
        <span className="font-mono text-[9px] uppercase tracking-widest">Zoom</span>
      </button>

      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={lineSeries} margin={{ top: 24, right: 8, bottom: 0, left: 0 }}>
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
            isAnimationActive={true}
            animationDuration={600}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
