import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CrosshairMode, type IChartApi, type ISeriesApi } from 'lightweight-charts';
import { Loader2 } from 'lucide-react';
import type { CandlePoint } from '@/lib/marketDataService';
import type { ChartTimeframe } from '@/lib/marketDataService';
import { calculateEMA } from '@/lib/technicalIndicators';

interface CandlestickChartProps {
  candles: CandlePoint[];
  loading: boolean;
  error: string | null;
  timeframe: ChartTimeframe;
  onTimeframeChange: (tf: ChartTimeframe) => void;
  /** Show a 20-period EMA overlay on the price chart. */
  showEma?: boolean;
}

const TIMEFRAMES: { value: ChartTimeframe; label: string }[] = [
  { value: '1min', label: '1m' },
  { value: '5min', label: '5m' },
  { value: '15min', label: '15m' },
  { value: '1h', label: '1h' },
  { value: '1day', label: '1D' },
  { value: '1week', label: '1W' },
  { value: '1month', label: '1M' },
];

export function CandlestickChart({
  candles,
  loading,
  error,
  timeframe,
  onTimeframeChange,
  showEma = true,
}: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const emaSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Create the chart once on mount
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#151A2D' },
        textColor: '#8A93A6',
        fontFamily: 'ui-monospace, monospace',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: 'rgba(138, 147, 166, 0.08)' },
        horzLines: { color: 'rgba(138, 147, 166, 0.08)' },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: 'rgba(138, 147, 166, 0.15)' },
      timeScale: { borderColor: 'rgba(138, 147, 166, 0.15)', timeVisible: true },
      height: 280,
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#00E676',
      downColor: '#FF5252',
      borderVisible: false,
      wickUpColor: '#00E676',
      wickDownColor: '#FF5252',
    });

    const emaSeries = chart.addLineSeries({
      color: '#2962FF',
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    emaSeriesRef.current = emaSeries;

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0]) setContainerWidth(entries[0].contentRect.width);
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      emaSeriesRef.current = null;
    };
  }, []);

  // Resize the chart when the container width changes
  useEffect(() => {
    if (chartRef.current && containerWidth > 0) {
      chartRef.current.applyOptions({ width: containerWidth });
    }
  }, [containerWidth]);

  // Push new candle data whenever it changes
  useEffect(() => {
    if (!candleSeriesRef.current || candles.length === 0) return;

    candleSeriesRef.current.setData(
      candles.map((c) => ({
        time: c.time as any,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      })),
    );

    if (emaSeriesRef.current) {
      if (showEma) {
        const ema = calculateEMA(candles, 20);
        emaSeriesRef.current.setData(ema.map((p) => ({ time: p.time as any, value: p.value })));
      } else {
        emaSeriesRef.current.setData([]);
      }
    }

    chartRef.current?.timeScale().fitContent();
  }, [candles, showEma]);

  return (
    <div className="bg-card border border-border rounded-xl p-3 space-y-3">
      {/* Timeframe tabs */}
      <div className="flex gap-1 overflow-x-auto scrollbar-none">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf.value}
            onClick={() => onTimeframeChange(tf.value)}
            className={`shrink-0 px-2.5 py-1 rounded-lg font-mono text-[11px] transition-colors ${
              timeframe === tf.value
                ? 'bg-primary/15 text-primary border border-primary/40'
                : 'text-muted-foreground hover:text-foreground border border-transparent'
            }`}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {/* Chart / loading / error states */}
      <div className="relative">
        {loading && candles.length === 0 && (
          <div className="h-[280px] flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
          </div>
        )}
        {!loading && (error || candles.length === 0) && (
          <div className="h-[280px] flex flex-col items-center justify-center gap-1.5 px-4 text-center">
            <p className="text-xs text-muted-foreground">
              Live chart isn't available right now for this timeframe.
            </p>
          </div>
        )}
        <div
          ref={containerRef}
          className={loading || error || candles.length === 0 ? 'hidden' : ''}
        />
      </div>
    </div>
  );
}
