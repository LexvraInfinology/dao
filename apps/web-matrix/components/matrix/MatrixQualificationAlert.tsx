"use client";

import React, { useState } from "react";
import { toast } from "@/lib/toast";

export interface MatrixQualificationAlertProps {
  isQualified?: boolean;
  activeDirectsCount?: number;
  referralUrl?: string;
}

export function MatrixQualificationAlert({
  isQualified = false,
  activeDirectsCount = 0,
  referralUrl,
}: MatrixQualificationAlertProps) {
  const [copied, setCopied] = useState(false);
  const count = Math.max(0, activeDirectsCount);
  const needed = Math.max(0, 2 - count);
  const progressPercent = isQualified ? 100 : Math.min(100, Math.round((count / 2) * 100));

  const handleCopy = () => {
    if (!referralUrl) {
      toast.error("Referral Link", "Please connect your wallet first to copy your referral link.");
      return;
    }
    toast.copy(referralUrl, "Referral Link");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isQualified) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/70 to-white border border-emerald-300/80 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-600/20">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Matrix Qualified
                </span>
                <span className="text-[11.5px] font-bold text-emerald-800">
                  {count} Active Directs (≥2 Required)
                </span>
              </div>
              <h4 className="text-[14px] sm:text-[15px] font-extrabold text-emerald-950 mt-1">
                100% Personal Tree Commission Routing Active
              </h4>
              <p className="text-[12px] text-emerald-900/80 mt-0.5 leading-relaxed">
                Your direct qualifications are satisfied on-chain. All personal tree positions (P3, P6, P8, P9, P11, P12) settle directly into your balance.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-[12px] font-bold shadow-xs">
              ✓ Full Payouts Unlocked
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50/60 to-white border border-amber-300/90 p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 mt-0.5 shadow-sm shadow-amber-500/20">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-black uppercase tracking-wider bg-amber-100 text-amber-950 border border-amber-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                Qualification Status: {count} / 2 Active Directs
              </span>
              <span className="text-[11.5px] font-bold text-amber-800">
                {needed} more active referral{needed > 1 ? "s" : ""} needed
              </span>
            </div>
            <h4 className="text-[14px] sm:text-[15.5px] font-extrabold text-slate-900 mt-1">
              Complete 2 Direct Referrals with $30 Slot 1 Deposit
            </h4>
            <p className="text-[12px] text-slate-600 mt-0.5 leading-relaxed max-w-2xl">
              Per Equora Matrix protocol rules, matrix commission payouts require at least 2 active direct referrals. Until unlocked, tree commissions are automatically directed to the 4 Community Protocol Pools.
            </p>

            {/* Progress Bar */}
            <div className="mt-3 flex items-center gap-3 max-w-md">
              <div className="flex-1 h-2 bg-amber-100 rounded-full overflow-hidden border border-amber-200">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-[11px] font-mono font-bold text-amber-900">
                {progressPercent}% Completed
              </span>
            </div>
          </div>
        </div>

        {referralUrl && (
          <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
            <button
              type="button"
              onClick={handleCopy}
              className={`px-4 py-2 rounded-xl text-[12px] font-bold transition-all cursor-pointer flex items-center gap-2 shadow-xs ${
                copied
                  ? "bg-emerald-600 text-white"
                  : "bg-amber-500 hover:bg-amber-600 text-slate-950 font-black"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                {copied ? (
                  <path d="M20 6L9 17l-5-5" />
                ) : (
                  <>
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </>
                )}
              </svg>
              <span>{copied ? "Link Copied!" : "Invite Direct Referral"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
