'use client';

import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { LoungeHero } from '@/components/dao/lounge/LoungeHero';
import { LoungeStatCards } from '@/components/dao/lounge/LoungeStatCards';
import { LoungeCompactMemberCard } from '@/components/dao/lounge/LoungeCompactMemberCard';
import { SoulboundPassCard } from '@/components/dao/lounge/SoulboundPassCard';
import { ClaimableDividendsCard } from '@/components/dao/lounge/ClaimableDividendsCard';
import { EarningsCapCard } from '@/components/dao/lounge/EarningsCapCard';
import { IncomeChannelsCard } from '@/components/dao/lounge/IncomeChannelsCard';
import { useWallet } from '@/context/WalletContext';
import { useLounge } from '@/hooks/useApi';

export default function MemberLoungePage() {
  const wallet     = useWallet();
  const activeAddress = wallet.base58Address || wallet.hexAddress;
  const { data: lounge, loading } = useLounge(activeAddress);

  // Pass live values down as props where components accept them
  const claimableDividends = lounge?.claimableDividendsUsd ?? 0;
  const pushedUsd          = lounge?.pushedUsd             ?? 0;
  const earningsCapUsd     = (lounge?.earningsCapUsd && lounge.earningsCapUsd >= 300) ? lounge.earningsCapUsd : 1500;
  const capProgressPct     = earningsCapUsd > 0 ? Math.min(100, Math.max(0, (pushedUsd / earningsCapUsd) * 100)) : 0;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn w-full max-w-full overflow-x-hidden">
      {/* 5X Capping 48-Hour Alert Banner */}
      {lounge?.isCapped && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-rose-500/10 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm sm:text-base font-black text-[#071A4A] tracking-tight">
                  5X EARNINGS CAP REACHED — 48H RE-TOPUP WINDOW OPEN
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 uppercase">
                  Seat #{lounge?.position}
                </span>
              </div>
              <p className="text-xs text-[#4F6184] leading-relaxed">
                You have reached 5X ($1,500.00 USD) on your Genesis Council seat. Re-topup $300 USD in TROB within 48 hours to reset your cap and preserve continuous dividend payouts.
              </p>
            </div>
          </div>
        </div>
      )}

      <LoungeHero loungeData={lounge} loading={loading} />

      {/* Desktop view */}
      <div className="hidden lg:block space-y-6 sm:space-y-8">
        <LoungeStatCards loungeData={lounge} />

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          <div className="xl:col-span-7">
            <SoulboundPassCard loungeData={lounge} />
          </div>
          <div className="xl:col-span-5 space-y-6">
            <ClaimableDividendsCard
              initialAmount={claimableDividends}
              pushedAmountUsd={pushedUsd}
              pushedAmountTrob={lounge?.pushedBtt ?? (pushedUsd / (lounge?.bttPriceUsd || 0.056))}
              priceUsd={lounge?.bttPriceUsd || 0.056}
              walletAddress={activeAddress ?? undefined}
            />
            <EarningsCapCard
              variant="desktop"
              capProgressPct={capProgressPct}
              pushedUsd={pushedUsd}
              earningsCapUsd={earningsCapUsd}
              trobPriceUsd={lounge?.trobPriceUsd ?? lounge?.bttPriceUsd}
              isCapped={lounge?.isCapped}
              retopupDeadline={lounge?.retopupDeadline}
              retopupTimeRemainingSeconds={lounge?.retopupTimeRemainingSeconds}
              position={lounge?.position}
            />
          </div>
        </div>
      </div>

      {/* Mobile view */}
      <div className="lg:hidden space-y-4 sm:space-y-5">
        <LoungeCompactMemberCard loungeData={lounge} />
        <EarningsCapCard
          variant="mobile"
          capProgressPct={capProgressPct}
          pushedUsd={pushedUsd}
          earningsCapUsd={earningsCapUsd}
          trobPriceUsd={lounge?.trobPriceUsd ?? lounge?.bttPriceUsd}
          isCapped={lounge?.isCapped}
          retopupDeadline={lounge?.retopupDeadline}
          retopupTimeRemainingSeconds={lounge?.retopupTimeRemainingSeconds}
          position={lounge?.position}
        />
        <ClaimableDividendsCard
          initialAmount={claimableDividends}
          pushedAmountUsd={pushedUsd}
          pushedAmountTrob={lounge?.pushedBtt ?? (pushedUsd / (lounge?.bttPriceUsd || 0.056))}
          priceUsd={lounge?.bttPriceUsd || 0.056}
          walletAddress={activeAddress ?? undefined}
        />
        <IncomeChannelsCard loungeData={lounge} />
      </div>
    </div>
  );
}
