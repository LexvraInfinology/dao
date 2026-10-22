"use client";

import React from "react";
import { MatrixUserProfile } from "@/lib/api";
import { useUserStore } from "@/lib/stores";

export interface WalletInfoCardProps {
  copy: (text: string) => void;
  profile?: MatrixUserProfile | null;
  onManage?: () => void;
}

export function WalletInfoCard({ copy, profile: propProfile, onManage }: WalletInfoCardProps) {
  const storeProfile = useUserStore((s) => s.profile);
  const storeAddress = useUserStore((s) => s.address);

  const profile = propProfile !== undefined ? propProfile : storeProfile;
  const address = profile?.address ?? storeAddress ?? "";
  const displayAddress = address ? `${address.slice(0, 6)} . . . ${address.slice(-4)}` : "Not Connected";
  const joinedDate = profile?.joinedAt ? new Date(profile.joinedAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Active";

  return (
    <div className="bg-white rounded-[22px] border border-[#e8ecf1] p-5 lg:p-6 shadow-xs w-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#f1f5f9]">
          <h2 className="text-[15.5px] font-bold text-[#0f172a]">Wallet Information</h2>
          <button
            type="button"
            onClick={onManage}
            className="px-3.5 py-1 rounded-lg bg-[#eff6ff] text-[12px] font-semibold text-[#2563eb] hover:bg-[#dbeafe] transition-colors cursor-pointer"
          >
            Manage
          </button>
        </div>

        {/* Connected Wallet Sub-Card */}
        <div className="rounded-2xl border border-[#dbeafe] p-3.5 flex items-center justify-between gap-3 mb-4 bg-white shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#eff6ff] flex items-center justify-center text-[#2563eb] flex-shrink-0">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-[#64748b] tracking-wider uppercase mb-0.5 leading-none">CONNECTED WALLET</p>
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-mono font-bold text-[#0f172a]">{displayAddress}</span>
                <button type="button" onClick={() => copy(address)} className="text-[#94a3b8] hover:text-[#2563eb] cursor-pointer transition-colors p-0.5" title="Copy full address">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                </button>
              </div>
            </div>
          </div>
          <span className="flex-shrink-0 px-2.5 py-1 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[11px] font-bold text-[#10b981]">
            Connected
          </span>
        </div>

        {/* Wallet Info Rows */}
        <div className="space-y-4">
          {/* Network */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-[#64748b]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
              <span className="text-[13px] font-medium">Network</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L4 12l8 5 8-5-8-10z" fill="#2563eb" opacity="0.85"/>
                <path d="M12 17l-8-5 8 10 8-10-8 5z" fill="#1d4ed8"/>
              </svg>
              <span className="text-[13.5px] font-bold text-[#0f172a]">TrobChain L1 (Native)</span>
            </div>
          </div>

          {/* Wallet Type */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-[#64748b]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
              <span className="text-[13px] font-medium">Wallet Type</span>
            </div>
            <span className="text-[13.5px] font-bold text-[#0f172a]">TrobSafe / Web3</span>
          </div>

          {/* Connected Since */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-[#64748b]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span className="text-[13px] font-medium">Connected Since</span>
            </div>
            <span className="text-[13.5px] font-bold text-[#0f172a] text-right">{joinedDate}</span>
          </div>

          {/* Last Activity */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-[#64748b]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 8 14"/></svg>
              <span className="text-[13px] font-medium">Protocol Status</span>
            </div>
            <span className="text-[13.5px] font-bold text-[#16a34a] text-right">Active Operative</span>
          </div>
        </div>
      </div>
    </div>
  );
}
