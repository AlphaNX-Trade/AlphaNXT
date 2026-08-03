import { useLocation } from 'wouter';
import { ChevronLeft, Volume2, Moon, Sun, Bell, HelpCircle, ChevronRight } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useSettings } from '@/hooks/useSettings';
import { useTheme } from '@/contexts/ThemeContext';

export default function SettingsPage() {
  const [, setLocation] = useLocation();
  const { settings, settingsLoading, updateSetting } = useSettings();
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col max-w-[480px] mx-auto pb-6">
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-background/95 backdrop-blur border-b border-border h-14 flex items-center justify-between px-4 z-40">
        <button
          onClick={() => setLocation('/profile')}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1"
          aria-label="Back to profile"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-semibold text-base text-foreground">Settings</span>
        <div className="w-6" aria-hidden />
      </header>

      <main className="flex-1 overflow-y-auto px-4 pt-[72px] pb-4 space-y-4">
        <div className="space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground px-1">
            Appearance
          </p>
          <div className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3.5">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 text-primary" />
              ) : (
                <Sun className="w-4 h-4 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Theme</p>
              <p className="text-[11px] text-muted-foreground">Choose dark or light mode</p>
            </div>
            <div className="flex bg-secondary/50 rounded-lg p-0.5 gap-0.5">
              <button
                onClick={() => setTheme('dark')}
                className={`px-3 py-1.5 rounded-md font-mono text-[10px] uppercase tracking-wider transition-colors ${
                  theme === 'dark' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                }`}
              >
                Dark
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`px-3 py-1.5 rounded-md font-mono text-[10px] uppercase tracking-wider transition-colors ${
                  theme === 'light' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                }`}
              >
                Light
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground px-1">
            Experience
          </p>
          {settingsLoading ? (
            <div className="h-16 bg-card border border-border rounded-xl animate-pulse" />
          ) : (
            <div className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3.5">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Volume2 className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Sound Effects</p>
                <p className="text-[11px] text-muted-foreground">Trade confirmations, achievements</p>
              </div>
              <Switch
                checked={settings?.soundEffectsEnabled ?? true}
                onCheckedChange={(checked) => updateSetting({ soundEffectsEnabled: checked })}
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground px-1">
            More
          </p>
          <button
            onClick={() => setLocation('/notifications')}
            className="w-full flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3.5 hover:border-primary/30 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4 text-primary" />
            </div>
            <span className="flex-1 text-left text-sm font-medium text-foreground">Notifications</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => setLocation('/help')}
            className="w-full flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3.5 hover:border-primary/30 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <HelpCircle className="w-4 h-4 text-primary" />
            </div>
            <span className="flex-1 text-left text-sm font-medium text-foreground">Help</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </main>
    </div>
  );
}
