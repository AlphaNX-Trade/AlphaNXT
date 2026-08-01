import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { initializeSettings, subscribeToSettings, updateSettings, type SettingsDoc } from '@/lib/settingsService';

interface UseSettingsResult {
  settings: SettingsDoc | null;
  settingsLoading: boolean;
  updateSetting: (patch: Partial<Omit<SettingsDoc, 'updatedAt'>>) => Promise<void>;
}

export function useSettings(): UseSettingsResult {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SettingsDoc | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSettings(null);
      setSettingsLoading(false);
      return;
    }

    initializeSettings(user.uid).catch(() => {
      /* onSnapshot below will surface persistent errors */
    });

    const unsub = subscribeToSettings(user.uid, (data) => {
      setSettings(data);
      setSettingsLoading(false);
    });

    return unsub;
  }, [user]);

  const updateSetting = async (patch: Partial<Omit<SettingsDoc, 'updatedAt'>>) => {
    if (!user) return;
    // Optimistic local update so the toggle feels instant.
    setSettings((prev) => (prev ? { ...prev, ...patch } : prev));
    await updateSettings(user.uid, patch);
  };

  return { settings, settingsLoading, updateSetting };
}
