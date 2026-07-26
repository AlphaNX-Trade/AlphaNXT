import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  createdAt: ReturnType<typeof serverTimestamp>;
  virtualBalance: number;
  portfolioValue: number;
  totalProfitLoss: number;
  xp: number;
  level: string;
  riskScore: number;
  winRate: number;
  watchlist: string[];
  holdings: string[];
}

/**
 * Creates a Firestore user document for a newly registered user.
 * If the document already exists, it is left untouched.
 * Returns the document data after creation (or the existing data).
 */
export async function initializeUserDocument(
  uid: string,
  fullName: string,
  email: string,
): Promise<void> {
  const userRef = doc(db, 'users', uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    await setDoc(userRef, {
      uid,
      fullName,
      email,
      createdAt: serverTimestamp(),
      virtualBalance: 100000,
      portfolioValue: 100000,
      totalProfitLoss: 0,
      xp: 0,
      level: 'Beginner',
      riskScore: 0,
      winRate: 0,
      watchlist: [],
      holdings: [],
    });
  }
}

/**
 * Verifies the user document exists in Firestore.
 * Returns true if the document is present and readable.
 */
export async function verifyUserDocument(uid: string): Promise<boolean> {
  const userRef = doc(db, 'users', uid);
  const snapshot = await getDoc(userRef);
  return snapshot.exists();
}
