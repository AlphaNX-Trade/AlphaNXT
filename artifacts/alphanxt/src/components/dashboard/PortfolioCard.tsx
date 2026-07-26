import { useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { useUserProfile } from '@/hooks/useUserProfile';
import { formatINR, formatINRWithSign } from '@/lib/formatters';

function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(0, { stiffness: 50, damping: 20 });
  const display = useTransform(spring, (current) => formatINR(Math.round(current)));
  
  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span>{display}</motion.span>;
}

export function PortfolioCard() {
  const { profile, profileLoading, profileError } = useUserProfile();

  if (profileLoading) {
    return (
      <div className="bg-card border border-primary/20 rounded-xl p-5 relative overflow-hidden animate-pulse h-[180px]">
        <div className="h-3 w-24 bg-secondary/50 rounded mb-2"></div>
        <div className="h-10 w-48 bg-secondary/50 rounded mb-6"></div>
        <div className="grid grid-cols-2 gap-4">
          <div>
             <div className="h-3 w-24 bg-secondary/50 rounded mb-2"></div>
             <div className="h-6 w-28 bg-secondary/50 rounded"></div>
          </div>
          <div>
             <div className="h-3 w-24 bg-secondary/50 rounded mb-2"></div>
             <div className="h-6 w-28 bg-secondary/50 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const vBalance = profile?.virtualBalance ?? 100000;
  const pValue = profile?.portfolioValue ?? 100000;
  const tPL = profile?.totalProfitLoss ?? 0;

  return (
    <div className="bg-card border border-primary/20 rounded-xl p-5 shadow-[0_0_30px_rgba(0,210,210,0.07)] relative">
      <div className="absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>
      
      <div className="mb-6">
        <h2 className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider mb-1">Virtual Balance</h2>
        <div className="text-3xl font-mono font-bold text-primary tracking-tight">
          <AnimatedNumber value={vBalance} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-y-5 gap-x-4">
        <div>
          <h3 className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider mb-1">Portfolio Value</h3>
          <div className="text-lg font-mono font-semibold text-foreground">
            {formatINR(pValue)}
          </div>
        </div>
        <div>
          <h3 className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider mb-1">Total P/L</h3>
          <div className={`text-lg font-mono font-semibold ${tPL > 0 ? 'text-success' : tPL < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
            {formatINRWithSign(tPL)}
          </div>
        </div>
        <div>
          <h3 className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider mb-1">Today's P/L</h3>
          <div className={`text-lg font-mono font-semibold ${(profile?.todayProfitLoss ?? 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
            {formatINRWithSign(profile?.todayProfitLoss ?? 0)}
            <span className="text-xs ml-0.5 opacity-80">(+0.00%)</span>
          </div>
        </div>
      </div>
      
      {profileError && (
        <div className="mt-5 bg-destructive/10 border border-destructive/20 text-destructive text-xs px-3 py-2 rounded-lg font-mono text-center">
          Error loading profile: {profileError}
        </div>
      )}
    </div>
  );
}
