import { Sparkles } from 'lucide-react';

// Real, substantive tips — not filler text. Rotates deterministically by
// day of year so "refreshes daily" is an accurate claim, not a fake label.
const DAILY_TIPS = [
  'Risk management is the foundation of successful trading. Professional traders rarely risk more than 1-2% of their capital on a single trade.',
  'A trading plan written before you enter — including your stop loss — removes emotion from the moment of decision.',
  'Volume confirms price: a move on high volume is generally more reliable than the same move on low volume.',
  'Loss aversion is a well-documented bias — the pain of a loss tends to feel stronger than the pleasure of an equal gain. This is why cutting winners early and holding losers is a common mistake.',
  'A reward/risk ratio above 1:1 means you can be profitable even if you win less than half your trades.',
  'Support and resistance are zones, not exact lines — price often pierces slightly through a level before reversing.',
  "Overbought and oversold RSI readings can persist during strong trends — they're not automatic reversal signals on their own.",
  'Journaling every trade — why you entered, what happened, what you would do differently — is one of the most effective ways to improve over time.',
];

function getTodayTipIndex(): number {
  const now = new Date();
  const dayOfYear = Math.floor(
    (Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) -
      Date.UTC(now.getUTCFullYear(), 0, 0)) /
      86_400_000,
  );
  return dayOfYear % DAILY_TIPS.length;
}

export function AIDailyTip() {
  const tip = DAILY_TIPS[getTodayTipIndex()];

  return (
    <div className="bg-gradient-to-br from-card via-card to-primary/5 border border-primary/20 rounded-xl p-5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <span className="bg-primary/10 text-primary text-[10px] font-mono px-2 py-0.5 rounded border border-primary/20">
          AI INSIGHT
        </span>
        <Sparkles className="w-4 h-4 text-primary" />
      </div>

      <p className="text-sm text-foreground/90 leading-relaxed mb-4 relative z-10 italic">
        "{tip}"
      </p>

      <div className="flex items-center justify-between mt-2 relative z-10">
        <span className="text-xs text-muted-foreground font-mono">— AlphaNXT AI Tutor</span>
        <span className="text-[10px] text-muted-foreground/60">Tip refreshes daily</span>
      </div>
    </div>
  );
}
