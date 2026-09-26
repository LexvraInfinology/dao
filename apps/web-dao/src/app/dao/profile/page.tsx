'use client';

import React from 'react';
import { ProfileHero } from '@/components/dao/profile/ProfileHero';
import { ProfileMemberCard } from '@/components/dao/profile/ProfileMemberCard';
import { ProfileMetricsGrid } from '@/components/dao/profile/ProfileMetricsGrid';
import { ProfileDaoDetails } from '@/components/dao/profile/ProfileDaoDetails';
import { ProfileRecentActivity } from '@/components/dao/profile/ProfileRecentActivity';
import { useWallet } from '@/context/WalletContext';
import { useDaoProfile, useTransactions } from '@/hooks/useApi';

export default function DaoProfilePage() {
  const wallet = useWallet();

  // Full profile from /api/dao/profile/:address
  const { data: profile, loading: profileLoading } =
    useDaoProfile(wallet.hexAddress);

  // Recent transactions for the activity stream
  const { data: txData } =
    useTransactions(wallet.hexAddress, 1, 5);

  const recentTxs = txData?.transactions ?? [];

  return (
    <div className="space-y-5 sm:space-y-6 lg:space-y-8 animate-fadeIn w-full max-w-full overflow-x-hidden">
      <ProfileHero profile={profile} loading={profileLoading} />

      <ProfileMemberCard profile={profile} loading={profileLoading} />

      <ProfileMetricsGrid profile={profile} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
        <div className="lg:col-span-5">
          <ProfileDaoDetails profile={profile} />
        </div>
        <div className="lg:col-span-7">
          <ProfileRecentActivity transactions={recentTxs} loading={profileLoading} />
        </div>
      </div>
    </div>
  );
}
