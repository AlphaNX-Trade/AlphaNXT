import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { ChevronLeft, Footprints, GraduationCap, TrendingUp, Trophy, Lock } from 'lucide-react';
import { BADGE_DEFINITIONS } from '@/lib/learnService';
import { useLearnProgress } from '@/hooks/useLearnProgress';
import type { LucideIcon } from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Footprints,
  GraduationCap,
  TrendingUp,
  Trophy,
};

export default function AchievementsPage() {
  const [, setLocation] = useLocation();
  const { earnedBadgeIds, progressLoading } = useLearnProgress();

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col max-w-[480px] mx-auto pb-6">
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-background/95 backdrop-blur border-b border-border h-14 flex items-center justify-between px-4 z-40">
        <button
          onClick={() => setLocation('/profile')}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1"
          aria-label="Back to profile"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-semibold text-base text-foreground">Achievements</span>
        <div className="w-6" aria-hidden />
      </header>

      <main className="flex-1 overflow-y-auto px-4 pt-[72px] pb-4 space-y-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Earned by making progress in the Learning Academy.
        </p>

        {progressLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-card border border-border rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {BADGE_DEFINITIONS.map((badge, i) => {
              const earned = earnedBadgeIds.includes(badge.id);
              const Icon = ICON_MAP[badge.icon] ?? Trophy;
              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`rounded-xl border p-4 flex flex-col items-center text-center gap-2 ${
                    earned ? 'bg-card border-primary/30' : 'bg-card/50 border-border'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      earned ? 'bg-primary/10' : 'bg-secondary/40'
                    }`}
                  >
                    {earned ? (
                      <Icon className="w-5 h-5 text-primary" />
                    ) : (
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <p className={`text-xs font-semibold ${earned ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {badge.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{badge.description}</p>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
