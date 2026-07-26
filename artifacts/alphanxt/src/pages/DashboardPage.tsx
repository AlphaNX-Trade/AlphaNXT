import React from 'react';
import { motion } from 'framer-motion';
import { BrandLogo } from '@/components/ui/Brand';
import { LogOut, Activity, BarChart2, PieChart } from 'lucide-react';
import { auth } from '@/lib/firebase';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Nav (Placeholder) */}
      <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card/50 backdrop-blur-md relative z-20">
        <BrandLogo />
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 text-success rounded border border-success/20 font-mono text-xs">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            MARKET OPEN
          </div>
          <button 
            onClick={() => auth.signOut()}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-secondary"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] opacity-[0.03] pointer-events-none">
          <div className="border-r border-b border-primary" />
          <div className="border-b border-primary" />
          <div className="border-r border-primary" />
          <div className="" />
        </div>
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center z-10 max-w-2xl"
        >
          <div className="flex justify-center gap-6 mb-8 text-primary/40">
            <Activity className="w-12 h-12" />
            <BarChart2 className="w-12 h-12" />
            <PieChart className="w-12 h-12" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            Terminal Active. <br/> <span className="text-muted-foreground">Market Data Loading...</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-12 font-mono">
            Dashboard Coming Soon. The premium trading experience is being assembled.
          </p>

          <div className="inline-block border border-primary/20 bg-primary/5 px-6 py-4 rounded-lg">
            <p className="font-mono text-sm text-primary flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block shadow-[0_0_8px_rgba(0,255,255,0.8)]" />
              SYSTEM_STATUS: <span className="text-foreground font-bold tracking-wider">INITIALIZING_WIDGETS</span>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
