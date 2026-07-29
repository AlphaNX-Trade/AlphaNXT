import { LineChart, Line, ResponsiveContainer, YAxis, ReferenceLine, BarChart, Bar, Cell } from 'recharts';
import type { IndicatorPoint } from '@/lib/technicalIndicators';

interface RSIPanelProps {
  data: IndicatorPoint[];
}

/** RSI panel with 30/70 reference lines. */
export function RSIPanel({ data }: RSIPanelProps) {
  if (data.length === 0) return null;
  return (
    <div className="bg-card border border-border rounded-xl p-3">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
        RSI (14)
      </p>
      <ResponsiveContainer width="100%" height={100}>
        <LineChart data={data}>
          <YAxis domain={[0, 100]} hide />
          <ReferenceLine y={70} stroke="#FF5252" strokeDasharray="3 3" strokeOpacity={0.4} />
          <ReferenceLine y={30} stroke="#00E676" strokeDasharray="3 3" strokeOpacity={0.4} />
          <Line type="monotone" dataKey="value" stroke="#2962FF" strokeWidth={1.5} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface MACDPanelProps {
  histogram: IndicatorPoint[];
}

/** MACD histogram panel — green above zero, red below. */
export function MACDPanel({ histogram }: MACDPanelProps) {
  if (histogram.length === 0) return null;
  return (
    <div className="bg-card border border-border rounded-xl p-3">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
        MACD Histogram
      </p>
      <ResponsiveContainer width="100%" height={100}>
        <BarChart data={histogram}>
          <YAxis hide />
          <ReferenceLine y={0} stroke="rgba(138,147,166,0.3)" />
          <Bar dataKey="value" isAnimationActive={false}>
            {histogram.map((point, i) => (
              <Cell key={i} fill={point.value >= 0 ? '#00E676' : '#FF5252'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
