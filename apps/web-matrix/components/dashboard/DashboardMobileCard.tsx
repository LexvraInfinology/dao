"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useUserStore, useMatrixStore } from "@/lib/stores";
import { toTrobBase58 } from "@/lib/format";
import { Copy, Check, Share2, ShieldCheck } from "lucide-react";
import { toast } from "@/lib/toast";

export function DashboardMobileCard() {
  const address = useUserStore((s) => s.address);
  const profile = useUserStore((s) => s.profile);
  const dashboard = useMatrixStore((s) => s.dashboard);
  const [copied, setCopied] = useState(false);

  const base58 = address ? toTrobBase58(address) : "";
  const referralUrl = typeof window !== "undefined" && base58
    ? `${window.location.origin}/?ref=${base58}`
    : `https://equorafi.com/?ref=${base58 || "..."}`;

  const handleCopy = () => {
    if (!referralUrl) return;
    navigator.clipboard?.writeText(referralUrl);
    setCopied(true);
    toast.copy(referralUrl, "Referral Link");
    setTimeout(() => setCopied(false), 2000);
  };

  const filledNodes = dashboard?.activeSlotProgress?.filledNodes ?? 0;
  const directsCount = profile?.directReferralsCount ?? 0;

  return (
    <div className="mt-4 lg:hidden">
      <div className="rounded-xl overflow-hidden bg-gradient-to-r from-[#172554] via-[#1e3a8a] to-[#0f172a] p-3.5 border border-[#3b82f6]/30 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-blue-600/60 border border-blue-400/40 flex items-center justify-center shrink-0">
              <Share2 className="w-3.5 h-3.5 text-blue-200" />
            </div>
            <span className="text-[12px] font-black text-white tracking-wide truncate">Personal Invite Link</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[9.5px] font-bold shrink-0 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            On-Chain
          </span>
        </div>

        <p className="text-[11px] text-slate-300 leading-tight mb-2.5">
          Share your link to place direct downlines in Slot 1 and unlock matrix rewards.
        </p>

        {/* Copy Referral Box */}
        <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-lg p-1.5 mb-2.5">
          <input
            type="text"
            readOnly
            value={referralUrl}
            className="bg-transparent text-[10.5px] font-mono text-slate-200 flex-1 min-w-0 px-1 focus:outline-none select-all truncate"
          />
          <button
            type="button"
            onClick={handleCopy}
            className="px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-[11px] font-bold flex items-center gap-1 shrink-0 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>

        {/* Quick Compact Status Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] text-slate-300">
          <span>Direct Referrals: <strong className="text-white font-black">{directsCount}</strong></span>
          <span>Slot 1 Board: <strong className="text-emerald-400 font-black">{filledNodes} / 14 Filled</strong></span>
        </div>
      </div>
    </div>
  );
}
