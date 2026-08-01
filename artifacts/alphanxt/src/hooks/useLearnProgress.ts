import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { initializeCourseProgress, initializeBadges } from '@/lib/learnService';
import type { CourseProgressDoc, UserBadgesDoc } from '@/lib/learnTypes';

interface UseLearnProgressResult {
  completedTopics: string[];
  quizScores: Record<string, number>;
  earnedBadgeIds: string[];
  todayTopicsCount?: number;
  todayTopicsCountDate?: string;
  weekTopicsCount?: number;
  weekTopicsCountWeek?: string;
  progressLoading: boolean;
}

/** Subscribes in real time to courses/{uid} and badges/{uid}, creating them if missing. */
export function useLearnProgress(): UseLearnProgressResult {
  const { user } = useAuth();
  const [completedTopics, setCompletedTopics] = useState<string[]>([]);
  const [quizScores, setQuizScores] = useState<Record<string, number>>({});
  const [earnedBadgeIds, setEarnedBadgeIds] = useState<string[]>([]);
  const [courseCounters, setCourseCounters] = useState<{
    todayTopicsCount?: number;
    todayTopicsCountDate?: string;
    weekTopicsCount?: number;
    weekTopicsCountWeek?: string;
  }>({});
  const [courseLoading, setCourseLoading] = useState(true);
  const [badgesLoading, setBadgesLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCompletedTopics([]);
      setQuizScores({});
      setCourseCounters({});
      setCourseLoading(false);
      return;
    }

    initializeCourseProgress(user.uid).catch(() => {
      /* onSnapshot below will surface persistent errors */
    });

    const unsub = onSnapshot(doc(db, 'courses', user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as CourseProgressDoc;
        setCompletedTopics(data.completedTopics ?? []);
        setQuizScores(data.quizScores ?? {});
        setCourseCounters({
          todayTopicsCount: data.todayTopicsCount,
          todayTopicsCountDate: data.todayTopicsCountDate,
          weekTopicsCount: data.weekTopicsCount,
          weekTopicsCountWeek: data.weekTopicsCountWeek,
        });
      }
      setCourseLoading(false);
    });

    return unsub;
  }, [user]);

  useEffect(() => {
    if (!user) {
      setEarnedBadgeIds([]);
      setBadgesLoading(false);
      return;
    }

    initializeBadges(user.uid).catch(() => {
      /* onSnapshot below will surface persistent errors */
    });

    const unsub = onSnapshot(doc(db, 'badges', user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as UserBadgesDoc;
        setEarnedBadgeIds(data.earnedBadges ?? []);
      }
      setBadgesLoading(false);
    });

    return unsub;
  }, [user]);

  return {
    completedTopics,
    quizScores,
    earnedBadgeIds,
    ...courseCounters,
    progressLoading: courseLoading || badgesLoading,
  };
}
