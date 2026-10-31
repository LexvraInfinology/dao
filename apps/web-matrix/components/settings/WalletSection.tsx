"use client";

import React from "react";
import { MatrixUserProfile } from "@/lib/api";
import { useUserStore } from "@/lib/stores";
import { formatAddress, toTrobBase58, formatDateSafe } from "@/lib/format";

export interface WalletSectionProps {
  copy: (text: string) => void;
  profile?: MatrixUserProfile | null;
  onSwitchWallet?: () => void;
  onDisconnectWallet?: () => void;
}

export function WalletSection({ copy, profile: propProfile, onSwitchWallet, onDisconnectWallet }: WalletSectionProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const storeProfile = useUserStore((s) => s.profile);
  const storeAddress = useUserStore((s) => s.address);

  const profile = mounted ? (propProfile !== undefined ? propProfile : storeProfile) : null;
  const address = mounted ? (profile?.address ?? storeAddress ?? "") : "";
  const displayAddress = address ? formatAddress(address) : "Not Connected";
  const joinedDate = formatDateSafe(profile?.joinedAt, address ? "Connected" : "—");

  return (
    <div className="space-y-4 lg:space-y-5 w-full">

      {/* ── CARD 1: CONNECTED WALLET ── */}
      <div className="bg-white rounded-[22px] border border-[#e8ecf1] p-4 sm:p-5 lg:p-7 shadow-xs w-full">
        {/* Title at top */}
        <div className="mb-4 sm:mb-5">
          <h2 className="text-[16px] sm:text-[17px] font-bold text-[#0f172a] leading-tight">
            Connected Wallet
          </h2>
          <p className="text-[12px] sm:text-[13px] text-[#64748b] mt-0.5">
            Manage your connected wallet and wallet preferences.
          </p>
        </div>

        {/* Inner Container: Wallet Address & Status */}
        <div className="bg-[#f8fafc] rounded-2xl p-3.5 sm:p-4 lg:p-4.5 border border-[#f1f5f9]">
          <div className="flex sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#e2e8f0] flex items-center justify-center text-[#2563eb] shadow-2xs flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                  <path d="M16 12h.01M2 10h20" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between sm:justify-start gap-2">
                  <p className="text-[10px] sm:text-[10.5px] font-bold text-[#64748b] tracking-wider uppercase whitespace-nowrap">
                    WALLET ADDRESS
                  </p>
                  {/* Status Badge on Mobile (< sm) */}
                  <div className="sm:hidden flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#e0f2fe] text-[#0284c7] text-[10.5px] font-bold flex-shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0284c7]" />
                    Connected
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-0.5 sm:mt-1 min-w-0">
                  <span className="text-[13.5px] sm:text-[15px] font-bold font-mono text-[#0f172a] tracking-tight truncate">
                    {displayAddress}
                  </span>
                  <button
                    type="button"
                    onClick={() => copy(toTrobBase58(address))}
                    className="text-[#94a3b8] hover:text-[#2563eb] p-1 rounded-md hover:bg-white transition-colors cursor-pointer flex-shrink-0"
                    title="Copy address"
                    aria-label="Copy address"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                  </button>
                  <a
                    href={`https://trobchain.com/#/address/${toTrobBase58(address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#94a3b8] hover:text-[#2563eb] p-1 rounded-md hover:bg-white transition-colors cursor-pointer flex-shrink-0"
                    title="View on explorer"
                    aria-label="View on explorer"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Status Badge on Desktop (>= sm) */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e0f2fe] text-[#0284c7] text-[11.5px] sm:text-[12px] font-bold flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0284c7]" />
              Connected
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 mt-4">
          <button
            type="button"
            onClick={() => copy(toTrobBase58(address))}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-[#eff6ff] text-[#2563eb] text-[12.5px] sm:text-[13px] font-semibold hover:bg-[#dbeafe] transition-colors cursor-pointer shadow-2xs"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
            Copy Address
          </button>
          <a
            href={`https://trobchain.com/#/address/${toTrobBase58(address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-[#eff6ff] text-[#2563eb] text-[12.5px] sm:text-[13px] font-semibold hover:bg-[#dbeafe] transition-colors cursor-pointer shadow-2xs"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            View on Explorer
          </a>
          <button
            type="button"
            onClick={onDisconnectWallet}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-[#fee2e2] text-[#dc2626] text-[12.5px] sm:text-[13px] font-semibold hover:bg-[#fecaca] transition-colors cursor-pointer shadow-2xs"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
            Disconnect Wallet
          </button>
        </div>
      </div>

      {/* ── CARD 2: WALLET INFORMATION ── */}
      <div className="bg-white rounded-[22px] border border-[#e8ecf1] p-4 sm:p-5 lg:p-7 shadow-xs w-full">
        <h2 className="text-[16px] lg:text-[17px] font-bold text-[#0f172a] leading-tight">
          Wallet Information
        </h2>
        <p className="text-[12px] lg:text-[13px] text-[#64748b] mt-0.5 mb-4 lg:mb-5">
          Details about your connected wallet and network.
        </p>

        {/* 5 Zebra-striped Rows */}
        <div className="rounded-2xl border border-[#f1f5f9] overflow-hidden">
          {/* Row 1: Network */}
          <div className="bg-[#f8fafc] px-3.5 sm:px-4 lg:px-5 py-3.5 flex items-center justify-between gap-3 border-b border-[#f1f5f9]">
            <span className="text-[12.5px] sm:text-[13.5px] text-[#64748b]">
              Network
            </span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-[#2563eb] text-[12.5px] sm:text-[13.5px] font-bold">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 3h12l4 6-10 13L2 9z" />
                  <path d="M12 22V9M2 9h20M7 3l3 6M17 3l-3 6" />
                </svg>
                <span>Trobium Blockchain</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#eff6ff] text-[#2563eb] text-[11px] font-bold">
                Supported
              </span>
            </div>
          </div>

          {/* Row 2: Wallet Type */}
          <div className="bg-white px-3.5 sm:px-4 lg:px-5 py-3.5 flex items-center justify-between gap-3 border-b border-[#f1f5f9]">
            <span className="text-[12.5px] sm:text-[13.5px] text-[#64748b]">
              Wallet Type
            </span>
            <span className="text-[13px] sm:text-[13.5px] font-bold text-[#0f172a]">
              TROBsafe
            </span>
          </div>

          {/* Row 3: Connection Date */}
          <div className="bg-[#f8fafc] px-3.5 sm:px-4 lg:px-5 py-3.5 flex items-center justify-between gap-3 border-b border-[#f1f5f9]">
            <span className="text-[12.5px] sm:text-[13.5px] text-[#64748b]">
              Connection Date
            </span>
            <span className="text-[13px] sm:text-[13.5px] font-bold text-[#0f172a] tracking-tight">
              {joinedDate}
            </span>
          </div>

          {/* Row 4: Last Activity */}
          <div className="bg-white px-3.5 sm:px-4 lg:px-5 py-3.5 flex items-center justify-between gap-3 border-b border-[#f1f5f9]">
            <span className="text-[12.5px] sm:text-[13.5px] text-[#64748b]">
              Last Activity
            </span>
            <span className="text-[13px] sm:text-[13.5px] font-bold text-[#16a34a] tracking-tight">
              {address ? "Synchronized Live" : "Disconnected"}
            </span>
          </div>

          {/* Row 5: Status */}
          <div className="bg-[#f8fafc] px-3.5 sm:px-4 lg:px-5 py-3.5 flex items-center justify-between gap-3">
            <span className="text-[12.5px] sm:text-[13.5px] text-[#64748b]">
              Status
            </span>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eff6ff] text-[#2563eb] text-[11px] sm:text-[11.5px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb]" />
              Active
            </div>
          </div>
        </div>
      </div>

      {/* ── CARD 3: WALLET MANAGEMENT ── */}
      <div className="bg-white rounded-[22px] border border-[#e8ecf1] p-4 sm:p-5 lg:p-7 shadow-xs w-full">
        <h2 className="text-[16px] sm:text-[17px] font-bold text-[#0f172a] leading-tight">
          Wallet Management
        </h2>
        <p className="text-[12px] sm:text-[13px] text-[#64748b] mt-0.5 mb-4 sm:mb-5">
          Manage your wallet connection and permissions.
        </p>

        <div className="space-y-3">
          {/* Switch Wallet */}
          <div
            onClick={onSwitchWallet}
            className="bg-[#f8fafc] rounded-2xl p-3.5 sm:p-4.5 border border-[#f1f5f9] flex items-center justify-between hover:bg-[#f1f5f9] transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#e2e8f0] flex items-center justify-center text-[#2563eb] shadow-2xs flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 3 21 3 21 8" />
                  <line x1="4" y1="20" x2="21" y2="3" />
                  <polyline points="21 16 21 21 16 21" />
                  <line x1="15" y1="15" x2="21" y2="21" />
                  <line x1="4" y1="4" x2="9" y2="9" />
                </svg>
              </div>
              <div>
                <h3 className="text-[13.5px] sm:text-[14px] font-bold text-[#0f172a] leading-tight">
                  Switch Wallet
                </h3>
                <p className="text-[12px] sm:text-[12.5px] text-[#64748b] mt-0.5">
                  Connect a different wallet to your account.
                </p>
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#94a3b8] group-hover:text-[#2563eb] transition-colors">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>

          {/* Disconnect Wallet */}
          <div
            onClick={onDisconnectWallet}
            className="bg-[#f8fafc] rounded-2xl p-3.5 sm:p-4.5 border border-[#f1f5f9] flex items-center justify-between hover:bg-[#fef2f2] transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#fee2e2] text-[#dc2626] flex items-center justify-center flex-shrink-0 shadow-2xs">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </div>
              <div>
                <h3 className="text-[13.5px] sm:text-[14px] font-bold text-[#0f172a] leading-tight">
                  Disconnect Wallet
                </h3>
                <p className="text-[12px] sm:text-[12.5px] text-[#64748b] mt-0.5">
                  Disconnect your current wallet from this DAO portal.
                </p>
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#94a3b8] group-hover:text-[#dc2626] transition-colors">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── CARD 4: YOUR WALLET, YOUR ACCESS (SECURITY REMINDER) ── */}
      <div className="bg-white rounded-[22px] border border-[#e8ecf1] p-4 sm:p-5 relative overflow-hidden shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5 z-10">
          <div className="w-11 h-11 rounded-[16px] bg-[#dbe1ff] text-[#2563eb] flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div>
            <h3 className="text-[14.5px] sm:text-[15px] font-bold text-[#0f172a] leading-tight">
              Your Wallet, Your Access
            </h3>
            <p className="text-[11.5px] sm:text-[12px] text-[#64748b] mt-1 leading-snug max-w-[400px]">
              Your wallet gives you access to the EQUORA_FI Genesis DAO platform. Keep your private key secure and never share it with anyone.
            </p>
          </div>
        </div>

        {/* Decorative isometric wireframe cube */}
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
