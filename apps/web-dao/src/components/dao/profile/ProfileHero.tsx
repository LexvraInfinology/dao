'use client';

import React from 'react';
import type { ProfileData } from '@/hooks/useApi';

interface ProfileHeroProps {
  profile?: ProfileData | null;
  loading?: boolean;
}

export const ProfileHero: React.FC<ProfileHeroProps> = ({ profile, loading }) => {
  const chainId   = process.env.NEXT_PUBLIC_CHAIN_ID ?? '8812';
  const chainName = chainId === '8812' ? 'TROBIUM L1' : `Chain ${chainId}`;

  return (
    <div className="relative rounded-3xl overflow-hidden bg-white border border-[#E2ECF9] shadow-[0_4px_25px_rgba(15,23,42,0.03)]">
      <div className="ambient-glow top-0 right-1/4 w-96 h-96 bg-blue-400/10 pointer-events-none" />

      {/* Desktop */}
      <div className="hidden lg:flex items-center justify-between p-8 lg:p-10 relative z-10 min-h-[160px]">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#155EEF]" />
            <span className="text-[11px] font-bold font-jakarta text-[#155EEF] uppercase tracking-wider">
              PROFILE • ON-CHAIN IDENTIFIER
            </span>
            {loading && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#155EEF] animate-pulse ml-1" />
            )}
          </div>
          <h1 className="text-3xl xl:text-4xl font-black font-jakarta text-[#071A4A] tracking-tight">
            DAO Member Profile
          </h1>
          <p className="text-xs sm:text-sm text-[#4F6184] leading-relaxed font-jakarta max-w-md pt-0.5">
            Your Genesis DAO identity, seat, and cryptographic on-chain status.
          </p>
          {profile?.isMember && (
            <div className="flex items-center gap-2 pt-1 text-xs font-jakarta flex-wrap">
              {profile.userId && (
                <span className="px-2 py-0.5 rounded-md bg-[#EEF4FF] text-[#155EEF] font-mono font-bold">
                  User #{profile.userId}
                </span>
              )}
              {profile.position && (
                <span className="text-[#60739A]">· Seat #{profile.position}</span>
              )}
              {profile.highestMatrixSlot > 0 && (
                <span className="text-[#60739A]">· Matrix Slot {profile.highestMatrixSlot}</span>
              )}
            </div>
          )}
        </div>

        {/* Right consensus card */}
        <div className="flex items-center gap-4 bg-white/80 backdrop-blur-xs p-3.5 pr-6 rounded-2xl border border-[#E2ECF9] shadow-xs shrink-0">
          <div className="w-12 h-12 rounded-xl overflow-hidden shadow-xs border border-[#BFDBFE]/60 shrink-0 bg-[#EFF6FF]">
            <img src="/dao/Profile_Consensus_Mini.png" alt="Consensus Ledger" className="w-full h-full object-cover" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold font-jakarta text-[#64748B] uppercase tracking-wider">
              <span>CONSENSUS STATE</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            </div>
            <div className="text-base font-black font-jakarta text-[#071A4A] tracking-tight">{chainName}</div>
            <div className="text-[11px] font-bold font-jakarta text-[#155EEF]">
              {profile?.registrationTimestamp
                ? `Registered · Finalized`
                : 'Epoch 184 · Finalized'}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden flex items-center justify-between p-5 sm:p-6 gap-4 relative z-10">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#EEF5FF] border border-[#BFDBFE]/60">
            <span className="text-[10px] font-bold font-jakarta text-[#155EEF] uppercase tracking-wider">PROFILE</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black font-jakarta tracking-tight leading-tight">
            <span className="text-[#071A4A] block">Your Seat.</span>
            <span className="text-[#155EEF] block">A Bigger Tomorrow.</span>
          </h1>
          <p className="text-xs text-[#4F6184] leading-relaxed font-jakarta">
            Manage your profile and DAO activity.
          </p>
        </div>
        <div className="relative w-20 h-24 shrink-0 flex items-center justify-center">
          <div className="absolute inset-1 rounded-full bg-blue-400/20 blur-xl pointer-events-none" />
          <div className="relative w-16 h-20 animate-float">
            <img src="/dao/Profile_Mobile_Crystal.png" alt="Profile Crystal"
              className="w-full h-full object-contain" />
          </div>
        </div>
      </div>
    </div>
  );
};
