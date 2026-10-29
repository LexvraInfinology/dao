'use client';

import React, { useState, useEffect } from 'react';
import SettingsHero from '@/components/dao/settings/SettingsHero';
import SettingsTabs, { SettingsTabType } from '@/components/dao/settings/SettingsTabs';
import AccountInformationCard from '@/components/dao/settings/AccountInformationCard';
import AccountIdentityCard from '@/components/dao/settings/AccountIdentityCard';

// Security tab components
import WalletSecurityCard from '@/components/dao/settings/security/WalletSecurityCard';
import ActiveSessionsCard from '@/components/dao/settings/security/ActiveSessionsCard';
import SecurityActivityCard from '@/components/dao/settings/security/SecurityActivityCard';
import SecurityMattersCard from '@/components/dao/settings/security/SecurityMattersCard';

// Notification tab components
import NotificationSettingsCard from '@/components/dao/settings/notifications/NotificationSettingsCard';
import StayInformedCard from '@/components/dao/settings/notifications/StayInformedCard';

// Wallet tab components
import ConnectedWalletCard from '@/components/dao/settings/wallet/ConnectedWalletCard';
import WalletInformationCard from '@/components/dao/settings/wallet/WalletInformationCard';
import WalletAccessCard from '@/components/dao/settings/wallet/WalletAccessCard';

// Privacy components removed — on-chain transparency standard
import { UnderfundedAlertBanner } from '@/components/dao/UnderfundedAlertBanner';

const VALID_TABS: SettingsTabType[] = ['account', 'security', 'notifications', 'wallet'];

export default function DaoSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTabType>('account');

  // Deep-link sync: read ?tab= on mount & listen to popstate
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const readUrlTab = () => {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as SettingsTabType | null;
      if (tabParam && VALID_TABS.includes(tabParam)) {
        setActiveTab(tabParam);
      }
    };

    readUrlTab();
    window.addEventListener('popstate', readUrlTab);
    return () => window.removeEventListener('popstate', readUrlTab);
  }, []);

  const handleTabChange = (tab: SettingsTabType) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.replaceState(null, '', url.pathname + url.search);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn font-sans pb-28 sm:pb-28 md:pb-16 max-w-5xl mx-auto w-full">
      <UnderfundedAlertBanner />
      {/* 1. Hero Banner */}
      <SettingsHero />

      {/* 2. Tabs Navigation */}
      <SettingsTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {/* 3. Tab Content */}
      {/* ================= TAB 1: ACCOUNT ================= */}
      {activeTab === 'account' && (
        <div className="animate-fadeIn max-w-4xl mx-auto space-y-5">
          {/* Desktop Layout */}
          <div className="hidden lg:grid grid-cols-12 gap-5 items-start">
            <div className="col-span-5 space-y-5">
              <AccountIdentityCard />
            </div>
            <div className="col-span-7 space-y-5">
              <AccountInformationCard />
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden space-y-4">
            <AccountIdentityCard />
            <AccountInformationCard />
          </div>
        </div>
      )}

      {/* ================= TAB 2: SECURITY ================= */}
      {activeTab === 'security' && (
        <div className="animate-fadeIn max-w-4xl mx-auto">
          {/* Desktop Layout */}
          <div className="hidden lg:grid grid-cols-12 gap-5 items-start">
            <div className="col-span-7 space-y-5">
              <WalletSecurityCard />
              <ActiveSessionsCard />
              <SecurityActivityCard />
            </div>
            <div className="col-span-5 space-y-5">
              <SecurityMattersCard />
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden space-y-4">
            <WalletSecurityCard />
            <ActiveSessionsCard />
            <SecurityActivityCard />
            <SecurityMattersCard />
          </div>
        </div>
      )}

      {/* ================= TAB 3: NOTIFICATIONS ================= */}
      {activeTab === 'notifications' && (
        <div className="animate-fadeIn max-w-4xl mx-auto">
          {/* Desktop Layout */}
          <div className="hidden lg:grid grid-cols-12 gap-5 items-start">
            <div className="col-span-7">
              <NotificationSettingsCard />
            </div>
            <div className="col-span-5">
              <StayInformedCard />
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden space-y-4">
            <NotificationSettingsCard />
            <StayInformedCard />
          </div>
        </div>
      )}

      {/* ================= TAB 4: WALLET ================= */}
      {activeTab === 'wallet' && (
        <div className="animate-fadeIn max-w-4xl mx-auto space-y-5">
          {/* Desktop Layout */}
          <div className="hidden lg:grid grid-cols-12 gap-5 items-start">
            <div className="col-span-7 space-y-5">
              <ConnectedWalletCard />
              <WalletInformationCard />
            </div>
            <div className="col-span-5 space-y-5">
              <WalletAccessCard />
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden space-y-4">
            <ConnectedWalletCard />
            <WalletInformationCard />
            <WalletAccessCard />
          </div>
        </div>
      )}
    </div>
  );
}
