import { useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { ChevronLeft, Download, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { useTransactionHistory } from '@/hooks/useTransactionHistory';
import { exportTransactionsToCsv } from '@/lib/csvExport';
import type { TradeSide } from '@/lib/tradingTypes';

type FilterTab = 'all' | 'buy' | 'sell';

const TABS: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'buy', label: 'Up' },
  { id: 'sell', label: 'Down' },
];

function formatDate(timestamp: any): string {
  if (!timestamp?.toDate) return '—';
  const date = timestamp.toDate() as Date;
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' · ' +
    date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export default function TransactionHistoryPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const { transactions, historyLoading, historyError } = useTransactionHistory();

  const filtered = useMemo(() => {
    if (activeTab === 'all') return transactions;
    const side: TradeSide = activeTab === 'buy' ? 'BUY' : 'SELL';
    return transactions.filter((t) => t.side === side);
  }, [transactions, activeTab]);

  const fmt = (n: number) =>
    `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col max-w-[480px] mx-auto pb-6">
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-background/95 backdrop-blur border-b border-border z-40">
        <div className="h-14 flex items-center justify-between px-4">
          <button
            onClick={() => setLocation('/portfolio')}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1"
            aria-label="Back to portfolio"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-semibold text-base text-foreground">Trade History</span>
          <button
            onClick={() => exportTransactionsToCsv(filtered)}
            disabled={filtered.length === 0}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 disabled:opacity-30"
            aria-label="Export CSV"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
        <div className="flex px-4 gap-1 border-b border-border">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2.5 font-mono text-xs font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'text-primary border-primary'
                  : 'text-muted-foreground border-transparent hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pt-[112px] pb-4 space-y-2">
        {historyLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
          </div>
        ) : historyError ? (
          <div className="text-center py-16 px-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {historyError.includes('index')
                ? "This history view needs a one-time Firestore index — check your Firebase console for a link to create it automatically."
                : historyError}
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 px-4">
            <p className="text-sm text-muted-foreground">No trades yet in this filter.</p>
          </div>
        ) : (
          filtered.map((t) => {
            const isBuy = t.side === 'BUY';
            return (
              <div
                key={t.id}
                className="bg-card border border-border rounded-xl px-4 py-3.5 flex items-center gap-3"
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    isBuy ? 'bg-emerald-500/10' : 'bg-red-500/10'
                  }`}
                >
                  {isBuy ? (
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-sm font-semibold text-foreground">{t.symbol}</span>
                    <span
                      className={`font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        isBuy ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {isBuy ? 'Up' : 'Down'}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{formatDate(t.timestamp)}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {t.quantity} share{t.quantity === 1 ? '' : 's'} @ {fmt(t.price)}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className="font-mono text-sm font-medium text-foreground">{fmt(t.totalAmount)}</p>
                  {t.realizedPL !== undefined && (
                    <p
                      className={`font-mono text-[10px] ${t.realizedPL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
                    >
                      {t.realizedPL >= 0 ? '+' : ''}
                      {fmt(t.realizedPL)}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </main>
    </div>
  );
}
