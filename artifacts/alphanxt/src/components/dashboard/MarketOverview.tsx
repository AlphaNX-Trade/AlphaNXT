import { ArrowUpRight } from 'lucide-react';

export function MarketOverview() {
  const indices = [
    { name: 'NIFTY 50', value: '24,856.50', change: '+104.30 (+0.42%)' },
    { name: 'SENSEX', value: '81,920.30', change: '+310.15 (+0.38%)' },
    { name: 'BANKNIFTY', value: '53,440.25', change: '+356.80 (+0.67%)' },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-xs text-muted-foreground uppercase font-mono tracking-wider px-1">Markets</h3>
      <div className="flex overflow-x-auto gap-3 pb-2 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {indices.map((idx, i) => (
          <div key={i} className="min-w-[160px] bg-card border border-border rounded-xl p-3 snap-start shrink-0">
            <div className="text-[10px] font-mono text-muted-foreground uppercase mb-1">{idx.name}</div>
            <div className="text-lg font-mono font-semibold text-foreground mb-1">{idx.value}</div>
            <div className="text-xs text-success flex items-center font-mono">
              <ArrowUpRight className="w-3 h-3 mr-0.5" />
              {idx.change}
            </div>
            <div className="mt-3">
              <svg width="60" height="24" viewBox="0 0 60 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polyline points="0,20 10,18 20,22 30,12 40,15 50,5 60,8" stroke="currentColor" strokeWidth="1.5" className="text-primary/40" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
