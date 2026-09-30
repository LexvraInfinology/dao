'use client';

import React from 'react';
import { User, ShieldCheck, Bell, Wallet, Shield } from 'lucide-react';

export type SettingsTabType = 'account' | 'security' | 'notifications' | 'wallet' | 'privacy';

interface SettingsTabsProps {
  activeTab: SettingsTabType;
  onTabChange: (tab: SettingsTabType) => void;
}

export default function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
  const desktopTabs: { id: SettingsTabType; label: string; icon: React.ReactNode }[] = [
    { id: 'account', label: 'Account', icon: <User className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'wallet', label: 'Wallet', icon: <Wallet className="w-4 h-4" /> },
    { id: 'privacy', label: 'Privacy', icon: <Shield className="w-4 h-4" /> },
  ];

  const mobileTabs: { id: SettingsTabType; label: string }[] = [
    { id: 'account', label: 'Account' },
    { id: 'security', label: 'Security' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'wallet', label: 'Wallet' },
    { id: 'privacy', label: 'Privacy' },
  ];

  const activeMobileTabRef = React.useRef<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    if (activeMobileTabRef.current) {
      activeMobileTabRef.current.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
    }
  }, [activeTab]);

  return (
    <>
      {/* ================= DESKTOP TABS (lg:flex) ================= */}
      <div className="hidden lg:flex items-center gap-5 xl:gap-8 border-b border-[#E2EEF9] px-1 font-sans">
        {desktopTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 pb-2.5 -mb-[1px] text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'text-[#0E62E4] border-b-2 border-[#0E62E4]'
                  : 'text-[#4F6D87] hover:text-[#14304A]'
              }`}
            >
              <span className={isActive ? 'text-[#0E62E4]' : 'text-[#60A5FA]'}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= MOBILE TABS (lg:hidden) ================= */}
      <div className="lg:hidden flex items-center gap-5 overflow-x-auto no-scrollbar border-b border-[#E2EEF9] px-1 font-sans">
        {mobileTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              ref={isActive ? activeMobileTabRef : null}
              onClick={() => onTabChange(tab.id)}
              className={`pb-2 -mb-[1px] text-xs font-semibold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                isActive
                  ? 'text-[#0E62E4] border-b-2 border-[#0E62E4] font-bold'
                  : 'text-[#4F6D87] hover:text-[#14304A]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </>
  );
}
