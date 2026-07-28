import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { ChevronLeft, Award } from 'lucide-react';
import { LEARNING_TOPICS, getTopicsByLevel } from '@/data/learnContent';
import type { LearningLevel } from '@/lib/learnTypes';
import { useLearnProgress } from '@/hooks/useLearnProgress';
import { useUserProfile } from '@/hooks/useUserProfile';
import { BADGE_DEFINITIONS } from '@/lib/learnService';
import { TopicCard } from '@/components/learn/TopicCard';
import { BottomNav } from '@/components/dashboard/BottomNav';

const LEVELS: LearningLevel[] = ['Beginner', 'Intermediate', 'Advanced'];

export default function LearnPage() {
  const [, setLocation] = useLocation();
  const { profile } = useUserProfile();
  const { completedTopics, quizScores, earnedBadgeIds, progressLoading } = useLearnProgress();

  const totalTopics = LEARNING_TOPICS.length;
  const completedCount = completedTopics.length;
  const overallProgress = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

  // A level unlocks once all topics in the previous level are completed.
  // Beginner is always unlocked.
  const isLevelLocked = (level: LearningLevel): boolean => {
    if (level === 'Beginner') return false;
    const levelIndex = LEVELS.indexOf(level);
    const previousLevel = LEVELS[levelIndex - 1];
    const previousTopics = getTopicsByLevel(previousLevel);
    return !previousTopics.every((t) => completedTopics.includes(t.id));
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col max-w-[480px] mx-auto pb-16">
      {/* Fixed header */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-background/95 backdrop-blur border-b border-border h-14 flex items-center justify-between px-4 z-40">
        <button
          onClick={() => setLocation('/dashboard')}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1"
          aria-label="Back to dashboard"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-semibold text-base text-foreground">Learning Academy</span>
        <div className="w-6" aria-hidden />
      </header>

      <main className="flex-1 overflow-y-auto px-4 pt-[72px] pb-4 space-y-6">
        {/* Progress overview */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-primary/20 rounded-xl p-5 relative"
        >
          <div className="absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Your Progress
              </p>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {completedCount} / {totalTopics} topics completed
              </p>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-widest bg-primary/10 text-primary px-2.5 py-1 rounded-full border border-primary/20">
              {profile?.xp ?? 0} XP
            </span>
          </div>

          <div className="w-full h-2 bg-secondary/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>

          {earnedBadgeIds.length > 0 && (
            <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-border">
              <Award className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs text-muted-foreground">
                {earnedBadgeIds.length} badge{earnedBadgeIds.length !== 1 ? 's' : ''} earned —{' '}
                {BADGE_DEFINITIONS.filter((b) => earnedBadgeIds.includes(b.id))
                  .map((b) => b.title)
                  .join(', ')}
              </span>
            </div>
          )}
        </motion.div>

        {/* Level sections */}
        {LEVELS.map((level) => {
          const topics = getTopicsByLevel(level);
          const locked = isLevelLocked(level);
          const levelCompleted = topics.filter((t) => completedTopics.includes(t.id)).length;

          return (
            <div key={level} className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {level}
                </p>
                <p className="font-mono text-[10px] text-muted-foreground">
                  {levelCompleted}/{topics.length}
                </p>
              </div>

              {progressLoading ? (
                <div className="space-y-2">
                  {topics.map((t) => (
                    <div key={t.id} className="h-[68px] bg-card border border-border rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {topics.map((topic) => (
                    <TopicCard
                      key={topic.id}
                      topic={topic}
                      completed={completedTopics.includes(topic.id)}
                      bestScore={quizScores[topic.id]}
                      locked={locked}
                      onClick={() => setLocation(`/learn/${topic.id}`)}
                    />
                  ))}
                </div>
              )}

              {locked && (
                <p className="text-[11px] text-muted-foreground px-1">
                  Complete all {LEVELS[LEVELS.indexOf(level) - 1]} topics to unlock.
                </p>
              )}
            </div>
          );
        })}
      </main>

      <BottomNav />
    </div>
  );
}
