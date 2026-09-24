'use client';

import React, { useState } from 'react';
import { ExternalLink, Copy, Check, X, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';
import { CouncilSeatDetail } from '@/data/councilSeatsData';

interface SeatInspectorProps {
  seat: CouncilSeatDetail;
  onClose?: () => void;
  onMintSeat?: (seatNumber: number) => void;
}

export const SeatInspector: React.FC<SeatInspectorProps> = ({
  seat,
  onClose,
  onMintSeat,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(seat.ownerAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isMintable = seat.status === 'next' || seat.status === 'defaulted';

  return (
    <div className="rounded-3xl bg-white border border-[#E2ECF9] p-5 sm:p-6 lg:p-7 shadow-[0_4px_25px_rgba(15,23,42,0.03)] space-y-5">
      {/* Top Header Row (Desktop has SEAT INSPECTOR + X; Mobile has Seat # + Badges) */}
      <div className="hidden md:flex items-center justify-between pb-3 border-b border-slate-100">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] font-jakarta">
          SEAT INSPECTOR
        </span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-[#64748B] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Title Row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h3 className="text-xl font-bold font-jakarta text-[#071A4A]">
            Council Seat #{seat.seatNumber}
          </h3>
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
              seat.status === 'mine' || seat.status === 'claimed'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : seat.status === 'defaulted'
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : seat.status === 'next'
                ? 'bg-blue-50 text-[#155EEF] border-blue-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            {seat.statusBadge}
          </span>
        </div>

        <span className="md:hidden text-xs text-[#60739A] font-jakarta">
          Genesis Council
        </span>
      </div>

      {/* Soulbound NFT Card (Dark Navy Midnight Card from Figma) */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#071437] to-[#0D2057] p-4 text-white shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 shrink-0 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center p-2.5 backdrop-blur-sm">
            <img
              src="/dao/Futuristic 3D Crystalline Soulbound Asset graphic.png"
              alt="Soulbound NFT"
              className="w-full h-full object-contain animate-float"
            />
          </div>
          <div>
            <div className="text-xs font-medium text-blue-200/90 font-jakarta">
              Soulbound NFT
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white">
              {seat.soulboundId}
            </div>
          </div>
        </div>
      </div>

      {/* Metadata Detail Rows */}
      <div className="space-y-3.5 text-xs font-jakarta">
        {/* Owner Address */}
        <div className="flex items-center justify-between">
          <span className="text-[#60739A]">Owner Address</span>
          <div className="flex items-center gap-1.5 font-mono font-bold text-[#071A4A]">
            <span>{seat.ownerAddress}</span>
            <button
              type="button"
              onClick={handleCopyAddress}
              className="p-1 hover:bg-slate-100 rounded text-[#60739A] hover:text-[#155EEF] transition-colors"
              title="Copy Address"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Lifetime Earnings */}
        <div className="flex items-center justify-between">
          <span className="text-[#60739A]">Lifetime Earnings</span>
          <span className="text-sm font-black font-jakarta text-[#071A4A]">
            {seat.lifetimeEarnings}
          </span>
        </div>

        {/* 5X Cap Progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[#60739A]">5X Cap Progress</span>
            <span className="font-bold text-[#071A4A]">{seat.capProgress}%</span>
          </div>
          <div className="w-full bg-[#E2ECF9] rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-[#12B76A] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, seat.capProgress)}%` }}
            />
          </div>
        </div>

        {/* Voting Power */}
        <div className="flex items-center justify-between">
          <span className="text-[#60739A]">Voting Power</span>
          <div className="text-right">
            <div className="font-bold text-sm text-[#071A4A]">{seat.votingPower}</div>
            <div className="text-[10px] text-[#60739A]">(1 Seat = 1 Vote)</div>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[#60739A]">Status</span>
          <div className="flex items-center gap-1.5 font-semibold text-[#071A4A]">
            <span
              className={`w-2 h-2 rounded-full ${
                seat.status === 'mine' || seat.status === 'claimed'
                  ? 'bg-emerald-500'
                  : seat.status === 'defaulted'
                  ? 'bg-rose-500'
                  : seat.status === 'next'
                  ? 'bg-[#155EEF] animate-pulse'
                  : 'bg-slate-400'
              }`}
            />
            <span>{seat.statusText}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 space-y-2.5">
        {isMintable && onMintSeat ? (
          <button
            type="button"
            onClick={() => onMintSeat(seat.seatNumber)}
            className="w-full py-3 rounded-xl bg-[#155EEF] hover:bg-[#0052E6] text-white text-xs sm:text-sm font-bold shadow-[0_4px_16px_rgba(21,94,239,0.35)] transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Claim Seat #{seat.seatNumber} (300 TROB)</span>
          </button>
        ) : null}

        {/* View on Explorer Button */}
        <a
          href="https://explorer.equora.fi"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 rounded-xl bg-[#EEF4FF] hover:bg-[#E0EAFF] border border-[#BFDBFE] text-[#155EEF] text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2"
        >
          <span>View on Explorer</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        {/* View Member Profile Button */}
        <a
          href="/dao/profile"
          className="w-full py-3 rounded-xl bg-[#155EEF] hover:bg-[#0052E6] text-white text-xs sm:text-sm font-bold shadow-[0_4px_14px_rgba(21,94,239,0.25)] transition-all flex items-center justify-center gap-2"
        >
          <span>View Member Profile</span>
        </a>
      </div>
    </div>
  );
};
