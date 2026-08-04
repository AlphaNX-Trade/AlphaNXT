import { Loader2 } from 'lucide-react';

/** Placeholder — full admin panel UI (user list, add money, adjust P/L, add stock) built in Part 2. */
export default function AdminPage() {
  return (
    <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center max-w-[480px] mx-auto px-6 text-center gap-3">
      <Loader2 className="w-5 h-5 text-primary animate-spin" />
      <p className="text-sm text-muted-foreground">Admin panel — coming in the next part.</p>
    </div>
  );
}
