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
    <div className="rounded-2xl bg-white border border-[#E2EEF9] p-4 sm:p-5 shadow-[0_2px_12px_rgba(14,98,228,0.06)] space-y-4 font-sans">
      {/* Top Header Row (Desktop has SEAT INSPECTOR + X; Mobile has Seat # + Badges) */}
      <div className="hidden md:flex items-center justify-between pb-2.5 border-b border-[#E2EEF9]">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#4F6D87]">
          SEAT INSPECTOR
        </span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-[#4F6D87] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Title Row */}
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <h3 className="text-base sm:text-lg font-bold text-[#14304A]">
            Council Seat #{seat.seatNumber}
          </h3>
          <span
            className={`text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full border ${
              seat.status === 'mine'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                : seat.status === 'claimed'
                ? 'bg-slate-100 text-slate-800 border-slate-300 font-bold'
                : seat.status === 'defaulted'
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : seat.status === 'next'
                ? 'bg-[#EFF6FF] text-[#0E62E4] border-[#0E62E4]/30 font-bold'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            {seat.status === 'mine' ? 'Your Seat' : seat.statusBadge}
          </span>
        </div>

        <span className="md:hidden text-[10px] text-[#4F6D87]">
          Genesis Council
        </span>
      </div>

      {/* Soulbound NFT Card (Dark Navy Midnight Card from Figma) */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#071437] to-[#0D2057] p-4 text-white shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 shrink-0 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center p-2.5 backdrop-blur-sm">
            <img
              src="/dao/trobiumdashboard.png"
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
      <div className="space-y-3 text-xs">
        {/* Owner Address */}
        <div className="flex items-center justify-between">
          <span className="text-[#4F6D87]">Owner Address</span>
          <div className="flex items-center gap-1.5 font-mono font-bold text-[#14304A]">
            <span>{seat.ownerAddress}</span>
            <button
              type="button"
              onClick={handleCopyAddress}
              className="p-1 hover:bg-slate-100 rounded text-[#4F6D87] hover:text-[#0E62E4] transition-colors"
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
          <span className="text-[#4F6D87]">Lifetime Earnings</span>
          <span className="text-sm font-bold text-[#14304A]">
            {seat.lifetimeEarnings}
          </span>
        </div>

        {/* 5X Cap Progress */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[#4F6D87]">5X Cap Progress</span>
            <span className="font-bold text-[#14304A]">{seat.capProgress}%</span>
          </div>
          <div className="w-full bg-[#E2EEF9] rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, seat.capProgress)}%` }}
            />
          </div>
        </div>

        {/* Voting Power */}
        <div className="flex items-center justify-between">
          <span className="text-[#4F6D87]">Voting Power</span>
          <div className="text-right">
            <div className="font-bold text-sm text-[#14304A]">{seat.votingPower}</div>
            <div className="text-[10px] text-[#4F6D87]">(1 Seat = 1 Vote)</div>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[#4F6D87]">Status</span>
          <div className="flex items-center gap-1.5 font-semibold text-[#14304A]">
            <span
              className={`w-2 h-2 rounded-full ${
                seat.status === 'mine'
                  ? 'bg-emerald-500 ring-2 ring-emerald-200'
                  : seat.status === 'claimed'
                  ? 'bg-[#14304A]'
                  : seat.status === 'defaulted'
                  ? 'bg-rose-500'
                  : seat.status === 'next'
                  ? 'bg-[#0E62E4] animate-pulse'
                  : 'bg-slate-400'
              }`}
            />
            <span>{seat.status === 'mine' ? 'Your Active Council Seat' : seat.statusText}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 space-y-2">
        {seat.status === 'mine' ? (
          <a
            href="/dao/lounge"
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Manage Seat in Member Lounge</span>
          </a>
        ) : isMintable && onMintSeat ? (
          <button
            type="button"
            onClick={() => onMintSeat(seat.seatNumber)}
            className="w-full py-2.5 rounded-xl bg-[#0E62E4] hover:bg-[#0B52C4] text-white text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Claim Seat #{seat.seatNumber} ($300 TROB)</span>
          </button>
        ) : isMintable && !onMintSeat ? (
          <div className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-xs text-center font-medium">
            Active Member · 1 Seat Per Wallet Limit
          </div>
        ) : null}

        {/* View on Explorer Button */}
        <a
          href={process.env.NEXT_PUBLIC_EXPLORER_URL ? `${process.env.NEXT_PUBLIC_EXPLORER_URL}/address/${seat.ownerAddress.replace(' (You)', '')}` : 'https://tronscan.org'}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 rounded-xl bg-[#F7FBFF] hover:bg-[#EFF6FF] border border-[#E2EEF9] text-[#0E62E4] text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
        >
          <span>View on Explorer</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        {/* View Member Profile Button */}
        <a
          href="/dao/profile"
          className="w-full py-2.5 rounded-xl bg-[#0E62E4] hover:bg-[#0B52C4] text-white text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-1.5"
        >
          <span>View Member Profile</span>
        </a>
      </div>
    </div>
  );
};
