import { doc, getDoc, setDoc, serverTimestamp, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * leaderboard/{uid} — a deliberately narrow, public-readable summary.
 * We do NOT expose the full portfolio doc (balance, holdings, etc.) to other
 * users — only what's needed to rank and display someone on a leaderboard.
 * Firestore rules must allow any authenticated user to READ this collection,
 * but only the owner to WRITE their own entry (see firestore.rules).
 */
export interface LeaderboardEntry {
  displayName: string;
  totalProfitLoss: number;
  winRate: number;
  xp: number;
  updatedAt: unknown;
}

/**
 * Recomputes and writes the calling user's public leaderboard entry from
 * their current portfolio + profile data. Called after trades (P/L, winRate)
 * and after XP-earning actions (quiz completion) — best-effort, never blocks
 * the action that triggered it.
 */
export async function syncLeaderboardEntry(uid: string): Promise<void> {
  const [userSnap, portfolioSnap] = await Promise.all([
    getDoc(doc(db, 'users', uid)),
    getDoc(doc(db, 'portfolio', uid)),
  ]);

  if (!userSnap.exists()) return;

  const userData = userSnap.data();
  const portfolioData = portfolioSnap.exists() ? portfolioSnap.data() : {};

  const entry: LeaderboardEntry = {
    displayName: (userData.fullName as string) ?? 'Trader',
    totalProfitLoss: (portfolioData.totalProfitLoss as number) ?? 0,
    winRate: (portfolioData.winRate as number) ?? 0,
    xp: (userData.xp as number) ?? 0,
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(db, 'leaderboard', uid), entry, { merge: true });
}

export interface LeaderboardRow extends LeaderboardEntry {
  uid: string;
  rank: number;
}

/** Fetches the top N leaderboard entries, ranked by total realized P/L. */
export async function fetchTopLeaderboard(topN = 50): Promise<LeaderboardRow[]> {
  const q = query(collection(db, 'leaderboard'), orderBy('totalProfitLoss', 'desc'), limit(topN));
  const snap = await getDocs(q);
  return snap.docs.map((d, i) => ({
    uid: d.id,
    rank: i + 1,
    ...(d.data() as LeaderboardEntry),
  }));
}
