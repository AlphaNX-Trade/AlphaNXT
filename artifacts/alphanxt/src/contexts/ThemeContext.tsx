import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/hooks/useSettings';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'alphanxt-theme';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyThemeToDom(theme: Theme): void {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

function readStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === 'light' ? 'light' : 'dark';
}

/**
 * Provides the current theme app-wide. Source of truth is:
 * - localStorage, for instant application before login / before Firestore
 *   settings load (avoids a flash of the wrong theme)
 * - settings/{uid} in Firestore, once loaded, for cross-device persistence
 * Setting the theme updates both immediately.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { settings, settingsLoading, updateSetting } = useSettings();
  const [theme, setThemeState] = useState<Theme>(readStoredTheme());

  // Apply immediately on mount and whenever it changes.
  useEffect(() => {
    applyThemeToDom(theme);
  }, [theme]);

  // Once Firestore settings load for a logged-in user, let that be the
  // source of truth (in case they set a preference on another device).
  useEffect(() => {
    if (!user || settingsLoading || !settings?.theme) return;
    if (settings.theme !== theme) {
      setThemeState(settings.theme);
      window.localStorage.setItem(STORAGE_KEY, settings.theme);
    }
    // Only react to the Firestore value changing, not local theme state,
    // to avoid fighting with the user's own toggle below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings?.theme, settingsLoading, user]);

  const setTheme = (next: Theme) => {
    setThemeState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    applyThemeToDom(next);
    if (user) {
      updateSetting({ theme: next }).catch(() => {
        /* best-effort — local + DOM state already updated */
      });
    }
  };

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
