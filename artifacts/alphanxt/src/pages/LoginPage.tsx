import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { motion } from 'framer-motion';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, AuthError } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { initializeUserDocument } from '@/lib/userService';
import { BrandLogo } from '@/components/ui/Brand';
import { FcGoogle } from 'react-icons/fc';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLocation('/dashboard');
    } catch (err) {
      const authErr = err as AuthError;
      setError(authErr.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      // Idempotent — only writes docs if they don't already exist, so this
      // is safe for both brand-new and returning Google sign-ins.
      await initializeUserDocument(
        result.user.uid,
        result.user.displayName ?? 'Trader',
        result.user.email ?? '',
      );
      setLocation('/dashboard');
    } catch (err) {
      const authErr = err as AuthError;
      setError(authErr.message || "Google sign in failed.");
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background text-foreground relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="flex-1 flex items-center justify-center p-6 z-10 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="flex justify-center mb-10">
            <BrandLogo />
          </div>

          <div className="bg-card border border-card-border p-8 rounded-xl shadow-2xl relative">
            <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            
            <h1 className="text-2xl font-bold mb-2">Terminal Access</h1>
            <p className="text-muted-foreground text-sm mb-8 font-mono">Authenticate to begin trading</p>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full bg-background border border-input rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-inner"
                  placeholder="trader@alphanxt.in"
                  data-testid="input-email"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Password</label>
                  <Link href="/forgot-password" className="text-xs text-primary hover:text-primary/80 hover:underline">
                    Forgot Password?
                  </Link>
                </div>
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

              {error && (
                <div className="text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded px-3 py-2 flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span>{error}</span>
                </div>
              )}

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-3 rounded-md transition-colors flex items-center justify-center gap-2 mt-2 shadow-[0_0_15px_rgba(0,255,255,0.15)] hover:shadow-[0_0_20px_rgba(0,255,255,0.25)]"
                data-testid="button-submit"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
              </button>
            </form>

            <div className="mt-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase font-mono">
                <span className="bg-card px-2 text-muted-foreground tracking-wider">Secure Alternative</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="mt-6 w-full bg-white hover:bg-gray-100 text-gray-900 font-medium py-3 rounded-md transition-colors flex items-center justify-center gap-3 border border-gray-200 shadow-sm"
              data-testid="button-google"
            >
              <FcGoogle className="w-5 h-5" />
              Continue with Google
            </button>
          </div>

          <p className="text-center mt-8 text-sm text-muted-foreground">
            Don't have a terminal account?{' '}
            <Link href="/register" className="text-primary hover:underline">
              Create Account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
