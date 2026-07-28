import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { ChevronLeft, CheckCircle2 } from 'lucide-react';
import { getTopicById } from '@/data/learnContent';
import { useLearnProgress } from '@/hooks/useLearnProgress';

interface TopicLessonPageProps {
  topicId: string;
}

export default function TopicLessonPage({ topicId }: TopicLessonPageProps) {
  const [, setLocation] = useLocation();
  const topic = getTopicById(topicId);
  const { completedTopics, quizScores } = useLearnProgress();

  if (!topic) {
    return (
      <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center max-w-[480px] mx-auto px-4 text-center">
        <p className="text-foreground font-medium">Topic not found</p>
        <button
          onClick={() => setLocation('/learn')}
          className="mt-3 text-primary text-sm font-medium"
        >
          Back to Learning Academy
        </button>
      </div>
    );
  }

  const isCompleted = completedTopics.includes(topic.id);
  const bestScore = quizScores[topic.id];

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col max-w-[480px] mx-auto pb-6">
      {/* Fixed header */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-background/95 backdrop-blur border-b border-border h-14 flex items-center justify-between px-4 z-40">
        <button
          onClick={() => setLocation('/learn')}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1"
          aria-label="Back to Learning Academy"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-semibold text-base text-foreground truncate max-w-[70%]">
          {topic.title}
        </span>
        <div className="w-6" aria-hidden />
      </header>

      <main className="flex-1 overflow-y-auto px-4 pt-[72px] pb-4 space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2"
        >
          <span className="font-mono text-[10px] uppercase tracking-widest bg-primary/10 text-primary px-2.5 py-1 rounded-full border border-primary/20">
            {topic.level}
          </span>
          {isCompleted ? (
            <span className="flex items-center gap-1 font-mono text-[10px] text-green-400">
              <CheckCircle2 className="w-3 h-3" /> Completed — {bestScore}%
            </span>
          ) : (
            <span className="font-mono text-[10px] text-muted-foreground">
              +{topic.xpReward} XP on completion
            </span>
          )}
        </motion.div>

        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          {topic.content.map((paragraph, i) => (
            <p key={i} className="text-sm text-foreground/90 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>

        <button
          onClick={() => setLocation(`/learn/${topic.id}/quiz`)}
          className="w-full bg-primary text-primary-foreground font-semibold text-sm py-3.5 rounded-xl hover:opacity-90 transition-opacity"
        >
          {isCompleted ? 'Retake Quiz' : 'Start Quiz'}
        </button>
      </main>
    </div>
  );
}
