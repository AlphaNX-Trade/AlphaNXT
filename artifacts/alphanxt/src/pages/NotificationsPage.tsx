import { useLocation } from 'wouter';
import { ChevronLeft, Bell, Mail } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useSettings } from '@/hooks/useSettings';

export default function NotificationsPage() {
  const [, setLocation] = useLocation();
  const { settings, settingsLoading, updateSetting } = useSettings();

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
        <span className="font-semibold text-base text-foreground">Notifications</span>
        <div className="w-6" aria-hidden />
      </header>

      <main className="flex-1 overflow-y-auto px-4 pt-[72px] pb-4 space-y-4">
        <p className="text-[11px] text-muted-foreground leading-relaxed bg-secondary/30 rounded-lg p-3">
          These preferences are saved to your account now. Actual push/email delivery isn't
          connected yet — that requires backend infrastructure not yet set up for this app.
        </p>

        {settingsLoading ? (
          <div className="space-y-3">
            <div className="h-16 bg-card border border-border rounded-xl animate-pulse" />
            <div className="h-16 bg-card border border-border rounded-xl animate-pulse" />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3.5">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Push Notifications</p>
                <p className="text-[11px] text-muted-foreground">Trade fills, daily tips, challenges</p>
              </div>
              <Switch
                checked={settings?.pushNotificationsEnabled ?? true}
                onCheckedChange={(checked) => updateSetting({ pushNotificationsEnabled: checked })}
              />
            </div>

            <div className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3.5">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Email Notifications</p>
                <p className="text-[11px] text-muted-foreground">Weekly summaries and updates</p>
              </div>
              <Switch
                checked={settings?.emailNotificationsEnabled ?? true}
                onCheckedChange={(checked) => updateSetting({ emailNotificationsEnabled: checked })}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
