import { useLocation } from 'wouter';
import { Bell, Terminal } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';

export function Header() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { profile } = useUserProfile();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const name = profile?.fullName?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'Trader';

  return (
    <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] h-14 bg-background/95 backdrop-blur z-50 border-b border-border flex items-center justify-between px-4">
      <div className="flex items-center gap-1.5">
        <Terminal className="w-4 h-4 text-primary" />
        <span className="font-bold tracking-tight text-lg">
          <span className="text-primary">Alpha</span>
          <span className="text-foreground">NXT</span>
        </span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-xs font-mono text-muted-foreground">{greeting}, {name}</span>
      </div>
      <button
        onClick={() => setLocation('/notifications')}
        className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
        data-testid="button-notifications"
      >
        <Bell className="w-5 h-5" />
      </button>
    </header>
  );
}
