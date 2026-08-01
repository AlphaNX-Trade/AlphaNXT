import { useState } from 'react';
import { useLocation } from 'wouter';
import { ChevronLeft, ChevronDown } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: 'What is AlphaNXT?',
    answer:
      'AlphaNXT is a paper trading and trading education app. You trade with virtual money — ₹1,00,000 to start — to practice and learn without any real financial risk. It is not a real-money trading platform.',
  },
  {
    question: 'Is my money real?',
    answer:
      'No. All balances, trades, and profit/loss in this app are simulated with virtual currency. Nothing here involves real money or a real brokerage account.',
  },
  {
    question: 'How does the AI Trading Coach work?',
    answer:
      'After you close a trade (sell a position), the coach analyzes your entry, exit, risk plan (if you set one), and holding time using rule-based logic — not guesswork. It highlights specific things like missing stop losses or poor reward-to-risk ratios, and links to relevant lessons. It never promises future profits.',
  },
  {
    question: 'What is the Risk Plan on the Trade screen?',
    answer:
      "It's an optional Stop Loss / Take Profit you set for your own reference when opening a position. It is not an automatically executed order — the app won't close your trade for you. It exists so the AI Coach can evaluate how your plan compared to what actually happened.",
  },
  {
    question: 'Why is live market data sometimes unavailable?',
    answer:
      'Live price data depends on external data sources that can be unreliable or rate-limited. When live data is unavailable, the app automatically falls back to static reference prices so nothing breaks — you can still practice placing trades.',
  },
  {
    question: 'How is Risk Score calculated?',
    answer:
      "It's a 0-100 heuristic based on your typical position size relative to your portfolio and whether you tend to set stop losses. It's meant as a rough behavioral signal, not a precise or industry-standard risk metric.",
  },
  {
    question: 'How do I earn XP and badges?',
    answer:
      'Complete lessons and pass their quizzes (70% or higher) in the Learning Academy to earn XP. Badges are awarded automatically for milestones like finishing your first topic or completing an entire level.',
  },
  {
    question: 'How does the Leaderboard work?',
    answer:
      "It ranks users by total realized profit/loss. Only your display name, P/L, win rate, and XP are shared — never your balance, holdings, or personal details.",
  },
];

export default function HelpPage() {
  const [, setLocation] = useLocation();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col max-w-[480px] mx-auto pb-6">
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-background/95 backdrop-blur border-b border-border h-14 flex items-center justify-between px-4 z-40">
        <button
          onClick={() => setLocation('/profile')}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1"
          aria-label="Back to profile"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-semibold text-base text-foreground">Help</span>
        <div className="w-6" aria-hidden />
      </header>

      <main className="flex-1 overflow-y-auto px-4 pt-[72px] pb-4 space-y-2">
        {FAQS.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={i} className="bg-card border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center justify-between px-4 py-3.5 text-left"
              >
                <span className="text-sm font-medium text-foreground pr-3">{faq.question}</span>
                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {isOpen && (
                <p className="px-4 pb-4 text-xs text-muted-foreground leading-relaxed">{faq.answer}</p>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
}
