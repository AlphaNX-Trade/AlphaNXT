import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/** settings/{uid} — user preferences. Fulfills the app's settings collection from the data model spec. */
export interface SettingsDoc {
  pushNotificationsEnabled: boolean;
  emailNotificationsEnabled: boolean;
  soundEffectsEnabled: boolean;
  updatedAt: unknown;
}

const DEFAULT_SETTINGS: Omit<SettingsDoc, 'updatedAt'> = {
  pushNotificationsEnabled: true,
  emailNotificationsEnabled: true,
  soundEffectsEnabled: true,
};

export async function initializeSettings(uid: string): Promise<void> {
  const ref = doc(db, 'settings', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { ...DEFAULT_SETTINGS, updatedAt: serverTimestamp() });
  }
}

export async function updateSettings(uid: string, patch: Partial<Omit<SettingsDoc, 'updatedAt'>>): Promise<void> {
  await setDoc(doc(db, 'settings', uid), { ...patch, updatedAt: serverTimestamp() }, { merge: true });
}

export function subscribeToSettings(uid: string, callback: (settings: SettingsDoc | null) => void): () => void {
  return onSnapshot(doc(db, 'settings', uid), (snap) => {
    callback(snap.exists() ? (snap.data() as SettingsDoc) : null);
  });
}
