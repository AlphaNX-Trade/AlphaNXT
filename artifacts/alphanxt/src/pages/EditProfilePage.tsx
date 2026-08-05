import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { ChevronLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { updateUserFullName, updateUsername } from '@/lib/userService';

export default function EditProfilePage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { profile, profileLoading } = useUserProfile();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.fullName) setFullName(profile.fullName);
    setUsername(profile?.username ?? '');
  }, [profile?.fullName, profile?.username]);

  const nameChanged = profile ? fullName.trim() !== profile.fullName && fullName.trim().length > 0 : false;
  const usernameChanged = profile ? username.trim() !== (profile.username ?? '') : false;
  const hasChanges = nameChanged || usernameChanged;

  const handleSave = async () => {
    if (!user || !hasChanges) return;
    setSaving(true);
    setError(null);
    try {
      if (nameChanged) await updateUserFullName(user.uid, fullName);
      if (usernameChanged) await updateUsername(user.uid, username);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

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
        <span className="font-semibold text-base text-foreground">Edit Profile</span>
        <div className="w-6" aria-hidden />
      </header>

      <main className="flex-1 overflow-y-auto px-4 pt-[72px] pb-4 space-y-4">
        {profileLoading ? (
          <div className="space-y-3">
            <div className="h-16 bg-card border border-border rounded-xl animate-pulse" />
            <div className="h-16 bg-card border border-border rounded-xl animate-pulse" />
          </div>
        ) : (
          <>
            <div className="bg-card border border-border rounded-xl p-4 space-y-2">
              <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/40"
              />
            </div>

            <div className="bg-card border border-border rounded-xl p-4 space-y-2">
              <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Username
              </label>
              <div className="flex items-center">
                <span className="text-muted-foreground text-sm pr-0.5">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))}
                  placeholder="yourhandle"
                  className="flex-1 bg-secondary/40 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/40"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">3-20 characters: letters, numbers, underscores.</p>
            </div>

            {profile?.title && (
              <div className="bg-card border border-primary/20 rounded-xl p-4 space-y-1">
                <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Title
                </label>
                <p className="text-sm text-primary font-medium">{profile.title}</p>
                <p className="text-[11px] text-muted-foreground">Assigned by AlphaNXT — can't be self-edited.</p>
              </div>
            )}

            <div className="bg-card border border-border rounded-xl p-4 space-y-2">
              <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Email
              </label>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
              <p className="text-[11px] text-muted-foreground">
                Email can't be changed here — it's tied to your login.
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 bg-destructive/10 border border-destructive/30 text-destructive rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p className="text-xs leading-relaxed">{error}</p>
              </div>
            )}

            {saved && (
              <div className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl px-4 py-3">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <p className="text-xs">Saved</p>
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className="w-full h-12 rounded-xl font-semibold text-sm bg-primary text-background flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
            </button>
          </>
        )}
      </main>
    </div>
  );
}
