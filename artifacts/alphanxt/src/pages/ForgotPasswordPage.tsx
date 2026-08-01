import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { motion } from 'framer-motion';
import { sendPasswordResetEmail, AuthError } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { BrandLogo } from '@/components/ui/Brand';
import { Loader2, CheckCircle2, ChevronLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err) {
      const authErr = err as AuthError & { message: string };
      // Firebase returns a distinct code for unregistered emails — but to
      // avoid confirming/denying which emails have accounts (a common
      // account-enumeration concern), show the same success state either way.
      if (authErr.code === 'auth/user-not-found') {
        setSent(true);
      } else {
        setError(authErr.message || 'Failed to send reset email.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center px-6 max-w-[480px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full space-y-6"
      >
        <button
          onClick={() => setLocation('/login')}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to login
        </button>

        <div className="flex flex-col items-center gap-3 pt-4">
          <BrandLogo />
          <div className="text-center space-y-1">
            <h1 className="text-lg font-semibold text-foreground">Reset your password</h1>
            <p className="text-sm text-muted-foreground max-w-[280px]">
              Enter the email on your account and we'll send you a reset link.
            </p>
          </div>
        </div>

        {sent ? (
          <div className="flex flex-col items-center gap-3 bg-card border border-emerald-500/30 rounded-xl p-5 text-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            <p className="text-sm text-foreground">
              If an account exists for <span className="font-medium">{email}</span>, a reset link
              is on its way. Check your inbox (and spam folder).
            </p>
            <Link href="/login" className="text-sm text-primary hover:underline">
              Return to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-background border border-input rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-inner"
                placeholder="trader@alphanxt.in"
              />
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-background font-semibold text-sm py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Reset Link'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
