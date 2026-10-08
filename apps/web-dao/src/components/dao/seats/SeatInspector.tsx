'use client';

import React, { useState, useEffect } from 'react';
import { ExternalLink, Copy, Check, X, ShieldAlert, Sparkles, ArrowRight, Coins, TrendingUp, Loader2, Clock } from 'lucide-react';
import { CouncilSeatDetail } from '@/data/councilSeatsData';
import { TrobPriceData } from '@/hooks/useApi';
import { getExplorerAddressUrl } from '@/utils/explorer';

interface SeatInspectorProps {
  seat: CouncilSeatDetail;
  priceData?: TrobPriceData | null;
  onClose?: () => void;
  onMintSeat?: (seatNumber: number) => void;
  onRetopup?: () => void;
  isMemberLoading?: boolean;
  isSeatsLoading?: boolean;
  walletConnected?: boolean;
}

export const SeatInspector: React.FC<SeatInspectorProps> = ({
  seat,
  priceData,
  onClose,
  onMintSeat,
  onRetopup,
  isMemberLoading = false,
  isSeatsLoading = false,
  walletConnected = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [, setTick] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (deadlineIso?: string | null) => {
    if (!deadlineIso) return '12h 00m 00s';
    const diffMs = new Date(deadlineIso).getTime() - Date.now();
    if (diffMs <= 0) return 'Window Expired';
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(seat.ownerAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isSeatsLoading) {
    return (
      <div className="rounded-2xl bg-white border border-[#E2EEF9] p-4 sm:p-5 shadow-[0_2px_12px_rgba(14,98,228,0.06)] space-y-4 font-sans">
        <div className="flex items-center justify-between pb-2.5 border-b border-[#E2EEF9]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#4F6D87]">
            SEAT INSPECTOR
          </span>
          <span className="text-xs text-[#0E62E4] font-medium flex items-center gap-1.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Syncing Seat Data...</span>
          </span>
        </div>
        <div className="space-y-3 py-6">
          <div className="h-6 w-3/4 bg-blue-50/80 rounded-lg animate-pulse" />
          <div className="h-4 w-1/2 bg-blue-50/50 rounded-lg animate-pulse" />
          <div className="h-20 bg-slate-50 rounded-xl border border-slate-100 animate-pulse" />
          <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  const isMintable = seat.status === 'next' || seat.status === 'defaulted';

  const entryFeeUsd = 300;
  const seatEntryTrob = 5357.14; // Fixed smart contract benchmark ($0.056 / $300)
  const instantCashbackUsd = (300 / Math.max(1, seat.seatNumber)).toFixed(2);
  const alreadyPaidTrob = seat.alreadyPaidTrob ?? 0;
  const remainingTrob = seat.remainingTrob && seat.remainingTrob > 0
    ? seat.remainingTrob
    : Math.max(0, Math.round((seatEntryTrob - alreadyPaidTrob) * 100) / 100);

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
              seat.statusBadge === 'Underfunded'
                ? 'bg-amber-50 text-amber-800 border-amber-300 font-bold'
                : seat.status === 'mine'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                : seat.statusBadge === '5X Capped'
                ? 'bg-red-50 text-red-700 border-red-300 font-bold animate-pulse'
                : seat.status === 'claimed'
                ? 'bg-slate-100 text-slate-800 border-slate-300 font-bold'
                : seat.status === 'defaulted'
                ? 'bg-purple-50 text-purple-700 border-purple-200 font-bold'
                : seat.status === 'next'
                ? 'bg-[#EFF6FF] text-[#0E62E4] border-[#0E62E4]/30 font-bold'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            {seat.statusBadge === 'Underfunded'
              ? (seat.status === 'mine' ? 'Your Seat (Underfunded)' : 'Underfunded')
              : (seat.status === 'mine' ? 'Your Seat' : seat.statusBadge)}
          </span>
        </div>

        <span className="md:hidden text-[10px] text-[#4F6D87]">
          Genesis Council
        </span>
      </div>

      {/* 5X Capped Alert Box */}
      {seat.statusBadge === '5X Capped' && (
        <div className="p-3.5 rounded-xl bg-rose-50/90 border border-rose-300/80 text-rose-950 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-rose-900">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>5X Earnings Cap Reached • $1,500 Earned</span>
            </div>
            {seat.retopupDeadline && (
              <span className="flex items-center gap-1 font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300">
                <Clock className="w-3 h-3 text-rose-600 shrink-0" />
                <span>{formatCountdown(seat.retopupDeadline)}</span>
              </span>
            )}
          </div>
          <p className="text-[11px] text-rose-800 leading-relaxed">
            {seat.status === 'mine'
              ? 'Your seat has reached the maximum 5X payout cap. Dividends are paused. Re-topup $300 before the 48-hour window closes to reactivate your seat for the next cycle, or your seat will be vacated for queue takeover.'
              : 'This seat reached the maximum $1,500 5X earnings cap. Dividends are paused. The owner has a 48-hour window to re-topup before the seat is vacated for queue takeover.'}
          </p>
        </div>
      )}

      {/* Underfunded Seat Alert Box */}
      {seat.statusBadge === 'Underfunded' && (
        <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-300/80 text-amber-950 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Underfunded Seat • Deposit Deficit</span>
            </div>
            {seat.retopupDeadline && (
              <span className="flex items-center gap-1 font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                <span>{formatCountdown(seat.retopupDeadline)}</span>
              </span>
            )}
          </div>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            {seat.status === 'mine'
              ? `Your seat was reserved with an initial deposit. Pay the remaining ${remainingTrob ? `${Math.round(remainingTrob).toLocaleString()} TROB` : 'balance'} to activate your seat and unlock full governance & dividends.`
              : 'This seat was reserved with a provisional deposit. The owner must complete the remaining deposit before the 12-hour window closes, after which it reopens for queue takeover.'}
          </p>
          {alreadyPaidTrob > 0 && (
            <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-amber-200/70 font-semibold text-amber-900">
              <span>Credited Initial Deposit:</span>
              <span className="font-mono text-emerald-700">-{alreadyPaidTrob.toLocaleString()} TROB</span>
            </div>
          )}
        </div>
      )}

      {/* Soulbound NFT Card (Dark Navy Midnight Card from Figma) */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#071437] to-[#0D2057] p-4 text-white shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 shrink-0 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center p-2.5 backdrop-blur-sm">
            <img
              src="/dao/equoranewlogo.png"
              alt="Soulbound NFT EQUORA Emblem"
              className="w-full h-full object-contain animate-float drop-shadow-[0_4px_12px_rgba(255,255,255,0.2)]"
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
        <div className="flex items-center justify-between gap-2">
          <span className="text-[#4F6D87] shrink-0">Owner Address</span>
          <div className="flex items-center gap-1.5 font-mono font-bold text-[#14304A] truncate">
            <span className="truncate">{seat.ownerAddress}</span>
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

        {/* Cycle Earnings */}
        <div className="flex items-center justify-between">
          <span className="text-[#4F6D87]">Cycle Earnings</span>
          <span className="text-sm font-bold text-[#14304A]">
            {seat.lifetimeEarnings}
          </span>
        </div>

        {/* Retopup / Deposit Cycles */}
        {seat.status !== 'next' && seat.status !== 'defaulted' && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE]/70 text-xs">
              <div className="space-y-0.5">
                <div className="text-[10px] uppercase font-bold text-[#155EEF] tracking-wider">Deposit Cycles</div>
                <div className="font-extrabold text-[#071A4A]">
                  {(seat.retopupCount ?? 0) > 0
                    ? `Cycle #${(seat.retopupCount ?? 0) + 1} (${seat.retopupCount} Retopup Done)`
                    : `Cycle #1 (Initial Deposit)`}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-[#60739A] font-medium">Deposits Count</div>
                <div className="font-black text-[#0E62E4]">
                  {1 + (seat.retopupCount ?? 0)} Deposits (${(1 + (seat.retopupCount ?? 0)) * 300} USD)
                </div>
              </div>
            </div>
            {(seat.retopupCount ?? 0) > 0 && seat.lifetimeEarningsUsd !== undefined && (
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200/60 text-xs">
                <span className="text-[11px] font-medium text-emerald-800">Lifetime Settled (All Cycles)</span>
                <span className="font-bold text-emerald-700">${seat.lifetimeEarningsUsd.toFixed(2)} USD</span>
              </div>
            )}
          </div>
        )}

        {/* 5X Cap Progress */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[#4F6D87]">5X Cap Progress</span>
            <span className={`font-bold text-xs sm:text-sm ${seat.statusBadge === '5X Capped' ? 'text-rose-600' : 'text-[#14304A]'}`}>
              {seat.capProgress}% {seat.statusBadge === '5X Capped' && '(48h Window Open)'}
            </span>
          </div>
          <div className="w-full bg-[#E2EEF9] rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                seat.statusBadge === '5X Capped' ? 'bg-rose-500' : 'bg-emerald-500'
              }`}
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
                  ? 'bg-purple-500'
                  : seat.status === 'next'
                  ? 'bg-[#0E62E4] animate-pulse'
                  : 'bg-slate-400'
              }`}
            />
            <span>{seat.status === 'mine' ? 'Your Active Council Seat' : seat.statusText}</span>
          </div>
        </div>
      </div>

      {/* Connected Pricing Card */}
      {isMintable && (
        <div className="p-3 rounded-xl bg-[#F7FBFF] border border-[#E2EEF9] space-y-2 text-xs">
          <div className="flex items-center justify-between text-[#14304A] font-bold">
            <span className="flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              <span>Seat Entry Pricing</span>
            </span>
            <span className="font-mono text-xs text-[#0E62E4] font-extrabold">
              $300.00 USD
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] p-1.5 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/60">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              <span>Instant Cashback (+300/n)</span>
            </span>
            <span className="font-mono font-bold">+${instantCashbackUsd} USD</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-2 space-y-2">
        {seat.statusBadge === 'Underfunded' && seat.status === 'mine' && onRetopup ? (
          <button
            type="button"
            onClick={onRetopup}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-[0_4px_14px_rgba(245,158,11,0.35)] transition-all flex items-center justify-center gap-1.5 cursor-pointer animate-pulse"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pay Remaining Balance {remainingTrob ? `(${Math.round(remainingTrob).toLocaleString()} TROB)` : ''} • Unlock Seat #{seat.seatNumber}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        ) : seat.statusBadge === '5X Capped' && seat.status === 'mine' && onRetopup ? (
          <button
            type="button"
            onClick={onRetopup}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-bold shadow-[0_4px_14px_rgba(217,119,6,0.35)] transition-all flex items-center justify-center gap-1.5 cursor-pointer animate-pulse"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Re-topup Seat #{seat.seatNumber} ($300 USD)</span>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        ) : seat.status === 'mine' ? (
          <a
            href="/dao/lounge"
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Manage Seat in Member Lounge</span>
          </a>
        ) : walletConnected && isMemberLoading ? (
          <div className="w-full py-2.5 rounded-xl bg-blue-50/80 border border-blue-200 text-[#0E62E4] text-xs font-semibold shadow-xs flex items-center justify-center gap-2 select-none">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0E62E4]" />
            <span>Syncing On-Chain Membership...</span>
          </div>
        ) : isMintable && onMintSeat ? (
          <button
            type="button"
            onClick={() => onMintSeat(seat.seatNumber)}
            className="w-full py-2.5 rounded-xl bg-[#0E62E4] hover:bg-[#0B52C4] text-white text-xs font-semibold shadow-[0_4px_14px_rgba(14,98,228,0.25)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Proceed to Claim Seat #{seat.seatNumber} ($300 USD)</span>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        ) : isMintable && !onMintSeat ? (
          <div className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-xs text-center font-medium">
            Active Member · 1 Seat Per Wallet Limit
          </div>
        ) : null}

        {/* View on Explorer Button */}
        <a
          href={getExplorerAddressUrl(seat.ownerAddress)}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 rounded-xl bg-[#F7FBFF] hover:bg-[#EFF6FF] border border-[#E2EEF9] text-[#0E62E4] text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
          title="View on Trobium Explorer"
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
