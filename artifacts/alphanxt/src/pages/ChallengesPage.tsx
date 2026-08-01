import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { ChevronLeft, CheckCircle2, Circle, Loader2, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useLearnProgress } from '@/hooks/useLearnProgress';
import { evaluateChallenges, type ChallengePeriod } from '@/lib/challengesService';
import { fetchTopLeaderboard, type LeaderboardRow } from '@/lib/leaderboardService';

type Tab = 'challenges' | 'leaderboard';

const PERIOD_LABEL: Record<ChallengePeriod, string> = {
  daily: 'Today',
  weekly: 'This Week',
  monthly: 'This Month',
};

export default function ChallengesPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('challenges');

  const { profile } = useUserProfile();
  const { completedTopics, todayTopicsCount, todayTopicsCountDate, weekTopicsCount, weekTopicsCountWeek } =
    useLearnProgress();

  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[] | null>(null);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab !== 'leaderboard' || leaderboard !== null) return;
    setLeaderboardLoading(true);
    fetchTopLeaderboard(50)
      .then(setLeaderboard)
      .catch((err) => setLeaderboardError(err instanceof Error ? err.message : 'Failed to load leaderboard.'))
      .finally(() => setLeaderboardLoading(false));
  }, [activeTab, leaderboard]);

  const challenges = evaluateChallenges({
    xp: profile?.xp ?? 0,
    completedTopics,
    todayTopicsCount,
    todayTopicsCountDate,
    weekTopicsCount,
    weekTopicsCountWeek,
    todayTradeCount: profile?.todayTradeCount,
    todayTradeCountDate: profile?.todayTradeCountDate,
    weekProfitLoss: profile?.weekProfitLoss,
    weekProfitLossWeek: profile?.weekProfitLossWeek,
  });

  const grouped: Record<ChallengePeriod, typeof challenges> = {
    daily: challenges.filter((c) => c.period === 'daily'),
    weekly: challenges.filter((c) => c.period === 'weekly'),
    monthly: challenges.filter((c) => c.period === 'monthly'),
  };

  const fmt = (n: number) =>
    `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col max-w-[480px] mx-auto pb-6">
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-background/95 backdrop-blur border-b border-border z-40">
        <div className="h-14 flex items-center justify-between px-4">
          <button
            onClick={() => setLocation('/profile')}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1"
            aria-label="Back to profile"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-semibold text-base text-foreground">Challenges</span>
          <div className="w-6" aria-hidden />
        </div>
        <div className="flex px-4 gap-1 border-b border-border">
          {(['challenges', 'leaderboard'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-2.5 font-mono text-xs font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'text-primary border-primary'
                  : 'text-muted-foreground border-transparent hover:text-foreground'
              }`}
            >
              {tab === 'challenges' ? 'Challenges' : 'Leaderboard'}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pt-[112px] pb-4 space-y-5">
        {activeTab === 'challenges' ? (
          (['daily', 'weekly', 'monthly'] as ChallengePeriod[]).map((period) => (
            <div key={period} className="space-y-2">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground px-1">
                {PERIOD_LABEL[period]}
              </p>
              <div className="space-y-2">
                {grouped[period].map((c) => (
                  <div
                    key={c.id}
                    className={`bg-card border rounded-xl px-4 py-3.5 flex items-start gap-3 ${
                      c.completed ? 'border-emerald-500/30' : 'border-border'
                    }`}
                  >
                    {c.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${c.completed ? 'text-foreground' : 'text-foreground/90'}`}
                      >
                        {c.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{c.description}</p>
                      {c.target > 1 && (
                        <div className="w-full h-1.5 bg-secondary/50 rounded-full overflow-hidden mt-2">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${Math.min(100, (c.progress / c.target) * 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                    {c.target > 1 && (
                      <span className="font-mono text-[10px] text-muted-foreground shrink-0">
                        {c.progress}/{c.target}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="space-y-2">
            {leaderboardLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
              </div>
            ) : leaderboardError ? (
              <p className="text-xs text-muted-foreground text-center py-10">{leaderboardError}</p>
            ) : leaderboard && leaderboard.length > 0 ? (
              leaderboard.map((row) => {
                const isMe = row.uid === user?.uid;
                return (
                  <div
                    key={row.uid}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 border ${
                      isMe ? 'bg-primary/5 border-primary/30' : 'bg-card border-border'
                    }`}
                  >
                    <div className="w-7 flex items-center justify-center shrink-0">
                      {row.rank === 1 ? (
                        <Crown className="w-4 h-4 text-amber-400" />
                      ) : (
                        <span className="font-mono text-xs text-muted-foreground">#{row.rank}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {row.displayName} {isMe && <span className="text-primary">(You)</span>}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Win rate {row.winRate.toFixed(0)}% · {row.xp} XP
                      </p>
                    </div>
                    <span
                      className={`font-mono text-sm font-semibold shrink-0 ${
                        row.totalProfitLoss >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {row.totalProfitLoss >= 0 ? '+' : ''}
                      {fmt(row.totalProfitLoss)}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-muted-foreground text-center py-10">
                No leaderboard entries yet — complete a trade to appear here.
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
