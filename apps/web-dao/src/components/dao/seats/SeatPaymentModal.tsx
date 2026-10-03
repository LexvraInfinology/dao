'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  Wallet,
  ArrowRight,
  TrendingUp,
  Coins,
  BadgeDollarSign,
  Layers,
} from 'lucide-react';
import { CouncilSeatDetail } from '@/data/councilSeatsData';
import { TrobPriceData } from '@/hooks/useApi';
import { useWallet } from '@/context/WalletContext';

interface SeatPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  seat: CouncilSeatDetail;
  priceData?: TrobPriceData | null;
  onConfirmPayment: (seatNumber: number) => Promise<{ success: boolean; txHash?: string | null; error?: string }>;
}

export const SeatPaymentModal: React.FC<SeatPaymentModalProps> = ({
  isOpen,
  onClose,
  seat,
  priceData,
  onConfirmPayment,
}) => {
  const wallet = useWallet();
  const [step, setStep] = useState<'review' | 'processing' | 'success' | 'error'>('review');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string>('Preparing payment request…');

  if (!isOpen) return null;

  // Pricing calculations pegged to $300 USD
  const entryFeeUsd = 300;
  const trobPriceUsd = priceData?.priceUsd && priceData.priceUsd > 0 ? priceData.priceUsd : 0.056;
  const seatEntryTrob = priceData?.seatEntryTrob ?? Math.round((entryFeeUsd / trobPriceUsd) * 100) / 100;
  const callValueSun = Math.ceil(seatEntryTrob * 1_000_000);

  // Instant cashback formula: $300 / position
  const instantCashbackUsd = (300 / Math.max(1, seat.seatNumber)).toFixed(2);
  const netEffectiveCostUsd = Math.max(0, entryFeeUsd - Number(instantCashbackUsd)).toFixed(2);
  const earningsCapUsd = 1500; // Fixed 5X rule: $300 * 5 = $1,500

  const handleProceed = async () => {
    if (!wallet.isConnected) {
      setErrorMessage('Please connect your TrobSafe wallet to proceed.');
      return;
    }

    setErrorMessage(null);
    setStep('processing');
    setProcessingStatus('Verifying device hardware & on-chain SR vote…');

    try {
      // Pre-flight check on Anti-Sybil and SR vote
      const { getDeviceFingerprint } = await import('@/utils/deviceFingerprint');
      const fingerprint = await getDeviceFingerprint();
      const userAddr = wallet.base58Address || wallet.hexAddress || '';
      const eligRes = await fetch(`/api/dao/eligibility/${encodeURIComponent(userAddr)}?deviceFingerprint=${encodeURIComponent(fingerprint)}`);
      const eligData = await eligRes.json();

      if (eligData?.deviceRestriction?.hasClaimed) {
        setErrorMessage(`Anti-Sybil Device Restriction: ${eligData.deviceRestriction.reason || 'This device has already claimed a Council Seat. Strictly 1 seat per device is permitted.'}`);
        setStep('error');
        return;
      }
      if (eligData?.walletAlreadyHasSeat) {
        setErrorMessage(`Limit 1 Seat Per Wallet: This wallet already owns Council Seat #${eligData.ownedSeatNumber}.`);
        setStep('error');
        return;
      }
      if (!eligData?.condition2?.srVote?.passed) {
        setErrorMessage(`EquoraFi SR Vote Required: You must cast an on-chain vote for the official EquoraFi Super Representative node (${eligData?.condition2?.srVote?.officialSrAddress || 'TC7LCXJ5qhhw6ewLzK8SJuJiwtWmLExLYY'}) before joining.`);
        setStep('error');
        return;
      }

      setProcessingStatus('Simulating smart contract execution…');
      const result = await onConfirmPayment(seat.seatNumber);

      if (result.success) {
        setTxHash(result.txHash || null);
        setStep('success');
      } else {
        setErrorMessage(result.error || 'Payment transaction was not completed.');
        setStep('error');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Transaction failed.';
      setErrorMessage(msg);
      setStep('error');
    }
  };

  const handleReset = () => {
    setErrorMessage(null);
    setStep('review');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn font-sans">
      <div className="relative w-full max-w-lg rounded-2xl bg-white border border-[#E2EEF9] shadow-[0_20px_60px_-15px_rgba(14,98,228,0.25)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#E2EEF9] bg-[#F7FBFF]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0E62E4] text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#14304A]">
                Confirm Council Seat #{seat.seatNumber}
              </h2>
              <p className="text-[11px] text-[#4F6D87]">
                Genesis Council Seat Entry & Pricing Review
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={step === 'processing'}
            className="p-1.5 rounded-lg hover:bg-slate-200/60 text-[#4F6D87] hover:text-[#14304A] transition-colors disabled:opacity-40 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {step === 'review' && (
            <>
              {/* Seat Banner */}
              <div className="rounded-xl p-3.5 bg-gradient-to-r from-[#071437] to-[#0D2057] text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center p-2 shrink-0">
                    <img
                      src="/dao/equoranewlogo.png"
                      alt="Soulbound NFT EQUORA Emblem"
                      className="w-full h-full object-contain drop-shadow-[0_2px_8px_rgba(255,255,255,0.2)]"
                    />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-sky-200 uppercase tracking-wider">
                      Selected Position
                    </div>
                    <div className="text-base sm:text-lg font-black tracking-tight">
                      Council Seat #{seat.seatNumber}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-200 border border-sky-400/30">
                    {seat.status === 'defaulted' ? 'Defaulted Vacancy' : 'Next Available'}
                  </span>
                  <div className="text-[10px] text-slate-300 font-mono mt-0.5">
                    NFT {seat.soulboundId}
                  </div>
                </div>
              </div>

              {/* Connected Pricing Breakdown */}
              <div className="rounded-xl border border-[#E2EEF9] bg-[#F7FBFF] p-3.5 sm:p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-[#14304A] pb-2 border-b border-[#E2EEF9]">
                  <span className="flex items-center gap-1.5">
                    <BadgeDollarSign className="w-3.5 h-3.5 text-[#0E62E4]" />
                    <span>Seat Pricing Breakdown</span>
                  </span>
                  <span className="text-[10px] text-[#4F6D87] font-normal">
                    Oracle Rate: 1 TROB = ${trobPriceUsd.toFixed(4)} USD
                  </span>
                </div>

                {/* Entry Price Row */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#4F6D87]">Protocol Entry Fee</span>
                  <div className="text-right">
                    <span className="font-bold text-[#14304A] font-mono text-sm sm:text-base">
                      $300.00 USD
                    </span>
                  </div>
                </div>

                {/* Live TROB Conversion Row */}
                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-white border border-[#E2EEF9]">
                  <span className="text-[#14304A] font-semibold flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-amber-500" />
                    <span>Payable in TROB</span>
                  </span>
                  <div className="text-right">
                    <span className="font-mono font-bold text-sm text-[#0E62E4]">
                      {seatEntryTrob.toLocaleString(undefined, { maximumFractionDigits: 2 })} TROB
                    </span>
                    <div className="text-[10px] text-[#4F6D87] font-mono">
                      ({callValueSun.toLocaleString()} TROBI / SUN)
                    </div>
                  </div>
                </div>

                {/* Instant Cashback Row */}
                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                  <span className="text-emerald-800 font-semibold flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Instant Genesis Cashback (+300/n)</span>
                  </span>
                  <span className="font-mono font-bold text-sm text-emerald-700">
                    +${instantCashbackUsd} USD
                  </span>
                </div>

                {/* Net Effective Cost */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[#4F6D87]">Net Out-of-Pocket Cost</span>
                  <span className="font-bold text-[#14304A] font-mono text-xs">
                    ${netEffectiveCostUsd} USD
                  </span>
                </div>

                {/* 5X Earnings Cap */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-[#E2EEF9]">
                  <span className="text-[#4F6D87] flex items-center gap-1">
                    <Layers className="w-3 h-3 text-[#0E62E4]" />
                    <span>5X Lifetime Earnings Cap</span>
                  </span>
                  <span className="font-bold text-emerald-600 font-mono">
                    ${earningsCapUsd.toLocaleString()}.00 USD
                  </span>
                </div>
              </div>

              {/* Wallet and Contract Meta */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[#4F6D87] flex items-center gap-1">
                    <Wallet className="w-3.5 h-3.5 text-slate-500" />
                    <span>Payer Wallet</span>
                  </span>
                  <span className="font-mono font-bold text-[#14304A] truncate max-w-[200px]">
                    {wallet.base58Address || wallet.hexAddress || 'Not Connected'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[#4F6D87] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Smart Contract</span>
                  </span>
                  <span className="font-mono font-semibold text-[#14304A] text-[11px]">
                    EquoraDAO (TLrAb4…e5qn)
                  </span>
                </div>
              </div>

              {/* Zero Gas Fee Notice */}
              <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/80 text-[11px] text-blue-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0E62E4] shrink-0" />
                <span>
                  Bandwidth & Energy limits are optimized for zero gas friction. Call value is pegged at $300 USD.
                </span>
              </div>
            </>
          )}

          {step === 'processing' && (
            <div className="py-8 px-4 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="w-16 h-16 rounded-full border-4 border-[#E2EEF9] border-t-[#0E62E4] animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-[#0E62E4] animate-pulse" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#14304A]">
                  Processing Seat #{seat.seatNumber} Claim
                </h3>
                <p className="text-xs text-[#4F6D87]">{processingStatus}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#F7FBFF] border border-[#E2EEF9] text-xs text-[#4F6D87] max-w-sm mx-auto text-left space-y-1">
                <div className="flex items-center gap-2 text-[#14304A] font-semibold">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0E62E4] animate-ping" />
                  <span>Amount: {seatEntryTrob.toLocaleString()} TROB ($300 USD)</span>
                </div>
                <p className="text-[11px]">
                  Please confirm the <span className="font-mono font-bold text-[#0E62E4]">joinDAO()</span> contract call inside your TrobSafe extension popup.
                </p>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="py-6 px-4 text-center space-y-4 animate-fadeIn">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#14304A]">
                  Council Seat #{seat.seatNumber} Claimed!
                </h3>
                <p className="text-xs text-[#4F6D87] max-w-sm mx-auto">
                  Your seat has been recorded on-chain and registered with the Genesis Council.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-1.5 text-left">
                <div className="flex items-center justify-between font-bold">
                  <span>Instant Cashback Received:</span>
                  <span className="font-mono text-sm">+${instantCashbackUsd} USD</span>
                </div>
                <p className="text-[11px] text-emerald-700">
                  Instant cashback credited directly to your connected wallet (Zero Gas Fees).
                </p>
                {txHash && (
                  <div className="pt-1 text-[11px] font-mono text-[#0E62E4] truncate">
                    Tx: {txHash}
                  </div>
                )}
              </div>

              <div className="pt-2">
                <a
                  href="/dao/lounge"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Enter Member Lounge</span>
                </a>
              </div>
            </div>
          )}

          {step === 'error' && (
            <div className="py-6 px-4 text-center space-y-4 animate-fadeIn">
              <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#14304A]">Payment Unsuccessful</h3>
                <p className="text-xs text-rose-600 max-w-sm mx-auto font-medium">
                  {errorMessage || 'The transaction could not be completed.'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-[#4F6D87] text-left space-y-1">
                <p className="font-semibold text-[#14304A]">Troubleshooting Tips:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Ensure your TrobSafe wallet has sufficient TROB balance (~{seatEntryTrob} TROB).</li>
                  <li>Verify that TrobSafe is unlocked and on the TrobChain network.</li>
                  <li>Click "Approve" when the TrobSafe contract prompt appears.</li>
                </ul>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 py-2.5 rounded-xl bg-[#0E62E4] hover:bg-[#0B52C4] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  Try Again
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#4F6D87] text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer (Review Step) */}
        {step === 'review' && (
          <div className="p-4 sm:p-5 border-t border-[#E2EEF9] bg-[#F7FBFF] flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-[#E2EEF9] hover:bg-slate-100 text-[#4F6D87] text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleProceed}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#0E62E4] hover:bg-[#0B52C4] text-white text-xs font-bold transition-all shadow-[0_4px_16px_rgba(14,98,228,0.3)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Confirm & Pay {seatEntryTrob.toLocaleString(undefined, { maximumFractionDigits: 1 })} TROB ($300 USD)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
