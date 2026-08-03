import React from 'react';

export function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`font-mono font-bold tracking-tight flex items-center gap-2 ${className}`}>
      <img src="/logo-mark.png" alt="AlphaNXT" className="w-8 h-8 object-contain" />
      <span className="text-primary text-xl">Alpha</span>
      <span className="text-foreground text-xl">NXT</span>
    </div>
  );
}
