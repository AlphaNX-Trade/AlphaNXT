import { Sparkles } from 'lucide-react';

export function AIDailyTip() {
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
        "Risk management is the foundation of successful trading. Professional traders never risk more than 1-2% of their capital on a single trade. Before entering any position, always define your stop-loss level."
      </p>

      <div className="flex items-center justify-between mt-2 relative z-10">
        <span className="text-xs text-muted-foreground font-mono">— AlphaNXT AI Tutor</span>
        <span className="text-[10px] text-muted-foreground/60">Tip refreshes daily</span>
      </div>
    </div>
  );
}
