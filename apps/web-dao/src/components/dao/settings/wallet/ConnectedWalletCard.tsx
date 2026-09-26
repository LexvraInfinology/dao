'use client';

import React, { useState } from 'react';
import { Wallet, Copy, Check, ExternalLink, LogOut, ShieldCheck } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { useAuthContext } from '@/context/AuthContext';

export default function ConnectedWalletCard() {
  const wallet = useWallet();
  const auth   = useAuthContext();
  const [copied, setCopied] = useState(false);

  // Prefer base58 (Trobium native), fallback to hex
  const displayAddress = wallet.base58Address ?? wallet.hexAddress ?? '—';
  const shortAddress   = displayAddress.length > 14
    ? `${displayAddress.slice(0, 8)}…${displayAddress.slice(-6)}`
    : displayAddress;

  const handleCopy = () => {
    if (!displayAddress || displayAddress === '—') return;
    navigator.clipboard.writeText(displayAddress).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDisconnect = () => {
    auth.signOut();
    wallet.disconnect();
  };

  const explorerUrl = wallet.base58Address
    ? `https://tronscan.io/#/address/${wallet.base58Address}`
    : wallet.hexAddress
    ? `https://tronscan.io/#/address/${wallet.hexAddress}`
    : 'https://tronscan.io';

  const isConnected = wallet.isConnected;

  const AddressRow = ({ mono = true }: { mono?: boolean }) => (
    <div className={`flex items-center gap-1.5 mt-0.5 ${mono ? 'font-mono text-sm font-bold' : 'font-mono text-xs font-bold'} text-[#071A4A]`}>
      <span>{shortAddress}</span>
      <button onClick={handleCopy} className="text-[#64748B] hover:text-[#155EEF] transition-colors" title="Copy address">
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
      <a href={explorerUrl} target="_blank" rel="noreferrer" className="text-[#64748B] hover:text-[#155EEF] transition-colors">
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  );

  return (
    <>
      {/* ── Desktop ───────────────────────────────────────────────── */}
      <div className="hidden lg:block rounded-3xl bg-white border border-[#E2ECF9] p-6 lg:p-7 shadow-[0_4px_25px_rgba(21,94,239,0.03)] font-jakarta space-y-5">
        <div>
          <h3 className="text-lg font-bold text-[#071A4A]">Connected Wallet</h3>
          <p className="text-xs text-[#64748B] mt-0.5">Your TrobSafe wallet — manages all on-chain interactions.</p>
        </div>

        {/* Wallet type badge */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] w-fit">
          <ShieldCheck className="w-4 h-4 text-[#155EEF]" />
          <span className="text-xs font-semibold text-[#155EEF]">TrobSafe Wallet</span>
        </div>

        {/* Address box */}
        <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-4 flex items-center justify-between hover:border-[#E2ECF9] transition-colors">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#155EEF] shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                {wallet.base58Address ? 'TROBIUM ADDRESS' : 'WALLET ADDRESS'}
              </div>
              <AddressRow />
            </div>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            isConnected
              ? 'bg-[#ECFDF5] border border-[#A7F3D0]/60 text-[#059669]'
              : 'bg-slate-100 border border-slate-200 text-slate-500'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-[#059669]' : 'bg-slate-400'}`} />
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {/* Auth info row */}
        {auth.user && (
          <div className="px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#F1F5F9] text-xs text-[#64748B] font-jakarta flex items-center justify-between">
            <span>Session JWT</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <Check className="w-3 h-3" /> Authenticated
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button onClick={handleCopy}
            className="px-4 py-2.5 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] text-[#155EEF] hover:bg-blue-100/70 text-xs font-semibold flex items-center gap-1.5 transition-colors">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            Copy Address
          </button>
          <a href={explorerUrl} target="_blank" rel="noreferrer"
            className="px-4 py-2.5 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] text-[#155EEF] hover:bg-blue-100/70 text-xs font-semibold flex items-center gap-1.5 transition-colors">
            <ExternalLink className="w-3.5 h-3.5" />
            View on Explorer
          </a>
          {isConnected && (
            <button onClick={handleDisconnect}
              className="px-4 py-2.5 rounded-xl bg-[#FEE2E2]/60 border border-[#FECACA]/60 text-[#DC2626] hover:bg-red-100/70 text-xs font-semibold flex items-center gap-1.5 transition-colors">
              <LogOut className="w-3.5 h-3.5" />
              Disconnect Wallet
            </button>
          )}
        </div>
      </div>

      {/* ── Mobile ────────────────────────────────────────────────── */}
      <div className="lg:hidden rounded-2xl bg-white border border-[#E2ECF9] p-3.5 sm:p-5 shadow-xs font-jakarta space-y-3.5 sm:space-y-4">
        <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-2.5 sm:p-3.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#155EEF] shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">TrobSafe</div>
              <AddressRow mono={false} />
            </div>
          </div>
          <span className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold shrink-0 ${
            isConnected ? 'bg-[#ECFDF5] border border-[#A7F3D0]/50 text-[#059669]' : 'bg-slate-100 border border-slate-200 text-slate-500'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-[#059669]' : 'bg-slate-400'}`} />
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        <div className="space-y-2 sm:space-y-2.5">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2.5">
            <button onClick={handleCopy} className="flex-1 py-2.5 px-3 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] text-[#155EEF] text-xs font-semibold flex items-center justify-center gap-1.5">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              Copy Address
            </button>
            <a href={explorerUrl} target="_blank" rel="noreferrer" className="flex-1 py-2.5 px-3 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] text-[#155EEF] text-xs font-semibold flex items-center justify-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5" />
              View Explorer
            </a>
          </div>
          {isConnected && (
            <button onClick={handleDisconnect} className="w-full py-2.5 rounded-xl bg-[#FEE2E2]/70 border border-[#FECACA]/60 text-[#DC2626] text-xs font-semibold flex items-center justify-center gap-1.5">
              <LogOut className="w-3.5 h-3.5" />
              Disconnect Wallet
            </button>
          )}
        </div>

        <div className="pt-1">
          <h4 className="text-sm font-bold text-[#071A4A]">TrobSafe Wallet</h4>
          <p className="text-[11px] text-[#64748B] mt-0.5">Secure · Trobium Native · Soulbound verified.</p>
        </div>
      </div>
    </>
  );
}
