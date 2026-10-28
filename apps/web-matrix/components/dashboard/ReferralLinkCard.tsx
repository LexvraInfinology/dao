"use client";

import React, { useState, useEffect } from "react";
import { toast } from "@/lib/toast";
import { formatAddress, toTrobBase58 } from "@/lib/format";
import { getOnChainCodeByUser } from "@/lib/contracts";

export interface ReferralLinkCardProps {
  address?: string | null;
  directsCount?: number;
  sponsorAddress?: string | null;
  upline2Address?: string | null;
}

export function ReferralLinkCard({
  address,
  directsCount = 0,
  sponsorAddress,
  upline2Address,
}: ReferralLinkCardProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [referralCode, setReferralCode] = useState<number | null>(null);
  const [origin, setOrigin] = useState(
    process.env.NEXT_PUBLIC_MATRIX_URL || "https://equorafimatrix.com"
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const [sponsorCode, setSponsorCode] = useState<number | null>(null);

  useEffect(() => {
    if (address) {
      getOnChainCodeByUser(address).then((code) => {
        if (code) setReferralCode(code);
      }).catch(() => {});
    }
  }, [address]);

  useEffect(() => {
    if (sponsorAddress && sponsorAddress !== "0x5181d06090f16c9bffef71e2ccd7ed17f676aad9") {
      getOnChainCodeByUser(sponsorAddress).then((c) => {
        if (c) setSponsorCode(c);
      }).catch(() => {});
    }
  }, [sponsorAddress]);

  const base58Addr = address ? toTrobBase58(address) : "";
  const refParam = referralCode ? String(referralCode) : base58Addr;
  const referralUrl = refParam ? `${origin}/gate?ref=${refParam}` : `${origin}/gate`;

  const handleCopyLink = () => {
    if (!address) {
      toast.error("Connect Wallet", "Connect your wallet first to generate your active referral link.");
      return;
    }
    toast.copy(referralUrl, "Referral Link");
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    if (!referralCode) {
      toast.info("Referral Code", "Generating on-chain referral code...");
      return;
    }
    toast.copy(String(referralCode), "5-Digit Referral Code");
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 text-[#102341] shadow-xs border border-[#e0eaf7]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2868e8] animate-pulse" />
            <span className="text-[10.5px] font-extrabold text-[#2868e8] tracking-widest uppercase">
              YOUR AFFILIATE & TEAM LINK
            </span>
          </div>
          <h3 className="text-[16px] sm:text-[18px] font-black tracking-tight text-[#102341] mt-0.5">
            Invite Partners & Earn Spillover
          </h3>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* 5-Digit Referral Code Pill */}
          {referralCode && (
            <div
              onClick={handleCopyCode}
              title="Click to copy your 5-digit code"
              className="px-2.5 py-1 rounded-full bg-[#e8fbf5] border border-[#c3f0e0] text-[11px] font-bold text-[#0e9f79] flex items-center gap-1.5 cursor-pointer hover:bg-emerald-100/60 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#0e9f79]" />
              <span>Code:</span>
              <span className="font-mono font-extrabold text-[#0e9f79] tracking-wider">{referralCode}</span>
            </div>
          )}

          {sponsorAddress && sponsorAddress !== "0x0000000000000000000000000000000000000000" ? (
            <>
              <div
                onClick={() => toast.copy(toTrobBase58(sponsorAddress), "Upline 1 (Sponsor) Address")}
                title="Click to copy Upline 1 (Sponsor) address"
                className="px-2.5 py-1 rounded-full bg-[#e7f1ff] border border-[#cde0ff] text-[11px] font-bold text-[#1758cc] flex items-center gap-1.5 cursor-pointer hover:bg-blue-100/60 transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#2868e8]" />
                <span>Upline 1:</span>
                <span className="font-mono font-extrabold text-[#1758cc]">
                  {sponsorCode ? `#${sponsorCode} • ` : ""}{toTrobBase58(sponsorAddress).slice(0, 5)}...{toTrobBase58(sponsorAddress).slice(-4)}
                </span>
              </div>

              {upline2Address && upline2Address !== "0x0000000000000000000000000000000000000000" && (
                <div
                  onClick={() => toast.copy(toTrobBase58(upline2Address), "Upline 2 Address")}
                  title="Click to copy Upline 2 address"
                  className="px-2.5 py-1 rounded-full bg-[#f0edff] border border-[#d8cfff] text-[11px] font-bold text-[#7256d8] flex items-center gap-1.5 cursor-pointer hover:bg-purple-100/60 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7256d8]" />
                  <span>Upline 2:</span>
                  <span className="font-mono font-extrabold text-[#7256d8]">
                    {toTrobBase58(upline2Address).slice(0, 5)}...{toTrobBase58(upline2Address).slice(-4)}
                  </span>
                </div>
              )}
            </>
          ) : (
            <div
              onClick={() => toast.copy("Protocol Liquidity Vault", "Root Vault")}
              title="Root Upline: Protocol 4 Pools Vault"
              className="px-2.5 py-1 rounded-full bg-[#fff6df] border border-[#fae2ab] text-[11px] font-bold text-[#b97a17] flex items-center gap-1.5 cursor-pointer hover:bg-amber-100/60 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#b97a17] animate-pulse" />
              <span>Upline:</span>
              <span className="font-extrabold text-[#b97a17]">4 Protocol Pools (Vault)</span>
            </div>
          )}

          <div className="px-2.5 py-1 rounded-full bg-[#f1f5f9] border border-[#e2e8f0] text-[11px] font-bold text-[#475569]">
            Directs: <span className="font-extrabold text-[#102341]">{directsCount} Members</span>
          </div>
        </div>
      </div>

      {/* Copy Link Input Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-[#f4f8fd] border border-[#e7eef7] rounded-xl p-2 sm:p-1.5 sm:pl-3">
        <span className="text-[12px] font-mono font-semibold text-[#537094] truncate flex-1 select-all break-all sm:break-normal">
          {referralUrl}
        </span>
        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
          {referralCode && (
            <button
              type="button"
              onClick={handleCopyCode}
              className={`px-3 py-1.5 rounded-lg text-[11.5px] font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                copiedCode
                  ? "bg-[#0e9f79] text-white"
                  : "bg-[#e8fbf5] hover:bg-[#d6f7ec] text-[#0e9f79] border border-[#c3f0e0]"
              }`}
            >
              {copiedCode ? "✓ Code Copied" : `Copy Code (${referralCode})`}
            </button>
          )}
          <button
            type="button"
            onClick={handleCopyLink}
            className={`px-3.5 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              copiedLink
                ? "bg-[#0e9f79] text-white shadow-xs"
                : "bg-gradient-to-r from-[#2c71f2] to-[#1754d0] hover:from-[#2463d6] hover:to-[#1346b3] text-white shadow-xs"
            }`}
          >
            {copiedLink ? (
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
      </div>

      {/* Footnote */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-[10.5px] text-[#657895] mt-2.5 px-0.5">
        <span>Share with prospective team members to place them directly in your Level 1/2 matrix.</span>
        {sponsorAddress && (
          <span className="text-[#657895] shrink-0">
            Sponsor: <span className="font-mono font-bold text-[#102341]">{formatAddress(sponsorAddress)}</span>
          </span>
        )}
      </div>
    </div>
  );
}
