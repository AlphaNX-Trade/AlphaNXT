import { collection, doc, getDoc, getDocs, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserProfileDoc, PortfolioDoc } from '@/lib/userService';

export interface AdminUserRow {
  uid: string;
  fullName: string;
  email: string;
  username?: string;
  title?: string;
  xp: number;
  level: string;
  virtualBalance: number;
  portfolioValue: number;
  totalProfitLoss: number;
  winRate: number;
  totalTrades: number;
}

/**
 * Fetches every user + their portfolio for the admin dashboard. This is a
 * one-time fetch (not real-time) — admin panels don't need sub-second
 * freshness, and this keeps Firestore read costs bounded regardless of how
 * long the admin leaves the page open.
 */
export async function listAllUsers(): Promise<AdminUserRow[]> {
  const [usersSnap, portfolioSnap] = await Promise.all([
    getDocs(collection(db, 'users')),
    getDocs(collection(db, 'portfolio')),
  ]);

  const portfolioByUid = new Map<string, PortfolioDoc>();
  portfolioSnap.forEach((d) => portfolioByUid.set(d.id, d.data() as PortfolioDoc));

  const rows: AdminUserRow[] = [];
  usersSnap.forEach((d) => {
    const user = d.data() as UserProfileDoc;
    const portfolio = portfolioByUid.get(d.id);
    rows.push({
      uid: d.id,
      fullName: user.fullName ?? 'Unknown',
      email: user.email ?? '—',
      username: user.username,
      title: user.title,
      xp: user.xp ?? 0,
      level: user.level ?? 'Beginner',
      virtualBalance: portfolio?.virtualBalance ?? 0,
      portfolioValue: portfolio?.portfolioValue ?? portfolio?.virtualBalance ?? 0,
      totalProfitLoss: portfolio?.totalProfitLoss ?? 0,
      winRate: portfolio?.winRate ?? 0,
      totalTrades: (portfolio as any)?.totalTrades ?? 0,
    });
  });

  return rows.sort((a, b) => a.fullName.localeCompare(b.fullName));
}

/** Credits a user's virtual balance (and portfolio value) by a given amount. Admin-only, per Firestore rules. */
export async function adminAddMoney(uid: string, amount: number): Promise<void> {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Amount must be greater than zero.');
  }
  await updateDoc(doc(db, 'portfolio', uid), {
    virtualBalance: increment(amount),
    portfolioValue: increment(amount),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Debits (removes) money from a user's virtual balance. Won't let the
 * balance go negative — caps the debit at whatever they currently have.
 */
export async function adminSubtractMoney(uid: string, amount: number): Promise<void> {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Amount must be greater than zero.');
  }
  const portfolioRef = doc(db, 'portfolio', uid);
  const snap = await getDoc(portfolioRef);
  if (!snap.exists()) throw new Error('Portfolio not found for this user.');

  const currentBalance = (snap.data().virtualBalance as number) ?? 0;
  const actualDebit = Math.min(amount, currentBalance);

  await updateDoc(portfolioRef, {
    virtualBalance: increment(-actualDebit),
    portfolioValue: increment(-actualDebit),
    updatedAt: serverTimestamp(),
  });

  if (actualDebit < amount) {
    throw new Error(
      `Only ₹${actualDebit.toLocaleString('en-IN')} was available — balance can't go negative, so that's all that was removed.`,
    );
  }
}

/** Assigns (or clears, with an empty string) an admin-only display title on a user's profile. */
export async function setUserTitle(uid: string, title: string): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { title: title.trim() || null });
}

/**
 * Directly adjusts a user's total realized P/L by a given amount (positive
 * or negative) — a manual credit/adjustment, not a real trade. Admin-only.
 */
export async function adminAdjustProfitLoss(uid: string, amount: number): Promise<void> {
  if (!Number.isFinite(amount) || amount === 0) {
    throw new Error('Enter a non-zero amount.');
  }
  await updateDoc(doc(db, 'portfolio', uid), {
    totalProfitLoss: increment(amount),
    updatedAt: serverTimestamp(),
  });
}
