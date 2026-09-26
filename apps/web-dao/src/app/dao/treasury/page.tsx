'use client';

import React, { useState } from 'react';
import { TreasuryHero } from '@/components/dao/treasury/TreasuryHero';
import { TreasuryBalanceCard } from '@/components/dao/treasury/TreasuryBalanceCard';
import { TreasuryWithdrawCard } from '@/components/dao/treasury/TreasuryWithdrawCard';
import { useWallet } from '@/context/WalletContext';
import { useLounge } from '@/hooks/useApi';

export default function DaoTreasuryPage() {
  const wallet = useWallet();
  const activeAddress = wallet.base58Address || wallet.hexAddress;
  // Lounge endpoint has claimableDividendsUsd which is our available balance
  const { data: lounge } = useLounge(activeAddress);

  const initialBalance = lounge?.claimableDividendsUsd ?? 0;
  const [balance, setBalance] = useState<number>(initialBalance);

  // Sync when API data arrives
  React.useEffect(() => {
    if (lounge?.claimableDividendsUsd != null) {
      setBalance(lounge.claimableDividendsUsd);
    }
  }, [lounge?.claimableDividendsUsd]);

  const handleWithdrawSuccess = (amount: number) => {
    setBalance((prev) => Math.max(0, parseFloat((prev - amount).toFixed(2))));
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn w-full max-w-full overflow-x-hidden">
      <TreasuryHero balance={balance} loungeData={lounge} />

      {/* Desktop */}
      <div className="hidden lg:block space-y-6 sm:space-y-8">
        <TreasuryBalanceCard
          balance={balance}
          totalVaultAssets={lounge?.totalReceivedUsd}
          contractAddress={process.env.NEXT_PUBLIC_DAO_ADDRESS}
        />
        <TreasuryWithdrawCard
          availableBalance={balance}
          onWithdrawSuccess={handleWithdrawSuccess}
          variant="desktop"
          walletAddress={activeAddress ?? undefined}
        />
      </div>

      {/* Mobile */}
      <div className="lg:hidden space-y-4 sm:space-y-5">
        <TreasuryWithdrawCard
          availableBalance={balance}
          onWithdrawSuccess={handleWithdrawSuccess}
          variant="mobile"
          walletAddress={activeAddress ?? undefined}
        />
        <TreasuryBalanceCard
          balance={balance}
          totalVaultAssets={lounge?.totalReceivedUsd}
          contractAddress={process.env.NEXT_PUBLIC_DAO_ADDRESS}
        />
      </div>
    </div>
  );
}
