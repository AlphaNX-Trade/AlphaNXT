import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ─── Collection shapes ────────────────────────────────────────────────────────

/** users/{uid} — profile information only */
export interface UserProfileDoc {
  uid: string;
  fullName: string;
  email: string;
  createdAt: ReturnType<typeof serverTimestamp>;
  xp: number;
  level: string;
  /** User-chosen handle, set from Edit Profile. Optional — not all users set one. */
  username?: string;
  /** Admin-assigned label (e.g. "VIP Trader", "Verified") — only the admin can set this, never the user. */
  title?: string;
}

/** portfolio/{uid} — financial / trading data */
export interface PortfolioDoc {
  virtualBalance: number;
  portfolioValue: number;
  totalProfitLoss: number;
  todayProfitLoss: number;
  riskScore: number;
  winRate: number;
  updatedAt: ReturnType<typeof serverTimestamp>;
  todayTradeCount?: number;
  todayTradeCountDate?: string;
  weekProfitLoss?: number;
  weekProfitLossWeek?: string;
}

/** watchlist/{uid} */
export interface WatchlistDoc {
  stocks: string[];
}

// ─── Merged consumer type (keeps backward compatibility) ─────────────────────

/**
 * Merged view of users/{uid} + portfolio/{uid} exposed to the rest of the app.
 * Consumers (hooks, components) continue to use this single shape.
 */
export interface UserProfile extends UserProfileDoc, PortfolioDoc {
  watchlist: string[];
  holdings: string[];
}

// ─── Default values ───────────────────────────────────────────────────────────

const DEFAULT_PORTFOLIO: PortfolioDoc = {
  virtualBalance: 100000,
  portfolioValue: 100000,
  totalProfitLoss: 0,
  todayProfitLoss: 0,
  riskScore: 0,
  winRate: 0,
  updatedAt: serverTimestamp() as ReturnType<typeof serverTimestamp>,
};

// ─── Initialization ───────────────────────────────────────────────────────────

/**
 * Called after a new user registers.
 * Creates documents in users/, portfolio/, and watchlist/ — all are no-ops
 * if the document already exists (backward compatibility).
 */
export async function initializeUserDocument(
  uid: string,
  fullName: string,
  email: string,
): Promise<void> {
  const userRef = doc(db, 'users', uid);
  const portfolioRef = doc(db, 'portfolio', uid);
  const watchlistRef = doc(db, 'watchlist', uid);

  const [userSnap, portfolioSnap, watchlistSnap] = await Promise.all([
    getDoc(userRef),
    getDoc(portfolioRef),
    getDoc(watchlistRef),
  ]);

  const writes: Promise<void>[] = [];

  if (!userSnap.exists()) {
    writes.push(
      setDoc(userRef, {
        uid,
        fullName,
        email,
        createdAt: serverTimestamp(),
        xp: 0,
        level: 'Beginner',
      } satisfies UserProfileDoc),
    );
  }

  if (!portfolioSnap.exists()) {
    writes.push(
      setDoc(portfolioRef, {
        ...DEFAULT_PORTFOLIO,
        updatedAt: serverTimestamp(),
      }),
    );
  }

  if (!watchlistSnap.exists()) {
    writes.push(setDoc(watchlistRef, { stocks: [] } satisfies WatchlistDoc));
  }

  await Promise.all(writes);
}

/**
 * Ensures a portfolio/{uid} document exists.
 * If missing, creates it — optionally seeded from legacy user doc data.
 * Safe to call on every dashboard mount for backward compatibility.
 */
export async function initializePortfolioDocument(
  uid: string,
  seed?: Partial<PortfolioDoc>,
): Promise<void> {
  const portfolioRef = doc(db, 'portfolio', uid);
  const snap = await getDoc(portfolioRef);
  if (!snap.exists()) {
    await setDoc(portfolioRef, {
      ...DEFAULT_PORTFOLIO,
      ...seed,
      updatedAt: serverTimestamp(),
    });
  }
}

/**
 * Ensures a watchlist/{uid} document exists.
 */
export async function initializeWatchlistDocument(uid: string): Promise<void> {
  const watchlistRef = doc(db, 'watchlist', uid);
  const snap = await getDoc(watchlistRef);
  if (!snap.exists()) {
    await setDoc(watchlistRef, { stocks: [] } satisfies WatchlistDoc);
  }
}

/**
 * Verifies the user profile document exists in Firestore.
 */
export async function verifyUserDocument(uid: string): Promise<boolean> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists();
}

/** Updates the display name shown across the app (Profile, AI Coach cards, leaderboard). */
export async function updateUserFullName(uid: string, fullName: string): Promise<void> {
  const trimmed = fullName.trim();
  if (!trimmed) {
    throw new Error('Name cannot be empty.');
  }
  await updateDoc(doc(db, 'users', uid), { fullName: trimmed });
}

/**
 * Updates the user's chosen username/handle. Basic format validation only —
 * uniqueness isn't enforced (would need a lookup collection to check
 * reliably; usernames here are a display handle, not a login identifier,
 * so a collision is a cosmetic issue rather than a functional one).
 */
export async function updateUsername(uid: string, username: string): Promise<void> {
  const trimmed = username.trim();
  if (trimmed && !/^[a-zA-Z0-9_]{3,20}$/.test(trimmed)) {
    throw new Error('Username must be 3-20 characters: letters, numbers, and underscores only.');
  }
  await updateDoc(doc(db, 'users', uid), { username: trimmed || null });
}
