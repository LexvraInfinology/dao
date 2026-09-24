'use client';

import React, { useState } from 'react';
import { TreasuryHero } from '@/components/dao/treasury/TreasuryHero';
import { TreasuryBalanceCard } from '@/components/dao/treasury/TreasuryBalanceCard';
import { TreasuryWithdrawCard } from '@/components/dao/treasury/TreasuryWithdrawCard';

export default function DaoTreasuryPage() {
  const [balance, setBalance] = useState<number>(420.50);

  const handleWithdrawSuccess = (amount: number) => {
    setBalance((prev) => Math.max(0, parseFloat((prev - amount).toFixed(2))));
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn w-full max-w-full overflow-x-hidden">
      {/* 1. Hero Section (Responsive: Desktop with micro-tags & crystal vs Mobile compact) */}
      <TreasuryHero />

      {/* =========================================================================
          2. DESKTOP VIEW (Visible on lg and above - exactly matching Desktop - 17)
             Order: Treasury Balance Card -> Withdraw Card
         ========================================================================= */}
      <div className="hidden lg:block space-y-6 sm:space-y-8">
        {/* Treasury Balance Card */}
        <TreasuryBalanceCard balance={balance} />

        {/* Withdraw Card (2-column layout) */}
        <TreasuryWithdrawCard
          availableBalance={balance}
          onWithdrawSuccess={handleWithdrawSuccess}
          variant="desktop"
        />
      </div>

      {/* =========================================================================
          3. MOBILE VIEW (Visible below lg - exactly matching Treasury Mobile)
             Order: Withdraw Card -> Treasury Balance Card
         ========================================================================= */}
      <div className="lg:hidden space-y-4 sm:space-y-5">
        {/* Withdraw Card (Compact stacked layout) */}
        <TreasuryWithdrawCard
          availableBalance={balance}
          onWithdrawSuccess={handleWithdrawSuccess}
          variant="mobile"
        />

        {/* Treasury Balance Card (Compact stacked footer) */}
        <TreasuryBalanceCard balance={balance} />
      </div>
    </div>
  );
}
