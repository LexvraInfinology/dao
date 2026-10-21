"use client";

import React, { useState } from "react";

export interface PrivacySectionProps {}

export function PrivacySection({}: PrivacySectionProps = {}) {
  const [visibilitySettings, setVisibilitySettings] = useState({
    matrixProfile: "Public",
    earningsVisibility: "Public",
    referralLink: "Public",
  });

  const [privacyToggles, setPrivacyToggles] = useState({
    nodeActivity: true,
    levelUpdates: true,
    transactionActivity: false,
    usageAnalytics: true,
    productUpdates: true,
  });

  const cycleVisibility = (key: keyof typeof visibilitySettings) => {
    const options = ["Public", "Team Only", "Private"];
    const current = visibilitySettings[key];
    const nextIdx = (options.indexOf(current) + 1) % options.length;
    setVisibilitySettings((prev) => ({ ...prev, [key]: options[nextIdx] }));
  };

  const togglePrivacy = (key: keyof typeof privacyToggles) => {
    setPrivacyToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-4 lg:space-y-5 w-full">

      {/* ── CARD 1: PROFILE VISIBILITY ── */}
      <div className="bg-white rounded-[22px] border border-[#e8ecf1] p-4 sm:p-5 lg:p-7 shadow-xs w-full">
        <div className="flex items-start justify-between gap-3 mb-4 lg:mb-5">
          <div>
            <h2 className="text-[16px] lg:text-[17px] font-bold text-[#0f172a] leading-tight">
              Profile Visibility
            </h2>
            <p className="text-[12px] lg:text-[13px] text-[#64748b] mt-0.5">
              Control what other Matrix members can see about your identity, level status, and matrix activity.
            </p>
          </div>
          <div className="text-[#2563eb] flex-shrink-0 mt-0.5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 2h4a1 1 0 011 1v2H9V3a1 1 0 011-1z" />
              <rect x="4" y="5" width="16" height="15" rx="2" />
              <circle cx="12" cy="11" r="2.5" />
              <path d="M7.5 17a4.5 4.5 0 019 0" />
            </svg>
          </div>
        </div>

        {/* Rows with Dropdown selectors */}
        <div className="space-y-2.5 sm:space-y-3">
          {/* Matrix Profile */}
          <div className="bg-[#f8fafc] rounded-2xl p-3 sm:p-3.5 lg:py-4 lg:px-5 border border-[#f1f5f9] flex items-center justify-between gap-3 sm:gap-4 transition-all">
            <div className="flex items-center gap-3 sm:gap-3.5 lg:gap-4 min-w-0">
              <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-[14px] bg-white border border-[#e2e8f0] flex items-center justify-center text-[#2563eb] shadow-2xs flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M6 20v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
                </svg>
              </div>
              <div className="min-w-0 pr-1">
                <h3 className="text-[13.5px] lg:text-[14px] font-bold text-[#0f172a] leading-tight">
                  Matrix Profile
                </h3>
                <p className="text-[11.5px] sm:text-[12px] lg:text-[12.5px] text-[#64748b] mt-0.5 leading-snug line-clamp-2">
                  Allow your basic Matrix profile (name, level, and joined date) to be visible to others.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => cycleVisibility("matrixProfile")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#e2e8f0] text-[12.5px] font-bold text-[#0f172a] shadow-2xs hover:bg-[#f8fafc] transition-colors cursor-pointer flex-shrink-0"
            >
              <span>{visibilitySettings.matrixProfile || "Public"}</span>
              <svg width="12" height="12" viewBox="0 0 10 10" fill="none"><path d="M2.5 4L5 6.5 7.5 4" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>

          {/* Earnings Visibility */}
          <div className="bg-[#f8fafc] rounded-2xl p-3 sm:p-3.5 lg:py-4 lg:px-5 border border-[#f1f5f9] flex items-center justify-between gap-3 sm:gap-4 transition-all">
            <div className="flex items-center gap-3 sm:gap-3.5 lg:gap-4 min-w-0">
              <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-[14px] bg-white border border-[#e2e8f0] flex items-center justify-center text-[#2563eb] shadow-2xs flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
              <div className="min-w-0 pr-1">
                <h3 className="text-[13.5px] lg:text-[14px] font-bold text-[#0f172a] leading-tight">
                  Earnings Visibility
                </h3>
                <p className="text-[11.5px] sm:text-[12px] lg:text-[12.5px] text-[#64748b] mt-0.5 leading-snug line-clamp-2">
                  Show your total earned yields and reward metrics on your public Matrix profile.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => cycleVisibility("earningsVisibility")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#e2e8f0] text-[12.5px] font-bold text-[#0f172a] shadow-2xs hover:bg-[#f8fafc] transition-colors cursor-pointer flex-shrink-0"
            >
              <span>{visibilitySettings.earningsVisibility || "Public"}</span>
              <svg width="12" height="12" viewBox="0 0 10 10" fill="none"><path d="M2.5 4L5 6.5 7.5 4" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>

          {/* Referral Link Visibility */}
          <div className="bg-[#f8fafc] rounded-2xl p-3 sm:p-3.5 lg:py-4 lg:px-5 border border-[#f1f5f9] flex items-center justify-between gap-3 sm:gap-4 transition-all">
            <div className="flex items-center gap-3 sm:gap-3.5 lg:gap-4 min-w-0">
              <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-[14px] bg-white border border-[#e2e8f0] flex items-center justify-center text-[#2563eb] shadow-2xs flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87" />
                  <path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
              </div>
              <div className="min-w-0 pr-1">
                <h3 className="text-[13.5px] lg:text-[14px] font-bold text-[#0f172a] leading-tight">
                  Referral Link Visibility
                </h3>
                <p className="text-[11.5px] sm:text-[12px] lg:text-[12.5px] text-[#64748b] mt-0.5 leading-snug line-clamp-2">
                  Allow other members to discover and copy your direct network referral link.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => cycleVisibility("referralLink")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#e2e8f0] text-[12.5px] font-bold text-[#0f172a] shadow-2xs hover:bg-[#f8fafc] transition-colors cursor-pointer flex-shrink-0"
            >
              <span>{visibilitySettings.referralLink || "Public"}</span>
              <svg width="12" height="12" viewBox="0 0 10 10" fill="none"><path d="M2.5 4L5 6.5 7.5 4" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>
      </div>


      {/* ── CARD 2: ACTIVITY VISIBILITY ── */}
      <div className="bg-white rounded-[22px] border border-[#e8ecf1] p-4 sm:p-5 lg:p-7 shadow-xs w-full">
        <div className="flex items-start justify-between gap-3 mb-4 lg:mb-5">
          <div>
            <h2 className="text-[16px] lg:text-[17px] font-bold text-[#0f172a] leading-tight">
              Activity Visibility
            </h2>
            <p className="text-[12px] lg:text-[13px] text-[#64748b] mt-0.5">
              Control how your Matrix node activity, progression, and transactions are broadcasted.
            </p>
          </div>
          <div className="text-[#2563eb] flex-shrink-0 mt-0.5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
              <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.64 5.64l2.12 2.12M16.24 16.24l2.12 2.12M5.64 18.36l2.12-2.12M16.24 7.76l2.12-2.12" />
            </svg>
          </div>
        </div>

        {/* Rows with Toggles */}
        <div className="space-y-2.5 sm:space-y-3">
          {/* Matrix Node Activity */}
          <div className="bg-[#f8fafc] rounded-2xl p-3 sm:p-3.5 lg:py-4 lg:px-5 border border-[#f1f5f9] flex items-center justify-between gap-3 sm:gap-4 transition-all">
            <div className="flex items-center gap-3 sm:gap-3.5 lg:gap-4 min-w-0">
              <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-[14px] bg-white border border-[#e2e8f0] flex items-center justify-center text-[#2563eb] shadow-2xs flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <div className="min-w-0 pr-1">
                <h3 className="text-[13.5px] lg:text-[14px] font-bold text-[#0f172a] leading-tight">
                  Matrix Node Activity
                </h3>
                <p className="text-[11.5px] sm:text-[12px] lg:text-[12.5px] text-[#64748b] mt-0.5 leading-snug line-clamp-2">
                  Show your node placements, dynamic spills, and tree growth milestones.
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={privacyToggles.nodeActivity}
              onClick={() => togglePrivacy("nodeActivity")}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out p-0.5 focus:outline-none ${
                privacyToggles.nodeActivity ? "bg-[#2563eb]" : "bg-[#cbd5e1]"
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  privacyToggles.nodeActivity ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Level Updates */}
          <div className="bg-[#f8fafc] rounded-2xl p-3 sm:p-3.5 lg:py-4 lg:px-5 border border-[#f1f5f9] flex items-center justify-between gap-3 sm:gap-4 transition-all">
            <div className="flex items-center gap-3 sm:gap-3.5 lg:gap-4 min-w-0">
              <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-[14px] bg-white border border-[#e2e8f0] flex items-center justify-center text-[#2563eb] shadow-2xs flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9H4a2 2 0 01-2-2V5a2 2 0 012-2h2" />
                  <path d="M18 9h2a2 2 0 002-2V5a2 2 0 00-2-2h-2" />
                  <path d="M4 22h16" />
                  <path d="M10 14.66V17c0 .55-.45 1-1 1H7v4h10v-4h-2c-.55 0-1-.45-1-1v-2.34" />
                  <path d="M18 2H6v7a6 6 0 0012 0V2z" />
                </svg>
              </div>
              <div className="min-w-0 pr-1">
                <h3 className="text-[13.5px] lg:text-[14px] font-bold text-[#0f172a] leading-tight">
                  Level Updates
                </h3>
                <p className="text-[11.5px] sm:text-[12px] lg:text-[12.5px] text-[#64748b] mt-0.5 leading-snug line-clamp-2">
                  Broadcast announcements when you cycle, upgrade, or unlock new matrix tiers.
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={privacyToggles.levelUpdates}
              onClick={() => togglePrivacy("levelUpdates")}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out p-0.5 focus:outline-none ${
                privacyToggles.levelUpdates ? "bg-[#2563eb]" : "bg-[#cbd5e1]"
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  privacyToggles.levelUpdates ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Transaction Activity */}
          <div className="bg-[#f8fafc] rounded-2xl p-3 sm:p-3.5 lg:py-4 lg:px-5 border border-[#f1f5f9] flex items-center justify-between gap-3 sm:gap-4 transition-all">
            <div className="flex items-center gap-3 sm:gap-3.5 lg:gap-4 min-w-0">
              <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-[14px] bg-white border border-[#e2e8f0] flex items-center justify-center text-[#2563eb] shadow-2xs flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <div className="min-w-0 pr-1">
                <h3 className="text-[13.5px] lg:text-[14px] font-bold text-[#0f172a] leading-tight">
                  Transaction Activity
                </h3>
                <p className="text-[11.5px] sm:text-[12px] lg:text-[12.5px] text-[#64748b] mt-0.5 leading-snug line-clamp-2">
                  Show your cryptographic transaction history and claim timestamps on your feed.
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={privacyToggles.transactionActivity}
              onClick={() => togglePrivacy("transactionActivity")}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out p-0.5 focus:outline-none ${
                privacyToggles.transactionActivity ? "bg-[#2563eb]" : "bg-[#cbd5e1]"
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  privacyToggles.transactionActivity ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>


      {/* ── CARD 3: DATA & PERSONALIZATION ── */}
      <div className="bg-white rounded-[22px] border border-[#e8ecf1] p-4 sm:p-5 lg:p-7 shadow-xs w-full">
        <div className="flex items-start justify-between gap-3 mb-4 lg:mb-5">
          <div>
            <h2 className="text-[16px] lg:text-[17px] font-bold text-[#0f172a] leading-tight">
              Data &amp; Personalization
            </h2>
            <p className="text-[12px] lg:text-[13px] text-[#64748b] mt-0.5">
              Manage how telemetry and telemetry signals are handled to improve matrix efficiency.
            </p>
          </div>
          <div className="text-[#2563eb] flex-shrink-0 mt-0.5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
            </svg>
          </div>
        </div>

        {/* Rows with Toggles */}
        <div className="space-y-2.5 sm:space-y-3">
          {/* Usage Analytics */}
          <div className="bg-[#f8fafc] rounded-2xl p-3 sm:p-3.5 lg:py-4 lg:px-5 border border-[#f1f5f9] flex items-center justify-between gap-3 sm:gap-4 transition-all">
            <div className="flex items-center gap-3 sm:gap-3.5 lg:gap-4 min-w-0">
              <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-[14px] bg-white border border-[#e2e8f0] flex items-center justify-center text-[#2563eb] shadow-2xs flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <ellipse cx="12" cy="5" rx="9" ry="3" />
                  <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                  <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                </svg>
              </div>
              <div className="min-w-0 pr-1">
                <h3 className="text-[13.5px] lg:text-[14px] font-bold text-[#0f172a] leading-tight">
                  Usage Analytics
                </h3>
                <p className="text-[11.5px] sm:text-[12px] lg:text-[12.5px] text-[#64748b] mt-0.5 leading-snug line-clamp-2">
                  Help us optimize matrix routing by sharing anonymized dApp performance telemetry.
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={privacyToggles.usageAnalytics}
              onClick={() => togglePrivacy("usageAnalytics")}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out p-0.5 focus:outline-none ${
                privacyToggles.usageAnalytics ? "bg-[#2563eb]" : "bg-[#cbd5e1]"
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  privacyToggles.usageAnalytics ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Product Updates & Communications */}
          <div className="bg-[#f8fafc] rounded-2xl p-3 sm:p-3.5 lg:py-4 lg:px-5 border border-[#f1f5f9] flex items-center justify-between gap-3 sm:gap-4 transition-all">
            <div className="flex items-center gap-3 sm:gap-3.5 lg:gap-4 min-w-0">
              <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-[14px] bg-white border border-[#e2e8f0] flex items-center justify-center text-[#2563eb] shadow-2xs flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 11l18-5v12L3 13v-2z" />
                  <path d="M11.6 16.8a3 3 0 11-5.8-1.6" />
                </svg>
              </div>
              <div className="min-w-0 pr-1">
                <h3 className="text-[13.5px] lg:text-[14px] font-bold text-[#0f172a] leading-tight">
                  Product Updates &amp; Communications
                </h3>
                <p className="text-[11.5px] sm:text-[12px] lg:text-[12.5px] text-[#64748b] mt-0.5 leading-snug line-clamp-2">
                  Receive smart notifications about smart contract revisions, releases, and key DAO votes.
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={privacyToggles.productUpdates}
              onClick={() => togglePrivacy("productUpdates")}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out p-0.5 focus:outline-none ${
                privacyToggles.productUpdates ? "bg-[#2563eb]" : "bg-[#cbd5e1]"
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  privacyToggles.productUpdates ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
