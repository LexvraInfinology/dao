'use client';

import React, { useState } from 'react';
import { Wallet, Copy, Check, ExternalLink, Trash2 } from 'lucide-react';

export default function ConnectedWalletCard() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('0x8A3F4c19B8204eA367E3F45E2091F2');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDisconnect = () => {
    if (confirm('Disconnect wallet from this DAO portal?')) {
      alert('Wallet disconnected.');
    }
  };

  return (
    <>
      {/* ================= DESKTOP CONNECTED WALLET (lg:block) ================= */}
      <div className="hidden lg:block rounded-3xl bg-white border border-[#E2ECF9] p-6 lg:p-7 shadow-[0_4px_25px_rgba(21,94,239,0.03)] font-jakarta space-y-5">
        {/* Header */}
        <div>
          <h3 className="text-lg font-bold text-[#071A4A]">
            Connected Wallet
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Manage your connected wallet and wallet preferences.
          </p>
        </div>

        {/* Address Container Box */}
        <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-4 flex items-center justify-between transition-colors hover:border-[#E2ECF9]">
          {/* Left Info */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#155EEF] shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                WALLET ADDRESS
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 font-mono text-sm font-bold text-[#071A4A]">
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

          {/* Right Status */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]/60 text-[#059669] text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
            <span>Connected</span>
          </span>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={handleCopy}
            className="px-4 py-2.5 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] text-[#155EEF] hover:bg-blue-100/70 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>Copy Address</span>
          </button>

          <a
            href="https://trobium.network"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] text-[#155EEF] hover:bg-blue-100/70 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View on Explorer</span>
          </a>

          <button
            onClick={handleDisconnect}
            className="px-4 py-2.5 rounded-xl bg-[#FEE2E2]/60 border border-[#FECACA]/60 text-[#DC2626] hover:bg-red-100/70 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Disconnect Wallet</span>
          </button>
        </div>
      </div>

      {/* ================= MOBILE CONNECTED WALLET (lg:hidden) ================= */}
      <div className="lg:hidden rounded-2xl bg-white border border-[#E2ECF9] p-3.5 sm:p-5 shadow-xs font-jakarta space-y-3.5 sm:space-y-4">
        {/* Top Box */}
        <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-2.5 sm:p-3.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#155EEF] shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                WALLET ADDRESS
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 font-mono text-xs font-bold text-[#071A4A]">
                <span className="truncate">0x8A3F...91F2</span>
                <button
                  onClick={handleCopy}
                  className="text-[#64748B] hover:text-[#155EEF] transition-colors cursor-pointer shrink-0"
                  title="Copy address"
                >
                  {copied ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
                <a
                  href="https://trobium.network"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#64748B] hover:text-[#155EEF] transition-colors shrink-0"
                  title="View on explorer"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]/50 text-[#059669] text-[10px] sm:text-[11px] font-semibold shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
            <span>Connected</span>
          </span>
        </div>

        {/* Buttons: 2 side by side on sm+, stacked on xs, 1 full width */}
        <div className="space-y-2 sm:space-y-2.5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5">
            <button
              onClick={handleCopy}
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] text-[#155EEF] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>Copy Address</span>
            </button>

            <a
              href="https://trobium.network"
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] text-[#155EEF] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Explorer</span>
            </a>
          </div>

          <button
            onClick={handleDisconnect}
            className="w-full py-2.5 rounded-xl bg-[#FEE2E2]/70 border border-[#FECACA]/60 text-[#DC2626] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Disconnect Wallet</span>
          </button>
        </div>

        {/* Caption */}
        <div className="pt-2">
          <h4 className="text-sm font-bold text-[#071A4A]">
            Connected Wallet
          </h4>
          <p className="text-[11px] text-[#64748B] mt-0.5">
            Manage your connected wallet and wallet preferences.
          </p>
        </div>
      </div>
    </>
  );
}
