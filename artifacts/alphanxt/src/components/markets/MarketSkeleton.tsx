interface MarketSkeletonProps {
  count?: number;
}

export function MarketSkeleton({ count = 5 }: MarketSkeletonProps) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-card border border-border rounded-xl px-4 py-3 flex items-center justify-between animate-pulse"
        >
          {/* Left: symbol + name */}
          <div className="flex flex-col gap-1.5">
            <div className="w-20 h-3 rounded bg-secondary/50" />
            <div className="w-32 h-2.5 rounded bg-secondary/50" />
          </div>
          {/* Right: price + change + star */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end gap-1.5">
              <div className="w-16 h-3 rounded bg-secondary/50" />
              <div className="w-12 h-2.5 rounded bg-secondary/50" />
            </div>
            <div className="w-5 h-5 rounded-full bg-secondary/50" />
          </div>
        </div>
      ))}
    </div>
  );
}
