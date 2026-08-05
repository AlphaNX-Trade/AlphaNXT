import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { signOut } from 'firebase/auth';
import {
  ChevronLeft,
  UserRound,
  Settings,
  Bell,
  HelpCircle,
  LogOut,
  Loader2,
  Trophy,
  Target,
  ShieldCheck,
} from 'lucide-react';
import { auth } from '@/lib/firebase';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { BottomNav } from '@/components/dashboard/BottomNav';
import { ProfileMenuItem } from '@/components/profile/ProfileMenuItem';
import { toast } from '@/hooks/use-toast';

/** Formats a rupee amount with Indian digit grouping, e.g. ₹1,00,000.00 */
function formatRupees(n: number): string {
  return `₹${n.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Derives up to 2 initials from a full name for the avatar fallback. */
function getInitials(fullName: string | undefined): string {
  if (!fullName) return '?';
  const parts = fullName.trim().split(/\s+/);
  const initials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '');
  return initials.join('') || '?';
}

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const { profile, profileLoading } = useUserProfile();
  const [loggingOut, setLoggingOut] = useState(false);
  const isAdmin = useIsAdmin();

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut(auth);
      setLocation('/login');
    } catch (err) {
      setLoggingOut(false);
      toast({
        title: 'Logout failed',
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col max-w-[480px] mx-auto pb-16">
      {/* Fixed header */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-background/95 backdrop-blur border-b border-border h-14 flex items-center justify-between px-4 z-40">
        <button
          onClick={() => setLocation('/dashboard')}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-semibold text-base text-foreground">Profile</span>
        <div className="w-6" />
      </header>

      {/* Scrollable content */}
      <main className="flex-1 overflow-y-auto px-4 pt-[72px] pb-4 space-y-6">
        {/* Identity card */}
        {profileLoading ? (
          <div className="bg-card border border-primary/20 rounded-xl p-5 animate-pulse space-y-3">
            <div className="w-16 h-16 rounded-full bg-secondary/50 mx-auto" />
            <div className="h-4 w-32 bg-secondary/50 rounded mx-auto" />
            <div className="h-3 w-40 bg-secondary/50 rounded mx-auto" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-primary/20 rounded-xl p-5 flex flex-col items-center text-center shadow-[0_0_30px_rgba(0,210,210,0.06)] relative"
          >
            <div className="absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-3">
              <span className="font-mono text-lg font-bold text-primary">
                {getInitials(profile?.fullName)}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <p className="text-base font-semibold text-foreground">
                {profile?.fullName ?? 'Trader'}
              </p>
              {profile?.title && (
                <span className="font-mono text-[9px] uppercase tracking-widest bg-primary/15 text-primary px-1.5 py-0.5 rounded border border-primary/20">
                  {profile.title}
                </span>
              )}
            </div>
            {profile?.username && (
              <p className="text-xs text-primary/80 font-mono">@{profile.username}</p>
            )}
            <p className="text-xs text-muted-foreground mt-0.5">{profile?.email}</p>

            <div className="flex items-center gap-2 mt-3">
              <span className="font-mono text-[10px] uppercase tracking-widest bg-primary/10 text-primary px-2.5 py-1 rounded-full border border-primary/20">
                {profile?.level ?? 'Beginner'}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest bg-secondary/50 text-muted-foreground px-2.5 py-1 rounded-full">
                {profile?.xp ?? 0} XP
              </span>
            </div>

            <div className="w-full grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-border">
              <div className="flex flex-col gap-0.5">
                <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                  Virtual Balance
                </p>
                <p className="font-mono text-sm font-semibold text-foreground">
                  {formatRupees(profile?.virtualBalance ?? 0)}
                </p>
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                  Win Rate
                </p>
                <p className="font-mono text-sm font-semibold text-foreground">
                  {(profile?.winRate ?? 0).toFixed(1)}%
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Menu */}
        <div className="space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground px-1">
            Progress
          </p>
          <ProfileMenuItem
            icon={Trophy}
            label="Achievements"
            onClick={() => setLocation('/achievements')}
          />
          <ProfileMenuItem
            icon={Target}
            label="Challenges & Leaderboard"
            onClick={() => setLocation('/challenges')}
          />
        </div>

        {isAdmin && (
          <div className="space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-widest text-primary/70 px-1">
              System
            </p>
            <button
              onClick={() => setLocation('/admin')}
              className="w-full flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-primary/10 to-transparent border border-primary/30 rounded-xl hover:border-primary/50 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-primary" />
              </div>
              <span className="flex-1 text-left text-sm font-medium text-foreground">Control Center</span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-primary">Admin</span>
            </button>
          </div>
        )}

        <div className="space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground px-1">
            Account
          </p>
          <ProfileMenuItem
            icon={UserRound}
            label="Edit Profile"
            onClick={() => setLocation('/edit-profile')}
          />
          <ProfileMenuItem
            icon={Settings}
            label="Settings"
            onClick={() => setLocation('/settings')}
          />
          <ProfileMenuItem
            icon={Bell}
            label="Notifications"
            onClick={() => setLocation('/notifications')}
          />
          <ProfileMenuItem
            icon={HelpCircle}
            label="Help"
            onClick={() => setLocation('/help')}
          />
        </div>

        <div className="space-y-2">
          <ProfileMenuItem
            icon={loggingOut ? Loader2 : LogOut}
            label={loggingOut ? 'Logging out…' : 'Logout'}
            onClick={handleLogout}
            destructive
          />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
