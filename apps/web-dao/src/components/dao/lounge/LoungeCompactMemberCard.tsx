'use client';

import React from 'react';
import { User } from 'lucide-react';
import type { LoungeData } from '@/hooks/useApi';

interface LoungeCompactMemberCardProps {
  loungeData?: LoungeData | null;
}

export const LoungeCompactMemberCard: React.FC<LoungeCompactMemberCardProps> = ({ loungeData }) => {
  const seatNumber = loungeData?.soulboundPass?.seatNumber ?? loungeData?.position ?? 12;
  const memberId   = loungeData?.soulboundPass?.memberId   ?? '#0012';
  const joinedAt   = loungeData?.soulboundPass?.joinedAt
    ? new Date(loungeData.soulboundPass.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Jan 2025';
  const status     = loungeData?.status ?? 'active';
  const isActive   = status === 'active';

  return (
    <div className="bg-white border border-[#E2ECF9] rounded-2xl p-4 shadow-[0_2px_10px_rgba(15,23,42,0.02)] flex items-center justify-between gap-3">
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE]/40 flex items-center justify-center text-[#155EEF] shrink-0">
          <User className="w-5 h-5" />
        </div>
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg font-black font-jakarta text-[#071A4A] tracking-tight">
              #{String(seatNumber).padStart(4, '0')}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[#F1F5F9] text-[10px] font-semibold text-[#60739A]">
              Soulbound NFT
            </span>
          </div>
          <div className="text-[10px] sm:text-[11px] text-[#60739A] font-medium flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
            <span>1.0% Voting Power</span>
            <span className="w-1 h-1 rounded-full bg-[#CBD5E1]" />
            <span>Since {joinedAt}</span>
          </div>
        </div>
      </div>

      <div className="shrink-0">
        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-2xs ${
          isActive
            ? 'bg-[#ECFDF5] border border-[#A7F3D0]/60 text-[#059669]'
            : 'bg-slate-100 border border-slate-200 text-slate-500'
        }`}>
          {isActive ? 'Active' : status}
        </span>
      </div>
    </div>
  );
};
