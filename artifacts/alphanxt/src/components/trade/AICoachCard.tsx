import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, AlertTriangle, Info, X, ArrowRight } from 'lucide-react';
import type { TradeAnalysis, CoachInsight } from '@/lib/aiCoachTypes';

interface AICoachCardProps {
  analysis: TradeAnalysis;
  symbol: string;
  onDismiss: () => void;
}

function InsightRow({ insight }: { insight: CoachInsight }) {
  const [, setLocation] = useLocation();
  const Icon = insight.kind === 'mistake' ? AlertTriangle : insight.kind === 'positive' ? CheckCircle2 : Info;
  const color =
    insight.kind === 'mistake' ? 'text-amber-400' : insight.kind === 'positive' ? 'text-emerald-400' : 'text-muted-foreground';

  return (
    <div className="flex items-start gap-2.5 py-2.5 border-b border-border/50 last:border-b-0">
      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${color}`} />
      <div className="flex-1 space-y-1">
        <p className="text-xs text-foreground/90 leading-relaxed">{insight.message}</p>
        {insight.lessonTopicId && (
          <button
            onClick={() => setLocation(`/learn/${insight.lessonTopicId}`)}
            className="flex items-center gap-1 text-[11px] font-medium text-primary hover:opacity-80 transition-opacity"
          >
            Related lesson <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

export function AICoachCard({ analysis, symbol, onDismiss }: AICoachCardProps) {
  const {
    won,
    realizedPL,
    realizedPLPercent,
    riskPercent,
    rewardPercent,
    riskRewardRatio,
    holdingStyle,
    holdingDurationLabel,
    summary,
    insights,
  } = analysis;

  const fmt = (n: number) =>
    `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="bg-card border border-primary/25 rounded-xl p-4 space-y-4 relative"
    >
      <div className="absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">AI Trading Coach</p>
            <p className="text-[10px] text-muted-foreground">{symbol} · trade closed</p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="text-muted-foreground hover:text-foreground transition-colors p-1"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Headline stats */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">P/L</p>
          <p className={`font-mono text-sm font-semibold ${won ? 'text-emerald-400' : 'text-red-400'}`}>
            {won ? '+' : ''}
            {fmt(realizedPL)}
          </p>
          <p className={`font-mono text-[10px] ${won ? 'text-emerald-400' : 'text-red-400'}`}>
            {won ? '+' : ''}
            {realizedPLPercent.toFixed(2)}%
          </p>
        </div>
        <div>
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">R:R</p>
          <p className="font-mono text-sm font-semibold text-foreground">
            {riskRewardRatio !== null ? `${riskRewardRatio.toFixed(2)}:1` : '—'}
          </p>
          <p className="font-mono text-[10px] text-muted-foreground">
            {riskPercent !== null ? `Risk ${riskPercent.toFixed(1)}%` : 'No stop set'}
          </p>
        </div>
        <div>
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Held</p>
          <p className="font-mono text-sm font-semibold text-foreground">{holdingDurationLabel}</p>
          <p className="font-mono text-[10px] text-muted-foreground">{holdingStyle}</p>
        </div>
      </div>

      {/* Summary */}
      <p className="text-xs text-foreground/80 leading-relaxed bg-secondary/30 rounded-lg p-3">{summary}</p>

      {/* Insights */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
          What we noticed
        </p>
        <div>
          {insights.map((insight, i) => (
            <InsightRow key={i} insight={insight} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
