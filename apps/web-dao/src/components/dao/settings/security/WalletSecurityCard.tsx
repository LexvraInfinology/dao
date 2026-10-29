'use client';

import React, { useState } from 'react';
import { Wallet, Copy, Check, ExternalLink, ArrowRight, ShieldCheck } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { getExplorerAddressUrl } from '@/utils/explorer';

export default function WalletSecurityCard() {
  const wallet = useWallet();
  const [copied, setCopied] = useState(false);

  // Use real wallet address — prefer base58 (Trobium), fallback to hex
  const activeAddress = wallet.base58Address ?? wallet.hexAddress ?? '';
  const shortAddress = activeAddress.length > 14
    ? `${activeAddress.slice(0, 8)}…${activeAddress.slice(-6)}`
    : activeAddress || '—';

  const explorerUrl = getExplorerAddressUrl(wallet.base58Address || wallet.hexAddress);
  const isConnected = Boolean(wallet.isConnected || activeAddress);

  const handleCopy = () => {
    if (!activeAddress) return;
    navigator.clipboard.writeText(activeAddress).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-3xl bg-white border border-[#E2ECF9] p-5 sm:p-6 lg:p-7 shadow-[0_4px_25px_rgba(21,94,239,0.03)] font-jakarta flex flex-col justify-between space-y-4 h-full">
      {/* Header */}
      <div>
        <h3 className="text-base sm:text-lg font-bold text-[#071A4A]">
          Wallet Security
        </h3>
        <p className="text-xs text-[#64748B] mt-0.5">
          Manage your connected wallet and access security.
        </p>
      </div>

      {/* Row Container */}
      <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors hover:border-[#E2ECF9]">
        {/* Left Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#155EEF] shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-[#071A4A] truncate">
              {wallet.base58Address ? 'TrobSafe Address' : 'Connected Wallet'}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5 font-mono text-xs text-[#64748B]">
              <span className="whitespace-nowrap font-medium text-[#071A4A]">{shortAddress}</span>
              {activeAddress && (
                <>
                  <button
                    onClick={handleCopy}
                    className="text-[#64748B] hover:text-[#155EEF] transition-colors cursor-pointer p-0.5"
                    title="Copy address"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#64748B] hover:text-[#155EEF] transition-colors p-0.5"
                    title="View on explorer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Action & Status */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-start sm:self-auto flex-wrap">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${
              isConnected
                ? 'bg-[#ECFDF5] border border-[#A7F3D0]/60 text-[#059669]'
                : 'bg-slate-100 border border-slate-200 text-slate-500'
            }`}
          >
            {isConnected ? (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#059669]" />
              </span>
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            )}
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </span>

          {isConnected ? (
            <a
              href={explorerUrl}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] text-[#155EEF] hover:bg-blue-100/70 text-xs font-semibold flex items-center gap-1 transition-colors shrink-0 whitespace-nowrap"
            >
              <span>View Explorer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          ) : (
            <button
              onClick={() => wallet.connect().catch(() => {})}
              className="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] text-[#155EEF] hover:bg-blue-100/70 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 whitespace-nowrap cursor-pointer"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Connect</span>
            </button>
          )}
        </div>
      </div>

      {/* Security note / verification footer */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] w-fit text-[#155EEF]">
        <ShieldCheck className="w-3.5 h-3.5 text-[#155EEF] shrink-0" />
        <span className="text-[11px] sm:text-xs font-semibold text-[#155EEF]">
          Trobium Native Network · Soulbound Verified
        </span>
      </div>
    </div>
  );
}
