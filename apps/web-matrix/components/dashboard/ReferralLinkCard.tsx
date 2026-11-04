"use client";

import React, { useState, useEffect } from "react";
import { Check, Copy, Share2, ShieldCheck, Crown } from "lucide-react";
import { toast } from "@/lib/toast";
import { formatAddress, toTrobBase58 } from "@/lib/format";
import { getOnChainCodeByUser, CONTRACT_ADDRESSES } from "@/lib/contracts";

export interface ReferralLinkCardProps {
  address?: string | null;
  directsCount?: number;
  sponsorAddress?: string | null;
  upline2Address?: string | null;
  isQualified?: boolean;
  referralCode?: number | null;
  joinedAt?: string | null;
  daoSeat?: number | null;
}

export function ReferralLinkCard({
  address,
  directsCount = 0,
  sponsorAddress,
  upline2Address,
  isQualified = false,
  referralCode: propReferralCode,
  joinedAt,
  daoSeat,
}: ReferralLinkCardProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [onChainCode, setOnChainCode] = useState<number | null>(propReferralCode || null);
  const [origin, setOrigin] = useState(
    process.env.NEXT_PUBLIC_MATRIX_URL || "https://equorafimatrix.com"
  );

  const isVaultSponsor =
    !sponsorAddress ||
    sponsorAddress.toLowerCase() === CONTRACT_ADDRESSES.vault.toLowerCase() ||
    (sponsorAddress.startsWith("T") && toTrobBase58(CONTRACT_ADDRESSES.vault) === sponsorAddress);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (propReferralCode && propReferralCode >= 10000 && propReferralCode <= 99999) {
      setOnChainCode(propReferralCode);
      return;
    }
    if (!address) return;
    let isMounted = true;
    getOnChainCodeByUser(address)
      .then((code) => {
        if (isMounted && code && code >= 10000 && code <= 99999) {
          setOnChainCode(code);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [address, propReferralCode]);

  const base58Addr = address ? toTrobBase58(address) : "";
  const referralCode = onChainCode || (propReferralCode ? Number(propReferralCode) : null);
  const referralUrl = base58Addr ? `${origin}/?ref=${base58Addr}` : `${origin}/`;

  const handleCopyLink = () => {
    if (!address) {
      toast.error("Connect Wallet", "Please connect your wallet first.");
      return;
    }
    toast.copy(referralUrl, "Referral Link");
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    if (!referralCode) return;
    toast.copy(String(referralCode), "5-Digit Referral Code");
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 text-[#102341] shadow-xs border border-[#e0eaf7] transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2868e8] animate-pulse" />
            <span className="text-[10px] font-extrabold text-[#2868e8] tracking-widest uppercase">
              REFERRAL &amp; AFFILIATE LINK
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                directsCount >= 2
                  ? "bg-[#e8fbf5] text-[#0e9f79] border border-[#c3f0e0]"
                  : "bg-[#fff6df] text-[#b97a17] border border-[#fae2ab]"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              {directsCount >= 2 ? "Qualified (100% Yield)" : "Need 2 Directs"}
            </span>
            {daoSeat && daoSeat >= 1 && daoSeat <= 100 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe] flex items-center gap-1">
                <Crown className="w-3 h-3 text-[#2563eb]" />
                <span>Council Seat #{daoSeat}</span>
              </span>
            )}
          </div>
          <h3 className="text-[15px] sm:text-[17px] font-black tracking-tight text-[#102341] mt-0.5">
            Invite Partners &amp; Grow Your Matrix
          </h3>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {isVaultSponsor ? (
            <div
              onClick={() => toast.copy(toTrobBase58(CONTRACT_ADDRESSES.vault), "Protocol Vault")}
              title="Click to copy Protocol Vault address"
              className="px-2.5 py-1 rounded-full bg-[#f8fafc] border border-[#e2e8f0] text-[11px] font-bold text-[#475569] flex items-center gap-1.5 cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <span>Upline:</span>
              <span className="font-mono font-extrabold text-[#2563eb]">
                Protocol Vault (Apex Root)
              </span>
            </div>
          ) : sponsorAddress && sponsorAddress !== "0x0000000000000000000000000000000000000000" ? (
            <div
              onClick={() => toast.copy(toTrobBase58(sponsorAddress), "Sponsor Address")}
              title="Click to copy Sponsor address"
              className="px-2.5 py-1 rounded-full bg-[#f8fafc] border border-[#e2e8f0] text-[11px] font-bold text-[#475569] flex items-center gap-1.5 cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <span>Upline:</span>
              <span className="font-mono font-extrabold text-[#102341]">
                {toTrobBase58(sponsorAddress).slice(0, 5)}...{toTrobBase58(sponsorAddress).slice(-4)}
              </span>
            </div>
          ) : null}

          <div className="px-2.5 py-1 rounded-full bg-[#e8fbf5] border border-[#c3f0e0] text-[11px] font-bold text-[#0e9f79]">
            Directs: <span className="font-extrabold text-[#0e9f79]">{directsCount}</span>
          </div>
        </div>
      </div>

      {/* Copy Link Input Bar (Always Directly Available) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-[#f4f8fd] border border-[#e7eef7] rounded-xl p-2 sm:p-1.5 sm:pl-3">
        <span className="text-[12px] font-mono font-semibold text-[#537094] truncate flex-1 select-all break-all sm:break-normal">
          {referralUrl}
        </span>
        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleCopyLink}
            className={`px-4 py-2 rounded-lg text-[12px] font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              copiedLink
                ? "bg-[#0e9f79] text-white shadow-xs"
                : "bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-xs"
            }`}
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Copied Link</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Referral Link</span>
              </>
            )}
          </button>
          {referralCode && (
            <button
              type="button"
              onClick={handleCopyCode}
              title="Copy 5-digit code only"
              className="px-3 py-2 rounded-lg text-[12px] font-bold bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition-all cursor-pointer flex items-center gap-1 shrink-0"
            >
              {copiedCode ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>Code: #{referralCode}</span>
            </button>
          )}
        </div>
      </div>

      {/* Footnote */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-[10.5px] text-[#657895] mt-2 px-0.5">
        <span>Share your personal link to register partners directly into your Level 1 &amp; Level 2 matrix.</span>
        <span className="text-[#657895] shrink-0">
          Sponsor:{" "}
          <span className="font-mono font-bold text-[#102341]">
            {isVaultSponsor ? `Protocol Vault (${formatAddress(toTrobBase58(CONTRACT_ADDRESSES.vault))})` : formatAddress(sponsorAddress || "")}
          </span>
        </span>
      </div>
    </div>
  );
}
