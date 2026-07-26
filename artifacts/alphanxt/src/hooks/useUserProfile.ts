import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import {
  UserProfile,
  UserProfileDoc,
  PortfolioDoc,
  initializePortfolioDocument,
  initializeWatchlistDocument,
} from '@/lib/userService';

interface UseUserProfileResult {
  profile: UserProfile | null;
  profileLoading: boolean;
  profileError: string | null;
}

/**
 * Subscribes to users/{uid} and portfolio/{uid} in real time and merges them
 * into a single UserProfile shape. If portfolio or watchlist documents are
 * missing (existing users from before Phase 2.5), they are created automatically
 * with sensible defaults seeded from the user doc where possible.
 */
export function useUserProfile(): UseUserProfileResult {
  const { user } = useAuth();

  const [userDoc, setUserDoc] = useState<UserProfileDoc | null>(null);
  const [portfolioDoc, setPortfolioDoc] = useState<PortfolioDoc | null>(null);

  // Track whether each listener has fired at least once
  const [userReady, setUserReady] = useState(false);
  const [portfolioReady, setPortfolioReady] = useState(false);

  const [profileError, setProfileError] = useState<string | null>(null);

  // Prevent duplicate auto-init calls
  const initializingPortfolio = useRef(false);
  const initializingWatchlist = useRef(false);

  useEffect(() => {
    if (!user) {
      setUserDoc(null);
      setPortfolioDoc(null);
      setUserReady(false);
      setPortfolioReady(false);
      setProfileError(null);
      initializingPortfolio.current = false;
      initializingWatchlist.current = false;
      return;
    }

    // Reset state when uid changes
    setUserReady(false);
    setPortfolioReady(false);
    initializingPortfolio.current = false;
    initializingWatchlist.current = false;

    const uid = user.uid;

    // ── Listener 1: users/{uid} ──────────────────────────────────────────────
    const userUnsub = onSnapshot(
      doc(db, 'users', uid),
      (snap) => {
        setUserDoc(snap.exists() ? (snap.data() as UserProfileDoc) : null);
        setUserReady(true);
      },
      (err) => {
        setProfileError(err.message);
        setUserReady(true);
      },
    );

    // ── Listener 2: portfolio/{uid} ──────────────────────────────────────────
    const portfolioUnsub = onSnapshot(
      doc(db, 'portfolio', uid),
      (snap) => {
        if (snap.exists()) {
          setPortfolioDoc(snap.data() as PortfolioDoc);
          setPortfolioReady(true);
        } else {
          // Document missing — auto-create for backward compatibility
          if (!initializingPortfolio.current) {
            initializingPortfolio.current = true;
            initializePortfolioDocument(uid).catch((err) =>
              setProfileError(err.message),
            );
            // portfolioReady stays false until the write triggers this snapshot again
          }
        }
      },
      (err) => {
        setProfileError(err.message);
        setPortfolioReady(true);
      },
    );

    // ── Auto-create watchlist/{uid} if missing (fire-and-forget) ────────────
    if (!initializingWatchlist.current) {
      initializingWatchlist.current = true;
      initializeWatchlistDocument(uid).catch((err) =>
        setProfileError(err.message),
      );
    }

    return () => {
      userUnsub();
      portfolioUnsub();
    };
  }, [user]);

  // Derive merged profile once both listeners have fired
  const profileLoading = !user ? false : !userReady || !portfolioReady;

  const profile: UserProfile | null =
    userReady && portfolioReady && userDoc && portfolioDoc
      ? {
          // UserProfileDoc fields
          uid: userDoc.uid,
          fullName: userDoc.fullName,
          email: userDoc.email,
          createdAt: userDoc.createdAt,
          xp: userDoc.xp ?? 0,
          level: userDoc.level ?? 'Beginner',

          // PortfolioDoc fields
          virtualBalance: portfolioDoc.virtualBalance,
          portfolioValue: portfolioDoc.portfolioValue,
          totalProfitLoss: portfolioDoc.totalProfitLoss,
          todayProfitLoss: portfolioDoc.todayProfitLoss,
          riskScore: portfolioDoc.riskScore,
          winRate: portfolioDoc.winRate,
          updatedAt: portfolioDoc.updatedAt,

          // Legacy fields (kept for backward compatibility)
          watchlist: [],
          holdings: [],
        }
      : null;

  return { profile, profileLoading, profileError };
}
