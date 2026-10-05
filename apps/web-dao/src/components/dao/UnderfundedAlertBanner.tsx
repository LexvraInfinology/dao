'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Lock,
  ArrowRight,
  ShieldAlert,
  Zap,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Clock,
} from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { useDaoMember, useTrobPrice } from '@/hooks/useApi';
import { RetopupModal } from '@/components/dao/lounge/RetopupModal';
import { getExplorerAddressUrl } from '@/utils/explorer';

interface UnderfundedAlertBannerProps {
  className?: string;
  variant?: 'banner' | 'card';
}

export const UnderfundedAlertBanner: React.FC<UnderfundedAlertBannerProps> = ({
  className = '',
  variant = 'banner',
}) => {
  const wallet = useWallet();
  const activeAddress = wallet.base58Address || wallet.hexAddress;
  const { data: memberData, refetch } = useDaoMember(activeAddress);
  const { data: price } = useTrobPrice(30_000);
  const [retopupModalOpen, setRetopupModalOpen] = useState(false);

  // 48h live countdown timer
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({ hours: 48, minutes: 0, seconds: 0, isExpired: false });

  useEffect(() => {
    function calc() {
      let targetMs: number;
      if (memberData?.retopupDeadline) {
        targetMs = new Date(memberData.retopupDeadline).getTime();
      } else {
        targetMs = Date.now() + 48 * 3600 * 1000;
      }
      const diff = targetMs - Date.now();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds, isExpired: false });
    }
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [memberData?.retopupDeadline]);

  if (!memberData || (memberData.status !== 'underfunded' && !memberData.underfunded)) {
    return null;
  }

  const position = memberData.position || '—';
  const entryTrob = memberData.entryAmountTrob ?? memberData.entryAmountBtt ?? 1.5;
  const entryUsd = memberData.entryAmountUsdEstimate ?? Math.round(entryTrob * 0.056 * 100) / 100;
  const priceUsd = price?.priceUsd || 0.056;
  const requiredTrob = price?.seatEntryTrob || Math.round((300 / priceUsd) * 100) / 100;
  const remainingTrob = Math.max(0, Math.round((requiredTrob - entryTrob) * 100) / 100);

  return (
    <>
      <div
        className={`w-full relative overflow-hidden rounded-2xl border-2 border-red-500/40 bg-gradient-to-r from-red-950/30 via-amber-950/20 to-red-900/30 backdrop-blur-md shadow-[0_8px_32px_rgba(239,68,68,0.2)] p-4 sm:p-5 text-left transition-all duration-300 animate-fadeIn ${className}`}
      >
        {/* Glow ambient background */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 max-w-3xl">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 text-white flex items-center justify-center shrink-0 shadow-[0_4px_16px_rgba(239,68,68,0.4)]">
              <Lock className="w-6 h-6 text-white animate-pulse" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-red-500/20 text-red-600 border border-red-500/30">
                  <ShieldAlert className="w-3 h-3 text-red-500" />
                  Dashboard Access Strictly Locked
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#17334F]/10 text-[#17334F] border border-[#17334F]/20">
                  Genesis Council Seat #{position}
                </span>
                {/* 48-Hour Live Countdown Pill */}
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold border ${
                  timeLeft.isExpired
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                }`}>
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>
                    48h Window:{' '}
                    {String(timeLeft.hours).padStart(2, '0')}:
                    {String(timeLeft.minutes).padStart(2, '0')}:
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                </span>
              </div>

              <h3 className="text-sm sm:text-base font-bold text-[#17334F] tracking-tight">
                Incomplete Seat Funding: You Can Only Access Dashboard When Remaining Balance is Paid
              </h3>

              <p className="text-xs sm:text-[13px] text-[#4F6D87] leading-relaxed">
                Your wallet holds reserved on-chain Council Seat <strong className="text-[#17334F]">#{position}</strong>, but was activated with only{' '}
                <strong className="text-red-600">{entryTrob.toLocaleString(undefined, { maximumFractionDigits: 2 })} TROB</strong> (~${entryUsd} USD) instead of the full $300 USD entry fee (~{requiredTrob.toLocaleString()} TROB). You have a <strong className="text-amber-700">48-hour reservation window</strong> to pay the remaining balance of <strong className="text-[#0E62E4]">{remainingTrob.toLocaleString()} TROB</strong>. Full Council Dashboard, VIP Lounge, governance, and matrix dividends remain strictly locked until paid.
              </p>

              <div className="flex items-center gap-2 pt-1 text-[11px] text-[#4F6D87]/90 font-medium">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>
                  <strong>48h Expiration Notice:</strong> When this 48-hour timer reaches 00:00:00, unpaid seat reservations will be automatically revoked and returned to the Genesis pool.
                </span>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end gap-2 w-full md:w-auto shrink-0 pt-2 md:pt-0">
            <button
              type="button"
              onClick={() => setRetopupModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs sm:text-sm font-bold shadow-[0_4px_16px_rgba(239,68,68,0.35)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.5)] transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Pay Remaining Balance ({remainingTrob.toLocaleString()} TROB)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {activeAddress && (
              <a
                href={getExplorerAddressUrl(activeAddress)}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[#4F6D87] hover:text-[#0E62E4] transition-colors"
              >
                <span>View On-Chain Seat</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Retopup Modal */}
      <RetopupModal
        isOpen={retopupModalOpen}
        onClose={() => setRetopupModalOpen(false)}
        seatPosition={typeof position === 'number' ? position : 1}
        retopupDeadline={memberData?.retopupDeadline}
        trobPriceUsd={priceUsd}
        alreadyPaidTrob={entryTrob}
        isUnderfunded={true}
        onSuccess={() => {
          setRetopupModalOpen(false);
          refetch();
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        }}
      />
    </>
  );
};
