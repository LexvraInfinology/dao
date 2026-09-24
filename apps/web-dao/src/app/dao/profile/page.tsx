'use client';

import React from 'react';
import { ProfileHero } from '@/components/dao/profile/ProfileHero';
import { ProfileMemberCard } from '@/components/dao/profile/ProfileMemberCard';
import { ProfileMetricsGrid } from '@/components/dao/profile/ProfileMetricsGrid';
import { ProfileDaoDetails } from '@/components/dao/profile/ProfileDaoDetails';
import { ProfileRecentActivity } from '@/components/dao/profile/ProfileRecentActivity';

export default function DaoProfilePage() {
  return (
    <div className="space-y-5 sm:space-y-6 lg:space-y-8 animate-fadeIn w-full max-w-full overflow-x-hidden">
      {/* 1. Page Header Hero Banner (Desktop on lg and above vs Mobile compact below lg) */}
      <ProfileHero />

      {/* 2. Main Member & Council Seat Row Card */}
      <ProfileMemberCard />

      {/* 3. 4 Stat Cards: Institutional Metrics Grid (Desktop 4 cards vs Mobile 2x2 grid) */}
      <ProfileMetricsGrid />

      {/* 4. Two-Column Split (Desktop) / Stacked (Mobile): DAO Details & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
        {/* Left: DAO Details (5 cols on desktop matching Figma 327px width) */}
        <div className="lg:col-span-5">
          <ProfileDaoDetails />
        </div>

        {/* Right: Recent Activity Stream (7 cols on desktop matching Figma 463px width) */}
        <div className="lg:col-span-7">
          <ProfileRecentActivity />
        </div>
      </div>
    </div>
  );
}
