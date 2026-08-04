import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Loader2, CheckCircle2, AlertCircle, Cpu } from 'lucide-react';
import { addAdminStock } from '@/lib/adminStocksService';
import { useAuth } from '@/contexts/AuthContext';
import type { AssetType } from '@/data/marketData';

const SECTORS = [
  'Banking',
  'Information Technology',
  'Energy',
  'Automobile',
  'Infrastructure',
  'Pharma',
  'FMCG',
  'Telecom',
  'Metals',
  'Financial Services',
  'Consumer Goods',
  'Index',
];

export function AddStockForm() {
  const { user } = useAuth();
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [sector, setSector] = useState(SECTORS[0]);
  const [type, setType] = useState<AssetType>('stock');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async () => {
    if (!user?.email) return;
    setBusy(true);
    setFeedback(null);
    try {
      const priceNum = parseFloat(price);
      await addAdminStock(user.email, {
        symbol: symbol.trim().toUpperCase(),
        name: name.trim(),
        price: priceNum,
        change: 0,
        changePercent: 0,
        dayHigh: priceNum,
        dayLow: priceNum,
        open: priceNum,
        prevClose: priceNum,
        volume: '0',
        marketCap: '—',
        sector,
        type,
      });
      setFeedback({ type: 'success', message: `${symbol.toUpperCase()} added and live in the simulation.` });
      setSymbol('');
      setName('');
      setPrice('');
    } catch (err) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Failed to add stock.' });
    } finally {
      setBusy(false);
    }
  };

  const canSubmit = symbol.trim() && name.trim() && parseFloat(price) > 0;

  return (
    <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/[0.06] to-transparent p-4 space-y-4 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center gap-2 relative z-10">
        <Cpu className="w-4 h-4 text-primary" />
        <p className="font-mono text-xs uppercase tracking-widest text-foreground">Deploy New Instrument</p>
      </div>

      <div className="grid grid-cols-2 gap-3 relative z-10">
        <div className="space-y-1.5">
          <label className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Symbol</label>
          <input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="ZOMATO"
            className="w-full bg-black/30 border border-primary/20 rounded-lg px-3 py-2.5 font-mono text-sm text-foreground focus:outline-none focus:border-primary/60"
          />
        </div>
        <div className="space-y-1.5">
          <label className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Price (₹)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="250.00"
            className="w-full bg-black/30 border border-primary/20 rounded-lg px-3 py-2.5 font-mono text-sm text-foreground focus:outline-none focus:border-primary/60"
          />
        </div>
      </div>

      <div className="space-y-1.5 relative z-10">
        <label className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Company Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Zomato Limited"
          className="w-full bg-black/30 border border-primary/20 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/60"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 relative z-10">
        <div className="space-y-1.5">
          <label className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Sector</label>
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="w-full bg-black/30 border border-primary/20 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/60"
          >
            {SECTORS.map((s) => (
              <option key={s} value={s} className="bg-[#0a0e18]">
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as AssetType)}
            className="w-full bg-black/30 border border-primary/20 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/60"
          >
            <option value="stock" className="bg-[#0a0e18]">Stock</option>
            <option value="index" className="bg-[#0a0e18]">Index</option>
          </select>
        </div>
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`flex items-start gap-2 rounded-lg px-3 py-2.5 border relative z-10 ${
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

      <button
        onClick={handleSubmit}
        disabled={!canSubmit || busy}
        className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-mono text-xs font-semibold uppercase tracking-widest disabled:opacity-40 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 relative z-10"
        style={{ boxShadow: canSubmit ? '0 0 24px rgba(0, 224, 255, 0.3)' : undefined }}
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
        Deploy to Market
      </button>
    </div>
  );
}
