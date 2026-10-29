"use client";

import React from "react";
import Link from "next/link";
import { MatrixUserProfile } from "@/lib/api";
import { useUserStore, useMatrixStore } from "@/lib/stores";
import { formatAddress, toTrobBase58, formatDateSafe } from "@/lib/format";

export interface AccountSectionProps {
  copy: (text: string) => void;
  profile?: MatrixUserProfile | null;
  slotsCount?: number;
}

export function AccountSection({ copy, profile: propProfile, slotsCount: propSlotsCount }: AccountSectionProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const storeProfile = useUserStore((s) => s.profile);
  const storeSlots = useMatrixStore((s) => s.slots);

  const profile = mounted ? (propProfile !== undefined ? propProfile : storeProfile) : null;
  const count = mounted ? (propSlotsCount !== undefined ? propSlotsCount : storeSlots.length) : 0;
  const storeAddress = useUserStore((s) => s.address);
  const address = mounted ? (profile?.address ?? storeAddress ?? "") : "";
  const displayAddress = address ? formatAddress(address) : "Not Connected";
  const userIdDisplay = profile?.userId ? `#${profile.userId}` : (address ? "#Pending" : "Unregistered");
  const levelDisplay = count > 0 ? `Slot ${count}` : "Not Activated";
  const joinedDate = formatDateSafe(profile?.joinedAt, address ? "Connected" : "—");

  return (
    <div className="space-y-4 lg:space-y-5 w-full">
      {/* Account Information Card */}
      <div className="bg-white rounded-[22px] border border-[#e8ecf1] p-4 sm:p-5 lg:p-6 shadow-xs w-full">
        <div className="flex items-center justify-between pb-3 sm:pb-4 mb-3 sm:mb-4 border-b border-[#f1f5f9]">
          <div>
            <h2 className="text-[16px] lg:text-[17px] font-bold text-[#0f172a] leading-tight">
              Account Information
            </h2>
            <p className="text-[12px] lg:text-[13px] text-[#64748b] mt-0.5">
              Your verified Matrix account details.
            </p>
          </div>

          <Link
            href="/profile"
            className="px-3.5 py-1.5 rounded-lg bg-[#eff6ff] text-[12px] lg:text-[12.5px] font-semibold text-[#2563eb] hover:bg-[#dbeafe] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
            </svg>
            Edit
          </Link>
        </div>

        <div className="space-y-2 sm:space-y-3">
          {/* Member ID */}
          <div className="bg-[#f8fafc] rounded-2xl p-2.5 sm:p-3.5 lg:p-4 flex items-center justify-between gap-2 sm:gap-3 border border-[#f1f5f9]">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl bg-white border border-[#e2e8f0] flex items-center justify-center text-[#2563eb] shadow-2xs flex-shrink-0">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <span className="text-[12.5px] sm:text-[13.5px] font-medium text-[#475569] truncate">Member ID</span>
            </div>
            <div className="flex-shrink-0">
              <span suppressHydrationWarning className="px-2.5 sm:px-3 py-1 rounded-xl bg-[#eff6ff] text-[#2563eb] font-extrabold text-[13px] sm:text-[14px] tracking-tight">
                {userIdDisplay}
              </span>
            </div>
          </div>

          {/* Current Level */}
          <div className="bg-[#f8fafc] rounded-2xl p-2.5 sm:p-3.5 lg:p-4 flex items-center justify-between gap-2 sm:gap-3 border border-[#f1f5f9]">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl bg-white border border-[#e2e8f0] flex items-center justify-center text-[#2563eb] shadow-2xs flex-shrink-0">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 20V10M12 20V4M6 20v-6" />
                </svg>
              </div>
              <span className="text-[12.5px] sm:text-[13.5px] font-medium text-[#475569] truncate">Current Level</span>
            </div>
            <div className="flex-shrink-0">
              <div suppressHydrationWarning className="px-2.5 sm:px-3 py-1 rounded-full bg-[#2563eb] text-white font-bold text-[11.5px] sm:text-[12px] flex items-center gap-1.5 shadow-xs">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                {levelDisplay}
              </div>
            </div>
          </div>

          {/* Connected Wallet */}
          <div className="bg-[#f8fafc] rounded-2xl p-2.5 sm:p-3.5 lg:p-4 flex items-center justify-between gap-2 sm:gap-3 border border-[#f1f5f9] min-w-0">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl bg-white border border-[#e2e8f0] flex items-center justify-center text-[#2563eb] shadow-2xs flex-shrink-0">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                  <path d="M16 12h.01M2 10h20" />
                </svg>
              </div>
              <span className="text-[12.5px] sm:text-[13.5px] font-medium text-[#475569] truncate">Connected Wallet</span>
            </div>
            <button
              type="button"
              onClick={() => copy(toTrobBase58(address))}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl bg-white border border-[#e2e8f0] text-[11.5px] sm:text-[13px] font-mono font-bold text-[#0f172a] hover:border-[#bfdbfe] hover:bg-[#eff6ff]/60 active:scale-98 transition-all cursor-pointer shadow-2xs group flex-shrink-0"
              aria-label="Copy wallet address"
              title="Click to copy wallet address"
            >
              <span suppressHydrationWarning>{displayAddress}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-[#94a3b8] group-hover:text-[#2563eb] transition-colors flex-shrink-0">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
            </button>
          </div>

          {/* Member Since */}
          <div className="bg-[#f8fafc] rounded-2xl p-2.5 sm:p-3.5 lg:p-4 flex items-center justify-between gap-2 sm:gap-3 border border-[#f1f5f9]">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl bg-white border border-[#e2e8f0] flex items-center justify-center text-[#2563eb] shadow-2xs flex-shrink-0">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <span className="text-[12.5px] sm:text-[13.5px] font-medium text-[#475569] truncate">Member Since</span>
            </div>
            <span suppressHydrationWarning className="text-[11px] sm:text-[13px] font-bold text-[#0f172a] text-right whitespace-nowrap flex-shrink-0">
              {joinedDate}
            </span>
          </div>

          {/* Referral / Sponsor ID */}
          <div className="bg-[#f8fafc] rounded-2xl p-2.5 sm:p-3.5 lg:p-4 flex items-center justify-between gap-2 sm:gap-3 border border-[#f1f5f9]">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl bg-white border border-[#e2e8f0] flex items-center justify-center text-[#2563eb] shadow-2xs flex-shrink-0">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </div>
              <span className="text-[12.5px] sm:text-[13.5px] font-medium text-[#475569] truncate">Referral / Sponsor ID</span>
            </div>
            <div className="flex-shrink-0">
              <div suppressHydrationWarning className="px-2 sm:px-3 py-1 rounded-xl bg-[#eff6ff] text-[#2563eb] font-bold text-[12px] sm:text-[13px] flex items-center gap-1">
                <span>↑</span>{" "}
                {profile?.sponsorUserId
                  ? `ID #${profile.sponsorUserId}`
                  : profile?.sponsorAddress && profile.sponsorAddress !== "0x0000000000000000000000000000000000000000"
                  ? formatAddress(profile.sponsorAddress)
                  : address
                  ? "Genesis (Root)"
                  : "None"}
              </div>
            </div>
          </div>

          {/* Matrix Status */}
          <div className="bg-[#f8fafc] rounded-2xl p-2.5 sm:p-3.5 lg:p-4 flex items-center justify-between gap-2 sm:gap-3 border border-[#f1f5f9]">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl bg-white border border-[#e2e8f0] flex items-center justify-center text-[#2563eb] shadow-2xs flex-shrink-0">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
              <span className="text-[12.5px] sm:text-[13.5px] font-medium text-[#475569] truncate">Matrix Status</span>
            </div>
            <div className="flex-shrink-0">
              {mounted && address ? (
                <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[#16a34a] text-[11.5px] sm:text-[12px] font-bold shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />Active Node
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-[11.5px] sm:text-[12px] font-bold shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />Disconnected
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
