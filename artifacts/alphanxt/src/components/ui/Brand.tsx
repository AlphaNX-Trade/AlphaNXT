import React from 'react';

export function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`font-mono font-bold tracking-tight flex items-center gap-1 ${className}`}>
      <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center border border-primary/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/10 animate-pulse" />
        <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(0,255,255,0.8)]" />
      </div>
      <span className="text-primary text-xl">Alpha</span>
      <span className="text-white text-xl">NXT</span>
    </div>
  );
}
