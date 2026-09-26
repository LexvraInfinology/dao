'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Copy, Check, ExternalLink, ArrowRight, Landmark, Loader2 } from 'lucide-react';
import type { ProfileData } from '@/hooks/useApi';
import { useWallet } from '@/context/WalletContext';

interface ProfileMemberCardProps {
  profile?: ProfileData | null;
  loading?: boolean;
}

export const ProfileMemberCard: React.FC<ProfileMemberCardProps> = ({ profile, loading }) => {
  const wallet   = useWallet();
  const [copied, setCopied] = useState(false);

  const displayAddr = wallet.base58Address ?? wallet.hexAddress ?? profile?.address ?? '—';
  const shortAddr   = displayAddr.length > 14
    ? `${displayAddr.slice(0, 8)}…${displayAddr.slice(-4)}`
    : displayAddr;

  const memberId  = profile?.userId  ? `#${profile.userId}`  : '—';
  const seatNum   = profile?.position ? `#${profile.position}` : '—';
  const isActive  = profile?.status === 'active';
  const joinedAt  = profile?.joinedAt
    ? new Date(profile.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';
  const nftId     = profile?.nftTokenId
    ? `#${String(profile.nftTokenId).padStart(4, '0')}`
    : '—';

  const handleCopy = () => {
    navigator.clipboard.writeText(displayAddr).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (loading && !profile) {
    return (
      <div className="rounded-3xl bg-white border border-[#E2ECF9] p-8 flex items-center justify-center gap-2 text-sm text-[#60739A] font-jakarta">
        <Loader2 className="w-4 h-4 animate-spin text-[#155EEF]" />Loading profile…
      </div>
    );
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:flex items-center justify-between gap-4 xl:gap-6 p-6 xl:p-8 rounded-3xl bg-white border border-[#E2ECF9] shadow-[0_4px_25px_rgba(15,23,42,0.03)]">
        <div className="flex items-center gap-5 min-w-0">
          <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-xs shrink-0 border border-[#BFDBFE]/60 bg-[#071A4A] relative">
            <img src="/dao/geometric avatar.png" alt="Member Avatar" className="w-full h-full object-cover" />
          </div>
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-black font-jakarta text-[#071A4A] tracking-tight">
                Member {memberId}
              </h2>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                isActive
                  ? 'bg-[#ECFDF5] border border-[#A7F3D0]/60 text-[#047857]'
                  : 'bg-slate-100 border border-slate-200 text-slate-500'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#10B981]' : 'bg-slate-400'}`} />
                {isActive ? 'Active Member' : (profile?.status ?? 'Unknown')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold font-jakarta text-[#155EEF] uppercase tracking-wider">SOVEREIGN ID:</span>
              <span className="px-2 py-0.5 rounded-md bg-[#EEF4FF] text-[#071A4A] font-mono font-bold text-xs">{nftId}</span>
            </div>
            <div className="flex items-center gap-3 pt-1 flex-wrap">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F0F5FF] border border-[#DCE7F6] text-xs font-mono font-semibold text-[#071A4A]">
                <div className="w-3.5 h-3.5 rounded-xs bg-[#155EEF] flex items-center justify-center text-white text-[8px]">⬡</div>
                <span>{shortAddr}</span>
                <button onClick={handleCopy} className="text-[#64748B] hover:text-[#155EEF] transition-colors ml-0.5" title="Copy address">
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <a href={`https://tronscan.io/#/address/${displayAddr}`} target="_blank" rel="noreferrer"
                className="text-xs font-bold font-jakarta text-[#155EEF] hover:underline flex items-center gap-1">
                <span>TrobiumScan</span><ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Council seat card */}
        <div className="bg-[#F8FAFC] border border-[#E2ECF9] rounded-2xl p-4 sm:p-5 w-72 xl:w-80 space-y-3 shrink-0 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold font-jakarta text-[#64748B] uppercase tracking-wider">COUNCIL SEAT</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#059669]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />Good Standing
            </span>
          </div>
          <div>
            <div className="text-xl font-black font-jakarta text-[#071A4A] tracking-tight">Seat {seatNum}</div>
            <div className="text-[10px] font-bold font-jakarta text-[#64748B] uppercase tracking-wider pt-0.5">
              {joinedAt !== '—' ? `CLAIMED: ${joinedAt}` : 'GENESIS COUNCIL'}
            </div>
          </div>
          <Link href="/dao/seats"
            className="w-full py-2.5 rounded-xl bg-[#155EEF] hover:bg-[#0052E6] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs">
            <span>View Seat</span><ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden bg-white border border-[#E2ECF9] rounded-2xl p-4 sm:p-5 shadow-[0_2px_10px_rgba(15,23,42,0.02)] space-y-4">
        <div className="flex flex-col items-center text-center space-y-2.5">
          <div className="relative">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#38BDF8] ring-4 ring-blue-50 shadow-xs bg-[#071A4A]">
              <img src="/dao/geometric avatar.png" alt="Member Avatar" className="w-full h-full object-cover scale-125" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#155EEF] border-2 border-white flex items-center justify-center text-white shadow-xs">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-xl font-black font-jakarta text-[#071A4A] tracking-tight">Member {memberId}</h2>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-[#E0F2FE] text-[#0284C7]' : 'bg-slate-100 text-slate-500'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#0284C7]' : 'bg-slate-400'}`} />
                {isActive ? 'Active' : (profile?.status ?? 'Unknown')}
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF4FF] text-xs font-mono font-semibold text-[#071A4A]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#155EEF]" />
              <span>{shortAddr}</span>
              <button onClick={handleCopy} className="text-[#64748B] hover:text-[#155EEF] transition-colors ml-0.5">
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-[#F8FAFC] border border-[#E2ECF9] rounded-2xl p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold font-jakarta text-[#64748B] uppercase tracking-wider">ASSIGNED POSITION</span>
            <span className="px-2 py-0.5 rounded-full bg-[#EEF2FE] text-[#4F46E5] text-[9px] font-bold">Tier 1 Genesis</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-[#E2ECF9] text-[#155EEF] flex items-center justify-center shrink-0 shadow-2xs">
              <Landmark className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold font-jakarta text-[#071A4A] truncate">Genesis Council Seat {seatNum}</div>
              <div className="text-[10px] text-[#64748B] font-jakarta truncate">Immutable Voting Key · Valid Epoch 2026–2028</div>
            </div>
          </div>
          <Link href="/dao/seats"
            className="w-full py-2.5 rounded-xl bg-[#155EEF] hover:bg-[#0052E6] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs">
            <span>View Seat</span><ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </>
  );
};
