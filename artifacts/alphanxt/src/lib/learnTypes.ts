import type { Timestamp } from 'firebase/firestore';

export type LearningLevel = 'Beginner' | 'Intermediate' | 'Advanced';

/** A single quiz question attached to a topic. */
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  /** Index into `options` of the correct answer. */
  correctIndex: number;
  explanation: string;
}

/** One educational topic inside the Learning Academy. */
export interface LearningTopic {
  id: string;
  title: string;
  level: LearningLevel;
  /** Short one-line teaser shown on the topic list card. */
  summary: string;
  /** Full lesson body, written as markdown-lite paragraphs (rendered as-is, line breaks preserved). */
  content: string[];
  quiz: QuizQuestion[];
  xpReward: number;
}

/** courses/{uid} — tracks a user's progress through the Learning Academy. */
export interface CourseProgressDoc {
  completedTopics: string[];
  /** topicId -> best score achieved (0-100) */
  quizScores: Record<string, number>;
  updatedAt: Timestamp | ReturnType<typeof import('firebase/firestore').serverTimestamp>;
}

/** Definition of an earnable badge (static, not stored per-user). */
export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  /** lucide-react icon name, resolved in the UI layer */
  icon: string;
  /** Returns true if the given completed-topic set has earned this badge. */
  isEarned: (completedTopics: string[]) => boolean;
}

/** badges/{uid} — tracks which badge IDs a user has earned. */
export interface UserBadgesDoc {
  earnedBadges: string[];
  updatedAt: Timestamp | ReturnType<typeof import('firebase/firestore').serverTimestamp>;
}

/** XP thresholds that determine a user's displayed level on their profile. */
export const LEVEL_THRESHOLDS: { level: LearningLevel; minXp: number }[] = [
  { level: 'Advanced', minXp: 600 },
  { level: 'Intermediate', minXp: 300 },
  { level: 'Beginner', minXp: 0 },
];

/** Resolves a total XP value into a display level. */
export function resolveLevelFromXp(xp: number): LearningLevel {
  const match = LEVEL_THRESHOLDS.find((t) => xp >= t.minXp);
  return match?.level ?? 'Beginner';
}
