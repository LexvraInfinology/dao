'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Box, LayoutGrid, Copy, Check, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import type { ProfileData } from '@/hooks/useApi';
import { useWallet } from '@/context/WalletContext';

interface ProfileDaoDetailsProps {
  profile?: ProfileData | null;
}

export const ProfileDaoDetails: React.FC<ProfileDaoDetailsProps> = ({ profile }) => {
  const wallet  = useWallet();
  const [copied, setCopied] = useState(false);

  const displayAddr = wallet.base58Address ?? wallet.hexAddress ?? profile?.address ?? '—';
  const shortAddr   = displayAddr.length > 14
    ? `${displayAddr.slice(0, 8)}…${displayAddr.slice(-4)}`
    : displayAddr;

  const handleCopy = () => {
    navigator.clipboard.writeText(displayAddr).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const memberId  = profile?.userId    ? `#${profile.userId}`    : '—';
  const seatNum   = profile?.position  ? `#${profile.position}`  : '—';
  const nftId     = profile?.nftTokenId ? `#${String(profile.nftTokenId).padStart(4, '0')}` : '—';
  const joinedAt  = profile?.joinedAt
    ? new Date(profile.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';

  const rows = [
    { label: 'Member ID',        value: memberId },
    { label: 'Connected Wallet', value: shortAddr, copyable: true },
    { label: 'Voting Power',     value: '1.0%  (Genesis Tier)' },
    { label: 'Member Since',     value: joinedAt },
  ];

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:block bg-white border border-[#E2ECF9] rounded-3xl p-6 sm:p-8 shadow-[0_4px_25px_rgba(15,23,42,0.03)] space-y-4">
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#EEF2FE] text-[#155EEF] flex items-center justify-center shrink-0">
              <Box className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold font-jakarta text-[#071A4A]">DAO Details</h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-md bg-[#EEF2FE] text-[#155EEF] text-[10px] font-bold font-mono uppercase tracking-wider">IMMUTABLE RECORD</span>
        </div>

        <div className="space-y-0 text-xs font-jakarta divide-y divide-[#F8FAFC]">
          {rows.map(({ label, value, copyable }) => (
            <div key={label} className="py-3 flex items-center justify-between">
              <span className="text-[#64748B] font-medium">{label}</span>
              {copyable ? (
                <div className="flex items-center gap-1.5 font-mono font-semibold text-[#071A4A]">
                  <span>{value}</span>
                  <button onClick={handleCopy} className="text-[#64748B] hover:text-[#155EEF] transition-colors" title="Copy">
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              ) : (
                <span className="font-bold text-[#071A4A]">{value}</span>
              )}
            </div>
          ))}

          {/* Council Seat — link */}
          <div className="py-3 flex items-center justify-between">
            <span className="text-[#64748B] font-medium text-xs">Council Seat</span>
            <Link href="/dao/seats" className="font-bold text-[#155EEF] hover:underline flex items-center gap-1 text-xs">
              <span>Seat {seatNum}</span><ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Soulbound NFT */}
          <div className="py-3 flex items-center justify-between">
            <span className="text-[#64748B] font-medium text-xs">Soulbound NFT</span>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EEF2FE] text-[#155EEF] font-bold text-xs font-mono">
              <Lock className="w-3 h-3" /><span>{nftId}</span>
            </div>
          </div>
        </div>

        {/* Badge pool cards */}
        {profile?.poolCards && profile.poolCards.length > 0 && (
          <div className="pt-2 flex flex-wrap gap-2">
            {profile.poolCards.map((c) => (
              <span key={c.tier} className="px-2.5 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]/60 text-[10px] font-bold text-[#047857]">
                {c.tierName} Pool
              </span>
            ))}
          </div>
        )}

        <div className="p-3.5 rounded-2xl bg-[#F0F5FF] border border-[#DCE7F6]/60 flex items-start gap-2.5 mt-4">
          <ShieldCheck className="w-4 h-4 text-[#155EEF] shrink-0 mt-0.5" />
          <p className="text-xs text-[#4F6184] font-jakarta leading-relaxed">
            Non-transferable Soulbound governance parameters secured by Trobium Core consensus.
          </p>
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden bg-white border border-[#E2ECF9] rounded-2xl p-4 shadow-[0_2px_10px_rgba(15,23,42,0.02)] space-y-3">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-[#155EEF]" />
            <h3 className="text-sm font-bold font-jakarta text-[#071A4A]">DAO Details</h3>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-[#EEF2FE] text-[#155EEF] text-[9px] font-bold uppercase tracking-wider font-mono">CANONICAL</span>
        </div>

        <div className="space-y-1 text-xs font-jakarta">
          {[
            { label: 'Member ID',  value: memberId,  shade: true },
            { label: 'Seat',       value: seatNum,   shade: false },
            { label: 'Wallet',     value: shortAddr, shade: true, mono: true },
            { label: 'Voting',     value: '1.0% (1 Vote)', shade: false },
            { label: 'Joined',     value: joinedAt,  shade: true },
            { label: 'SBT',        value: nftId,     shade: false, icon: true },
          ].map(({ label, value, shade, mono, icon }) => (
            <div key={label} className={`px-3 py-2.5 flex items-center justify-between ${shade ? 'bg-[#F0F4FC] rounded-xl' : ''}`}>
              <span className="text-[#64748B] font-medium">{label}</span>
              {icon
                ? <div className="flex items-center gap-1 font-mono font-bold text-[#071A4A]"><Lock className="w-3 h-3 text-[#155EEF]" /><span>{value}</span></div>
                : <span className={`font-bold text-[#071A4A] ${mono ? 'font-mono' : ''}`}>{value}</span>
              }
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
