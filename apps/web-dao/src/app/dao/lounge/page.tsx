'use client';

import React from 'react';
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
  const capProgressPct     = lounge?.capProgressPct        ?? 0;
  const pushedUsd          = lounge?.pushedUsd             ?? 0;
  const earningsCapUsd     = lounge?.earningsCapUsd        ?? 0;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn w-full max-w-full overflow-x-hidden">
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
              walletAddress={activeAddress ?? undefined}
            />
            <EarningsCapCard
              variant="desktop"
              capProgressPct={capProgressPct}
              pushedUsd={pushedUsd}
              earningsCapUsd={earningsCapUsd}
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
        />
        <ClaimableDividendsCard
          initialAmount={claimableDividends}
          walletAddress={wallet.hexAddress ?? undefined}
        />
        <IncomeChannelsCard loungeData={lounge} />
      </div>
    </div>
  );
}
