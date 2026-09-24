'use client';

import React from 'react';
import { LoungeHero } from '@/components/dao/lounge/LoungeHero';
import { LoungeStatCards } from '@/components/dao/lounge/LoungeStatCards';
import { LoungeCompactMemberCard } from '@/components/dao/lounge/LoungeCompactMemberCard';
import { SoulboundPassCard } from '@/components/dao/lounge/SoulboundPassCard';
import { ClaimableDividendsCard } from '@/components/dao/lounge/ClaimableDividendsCard';
import { EarningsCapCard } from '@/components/dao/lounge/EarningsCapCard';
import { IncomeChannelsCard } from '@/components/dao/lounge/IncomeChannelsCard';

export default function MemberLoungePage() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn w-full max-w-full overflow-x-hidden">
      {/* 1. Hero Section (Responsive: Desktop with orbital rings & micro-tags vs Mobile compact) */}
      <LoungeHero />

      {/* =========================================================================
          2. DESKTOP VIEW (Visible on lg and above - exactly matching Desktop - 14)
         ========================================================================= */}
      <div className="hidden lg:block space-y-6 sm:space-y-8">
        {/* Four Stat Cards Row */}
        <LoungeStatCards />

        {/* Two-Column Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Left Column: Soulbound Pass Virtual Card + Metadata + Actions (7 cols on xl) */}
          <div className="xl:col-span-7">
            <SoulboundPassCard />
          </div>

          {/* Right Column: Claimable Dividends + 5X Earnings Cap (5 cols on xl) */}
          <div className="xl:col-span-5 space-y-6">
            <ClaimableDividendsCard />
            <EarningsCapCard variant="desktop" />
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. MOBILE VIEW (Visible below lg - exactly matching Member Lounge Mobile)
         ========================================================================= */}
      <div className="lg:hidden space-y-4 sm:space-y-5">
        {/* Compact Member Info Card */}
        <LoungeCompactMemberCard />

        {/* 5X Earnings Cap Card */}
        <EarningsCapCard variant="mobile" />

        {/* Claimable Dividends Card */}
        <ClaimableDividendsCard />

        {/* Income Channels Section */}
        <IncomeChannelsCard />
      </div>
    </div>
  );
}
