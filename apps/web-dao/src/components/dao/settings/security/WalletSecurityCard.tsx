'use client';

import React, { useState } from 'react';
import { Wallet, Copy, Check, ExternalLink, ArrowRight } from 'lucide-react';

export default function WalletSecurityCard() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('0x8A3F4c19B8204eA367E3F45E2091F2');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* ================= DESKTOP VIEW (lg:block) ================= */}
      <div className="hidden lg:block rounded-3xl bg-white border border-[#E2ECF9] p-6 lg:p-7 shadow-[0_4px_25px_rgba(21,94,239,0.03)] font-jakarta space-y-4">
        {/* Header */}
        <div>
          <h3 className="text-lg font-bold text-[#071A4A]">
            Wallet Security
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Manage your connected wallet and access security.
          </p>
        </div>

        {/* Row Container */}
        <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition-colors hover:border-[#E2ECF9]">
          {/* Left Info */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#155EEF] shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-[#071A4A]">
                Connected Wallet
              </h4>
              <div className="flex items-center gap-1.5 mt-0.5 font-mono text-xs text-[#64748B]">
                <span>0x8A3F...91F2</span>
                <button
                  onClick={handleCopy}
                  className="text-[#64748B] hover:text-[#155EEF] transition-colors cursor-pointer"
                  title="Copy address"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                <a
                  href="https://trobium.network"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#64748B] hover:text-[#155EEF] transition-colors"
                  title="View on explorer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Action & Status */}
          <div className="flex flex-wrap items-center gap-2 xl:gap-3 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-2.5 xl:px-3 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]/60 text-[#059669] text-xs font-semibold shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
              <span>Connected</span>
            </span>

            <button
              onClick={() => alert('View wallet details')}
              className="px-2.5 xl:px-3.5 py-1.5 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] text-[#155EEF] hover:bg-blue-100/70 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
            >
              <span>View Wallet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <a
              href="https://trobium.network"
              target="_blank"
              rel="noreferrer"
              className="text-[#64748B] hover:text-[#155EEF] transition-colors p-1 shrink-0"
              title="Open wallet window"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* ================= MOBILE VIEW (lg:hidden) ================= */}
      <div className="lg:hidden rounded-2xl bg-white border border-[#E2ECF9] p-5 shadow-xs font-jakarta space-y-3.5">
        {/* Header */}
        <div>
          <h3 className="text-base font-bold text-[#071A4A]">
            Wallet Security
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Manage your connected wallet and access security.
          </p>
        </div>

        {/* Row Box */}
        <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#155EEF] shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#071A4A]">
                Connected Wallet
              </h4>
              <div className="flex items-center gap-1 mt-0.5 font-mono text-[11px] text-[#64748B]">
                <span>0x8A3F...91F2</span>
                <button
                  onClick={handleCopy}
                  className="text-[#64748B] hover:text-[#155EEF] transition-colors cursor-pointer"
                  title="Copy address"
                >
                  {copied ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]/50 text-[#059669] text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
            <span>Connected</span>
          </span>
        </div>

        {/* Bottom Link */}
        <div className="flex justify-end pt-1">
          <button
            onClick={() => alert('View wallet details')}
            className="text-xs font-bold text-[#155EEF] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View Wallet</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </>
  );
}
