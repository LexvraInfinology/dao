'use client';

import React, { useState } from 'react';
import SettingsHero from '@/components/dao/settings/SettingsHero';
import SettingsTabs, { SettingsTabType } from '@/components/dao/settings/SettingsTabs';
import AccountInformationCard from '@/components/dao/settings/AccountInformationCard';
import AccountIdentityCard from '@/components/dao/settings/AccountIdentityCard';
import SettingsDangerZone from '@/components/dao/settings/SettingsDangerZone';

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
import WalletManagementCard from '@/components/dao/settings/wallet/WalletManagementCard';
import WalletAccessCard from '@/components/dao/settings/wallet/WalletAccessCard';

// Privacy tab components
import ProfileVisibilityCard from '@/components/dao/settings/privacy/ProfileVisibilityCard';
import DaoActivityPrivacyCard from '@/components/dao/settings/privacy/DaoActivityPrivacyCard';
import YourPrivacyCard from '@/components/dao/settings/privacy/YourPrivacyCard';
import DataPrivacyCard from '@/components/dao/settings/privacy/DataPrivacyCard';

export default function DaoSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTabType>('privacy');

  return (
    <div className="space-y-6 sm:space-y-7 animate-fadeIn font-jakarta pb-12">
      {/* 1. Hero Banner */}
      <SettingsHero />

      {/* 2. Tabs Navigation */}
      <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 3. Tab Content */}
      {/* ================= TAB 1: ACCOUNT ================= */}
      {activeTab === 'account' && (
        <div className="animate-fadeIn">
          {/* Desktop Layout (lg:block) */}
          <div className="hidden lg:block space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              {/* Left Column: Account Information Card (7 cols on xl) */}
              <div className="xl:col-span-7">
                <AccountInformationCard />
              </div>

              {/* Right Column: Member Identity Card (5 cols on xl) */}
              <div className="xl:col-span-5">
                <AccountIdentityCard />
              </div>
            </div>

            {/* Bottom Row: Full-width Danger Zone */}
            <SettingsDangerZone />
          </div>

          {/* Mobile Layout (lg:hidden) */}
          <div className="lg:hidden space-y-4">
            <AccountIdentityCard />
            <AccountInformationCard />
            <SettingsDangerZone />
          </div>
        </div>
      )}

      {/* ================= TAB 2: SECURITY ================= */}
      {activeTab === 'security' && (
        <div className="animate-fadeIn">
          {/* Desktop Layout (lg:block) */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              {/* Left Column: 4 stacked cards (7 cols on xl) */}
              <div className="xl:col-span-7 space-y-6">
                <WalletSecurityCard />
                <ActiveSessionsCard />
                <TwoFactorCard />
                <SecurityActivityCard />
              </div>

              {/* Right Column: Member Card + Security Matters Card (5 cols on xl) */}
              <div className="xl:col-span-5 space-y-6">
                <AccountIdentityCard className="h-auto py-8" />
                <SecurityMattersCard />
              </div>
            </div>
          </div>

          {/* Mobile Layout (lg:hidden) */}
          <div className="lg:hidden space-y-4">
            <AccountIdentityCard />
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
        <div className="animate-fadeIn">
          {/* Desktop Layout (lg:block) */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              {/* Left Column: Notification Settings Card (7 cols on xl) */}
              <div className="xl:col-span-7">
                <NotificationSettingsCard />
              </div>

              {/* Right Column: Member Card + Stay Informed Card (5 cols on xl) */}
              <div className="xl:col-span-5 space-y-6">
                <AccountIdentityCard className="h-auto py-8" />
                <StayInformedCard />
              </div>
            </div>
          </div>

          {/* Mobile Layout (lg:hidden) */}
          <div className="lg:hidden space-y-4">
            <AccountIdentityCard />
            <NotificationSettingsCard />
            <StayInformedCard />
          </div>
        </div>
      )}

      {/* ================= TAB 4: WALLET ================= */}
      {activeTab === 'wallet' && (
        <div className="animate-fadeIn">
          {/* Desktop Layout (lg:block) */}
          <div className="hidden lg:block space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              {/* Left Column: Connected Wallet + Wallet Information (7 cols on xl) */}
              <div className="xl:col-span-7 space-y-6">
                <ConnectedWalletCard />
                <WalletInformationCard />
              </div>

              {/* Right Column: Member Card + Wallet Access Card (5 cols on xl) */}
              <div className="xl:col-span-5 space-y-6">
                <AccountIdentityCard className="h-auto py-8" />
                <WalletAccessCard />
              </div>
            </div>

            {/* Bottom Row: Full-width Wallet Management Card */}
            <WalletManagementCard />
          </div>

          {/* Mobile Layout (lg:hidden) */}
          <div className="lg:hidden space-y-4">
            <AccountIdentityCard />
            <ConnectedWalletCard />
            <WalletInformationCard />
            <WalletAccessCard />
          </div>
        </div>
      )}

      {/* ================= TAB 5: PRIVACY ================= */}
      {activeTab === 'privacy' && (
        <div className="animate-fadeIn">
          {/* Desktop Layout (lg:block) */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              {/* Left Column: Profile Visibility + DAO Activity (7 cols on xl) */}
              <div className="xl:col-span-7 space-y-6">
                <ProfileVisibilityCard />
                <DaoActivityPrivacyCard />
              </div>

              {/* Right Column: Member Card + Your Privacy Card (5 cols on xl) */}
              <div className="xl:col-span-5 space-y-6">
                <AccountIdentityCard className="h-auto py-8" />
                <YourPrivacyCard />
              </div>
            </div>
          </div>

          {/* Mobile Layout (lg:hidden) */}
          <div className="lg:hidden space-y-4">
            <AccountIdentityCard />
            <ProfileVisibilityCard />
            <DaoActivityPrivacyCard />
            <DataPrivacyCard />
          </div>
        </div>
      )}
    </div>
  );
}
