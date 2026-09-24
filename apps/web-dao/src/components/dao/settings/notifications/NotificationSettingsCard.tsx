'use client';

import React, { useState } from 'react';
import {
  Mail,
  Landmark,
  Award,
  ExternalLink,
  BarChart2,
  ShieldCheck,
  Megaphone,
  ArrowLeftRight,
  Crown,
} from 'lucide-react';

export default function NotificationSettingsCard() {
  // Desktop settings state (all default ON per Desktop Figma)
  const [desktopToggles, setDesktopToggles] = useState<Record<string, boolean>>({
    daoActivity: true,
    governance: true,
    councilSeat: true,
    matrixBridge: true,
    protocolUpdates: true,
    securityAlerts: true,
    marketingEvents: true,
  });

  // Mobile settings state (matching Mobile Figma screenshot: Matrix Bridge & Marketing OFF)
  const [mobileToggles, setMobileToggles] = useState<Record<string, boolean>>({
    governance: true,
    matrixBridge: false,
    protocolUpdates: true,
    securityAlerts: true,
    daoActivity: true,
    councilSeat: true,
    marketingEvents: false,
  });

  const toggleDesktop = (key: string) => {
    setDesktopToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleMobile = (key: string) => {
    setMobileToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const desktopItems = [
    {
      key: 'daoActivity',
      icon: <Mail className="w-5 h-5 text-[#155EEF]" />,
      title: 'DAO Activity',
      subtitle: 'Seat distributions, treasury updates and important DAO activit',
    },
    {
      key: 'governance',
      icon: <Landmark className="w-5 h-5 text-[#155EEF]" />,
      title: 'Governance',
      subtitle: 'New proposals, voting updates and governance decisions.',
    },
    {
      key: 'councilSeat',
      icon: <Award className="w-5 h-5 text-[#155EEF]" />,
      title: 'Council Seat',
      subtitle: 'Updates related to your council seat and seat activity.',
    },
    {
      key: 'matrixBridge',
      icon: <ExternalLink className="w-5 h-5 text-[#155EEF]" />,
      title: 'Matrix Bridge',
      subtitle: "Updates about the DAO's connection with the retail ecosysten",
    },
    {
      key: 'protocolUpdates',
      icon: <BarChart2 className="w-5 h-5 text-[#155EEF]" />,
      title: 'Protocol Updates',
      subtitle: 'New features, platform announcements and improvements.',
    },
    {
      key: 'securityAlerts',
      icon: <ShieldCheck className="w-5 h-5 text-[#155EEF]" />,
      title: 'Security Alerts',
      subtitle: 'Login attempts, wallet changes and security notifications.',
    },
    {
      key: 'marketingEvents',
      icon: <Megaphone className="w-5 h-5 text-[#155EEF]" />,
      title: 'Marketing & Events',
      subtitle: 'Product updates, events and community announcements.',
    },
  ];

  const mobileItems = [
    {
      key: 'governance',
      icon: <Landmark className="w-4 h-4 text-[#155EEF]" />,
      title: 'Governance',
      subtitle: 'New proposals, voting updates & quorum alerts.',
    },
    {
      key: 'matrixBridge',
      icon: <ArrowLeftRight className="w-4 h-4 text-[#155EEF]" />,
      title: 'Matrix Bridge',
      subtitle: 'Updates on matrix progress & cross-ecosystem routing.',
    },
    {
      key: 'protocolUpdates',
      icon: <BarChart2 className="w-4 h-4 text-[#155EEF]" />,
      title: 'Protocol Updates',
      subtitle: 'New features, platform announcements & releases.',
    },
    {
      key: 'securityAlerts',
      icon: <ShieldCheck className="w-4 h-4 text-[#155EEF]" />,
      title: 'Security Alerts',
      subtitle: 'Login attempts, contract approvals & security alerts.',
    },
    {
      key: 'daoActivity',
      icon: <Mail className="w-4 h-4 text-[#155EEF]" />,
      title: 'DAO Activity',
      subtitle: 'Seat distributions, treasury updates & activity.',
    },
    {
      key: 'councilSeat',
      icon: <Crown className="w-4 h-4 text-[#155EEF]" />,
      title: 'Council Seat',
      subtitle: 'Updates related to your council seat and status.',
    },
    {
      key: 'marketingEvents',
      icon: <Megaphone className="w-4 h-4 text-[#155EEF]" />,
      title: 'Marketing & Events',
      subtitle: 'Community AMAs, global summits & live events.',
    },
  ];

  return (
    <>
      {/* ================= DESKTOP NOTIFICATION SETTINGS (lg:block) ================= */}
      <div className="hidden lg:block rounded-3xl bg-white border border-[#E2ECF9] p-7 shadow-[0_4px_25px_rgba(21,94,239,0.03)] font-jakarta space-y-4">
        {/* Header */}
        <div>
          <h3 className="text-lg font-bold text-[#071A4A]">
            Notification Settings
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Choose what updates you want to receive.
          </p>
        </div>

        {/* 7 Toggle Rows */}
        <div className="space-y-3 pt-1">
          {desktopItems.map((item) => {
            const isChecked = desktopToggles[item.key] ?? false;
            return (
              <div
                key={item.key}
                className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl px-5 py-4 flex items-center justify-between transition-colors hover:border-[#E2ECF9]"
              >
                {/* Left Info */}
                <div className="flex items-center gap-3.5 min-w-0 pr-4">
                  <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-[#071A4A]">
                      {item.title}
                    </h4>
                    <p className="text-xs text-[#64748B] mt-0.5 truncate">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                {/* Right Switch */}
                <button
                  type="button"
                  onClick={() => toggleDesktop(item.key)}
                  className={`w-11 h-6 rounded-full relative p-0.5 transition-colors shrink-0 cursor-pointer ${
                    isChecked ? 'bg-[#155EEF]' : 'bg-[#CBD5E1]'
                  }`}
                  aria-label={`Toggle ${item.title}`}
                >
                  <span
                    className={`block w-5 h-5 bg-white rounded-full shadow-xs transform transition-transform ${
                      isChecked ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= MOBILE NOTIFICATION SETTINGS (lg:hidden) ================= */}
      <div className="lg:hidden rounded-2xl bg-white border border-[#E2ECF9] p-5 shadow-xs font-jakarta space-y-4">
        {/* Header */}
        <div>
          <h3 className="text-base font-bold text-[#071A4A]">
            Notification Settings
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Choose what updates you want to receive.
          </p>
        </div>

        {/* 7 Toggle Rows */}
        <div className="space-y-2.5 pt-1">
          {mobileItems.map((item) => {
            const isChecked = mobileToggles[item.key] ?? false;
            return (
              <div
                key={item.key}
                className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-3 flex items-center justify-between"
              >
                {/* Left Info */}
                <div className="flex items-center gap-3 min-w-0 pr-3">
                  <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[#071A4A]">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-[#64748B] mt-0.5 truncate">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                {/* Right Switch */}
                <button
                  type="button"
                  onClick={() => toggleMobile(item.key)}
                  className={`w-11 h-6 rounded-full relative p-0.5 transition-colors shrink-0 cursor-pointer ${
                    isChecked ? 'bg-[#155EEF]' : 'bg-[#CBD5E1]'
                  }`}
                  aria-label={`Toggle ${item.title}`}
                >
                  <span
                    className={`block w-5 h-5 bg-white rounded-full shadow-xs transform transition-transform ${
                      isChecked ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
