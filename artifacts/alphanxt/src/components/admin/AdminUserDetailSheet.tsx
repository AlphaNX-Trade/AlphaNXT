import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, TrendingUp, Loader2, CheckCircle2, AlertCircle, Zap, MinusCircle, Award } from 'lucide-react';
import type { AdminUserRow } from '@/lib/adminService';
import { adminAddMoney, adminSubtractMoney, adminAdjustProfitLoss, setUserTitle } from '@/lib/adminService';

interface AdminUserDetailSheetProps {
  user: AdminUserRow;
  onClose: () => void;
  onUpdated: () => void;
}

const fmt = (n: number) =>
  `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function AdminUserDetailSheet({ user, onClose, onUpdated }: AdminUserDetailSheetProps) {
  const [moneyAmount, setMoneyAmount] = useState('');
  const [moneyMode, setMoneyMode] = useState<'credit' | 'debit'>('credit');
  const [plAmount, setPlAmount] = useState('');
  const [titleInput, setTitleInput] = useState(user.title ?? '');
  const [busy, setBusy] = useState<'money' | 'pl' | 'title' | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleMoneyAction = async () => {
    const amount = parseFloat(moneyAmount);
    setBusy('money');
    setFeedback(null);
    try {
      if (moneyMode === 'credit') {
        await adminAddMoney(user.uid, amount);
        setFeedback({ type: 'success', message: `Credited ${fmt(amount)} to ${user.fullName}.` });
      } else {
        await adminSubtractMoney(user.uid, amount);
        setFeedback({ type: 'success', message: `Debited ${fmt(amount)} from ${user.fullName}.` });
      }
      setMoneyAmount('');
      onUpdated();
    } catch (err) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Failed to update balance.' });
    } finally {
      setBusy(null);
    }
  };

  const handleSetTitle = async () => {
    setBusy('title');
    setFeedback(null);
    try {
      await setUserTitle(user.uid, titleInput);
      setFeedback({
        type: 'success',
        message: titleInput.trim() ? `Title "${titleInput.trim()}" assigned.` : 'Title cleared.',
      });
      onUpdated();
    } catch (err) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Failed to set title.' });
    } finally {
      setBusy(null);
    }
  };

  const handleAdjustPL = async () => {
    const amount = parseFloat(plAmount);
    setBusy('pl');
    setFeedback(null);
    try {
      await adminAdjustProfitLoss(user.uid, amount);
      setFeedback({
        type: 'success',
        message: `${amount >= 0 ? 'Added' : 'Subtracted'} ${fmt(Math.abs(amount))} ${amount >= 0 ? 'to' : 'from'} P/L.`,
      });
      setPlAmount('');
      onUpdated();
    } catch (err) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Failed to adjust P/L.' });
    } finally {
      setBusy(null);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end justify-center"
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[480px] max-h-[85vh] overflow-y-auto bg-[#0a0e18] border-t border-primary/30 rounded-t-2xl relative"
          style={{ boxShadow: '0 -10px 60px rgba(0, 224, 255, 0.08)' }}
        >
          {/* Scan-line accent */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />

          <div className="sticky top-0 bg-[#0a0e18]/95 backdrop-blur border-b border-primary/10 px-5 py-4 flex items-center justify-between z-10">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/70">User Record</p>
              <p className="text-base font-semibold text-foreground">{user.fullName}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Stat grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Balance', value: fmt(user.virtualBalance), glow: true },
                { label: 'Portfolio Value', value: fmt(user.portfolioValue) },
                {
                  label: 'Total P/L',
                  value: `${user.totalProfitLoss >= 0 ? '+' : ''}${fmt(user.totalProfitLoss)}`,
                  positive: user.totalProfitLoss >= 0,
                },
                { label: 'Win Rate', value: `${user.winRate.toFixed(0)}%` },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`rounded-xl border p-3 ${
                    stat.glow ? 'border-primary/30 bg-primary/5' : 'border-white/10 bg-white/[0.02]'
                  }`}
                >
                  <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-1">
                    {stat.label}
                  </p>
                  <p
                    className={`font-mono text-sm font-semibold ${
                      stat.positive !== undefined
                        ? stat.positive
                          ? 'text-emerald-400'
                          : 'text-red-400'
                        : 'text-foreground'
                    }`}
                  >
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Feedback */}
            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex items-start gap-2 rounded-xl px-3.5 py-2.5 border ${
                    feedback.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-destructive/10 border-destructive/30 text-destructive'
                  }`}
                >
                  {feedback.type === 'success' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  )}
                  <p className="text-xs">{feedback.message}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Add / Remove Money */}
            <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/[0.06] to-transparent p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-primary" />
                  <p className="font-mono text-xs uppercase tracking-widest text-foreground">Balance</p>
                </div>
                <div className="flex bg-black/30 rounded-lg p-0.5 gap-0.5">
                  <button
                    onClick={() => setMoneyMode('credit')}
                    className={`px-3 py-1 rounded-md font-mono text-[10px] uppercase tracking-wider transition-colors ${
                      moneyMode === 'credit' ? 'bg-emerald-500 text-white' : 'text-muted-foreground'
                    }`}
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setMoneyMode('debit')}
                    className={`px-3 py-1 rounded-md font-mono text-[10px] uppercase tracking-wider transition-colors ${
                      moneyMode === 'debit' ? 'bg-red-500 text-white' : 'text-muted-foreground'
                    }`}
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={moneyAmount}
                  onChange={(e) => setMoneyAmount(e.target.value)}
                  placeholder="Amount (₹)"
                  className="flex-1 bg-black/30 border border-primary/20 rounded-lg px-3 py-2.5 font-mono text-sm text-foreground focus:outline-none focus:border-primary/60"
                />
                <button
                  onClick={handleMoneyAction}
                  disabled={busy === 'money' || !moneyAmount}
                  className={`px-4 rounded-lg font-mono text-xs font-semibold uppercase tracking-wider disabled:opacity-40 transition-opacity flex items-center gap-1.5 ${
                    moneyMode === 'credit'
                      ? 'bg-emerald-500 text-white hover:opacity-90'
                      : 'bg-red-500 text-white hover:opacity-90'
                  }`}
                  style={{
                    boxShadow:
                      moneyMode === 'credit'
                        ? '0 0 20px rgba(16, 185, 129, 0.25)'
                        : '0 0 20px rgba(239, 68, 68, 0.25)',
                  }}
                >
                  {busy === 'money' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : moneyMode === 'credit' ? (
                    <Zap className="w-3.5 h-3.5" />
                  ) : (
                    <MinusCircle className="w-3.5 h-3.5" />
                  )}
                  {moneyMode === 'credit' ? 'Credit' : 'Debit'}
                </button>
              </div>
            </div>

            {/* Adjust P/L */}
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <p className="font-mono text-xs uppercase tracking-widest text-foreground">
                  Manual P/L Adjustment
                </p>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Directly adjusts total P/L. Use a negative number to subtract.
              </p>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={plAmount}
                  onChange={(e) => setPlAmount(e.target.value)}
                  placeholder="Amount (± ₹)"
                  className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 font-mono text-sm text-foreground focus:outline-none focus:border-white/30"
                />
                <button
                  onClick={handleAdjustPL}
                  disabled={busy === 'pl' || !plAmount}
                  className="px-4 rounded-lg bg-secondary text-foreground font-mono text-xs font-semibold uppercase tracking-wider disabled:opacity-40 hover:bg-secondary/70 transition-colors flex items-center gap-1.5"
                >
                  {busy === 'pl' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  Apply
                </button>
              </div>
            </div>

            {/* Assign Title */}
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-muted-foreground" />
                <p className="font-mono text-xs uppercase tracking-widest text-foreground">Assign Title</p>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Shown as a badge on their profile. Leave blank and apply to remove it.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="e.g. VIP Trader, Verified"
                  className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-white/30"
                />
                <button
                  onClick={handleSetTitle}
                  disabled={busy === 'title'}
                  className="px-4 rounded-lg bg-secondary text-foreground font-mono text-xs font-semibold uppercase tracking-wider disabled:opacity-40 hover:bg-secondary/70 transition-colors flex items-center gap-1.5"
                >
                  {busy === 'title' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  Apply
                </button>
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground text-center font-mono">
              UID: {user.uid.slice(0, 12)}… · {user.email}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
