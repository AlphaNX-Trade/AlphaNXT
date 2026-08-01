import { useState } from 'react';
import { sendEmailVerification } from 'firebase/auth';
import { MailWarning, X, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Shown on the dashboard when the signed-in user hasn't verified their
 * email. Doesn't block app usage (paper trading has no real financial
 * stakes) — it's a nudge, not a hard gate. Dismissible for the session.
 */
export function EmailVerificationBanner() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);
  const [justSent, setJustSent] = useState(false);
  const [checking, setChecking] = useState(false);

  if (!user || user.emailVerified || dismissed) return null;

  const handleResend = async () => {
    setSending(true);
    try {
      await sendEmailVerification(user);
      setJustSent(true);
      setTimeout(() => setJustSent(false), 4000);
    } catch {
      // Silently ignore — Firebase rate-limits repeated sends; the button
      // simply stays available to try again later.
    } finally {
      setSending(false);
    }
  };

  const handleCheckAgain = async () => {
    setChecking(true);
    try {
      await user.reload();
      // If now verified, the parent re-render (auth state listener) will
      // naturally hide this banner since user.emailVerified flips to true.
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="flex items-start gap-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3">
      <MailWarning className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
      <div className="flex-1 space-y-1.5">
        <p className="text-xs text-amber-200 leading-relaxed">
          Verify your email to secure your account. Check your inbox for a link.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={handleResend}
            disabled={sending}
            className="text-[11px] font-medium text-amber-300 hover:text-amber-200 transition-colors flex items-center gap-1"
          >
            {sending ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : justSent ? (
              <CheckCircle2 className="w-3 h-3" />
            ) : null}
            {justSent ? 'Sent!' : 'Resend email'}
          </button>
          <button
            onClick={handleCheckAgain}
            disabled={checking}
            className="text-[11px] font-medium text-amber-300 hover:text-amber-200 transition-colors"
          >
            {checking ? "Checking…" : "I've verified"}
          </button>
        </div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-amber-400/60 hover:text-amber-300 transition-colors p-0.5"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
