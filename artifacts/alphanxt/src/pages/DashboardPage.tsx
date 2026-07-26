import React from 'react';
import { Header } from '@/components/dashboard/Header';
import { PortfolioCard } from '@/components/dashboard/PortfolioCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { MarketOverview } from '@/components/dashboard/MarketOverview';
import { AIDailyTip } from '@/components/dashboard/AIDailyTip';
import { Watchlist } from '@/components/dashboard/Watchlist';
import { BottomNav } from '@/components/dashboard/BottomNav';

export default function DashboardPage() {
  return (
    <div className="min-h-[100dvh] bg-background flex flex-col max-w-[480px] mx-auto relative pb-24">
      <Header />
      <main className="flex-1 overflow-y-auto px-4 pt-20 pb-6 space-y-7">
        <PortfolioCard />
        <QuickActions />
        <MarketOverview />
        <AIDailyTip />
        <Watchlist />
      </main>
      <BottomNav />
    </div>
  );
}
