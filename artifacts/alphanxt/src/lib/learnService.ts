import {
  doc,
  getDoc,
  setDoc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { CourseProgressDoc, UserBadgesDoc, BadgeDefinition } from '@/lib/learnTypes';
import { resolveLevelFromXp } from '@/lib/learnTypes';
import { LEARNING_TOPICS, getTopicById } from '@/data/learnContent';

const PASS_THRESHOLD = 70; // % correct required to pass a quiz and earn XP

// ─── Badge definitions (static — evaluated client-side against progress) ────

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'first-steps',
    title: 'First Steps',
    description: 'Complete your first Learning Academy topic.',
    icon: 'Footprints',
    isEarned: (completed) => completed.length >= 1,
  },
  {
    id: 'beginner-graduate',
    title: 'Beginner Graduate',
    description: 'Complete all Beginner-level topics.',
    icon: 'GraduationCap',
    isEarned: (completed) => {
      const beginnerIds = LEARNING_TOPICS.filter((t) => t.level === 'Beginner').map((t) => t.id);
      return beginnerIds.every((id) => completed.includes(id));
    },
  },
  {
    id: 'halfway-there',
    title: 'Halfway There',
    description: 'Complete 6 or more topics.',
    icon: 'TrendingUp',
    isEarned: (completed) => completed.length >= 6,
  },
  {
    id: 'academy-master',
    title: 'Academy Master',
    description: 'Complete every topic in the Learning Academy.',
    icon: 'Trophy',
    isEarned: (completed) => completed.length >= LEARNING_TOPICS.length,
  },
];

// ─── Initialization ───────────────────────────────────────────────────────────

export async function initializeCourseProgress(uid: string): Promise<void> {
  const ref = doc(db, 'courses', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const initial: CourseProgressDoc = {
      completedTopics: [],
      quizScores: {},
      updatedAt: serverTimestamp(),
    };
    await setDoc(ref, initial);
  }
}

export async function initializeBadges(uid: string): Promise<void> {
  const ref = doc(db, 'badges', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const initial: UserBadgesDoc = {
      earnedBadges: [],
      updatedAt: serverTimestamp(),
    };
    await setDoc(ref, initial);
  }
}

// ─── Quiz submission ──────────────────────────────────────────────────────────

export interface SubmitQuizResult {
  passed: boolean;
  scorePercent: number;
  xpAwarded: number;
  newlyEarnedBadges: BadgeDefinition[];
}

/**
 * Records a quiz attempt. If the score clears PASS_THRESHOLD and the topic
 * wasn't already completed, awards XP (once) and recalculates the user's level.
 * Also evaluates badges and persists any newly earned ones.
 */
export async function submitQuizAttempt(
  uid: string,
  topicId: string,
  correctCount: number,
  totalQuestions: number,
): Promise<SubmitQuizResult> {
  const topic = getTopicById(topicId);
  if (!topic) {
    throw new Error(`Unknown topic: ${topicId}`);
  }

  const scorePercent = Math.round((correctCount / totalQuestions) * 100);
  const passed = scorePercent >= PASS_THRESHOLD;

  const courseRef = doc(db, 'courses', uid);
  const userRef = doc(db, 'users', uid);
  const badgesRef = doc(db, 'badges', uid);

  let xpAwarded = 0;
  let newlyEarnedBadges: BadgeDefinition[] = [];

  await runTransaction(db, async (tx) => {
    const courseSnap = await tx.get(courseRef);
    const userSnap = await tx.get(userRef);
    const badgesSnap = await tx.get(badgesRef);

    const courseData: CourseProgressDoc = courseSnap.exists()
      ? (courseSnap.data() as CourseProgressDoc)
      : { completedTopics: [], quizScores: {}, updatedAt: serverTimestamp() };

    const wasAlreadyCompleted = courseData.completedTopics.includes(topicId);
    const previousBest = courseData.quizScores[topicId] ?? 0;

    const updatedCompleted = passed && !wasAlreadyCompleted
      ? [...courseData.completedTopics, topicId]
      : courseData.completedTopics;

    const updatedScores = {
      ...courseData.quizScores,
      [topicId]: Math.max(previousBest, scorePercent),
    };

    tx.set(
      courseRef,
      { completedTopics: updatedCompleted, quizScores: updatedScores, updatedAt: serverTimestamp() },
      { merge: true },
    );

    // Award XP only the first time this topic is passed
    if (passed && !wasAlreadyCompleted) {
      xpAwarded = topic.xpReward;
      const currentXp = userSnap.exists() ? (userSnap.data().xp as number) ?? 0 : 0;
      const newXp = currentXp + xpAwarded;
      tx.set(
        userRef,
        { xp: newXp, level: resolveLevelFromXp(newXp) },
        { merge: true },
      );
    }

    // Evaluate badges against the updated completed-topics list
    const badgesData: UserBadgesDoc = badgesSnap.exists()
      ? (badgesSnap.data() as UserBadgesDoc)
      : { earnedBadges: [], updatedAt: serverTimestamp() };

    const newlyEarnedIds = BADGE_DEFINITIONS.filter(
      (b) => !badgesData.earnedBadges.includes(b.id) && b.isEarned(updatedCompleted),
    );

    if (newlyEarnedIds.length > 0) {
      newlyEarnedBadges = newlyEarnedIds;
      tx.set(
        badgesRef,
        {
          earnedBadges: [...badgesData.earnedBadges, ...newlyEarnedIds.map((b) => b.id)],
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
    }
  });

  return { passed, scorePercent, xpAwarded, newlyEarnedBadges };
}
