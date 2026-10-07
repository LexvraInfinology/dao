'use client';

import React, { useState } from 'react';
import SettingsHero from '@/components/dao/settings/SettingsHero';
import SettingsTabs, { SettingsTabType } from '@/components/dao/settings/SettingsTabs';
import AccountInformationCard from '@/components/dao/settings/AccountInformationCard';

// Security tab components
import WalletSecurityCard from '@/components/dao/settings/security/WalletSecurityCard';
import ActiveSessionsCard from '@/components/dao/settings/security/ActiveSessionsCard';
import TwoFactorCard from '@/components/dao/settings/security/TwoFactorCard';
import SecurityActivityCard from '@/components/dao/settings/security/SecurityActivityCard';
import SecurityMattersCard from '@/components/dao/settings/security/SecurityMattersCard';

// Notification tab components
import NotificationSettingsCard from '@/components/dao/settings/notifications/NotificationSettingsCard';
import StayInformedCard from '@/components/dao/settings/notifications/StayInformedCard';

// Wallet tab components
import ConnectedWalletCard from '@/components/dao/settings/wallet/ConnectedWalletCard';
import WalletInformationCard from '@/components/dao/settings/wallet/WalletInformationCard';
import WalletAccessCard from '@/components/dao/settings/wallet/WalletAccessCard';

// Privacy tab components
import ProfileVisibilityCard from '@/components/dao/settings/privacy/ProfileVisibilityCard';
import DaoActivityPrivacyCard from '@/components/dao/settings/privacy/DaoActivityPrivacyCard';
import DataPrivacyCard from '@/components/dao/settings/privacy/DataPrivacyCard';
import { UnderfundedAlertBanner } from '@/components/dao/UnderfundedAlertBanner';

export default function DaoSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTabType>('account');

  return (
    <div className="space-y-5 sm:space-y-6 animate-fadeIn font-sans pb-12 max-w-5xl mx-auto w-full">
      <UnderfundedAlertBanner />
      {/* 1. Hero Banner */}
      <SettingsHero />

      {/* 2. Tabs Navigation */}
      <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 3. Tab Content */}
      {/* ================= TAB 1: ACCOUNT ================= */}
      {activeTab === 'account' && (
        <div className="animate-fadeIn space-y-5 max-w-4xl mx-auto">
          <AccountInformationCard />
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
              <TwoFactorCard />
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
            <TwoFactorCard />
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

      {/* ================= TAB 5: PRIVACY ================= */}
      {activeTab === 'privacy' && (
        <div className="animate-fadeIn max-w-4xl mx-auto space-y-5">
          <ProfileVisibilityCard />
          <DaoActivityPrivacyCard />
          <DataPrivacyCard />
        </div>
      )}
    </div>
  );
}
