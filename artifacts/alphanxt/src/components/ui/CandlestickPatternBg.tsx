/**
 * Decorative ascending candlestick pattern with a grid overlay, used on the
 * splash screen to echo the reference design. Purely decorative — not real
 * data (the app's decision-relevant charts elsewhere always use real data).
 */
export function CandlestickPatternBg({ className = '' }: { className?: string }) {
  // Deterministic pseudo-random candle heights so the pattern looks organic
  // but never changes between renders (no need for real randomness here).
  const candles = [
    { x: 10, high: 40, low: 60, open: 55, close: 45 },
    { x: 30, high: 35, low: 58, open: 50, close: 42 },
    { x: 50, high: 45, low: 65, open: 60, close: 50 },
    { x: 70, high: 25, low: 50, open: 45, close: 30 },
    { x: 90, high: 30, low: 55, open: 50, close: 35 },
    { x: 110, high: 15, low: 40, open: 35, close: 20 },
    { x: 130, high: 20, low: 45, open: 40, close: 25 },
    { x: 150, high: 5, low: 30, open: 25, close: 10 },
    { x: 170, high: 10, low: 35, open: 30, close: 15 },
    { x: 190, high: -5, low: 20, open: 15, close: 0 },
  ];

  return (
    <svg
      viewBox="0 0 210 80"
      preserveAspectRatio="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Grid */}
      {[0, 20, 40, 60, 80].map((y) => (
        <line key={`h-${y}`} x1="0" y1={y} x2="210" y2={y} stroke="#2962FF" strokeOpacity="0.08" strokeWidth="0.5" />
      ))}
      {[0, 30, 60, 90, 120, 150, 180, 210].map((x) => (
        <line key={`v-${x}`} x1={x} y1="0" x2={x} y2="80" stroke="#2962FF" strokeOpacity="0.08" strokeWidth="0.5" />
      ))}

      {/* Trend line connecting closes */}
      <polyline
        points={candles.map((c) => `${c.x},${c.close}`).join(' ')}
        fill="none"
        stroke="#2962FF"
        strokeOpacity="0.25"
        strokeWidth="1"
      />

      {/* Candles */}
      {candles.map((c, i) => {
        const isUp = c.close < c.open; // svg y grows downward, so "up" candle has close above open
        const color = isUp ? '#2962FF' : '#94A3B8';
        return (
          <g key={i}>
            <line x1={c.x} y1={c.high} x2={c.x} y2={c.low} stroke={color} strokeWidth="1" strokeOpacity="0.6" />
            <rect
              x={c.x - 3}
              y={Math.min(c.open, c.close)}
              width="6"
              height={Math.max(2, Math.abs(c.close - c.open))}
              fill={color}
              opacity="0.7"
              rx="0.5"
            />
          </g>
        );
      })}
    </svg>
  );
}
