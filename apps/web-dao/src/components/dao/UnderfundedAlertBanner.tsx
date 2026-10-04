'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  Lock,
  ArrowRight,
  ShieldAlert,
  Zap,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
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

  if (!memberData || (memberData.status !== 'underfunded' && !memberData.underfunded)) {
    return null;
  }

  const position = memberData.position || '—';
  const entryTrob = memberData.entryAmountTrob ?? memberData.entryAmountBtt ?? 1.5;
  const entryUsd = memberData.entryAmountUsdEstimate ?? Math.round(entryTrob * 0.056 * 100) / 100;
  const priceUsd = price?.priceUsd || 0.056;
  const requiredTrob = price?.seatEntryTrob || Math.round((300 / priceUsd) * 100) / 100;

  return (
    <>
      <div
        className={`w-full relative overflow-hidden rounded-2xl border-2 border-red-500/30 bg-gradient-to-r from-red-950/20 via-amber-950/15 to-red-900/20 backdrop-blur-md shadow-[0_8px_32px_rgba(239,68,68,0.15)] p-4 sm:p-5 text-left transition-all duration-300 animate-fadeIn ${className}`}
      >
        {/* Glow ambient background */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 max-w-3xl">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-red-500 to-amber-600 text-white flex items-center justify-center shrink-0 shadow-[0_4px_16px_rgba(239,68,68,0.4)]">
              <Lock className="w-5 h-5 text-white animate-pulse" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-red-500/20 text-red-600 border border-red-500/30">
                  <ShieldAlert className="w-3 h-3 text-red-500" />
                  Dashboard Access Locked
                </span>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#17334F]/10 text-[#17334F] border border-[#17334F]/20">
                  Genesis Council Seat #{position}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-red-100 text-red-800">
                  Status: Underfunded Deposit
                </span>
              </div>

              <h3 className="text-sm sm:text-base font-bold text-[#17334F] tracking-tight">
                Incomplete Seat Funding: Paid {entryTrob.toLocaleString(undefined, { maximumFractionDigits: 2 })} TROB (~${entryUsd} USD) of $300 Required
              </h3>

              <p className="text-xs sm:text-[13px] text-[#4F6D87] leading-relaxed">
                Your wallet holds on-chain Council Seat <strong className="text-[#17334F]">#{position}</strong>, but was activated with only{' '}
                <strong className="text-red-600">{entryTrob.toLocaleString(undefined, { maximumFractionDigits: 2 })} TROB</strong> instead of the full $300 USD entry fee (~{requiredTrob.toLocaleString()} TROB). VIP Lounge, governance voting, and matrix dividend withdrawals remain locked until full funding is completed.
              </p>

              <div className="flex items-center gap-2 pt-1 text-[11px] text-[#4F6D87]/90 font-medium">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>
                  <strong>On-Chain Note:</strong> Your seat is already registered on TrobChain. Calling <code className="bg-black/5 px-1 py-0.5 rounded text-[10px]">joinDAO()</code> will revert with <code className="bg-black/5 px-1 py-0.5 rounded text-[10px]">AlreadyMember</code>. You must use <strong className="text-[#0E62E4]">Re-topup</strong> to complete your entry fee.
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
              <span>Complete Re-topup ($300)</span>
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
        trobPriceUsd={priceUsd}
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
