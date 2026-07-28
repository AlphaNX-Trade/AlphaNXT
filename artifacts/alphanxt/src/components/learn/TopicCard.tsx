import { CheckCircle2, ChevronRight, Lock } from 'lucide-react';
import type { LearningTopic } from '@/lib/learnTypes';

interface TopicCardProps {
  topic: LearningTopic;
  completed: boolean;
  bestScore?: number;
  locked?: boolean;
  onClick: () => void;
}

/** Single topic row shown inside a level section on the Learn page. */
export function TopicCard({ topic, completed, bestScore, locked, onClick }: TopicCardProps) {
  return (
    <button
      onClick={locked ? undefined : onClick}
      disabled={locked}
      className={`w-full flex items-center gap-3 px-4 py-3.5 bg-card border rounded-xl text-left transition-colors ${
        locked
          ? 'border-border opacity-50 cursor-not-allowed'
          : completed
            ? 'border-green-500/30 hover:border-green-500/50'
            : 'border-border hover:border-primary/30'
      }`}
      data-testid={`topic-card-${topic.id}`}
    >
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
          completed ? 'bg-green-500/10' : 'bg-primary/10'
        }`}
      >
        {locked ? (
          <Lock className="w-4 h-4 text-muted-foreground" />
        ) : completed ? (
          <CheckCircle2 className="w-4 h-4 text-green-400" />
        ) : (
          <span className="font-mono text-xs font-bold text-primary">+{topic.xpReward}</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{topic.title}</p>
        <p className="text-xs text-muted-foreground truncate">{topic.summary}</p>
      </div>

      {!locked && (
        <div className="flex flex-col items-end gap-0.5 shrink-0">
          {completed && bestScore !== undefined && (
            <span className="font-mono text-[10px] text-green-400">{bestScore}%</span>
          )}
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      )}
    </button>
  );
}
