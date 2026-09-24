'use client';

import React, { useState } from 'react';
import {
  User,
  Users,
  Wallet,
  ShieldCheck,
  Box,
  Pen,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';

export default function AccountInformationCard() {
  const [copied, setCopied] = useState(false);

  const handleCopyWallet = () => {
    navigator.clipboard.writeText('0x8A3F4c19B8204eA367E3F45E2091F2');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* ================= DESKTOP ACCOUNT INFORMATION (lg:block) ================= */}
      <div className="hidden lg:flex flex-col justify-between h-full rounded-3xl bg-white border border-[#E2ECF9] p-7 shadow-[0_4px_25px_rgba(21,94,239,0.03)] font-jakarta">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-bold text-[#071A4A]">
              Account Information
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Your Genesis DAO identity details.
            </p>
          </div>

          <button
            onClick={() => alert('Edit profile details')}
            className="px-3.5 py-1.5 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] text-[#155EEF] hover:bg-blue-100/70 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Pen className="w-3.5 h-3.5 text-[#155EEF]" />
            <span>Edit</span>
          </button>
        </div>

        {/* 5 Rows */}
        <div className="space-y-3.5 flex-1 flex flex-col justify-between">
          {/* 1. Member ID */}
          <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl px-5 py-4 flex items-center justify-between transition-colors hover:border-[#E2ECF9]">
            <div className="flex items-center gap-3">
              <User className="w-[18px] h-[18px] text-[#155EEF]" />
              <span className="text-sm font-medium text-[#475569]">Member ID</span>
            </div>
            <span className="text-sm font-bold text-[#071A4A]">#1042</span>
          </div>

          {/* 2. Council Seat */}
          <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl px-5 py-4 flex items-center justify-between transition-colors hover:border-[#E2ECF9]">
            <div className="flex items-center gap-3">
              <Users className="w-[18px] h-[18px] text-[#155EEF]" />
              <span className="text-sm font-medium text-[#475569]">Council Seat</span>
            </div>
            <span className="text-sm font-bold text-[#071A4A]">#86</span>
          </div>

          {/* 3. Connected Wallet */}
          <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl px-5 py-4 flex items-center justify-between transition-colors hover:border-[#E2ECF9]">
            <div className="flex items-center gap-3">
              <Wallet className="w-[18px] h-[18px] text-[#155EEF]" />
              <span className="text-sm font-medium text-[#475569]">Connected Wallet</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#071A4A]">
                0x8A3F...91F2
              </span>
              <button
                onClick={handleCopyWallet}
                className="text-[#64748B] hover:text-[#155EEF] transition-colors cursor-pointer"
                title="Copy wallet address"
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

          {/* 4. Member Since */}
          <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl px-5 py-4 flex items-center justify-between transition-colors hover:border-[#E2ECF9]">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-[18px] h-[18px] text-[#155EEF]" />
              <span className="text-sm font-medium text-[#475569]">Member Since</span>
            </div>
            <span className="text-xs font-medium text-[#071A4A]">Aug 12, 2026</span>
          </div>

          {/* 5. Soulbound NFT */}
          <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl px-5 py-4 flex items-center justify-between transition-colors hover:border-[#E2ECF9]">
            <div className="flex items-center gap-3">
              <Box className="w-[18px] h-[18px] text-[#155EEF]" />
              <span className="text-sm font-medium text-[#475569]">Soulbound NFT</span>
            </div>
            <span className="text-xs font-bold text-[#071A4A]">#0086</span>
          </div>
        </div>
      </div>

      {/* ================= MOBILE ACCOUNT INFORMATION (lg:hidden) ================= */}
      <div className="lg:hidden rounded-2xl bg-white border border-[#E2ECF9] p-5 shadow-[0_2px_15px_rgba(21,94,239,0.02)] font-jakarta">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#071A4A]">
              Account Information
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Your Genesis DAO identity details.
            </p>
          </div>

          <button
            onClick={() => alert('Edit profile details')}
            className="px-3 py-1.5 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] text-[#155EEF] hover:bg-blue-100/70 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Pen className="w-3.5 h-3.5 text-[#155EEF]" />
            <span>Edit</span>
          </button>
        </div>

        {/* Divider */}
        <div className="border-t border-[#F1F5F9] my-4" />

        {/* 5 Rows with spacious layout matching mobile design */}
        <div className="space-y-4">
          {/* 1. Member ID */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-[#155EEF]" />
              <span className="text-xs font-medium text-[#475569]">Member ID</span>
            </div>
            <span className="text-sm font-bold text-[#071A4A]">#1042</span>
          </div>

          {/* 2. Council Seat */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-[#155EEF]" />
              <span className="text-xs font-medium text-[#475569]">Council Seat</span>
            </div>
            <span className="text-sm font-bold text-[#155EEF]">#86</span>
          </div>

          {/* 3. Connected Wallet */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wallet className="w-4 h-4 text-[#155EEF]" />
              <span className="text-xs font-medium text-[#475569]">Connected Wallet</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono font-bold text-[#071A4A]">
                0x8A3F...91F2
              </span>
              <button
                onClick={handleCopyWallet}
                className="text-[#64748B] hover:text-[#155EEF] transition-colors cursor-pointer"
                title="Copy address"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* 4. Member Since */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-[#155EEF]" />
              <span className="text-xs font-medium text-[#475569]">Member Since</span>
            </div>
            <span className="text-xs font-medium text-[#071A4A]">Aug 12, 2026</span>
          </div>

          {/* 5. Soulbound NFT */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Box className="w-4 h-4 text-[#155EEF]" />
              <span className="text-xs font-medium text-[#475569]">Soulbound NFT</span>
            </div>
            <span className="text-xs font-bold text-[#071A4A]">#0086</span>
          </div>
        </div>
      </div>
    </>
  );
}
