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
  // STRICT RULE: User is ONLY qualified if active directs count >= 2
  const strictlyQualified = Boolean(isQualified || count >= 2);
  const progressPercent = strictlyQualified ? 100 : Math.min(100, Math.round((count / 2) * 100));

  const handleCopy = () => {
    if (!referralUrl) {
      toast.error("Referral Link", "Please connect your wallet first to copy your referral link.");
      return;
    }
    toast.copy(referralUrl, "Referral Link");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // If user is ALREADY qualified, hide this alert completely to keep the layout clean!
  if (strictlyQualified) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50/60 to-white border border-amber-300/90 p-3.5 sm:p-4 shadow-xs mb-3">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 mt-0.5 shadow-sm shadow-amber-500/20">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-950 border border-amber-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                Qualification Status: {count} / 2 Active Directs
              </span>
              <span className="text-[11px] font-bold text-amber-800">
                {needed} more active referral{needed > 1 ? "s" : ""} needed (2 Required)
              </span>
            </div>
            <h4 className="text-[13.5px] font-extrabold text-slate-900 mt-0.5">
              Complete 2 Direct Referrals with $30 Slot 1 Deposit
            </h4>
            <p className="text-[11.5px] text-slate-600 mt-0.5 leading-relaxed max-w-2xl">
              Per Equora Matrix protocol rules, matrix commission payouts require at least 2 active direct referrals. Until unlocked, tree commissions are automatically directed to the 4 Community Protocol Pools.
            </p>

            {/* Progress Bar */}
            <div className="mt-2.5 flex items-center gap-3 max-w-md">
              <div className="flex-1 h-1.5 bg-amber-100 rounded-full overflow-hidden border border-amber-200">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-[10.5px] font-mono font-bold text-amber-900">
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
              className={`px-3.5 py-1.5 rounded-xl text-[11.5px] font-bold transition-all cursor-pointer flex items-center gap-2 shadow-xs ${
                copied
                  ? "bg-emerald-600 text-white"
                  : "bg-amber-500 hover:bg-amber-600 text-slate-950 font-black"
              }`}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
