'use client';

import React from 'react';
import { Wallet, Monitor, Shield, ArrowRight } from 'lucide-react';

export default function SecurityActivityCard() {
  const events = [
    {
      id: 1,
      title: 'Wallet Connected',
      subtitle: '0x8A3F...91F2',
      time: 'Aug 12, 2026, 10:24 AM',
      shortTime: 'Aug 12, 10:24 AM',
      badgeText: 'Success',
      badgeType: 'success',
      icon: <Wallet className="w-5 h-5 text-[#155EEF]" />,
      mobileIcon: <Wallet className="w-4 h-4 text-[#155EEF]" />,
    },
    {
      id: 2,
      title: 'Session Started',
      subtitle: 'Chrome • Windows',
      time: 'Aug 12, 2026, 10:24 AM',
      shortTime: 'Aug 12, 10:24 AM',
      badgeText: 'Success',
      badgeType: 'success',
      icon: <Monitor className="w-5 h-5 text-[#155EEF]" />,
      mobileIcon: <Monitor className="w-4 h-4 text-[#155EEF]" />,
    },
    {
      id: 3,
      title: '2FA Not Enabled',
      subtitle: 'Account security update',
      time: 'Aug 12, 2026, 10:20 AM',
      shortTime: 'Aug 12, 10:20 AM',
      badgeText: 'Info',
      badgeType: 'info',
      icon: <Shield className="w-5 h-5 text-[#155EEF]" />,
      mobileIcon: <Shield className="w-4 h-4 text-[#155EEF]" />,
    },
  ];

  return (
    <>
      {/* ================= DESKTOP VIEW (lg:block) ================= */}
      <div className="hidden lg:block rounded-3xl bg-white border border-[#E2ECF9] p-6 lg:p-7 shadow-[0_4px_25px_rgba(21,94,239,0.03)] font-jakarta space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#071A4A]">
              Security Activity
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Recent security events on your account.
            </p>
          </div>

          <button
            onClick={() => alert('View all security activity')}
            className="text-xs font-bold text-[#155EEF] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Event List */}
        <div className="space-y-3 pt-1">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-4 flex items-center justify-between transition-colors hover:border-[#E2ECF9]"
            >
              {/* Left Info */}
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center shrink-0">
                  {evt.icon}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#071A4A]">
                    {evt.title}
                  </h4>
                  <div className="text-xs font-mono text-[#64748B] mt-0.5">
                    {evt.subtitle}
                  </div>
                </div>
              </div>

              {/* Right Timestamp & Badge */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#64748B]">
                  {evt.time}
                </span>

                {evt.badgeType === 'success' ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0]/60 text-[#059669] text-xs font-semibold">
                    {evt.badgeText}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-[#EFF6FF] border border-[#DBEAFE] text-[#155EEF] text-xs font-semibold">
                    {evt.badgeText}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= MOBILE VIEW (lg:hidden) ================= */}
      <div className="lg:hidden rounded-2xl bg-white border border-[#E2ECF9] p-5 shadow-xs font-jakarta space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#071A4A]">
              Security Activity
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Recent security events on your account.
            </p>
          </div>

          <button
            onClick={() => alert('View all security activity')}
            className="text-xs font-bold text-[#155EEF] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Event List */}
        <div className="space-y-3 pt-1">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-3.5 flex items-center justify-between"
            >
              {/* Left Info */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] flex items-center justify-center shrink-0">
                  {evt.mobileIcon}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#071A4A]">
                    {evt.title}
                  </h4>
                  <div className="text-[11px] font-mono text-[#64748B] mt-0.5">
                    {evt.subtitle}
                  </div>
                </div>
              </div>

              {/* Right Timestamp & Badge stacked */}
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] text-[#64748B]">
                  {evt.shortTime}
                </span>

                {evt.badgeType === 'success' ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#ECFDF5] border border-[#A7F3D0]/60 text-[#059669] text-[10px] font-semibold">
                    {evt.badgeText}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#EFF6FF] border border-[#DBEAFE] text-[#155EEF] text-[10px] font-semibold">
                    {evt.badgeText}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
