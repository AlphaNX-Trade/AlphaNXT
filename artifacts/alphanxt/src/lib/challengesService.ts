import { LEARNING_TOPICS } from '@/data/learnContent';
import { todayDateString, currentWeekString } from '@/lib/dateUtils';

export type ChallengePeriod = 'daily' | 'weekly' | 'monthly';

export interface ChallengeStatus {
  id: string;
  title: string;
  description: string;
  period: ChallengePeriod;
  progress: number; // current value
  target: number; // value needed to complete
  completed: boolean;
}

export interface ChallengeEvaluationInput {
  xp: number;
  completedTopics: string[];
  todayTopicsCount?: number;
  todayTopicsCountDate?: string;
  weekTopicsCount?: number;
  weekTopicsCountWeek?: string;
  todayTradeCount?: number;
  todayTradeCountDate?: string;
  weekProfitLoss?: number;
  weekProfitLossWeek?: string;
}

/**
 * Evaluates all challenges from data already tracked elsewhere in the app
 * (portfolio + courses + profile docs) — no separate "challenges" collection
 * or backend job required. Daily/weekly counters are date-gated here too,
 * not just at write time, so a stale count from a previous day/week never
 * reads as "done today".
 */
export function evaluateChallenges(input: ChallengeEvaluationInput): ChallengeStatus[] {
  const today = todayDateString();
  const thisWeek = currentWeekString();

  const todayTrades = input.todayTradeCountDate === today ? (input.todayTradeCount ?? 0) : 0;
  const todayTopics = input.todayTopicsCountDate === today ? (input.todayTopicsCount ?? 0) : 0;
  const weekTopics = input.weekTopicsCountWeek === thisWeek ? (input.weekTopicsCount ?? 0) : 0;
  const weekPL = input.weekProfitLossWeek === thisWeek ? (input.weekProfitLoss ?? 0) : 0;

  const beginnerTopicIds = LEARNING_TOPICS.filter((t) => t.level === 'Beginner').map((t) => t.id);
  const beginnerCompletedCount = beginnerTopicIds.filter((id) => input.completedTopics.includes(id)).length;

  return [
    {
      id: 'daily-trade',
      title: 'Place a trade today',
      description: 'Execute at least one paper trade (buy or sell).',
      period: 'daily',
      progress: Math.min(todayTrades, 1),
      target: 1,
      completed: todayTrades >= 1,
    },
    {
      id: 'daily-lesson',
      title: 'Complete a lesson today',
      description: 'Pass one Learning Academy quiz.',
      period: 'daily',
      progress: Math.min(todayTopics, 1),
      target: 1,
      completed: todayTopics >= 1,
    },
    {
      id: 'weekly-positive-pl',
      title: 'Finish the week in the green',
      description: 'End this week with positive realized profit/loss.',
      period: 'weekly',
      progress: weekPL > 0 ? 1 : 0,
      target: 1,
      completed: weekPL > 0,
    },
    {
      id: 'weekly-lessons',
      title: 'Complete 2 lessons this week',
      description: 'Pass two Learning Academy quizzes this week.',
      period: 'weekly',
      progress: Math.min(weekTopics, 2),
      target: 2,
      completed: weekTopics >= 2,
    },
    {
      id: 'monthly-beginner-graduate',
      title: 'Finish the Beginner track',
      description: 'Complete every Beginner-level Learning Academy topic.',
      period: 'monthly',
      progress: beginnerCompletedCount,
      target: beginnerTopicIds.length,
      completed: beginnerCompletedCount >= beginnerTopicIds.length,
    },
    {
      id: 'monthly-xp',
      title: 'Reach 500 XP',
      description: 'Accumulate 500 total XP from the Learning Academy.',
      period: 'monthly',
      progress: Math.min(input.xp, 500),
      target: 500,
      completed: input.xp >= 500,
    },
  ];
}
