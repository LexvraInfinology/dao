"use client";

import React, { useState, useEffect } from "react";
import { toast } from "@/lib/toast";

export interface ReferralLinkCardProps {
  address?: string | null;
  directsCount?: number;
  sponsorAddress?: string | null;
}

export function ReferralLinkCard({
  address,
  directsCount = 0,
  sponsorAddress,
}: ReferralLinkCardProps) {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState(process.env.NEXT_PUBLIC_APP_URL || "https://equorafimatrix.com");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const referralUrl = address ? `${origin}/?ref=${address}` : `${origin}/?ref=connect`;

  const handleCopy = () => {
    if (!address) {
      toast.error("Connect Wallet", "Connect your wallet first to generate your active referral link.");
      return;
    }
    toast.copy(referralUrl, "Referral Link");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-2xl p-4 sm:p-5 text-white shadow-sm border border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-pulse" />
            <span className="text-[10.5px] font-bold text-[#38bdf8] tracking-widest uppercase">
              YOUR AFFILIATE & TEAM LINK
            </span>
          </div>
          <h3 className="text-[16px] sm:text-[18px] font-black tracking-tight text-white mt-0.5">
            Invite Partners & Earn Spillover
          </h3>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-3 py-1 rounded-full bg-white/10 text-[11px] font-semibold text-slate-300">
            Directs: <span className="font-bold text-white">{directsCount} Members</span>
          </div>
        </div>
      </div>

      {/* Copy Link Input Bar */}
      <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl p-1.5 pl-3">
        <span className="text-[12px] font-mono text-slate-300 truncate flex-1 select-all">
          {referralUrl}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className={`px-3.5 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            copied
              ? "bg-[#16a34a] text-white"
              : "bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-xs"
          }`}
        >
          {copied ? (
            <>
              <span>✓</span>
              <span>Copied</span>
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <span>Copy Link</span>
            </>
          )}
        </button>
      </div>

      {/* Footnote */}
      <div className="flex items-center justify-between text-[10.5px] text-slate-400 mt-2 px-1">
        <span>Share with prospective team members to place them directly in your Level 1/2 matrix.</span>
        {sponsorAddress && (
          <span className="text-slate-300 shrink-0">
            Sponsor: <span className="font-mono text-white">{sponsorAddress.slice(0, 6)}...{sponsorAddress.slice(-4)}</span>
          </span>
        )}
      </div>
    </div>
  );
}
