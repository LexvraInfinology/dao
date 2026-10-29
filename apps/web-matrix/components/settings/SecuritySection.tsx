"use client";

import React from "react";
import { toast } from "@/lib/toast";

import { useUserStore } from "@/lib/stores";
import { EXPLORER_URL } from "@/lib/contracts";
import { formatAddress, toTrobBase58 } from "@/lib/format";

export interface SecuritySectionProps {
  copy: (text: string) => void;
}

export function SecuritySection({ copy }: SecuritySectionProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const rawAddress = useUserStore((s) => s.address) || "";
  const address = mounted ? rawAddress : "";
  const displayAddress = address ? formatAddress(address) : "Not Connected";
  const displayAddressSpaced = address ? formatAddress(address, "spaced") : "Not Connected";

  return (
    <div className="space-y-4 lg:space-y-5 w-full">

      {/* ── CARD 1: WALLET SECURITY ── */}
      <div className="bg-white rounded-[22px] border border-[#e8ecf1] p-4 sm:p-5 lg:p-6 shadow-xs w-full">
        <h2 className="text-[16px] lg:text-[17px] font-bold text-[#0f172a] leading-tight">
          Wallet Security
        </h2>
        <p className="text-[12px] lg:text-[13px] text-[#64748b] mt-0.5">
          Manage your connected wallet and access security.
        </p>

        {/* Inner Box */}
        <div className="bg-[#f8fafc] rounded-2xl p-3.5 sm:p-4 border border-[#f1f5f9] flex flex-wrap items-center justify-between gap-3 mt-3.5 sm:mt-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white border border-[#e2e8f0] flex items-center justify-center text-[#2563eb] shadow-2xs flex-shrink-0">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="6" width="20" height="12" rx="2" />
                <path d="M16 12h.01M2 10h20" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="text-[13.5px] font-bold text-[#0f172a] leading-tight">Connected Wallet</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[12px] font-mono text-[#64748b]">{displayAddressSpaced}</span>
                <button
                  type="button"
                  onClick={() => copy(toTrobBase58(address))}
                  className="text-[#94a3b8] hover:text-[#2563eb] p-0.5 cursor-pointer transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                </button>
                <a
                  href={`${EXPLORER_URL}/#/address/${toTrobBase58(address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#94a3b8] hover:text-[#2563eb] p-0.5 cursor-pointer transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            {mounted && address ? (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[#16a34a] text-[11.5px] font-bold shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
                Connected
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-[11.5px] font-bold shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                Disconnected
              </div>
            )}

            <button
              type="button"
              onClick={() => toast.info("Your wallet is secured by Web3 cryptography on TrobChain.", "Wallet Security")}
              className="text-[12.5px] sm:text-[13px] font-bold text-[#2563eb] hover:text-[#1d4ed8] flex items-center gap-1 cursor-pointer transition-colors"
            >
              View Wallet
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </div>
      </div>


      {/* ── CARD 2: ACTIVE SESSIONS ── */}
      <div className="bg-white rounded-[22px] border border-[#e8ecf1] p-4 sm:p-5 lg:p-6 shadow-xs w-full">
        <h2 className="text-[16px] lg:text-[17px] font-bold text-[#0f172a] leading-tight">
          Active Sessions
        </h2>
        <p className="text-[12px] lg:text-[13px] text-[#64748b] mt-0.5">
          View and manage your active sessions.
        </p>

        {/* Inner Box */}
        <div className="bg-[#f8fafc] rounded-2xl p-3.5 sm:p-4 border border-[#f1f5f9] flex flex-wrap items-center justify-between gap-3 mt-3.5 sm:mt-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white border border-[#e2e8f0] flex items-center justify-center text-[#2563eb] shadow-2xs flex-shrink-0">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="text-[13.5px] font-bold text-[#0f172a] leading-tight">Current Session</div>
              <div className="text-[12px] text-[#64748b] mt-0.5">Chrome • Windows</div>
              <div className="text-[11.5px] font-semibold text-[#16a34a] mt-0.5">Active now</div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[#16a34a] text-[11.5px] font-bold shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
              Active
            </div>

            <button
              type="button"
              onClick={() => toast.info("Your active session is tied to your browser and wallet connection.", "Active Sessions")}
              className="text-[12.5px] sm:text-[13px] font-bold text-[#2563eb] hover:text-[#1d4ed8] flex items-center gap-1 cursor-pointer transition-colors"
            >
              Manage Sessions
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </div>
      </div>


      {/* ── CARD 3: TWO-FACTOR AUTHENTICATION (2FA) ── */}
      <div className="bg-white rounded-[22px] border border-[#e8ecf1] p-4 sm:p-5 lg:p-6 shadow-xs w-full">
        <h2 className="text-[16px] lg:text-[17px] font-bold text-[#0f172a] leading-tight">
          Two-Factor Authentication (2FA)
        </h2>
        <p className="text-[12px] lg:text-[13px] text-[#64748b] mt-0.5">
          Add an extra layer of security to your account.
        </p>

        {/* Inner Box */}
        <div className="bg-[#f8fafc] rounded-2xl p-3.5 sm:p-4 border border-[#f1f5f9] flex flex-wrap items-center justify-between gap-3 mt-3.5 sm:mt-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white border border-[#e2e8f0] flex items-center justify-center text-[#2563eb] shadow-2xs flex-shrink-0">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="text-[13.5px] font-bold text-[#0f172a] leading-tight">2FA Status</div>
              <div className="text-[12px] text-[#64748b] mt-0.5">Not enabled</div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            <div className="px-3 py-1 rounded-full bg-[#fff1f2] border border-[#fecdd3] text-[#e11d48] text-[11.5px] font-bold">
              Not Enabled
            </div>

            <button
              type="button"
              onClick={() => toast.info("2FA is cryptographically enforced via your wallet signer on every transaction.", "Two-Factor Auth")}
              className="text-[12.5px] sm:text-[13px] font-bold text-[#2563eb] hover:text-[#1d4ed8] flex items-center gap-1 cursor-pointer transition-colors"
            >
              Enable
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </div>
      </div>


      {/* ── CARD 4: SECURITY ACTIVITY ── */}
      <div className="bg-white rounded-[22px] border border-[#e8ecf1] p-4 sm:p-5 lg:p-6 shadow-xs w-full">
        <div className="flex items-center justify-between pb-3 sm:pb-4 mb-3 sm:mb-4 border-b border-[#f1f5f9]">
          <div>
            <h2 className="text-[16px] lg:text-[17px] font-bold text-[#0f172a] leading-tight">
              Security Activity
            </h2>
            <p className="text-[12px] lg:text-[13px] text-[#64748b] mt-0.5">
              Recent security events on your account.
            </p>
          </div>

          <button
            type="button"
            onClick={() => toast.info("Displaying all verified ledger and security events.", "Security Activity")}
            className="text-[13px] font-bold text-[#2563eb] hover:text-[#1d4ed8] flex items-center gap-1 cursor-pointer transition-colors"
          >
            View All
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>

        {/* Activity List */}
        <div className="space-y-3 sm:space-y-3.5">
          {/* 1. Wallet Connected */}
          <div className="flex items-center justify-between gap-3 py-1">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#eff6ff] flex items-center justify-center text-[#2563eb] flex-shrink-0">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                  <path d="M16 12h.01M2 10h20" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="text-[13.5px] font-bold text-[#0f172a] leading-tight">Wallet Connected</div>
                <div className="text-[12px] font-mono text-[#64748b] mt-0.5">{displayAddress}</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-4 flex-shrink-0">
              <span className="text-[12px] text-[#64748b] whitespace-nowrap">Aug 12, 2026, 10:24 AM</span>
              <span className="px-2.5 py-0.5 rounded-md bg-[#ecfdf5] border border-[#bbf7d0] text-[#16a34a] text-[11px] font-bold">
                Success
              </span>
            </div>
          </div>

          {/* 2. Session Started */}
          <div className="flex items-center justify-between gap-3 py-1">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#eff6ff] flex items-center justify-center text-[#2563eb] flex-shrink-0">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="text-[13.5px] font-bold text-[#0f172a] leading-tight">Session Started</div>
                <div className="text-[12px] text-[#64748b] mt-0.5">Chrome • Windows</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-4 flex-shrink-0">
              <span className="text-[12px] text-[#64748b] whitespace-nowrap">Aug 12, 2026, 10:24 AM</span>
              <span className="px-2.5 py-0.5 rounded-md bg-[#ecfdf5] border border-[#bbf7d0] text-[#16a34a] text-[11px] font-bold">
                Success
              </span>
            </div>
          </div>

          {/* 3. 2FA Not Enabled */}
          <div className="flex items-center justify-between gap-3 py-1">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#eff6ff] flex items-center justify-center text-[#2563eb] flex-shrink-0">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="text-[13.5px] font-bold text-[#0f172a] leading-tight">2FA Not Enabled</div>
                <div className="text-[12px] text-[#64748b] mt-0.5">Account security update</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-4 flex-shrink-0">
              <span className="text-[12px] text-[#64748b] whitespace-nowrap">Aug 12, 2026, 10:20 AM</span>
              <span className="px-2.5 py-0.5 rounded-md bg-[#eff6ff] border border-[#bfdbfe] text-[#2563eb] text-[11px] font-bold">
                Info
              </span>
            </div>
          </div>
        </div>
      </div>


      {/* ── 5. YOUR SECURITY MATTERS BANNER ── */}
      <div className="bg-[#f0f6ff] border border-[#dbeafe] rounded-[22px] p-4 lg:p-5 flex items-start gap-3.5 shadow-2xs w-full">
        <div className="w-10 h-10 rounded-xl bg-white border border-[#bfdbfe] text-[#2563eb] flex items-center justify-center flex-shrink-0 shadow-2xs mt-0.5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <div>
          <h4 className="text-[14px] font-bold text-[#0f172a] leading-tight">
            Your Security Matters
          </h4>
          <p className="text-[12px] text-[#64748b] mt-1 leading-relaxed">
            Your wallet controls access to your Genesis DAO account. Never share your private key or recovery phrase with anyone.
          </p>
        </div>
      </div>

    </div>
  );
}
