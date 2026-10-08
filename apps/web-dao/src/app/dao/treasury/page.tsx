'use client';

import React, { useState } from 'react';
import { TreasuryHero } from '@/components/dao/treasury/TreasuryHero';
import { TreasuryBalanceCard } from '@/components/dao/treasury/TreasuryBalanceCard';
import { TreasuryWithdrawCard } from '@/components/dao/treasury/TreasuryWithdrawCard';
import { UnderfundedAlertBanner } from '@/components/dao/UnderfundedAlertBanner';
import { useWallet } from '@/context/WalletContext';
import { useLounge, useDaoProfile } from '@/hooks/useApi';
import { getActiveDaoAddress } from '@/utils/trobAddress';
import { calculateMemberEarnedUsd } from '@/utils/daoEconomics';

export default function DaoTreasuryPage() {
  const wallet = useWallet();
  const activeAddress = wallet.base58Address || wallet.hexAddress;

  const { data: profile } = useDaoProfile(activeAddress);
  const { data: lounge } = useLounge(activeAddress);

  // Exact on-chain earned/received payouts
  const totalReceivedUsd = profile?.totalEarnedUsd ?? lounge?.totalReceivedUsd ?? (lounge?.position ? calculateMemberEarnedUsd(lounge.position, lounge.status, 93) : 0);
  const totalReceivedTrob = profile?.totalEarnedBtt ?? lounge?.totalReceivedBtt ?? (totalReceivedUsd / 0.056);
  const fallbackBalance = lounge?.claimableDividendsUsd ?? 0;

  const [claimableBalance, setClaimableBalance] = useState<number>(fallbackBalance);

  // Sync when API data arrives
  React.useEffect(() => {
    if (lounge?.claimableDividendsUsd != null) {
      setClaimableBalance(lounge.claimableDividendsUsd);
    }
  }, [lounge?.claimableDividendsUsd]);

  const handleWithdrawSuccess = (amount: number) => {
    setClaimableBalance((prev) => Math.max(0, parseFloat((prev - amount).toFixed(2))));
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn w-full max-w-full overflow-x-hidden pb-12">
      <UnderfundedAlertBanner />
      <TreasuryHero
        balance={claimableBalance}
        totalReceivedUsd={totalReceivedUsd}
        totalReceivedTrob={totalReceivedTrob}
        loungeData={{ ...lounge, totalReceivedUsd } as any}
      />

      {/* Desktop */}
      <div className="hidden lg:block space-y-6 sm:space-y-8">
        <TreasuryBalanceCard
          balance={claimableBalance}
          totalReceivedUsd={totalReceivedUsd}
          totalReceivedTrob={totalReceivedTrob}
          earningsCapUsd={profile?.earningsCapUsd ?? 1500}
          remainingCapUsd={profile?.remainingCapUsd ?? Math.max(0, 1500 - totalReceivedUsd)}
          contractAddress={getActiveDaoAddress()}
        />
        <TreasuryWithdrawCard
          availableBalance={claimableBalance}
          onWithdrawSuccess={handleWithdrawSuccess}
          variant="desktop"
          walletAddress={activeAddress ?? undefined}
        />
      </div>

      {/* Mobile (Balance Card FIRST so user immediately sees their on-chain earnings) */}
      <div className="lg:hidden space-y-4 sm:space-y-5">
        <TreasuryBalanceCard
          balance={claimableBalance}
          totalReceivedUsd={totalReceivedUsd}
          totalReceivedTrob={totalReceivedTrob}
          earningsCapUsd={profile?.earningsCapUsd ?? 1500}
          remainingCapUsd={profile?.remainingCapUsd ?? Math.max(0, 1500 - totalReceivedUsd)}
          contractAddress={getActiveDaoAddress()}
        />
        <TreasuryWithdrawCard
          availableBalance={claimableBalance}
          onWithdrawSuccess={handleWithdrawSuccess}
          variant="mobile"
          walletAddress={activeAddress ?? undefined}
        />
      </div>
    </div>
  );
}
