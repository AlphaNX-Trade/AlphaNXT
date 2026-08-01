import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { motion } from 'framer-motion';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification, AuthError } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { initializeUserDocument, verifyUserDocument } from '@/lib/userService';
import { BrandLogo } from '@/components/ui/Brand';
import { Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    setLoadingStep('Creating account…');

    try {
      // Step 1: Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });

      // Best-effort — a failed verification email shouldn't block account creation.
      sendEmailVerification(userCredential.user).catch((err) => {
        console.warn('Failed to send verification email:', err);
      });

      // Step 2: Initialize Firestore document (no-op if it already exists)
      setLoadingStep('Setting up your profile…');
      await initializeUserDocument(userCredential.user.uid, name, email);

      // Step 3: Verify the document exists before navigating
      setLoadingStep('Verifying account…');
      const verified = await verifyUserDocument(userCredential.user.uid);
      if (!verified) {
        throw new Error('Account setup could not be verified. Please try again.');
      }

      setLocation('/dashboard');
    } catch (err) {
      const authErr = err as AuthError & { message: string };
      setError(authErr.message || 'Failed to create account.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background text-foreground relative overflow-hidden">
      <div className="absolute top-1/4 left-0 w-1/2 h-1/2 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="flex-1 flex items-center justify-center p-6 z-10 py-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="flex justify-center mb-8">
            <BrandLogo />
          </div>

          <div className="bg-card border border-card-border p-8 rounded-xl shadow-2xl relative">
            <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            
            <h1 className="text-2xl font-bold mb-2">Initialize Account</h1>
            <p className="text-muted-foreground text-sm mb-8 font-mono">Create your paper trading profile</p>

            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full bg-background border border-input rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-inner"
                  placeholder="Arjun Sharma"
                  data-testid="input-name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full bg-background border border-input rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-inner"
                  placeholder="arjun@example.com"
                  data-testid="input-email"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full bg-background border border-input rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-inner font-mono tracking-widest"
                  placeholder="••••••••"
                  data-testid="input-password"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Confirm Password</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-background border border-input rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-inner font-mono tracking-widest"
                  placeholder="••••••••"
                  data-testid="input-confirm-password"
                />
              </div>

              {error && (
                <div className="text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded px-3 py-2 flex items-start gap-2 mt-2">
                  <span className="mt-0.5">•</span>
                  <span>{error}</span>
                </div>
              )}

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-3 rounded-md transition-colors flex items-center justify-center gap-2 mt-6 shadow-[0_0_15px_rgba(0,255,255,0.15)] hover:shadow-[0_0_20px_rgba(0,255,255,0.25)]"
                data-testid="button-register"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">{loadingStep || 'Please wait…'}</span>
                  </>
                ) : "Create Account"}
              </button>
            </form>
          </div>

          <p className="text-center mt-8 text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
