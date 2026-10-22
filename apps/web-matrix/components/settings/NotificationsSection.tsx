"use client";

import React, { useState } from "react";

export interface NotificationsSectionProps {
  notifications?: Record<string, boolean>;
  onToggleNotification?: (key: string) => void;
}

export function NotificationsSection({
  notifications: externalNotifications,
  onToggleNotification,
}: NotificationsSectionProps) {
  const [internalNotifications, setInternalNotifications] = useState<Record<string, boolean>>({
    matrixActivity: true,
    levelUpdates: true,
    referralJoined: true,
    cycleCompletion: true,
    earningsReward: true,
    leaderboardRank: true,
    announcements: true,
  });

  const notifications = externalNotifications ?? internalNotifications;

  const toggleNotification = (key: string) => {
    if (onToggleNotification) {
      onToggleNotification(key);
    } else {
      setInternalNotifications((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
    }
  };

  const notificationItems = [
    {
      id: "matrixActivity",
      title: "Matrix Activity",
      description: "Get notified when new nodes are added or activity happens in your matrix.",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <polyline points="3 7 12 13 21 7" />
        </svg>
      ),
    },
    {
      id: "levelUpdates",
      title: "Level Updates",
      description: "Receive notifications when you complete a level or unlock a new level.",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="21" x2="21" y2="21" />
          <line x1="4" y1="10" x2="20" y2="10" />
          <polyline points="12 3 20 10 4 10 12 3" />
          <line x1="6" y1="10" x2="6" y2="21" />
          <line x1="10" y1="10" x2="10" y2="21" />
          <line x1="14" y1="10" x2="14" y2="21" />
          <line x1="18" y1="10" x2="18" y2="21" />
        </svg>
      ),
    },
    {
      id: "referralJoined",
      title: "New Referral Joined",
      description: "Get notified when someone joins using your referral link.",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="6" />
          <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
        </svg>
      ),
    },
    {
      id: "cycleCompletion",
      title: "Cycle Completion",
      description: "Receive updates when a matrix cycle is completed.",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      ),
    },
    {
      id: "earningsReward",
      title: "Earnings / Reward Updates",
      description: "Get notified about your earnings, rewards, or credit updates.",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
    {
      id: "leaderboardRank",
      title: "Leaderboard Rank Updates",
      description: "Receive notifications when your rank changes on the leaderboard.",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      ),
    },
    {
      id: "announcements",
      title: "Product Announcements",
      description: "Stay updated with important updates, new features, and platform news.",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 11l18-5v12L3 13v-2z" />
          <path d="M11.6 16.8a3 3 0 11-5.8-1.6" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-4 lg:space-y-5 w-full">

      {/* ── MAIN CARD: NOTIFICATION SETTINGS ── */}
      <div className="bg-white rounded-[22px] border border-[#e8ecf1] p-4 sm:p-5 lg:p-7 shadow-xs w-full">
        <h2 className="text-[16px] lg:text-[17px] font-bold text-[#0f172a] leading-tight">
          Notification Settings
        </h2>
        <p className="text-[12px] lg:text-[13px] text-[#64748b] mt-1 mb-4 lg:mb-5">
          Choose what updates you want to receive.
        </p>

        {/* 7 Notification Items */}
        <div className="space-y-2.5 sm:space-y-3 lg:space-y-3.5">
          {notificationItems.map((item) => {
            const isEnabled = notifications[item.id] ?? true;
            return (
              <div
                key={item.id}
                className="bg-[#f8fafc] rounded-2xl p-3 sm:p-3.5 lg:py-4 lg:px-5 border border-[#f1f5f9] flex items-center justify-between gap-3 sm:gap-4 transition-all"
              >
                <div className="flex items-center gap-3 sm:gap-3.5 lg:gap-4 min-w-0">
                  <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-[14px] bg-white border border-[#e2e8f0] flex items-center justify-center text-[#2563eb] shadow-2xs flex-shrink-0">
                    {item.icon}
                  </div>

                  <div className="min-w-0 pr-1">
                    <h3 className="text-[13.5px] lg:text-[14px] font-bold text-[#0f172a] leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-[11.5px] sm:text-[12px] lg:text-[12.5px] text-[#64748b] mt-0.5 leading-snug line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={isEnabled}
                  onClick={() => toggleNotification(item.id)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out p-0.5 focus:outline-none ${
                    isEnabled ? "bg-[#2563eb]" : "bg-[#cbd5e1]"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      isEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── BOTTOM CARD: STAY INFORMED ── */}
      <div className="bg-white rounded-[22px] border border-[#e8ecf1] p-4 sm:p-5 relative overflow-hidden shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5 z-10">
          <div className="w-11 h-11 rounded-[16px] bg-[#dbe1ff] text-[#2563eb] flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
          </div>
          <div>
            <h3 className="text-[14.5px] sm:text-[15px] font-bold text-[#0f172a] leading-tight">
              Stay Informed
            </h3>
            <p className="text-[11.5px] sm:text-[12px] text-[#64748b] mt-1 leading-snug max-w-[420px]">
              Get real-time updates on your council seat, governance proposals, and important DAO activity.
            </p>
          </div>
        </div>

        {/* Decorative isometric wireframe */}
        <div className="hidden sm:block absolute right-3 -bottom-2 pointer-events-none opacity-85">
          <svg width="72" height="72" viewBox="0 0 60 60" fill="none" stroke="#bfdbfe" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M30 6 L52 18 L52 42 L30 54 L8 42 L8 18 Z" />
            <path d="M30 6 L30 30 L52 18" />
            <path d="M30 30 L8 18" />
            <path d="M30 30 L30 54" />
          </svg>
        </div>
      </div>

    </div>
  );
}
