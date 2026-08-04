import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Search,
  Users,
  Wallet,
  Activity,
  ShieldCheck,
  Loader2,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import { listAllUsers, type AdminUserRow } from '@/lib/adminService';
import { AdminUserDetailSheet } from '@/components/admin/AdminUserDetailSheet';
import { AddStockForm } from '@/components/admin/AddStockForm';

type Tab = 'users' | 'deploy';

const fmt = (n: number) =>
  `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

/** Subtle animated grid backdrop — reinforces the "control center" feel without being distracting. */
function GridBackdrop() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-[0.07]">
      <svg width="100%" height="100%">
        <defs>
          <pattern id="admin-grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#00E0FF" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#admin-grid)" />
      </svg>
    </div>
  );
}

export default function AdminPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUserRow | null>(null);

  const loadUsers = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const rows = await listAllUsers();
      setUsers(rows);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter((u) => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, search]);

  const totals = useMemo(
    () => ({
      userCount: users.length,
      totalBalance: users.reduce((sum, u) => sum + u.virtualBalance, 0),
      totalPL: users.reduce((sum, u) => sum + u.totalProfitLoss, 0),
    }),
    [users],
  );

  return (
    <div className="min-h-[100dvh] bg-[#05070c] flex flex-col max-w-[480px] mx-auto pb-8 relative">
      <GridBackdrop />

      {/* Header */}
      <header className="sticky top-0 bg-[#05070c]/95 backdrop-blur border-b border-primary/15 z-40 relative">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        <div className="h-14 flex items-center justify-between px-4">
          <button
            onClick={() => setLocation('/dashboard')}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="font-mono text-sm font-bold uppercase tracking-[0.15em] text-foreground">
              Control Center
            </span>
          </div>
          <button
            onClick={() => loadUsers(true)}
            className="text-muted-foreground hover:text-primary transition-colors p-1"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 pt-4 space-y-5 relative z-10">
        {/* Live status strip */}
        <div className="flex items-center gap-1.5 px-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-emerald-400">
            System Online
          </span>
        </div>

        {/* Overview stats */}
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { icon: Users, label: 'Users', value: loading ? '—' : totals.userCount.toString() },
            { icon: Wallet, label: 'Total Balance', value: loading ? '—' : fmt(totals.totalBalance) },
            {
              icon: Activity,
              label: 'Net P/L',
              value: loading ? '—' : `${totals.totalPL >= 0 ? '+' : ''}${fmt(totals.totalPL)}`,
              positive: totals.totalPL >= 0,
            },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-primary/20 bg-gradient-to-b from-primary/[0.06] to-transparent p-3 relative overflow-hidden"
            >
              <stat.icon className="w-3.5 h-3.5 text-primary mb-2" />
              <p
                className={`font-mono text-sm font-bold ${
                  stat.positive === undefined ? 'text-foreground' : stat.positive ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {stat.value}
              </p>
              <p className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground mt-0.5">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-primary/10">
          {(['users', 'deploy'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 font-mono text-[11px] uppercase tracking-widest border-b-2 transition-colors ${
                activeTab === tab
                  ? 'text-primary border-primary'
                  : 'text-muted-foreground border-transparent hover:text-foreground'
              }`}
            >
              {tab === 'users' ? 'User Registry' : 'Deploy Stock'}
            </button>
          ))}
        </div>

        {activeTab === 'users' ? (
          <div className="space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email…"
                className="w-full bg-white/[0.03] border border-primary/15 rounded-lg pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
              />
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground py-16">
                {users.length === 0 ? 'No registered users yet.' : 'No matches for that search.'}
              </p>
            ) : (
              <div className="space-y-2">
                {filtered.map((u, i) => (
                  <motion.button
                    key={u.uid}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.02, 0.3) }}
                    onClick={() => setSelectedUser(u)}
                    className="w-full flex items-center gap-3 bg-white/[0.02] border border-primary/10 hover:border-primary/30 rounded-xl px-4 py-3 transition-colors text-left"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <span className="font-mono text-xs font-bold text-primary">
                        {u.fullName.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{u.fullName}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{u.email}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono text-xs font-semibold text-foreground">{fmt(u.virtualBalance)}</p>
                      <p
                        className={`font-mono text-[10px] ${u.totalProfitLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
                      >
                        {u.totalProfitLoss >= 0 ? '+' : ''}
                        {fmt(u.totalProfitLoss)}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <AddStockForm />
        )}
      </main>

      {selectedUser && (
        <AdminUserDetailSheet
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdated={() => loadUsers(true)}
        />
      )}
    </div>
  );
}
