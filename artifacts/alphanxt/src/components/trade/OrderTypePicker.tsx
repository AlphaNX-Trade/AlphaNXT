import type { OrderType } from '@/lib/tradingTypes';

interface OrderTypeOption {
  type: OrderType;
  label: string;
  available: boolean;
}

const OPTIONS: OrderTypeOption[] = [
  { type: 'MARKET',     label: 'Market',     available: true  },
  { type: 'LIMIT',      label: 'Limit',      available: false },
  { type: 'STOP_LOSS',  label: 'Stop Loss',  available: false },
  { type: 'TAKE_PROFIT',label: 'Take Profit',available: false },
];

interface OrderTypePickerProps {
  selected?: OrderType;
}

/** Only MARKET is active; others are placeholder tabs. */
export function OrderTypePicker({ selected = 'MARKET' }: OrderTypePickerProps) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
      {OPTIONS.map((opt) => {
        const isActive = opt.type === selected && opt.available;
        return (
          <div
            key={opt.type}
            title={opt.available ? undefined : 'Coming soon'}
            className={`relative shrink-0 px-3.5 py-1.5 rounded-lg font-mono text-xs transition-colors select-none ${
              isActive
                ? 'bg-primary/15 text-primary border border-primary/40'
                : opt.available
                  ? 'bg-card border border-border text-muted-foreground cursor-pointer hover:text-foreground'
                  : 'bg-card border border-border/50 text-muted-foreground/40 cursor-not-allowed'
            }`}
          >
            {opt.label}
            {!opt.available && (
              <span className="ml-1.5 text-[9px] uppercase tracking-wide opacity-60">Soon</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
