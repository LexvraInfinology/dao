'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Clock,
  RotateCcw,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  TrendingUp,
  Coins,
  Loader2,
} from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { useTrobPrice } from '@/hooks/useApi';
import { playPriorityAlertChime } from '@/utils/soundEffects';
import { getExplorerTxUrl } from '@/utils/explorer';
import { getActiveDaoAddress } from '@/utils/trobAddress';
import { pollOnChainTxSuccess } from '@/utils/txConfirmation';

interface RetopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  seatPosition: number;
  retopupDeadline?: string | null;
  trobPriceUsd?: number;
  alreadyPaidTrob?: number;
  isUnderfunded?: boolean;
  cashbackUsd?: number;
  onSuccess?: () => void;
}

export const RetopupModal: React.FC<RetopupModalProps> = ({
  isOpen,
  onClose,
  seatPosition,
  retopupDeadline,
  trobPriceUsd = 0.056,
  alreadyPaidTrob = 0,
  isUnderfunded = false,
  cashbackUsd,
  onSuccess,
}) => {
  const wallet = useWallet();
  const { data: livePriceData } = useTrobPrice(15_000);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    txHash: string;
    distributedToMembers: number;
    retopupAmountUsd: number;
    retopupTrob: number;
  } | null>(null);

  // 48h countdown state
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({ hours: 48, minutes: 0, seconds: 0, isExpired: false });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate live countdown timer
  useEffect(() => {
    if (!isOpen) return;

    function updateTimer() {
      let targetMs: number;
      if (retopupDeadline) {
        targetMs = new Date(retopupDeadline).getTime();
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

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isOpen, retopupDeadline]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const entryAmountUsd = 300;
  const price = (livePriceData?.priceUsd && livePriceData.priceUsd > 0)
    ? livePriceData.priceUsd
    : (trobPriceUsd > 0 ? trobPriceUsd : 0.038);
  const fullRequiredTrob = Math.round((entryAmountUsd / price) * 100) / 100;
  const creditTrob = isUnderfunded && alreadyPaidTrob > 0 ? Math.min(alreadyPaidTrob, fullRequiredTrob) : 0;
  const retopupFeeTrob = Math.round((fullRequiredTrob - creditTrob) * 100) / 100;
  const effectiveCashbackUsd = cashbackUsd && cashbackUsd > 0 && cashbackUsd < 300
    ? cashbackUsd
    : 3.53;
  const cashbackTrob = Math.round((effectiveCashbackUsd / price) * 100) / 100;
  const netUsd = parseFloat((retopupFeeTrob * price).toFixed(2));
  const activeAddr = wallet.base58Address || wallet.hexAddress || '';

  const handleRetopup = async () => {
    if (!wallet.isConnected) {
      setError('Please connect your TrobSafe wallet first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const contractAddress = getActiveDaoAddress();
      const callValueSun = Math.round(retopupFeeTrob * 1_000_000);
      const targetFunction = isUnderfunded ? 'completeUnderfundedSeat()' : 'retopup()';

      // Pre-flight EVM dry-run simulation
      const { simulateContractCall } = await import('@/utils/contractSimulation');
      const sim = await simulateContractCall({
        functionName: targetFunction,
        ownerAddress: activeAddr,
        contractAddress,
        callValueSun,
      });

      if (!sim.canProceed) {
        throw new Error(sim.errorReason || 'Smart contract pre-flight simulation failed. Transaction cannot be accepted at this time.');
      }

      let txId: string | null = null;
      try {
        const result = await wallet.callContract({
          contract_address: contractAddress,
          function_selector: targetFunction,
          parameter: '',
          call_value: callValueSun,
          fee_limit: 100_000_000,
          owner_address: activeAddr,
        });

        if (result?.result && result.txid) {
          txId = result.txid;
        } else if (typeof result === 'string') {
          txId = result;
        } else if (result?.txid) {
          txId = result.txid;
        } else {
          const errDetail = (result as any)?.Error || (result as any)?.message || 'Transaction was rejected or failed in TrobSafe wallet.';
          throw new Error(errDetail);
        }
      } catch (callErr: any) {
        throw new Error(callErr.message || 'Transaction was cancelled or rejected in TrobSafe.');
      }

      if (!txId) {
        throw new Error('On-chain deposit was not confirmed by TrobSafe. Please approve the payment in your wallet.');
      }

      // Strictly verify execution receipt from TrobChain FullNode
      const confirmCheck = await pollOnChainTxSuccess(txId);
      if (!confirmCheck.success) {
        throw new Error(confirmCheck.error || 'Transaction failed or reverted on blockchain.');
      }

      // Synchronize database via serverless retopup endpoint
      let res = await fetch('/api/dao/retopup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: activeAddr,
          txHash: txId,
          retopupFeeTrob,
          isUnderfunded,
        }),
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch('https://api.equorafidao.com/api/dao/retopup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address: activeAddr,
            txHash: txId,
            retopupFeeTrob,
            isUnderfunded,
          }),
        });
      }

      const data = await res.json();
      if (data.success) {
        playPriorityAlertChime();
        setSuccessData({
          txHash: data.data?.txHash || txId,
          distributedToMembers: data.data?.distributedToMembers ?? 0,
          retopupAmountUsd: data.data?.retopupAmountUsd ?? entryAmountUsd,
          retopupTrob: data.data?.retopupTrob ?? retopupFeeTrob,
        });
        if (onSuccess) onSuccess();
      } else {
        setError(data.error || 'Failed to complete deposit synchronization. Please try again.');
      }
    } catch (err: any) {
      console.error('Deposit execution error:', err);
      let rawMsg = err?.message || 'Error executing deposit transaction.';
      if (rawMsg.includes('Validate InternalTransfer error') || rawMsg.includes('balance is not sufficient')) {
        rawMsg = `Insufficient TROB Balance: Your wallet requires ${retopupFeeTrob.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TROB (~$${isUnderfunded ? netUsd : entryAmountUsd} USD at $${price.toFixed(4)}/TROB) to complete this transaction. Please add TROB to your connected wallet.`;
      }
      setError(rawMsg);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 font-sans animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div
        className="bg-white w-full max-w-lg rounded-2xl sm:rounded-3xl border border-[#E2EEF9] shadow-2xl overflow-hidden flex flex-col my-auto cursor-default animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-[#E7EEF8] flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-amber-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <RotateCcw className="w-5 h-5 animate-spin-reverse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500 text-white">
                  {isUnderfunded ? 'Seat Reservation' : '5X Cap Renewal'}
                </span>
                <span className="text-xs font-bold text-amber-950">Seat #{seatPosition}</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#14304A]">
                {isUnderfunded ? 'Complete Seat Deposit' : 'Council Seat Re-topup'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-[#14304A] rounded-lg hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3.5 sm:p-6 space-y-3.5 sm:space-y-4 max-h-[85vh] sm:max-h-[80vh] overflow-y-auto">
          {successData ? (
            /* Success State */
            <div className="py-4 text-center space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-[#14304A]">
                  {isUnderfunded
                    ? `Seat #${seatPosition} Fully Funded & Activated!`
                    : `Seat #${seatPosition} Successfully Retopuped!`}
                </h4>
                <p className="text-xs text-[#4F6D87] max-w-sm mx-auto">
                  {isUnderfunded
                    ? 'Your Council Seat deposit is confirmed on-chain. VIP Lounge Pass, Matrix Pools & full governance voting are now unlocked!'
                    : 'Your 5X Cap ($1,500 USD) has been reset to zero ($0.00), and your seat remains permanently active.'}
                </p>
              </div>

              {/* Fee Distribution Badge */}
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1 text-xs">
                <div className="font-semibold text-emerald-800 flex items-center justify-center gap-1.5">
                  <Coins className="w-4 h-4 text-emerald-600" />
                  <span>Fee Distributed to Council Members</span>
                </div>
                <div className="text-xl font-black font-mono text-emerald-700">
                  ${successData.retopupAmountUsd}.00 USD
                </div>
                <div className="text-[11px] text-emerald-600 font-medium">
                  Distributed equally across all active council members
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <a
                  href={getExplorerTxUrl(successData.txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-4 rounded-xl border border-[#E2EEF9] bg-[#F8FAFC] hover:bg-[#EFF6FF] text-xs font-semibold text-[#0E62E4] transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Verify on Explorer</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => {
                    onClose();
                    window.location.reload();
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors"
                >
                  Return to Member Lounge
                </button>
              </div>
            </div>
          ) : (
            /* Active Retopup Form */
            <>
              {/* 48-Hour Live Countdown Alert Card */}
              <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-300 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                    <span>Reservation Window</span>
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      timeLeft.isExpired
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : 'bg-amber-200 text-amber-900 border-amber-300'
                    }`}
                  >
                    {timeLeft.isExpired ? 'Window Expired' : 'Window Active'}
                  </span>
                </div>

                {/* 3-Part Digital Clock */}
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  <div className="bg-white rounded-lg p-1.5 border border-amber-200 shadow-2xs">
                    <div className="text-lg font-black font-mono text-[#14304A]">
                      {String(timeLeft.hours).padStart(2, '0')}
                    </div>
                    <div className="text-[8.5px] uppercase font-bold text-slate-400">Hours</div>
                  </div>
                  <div className="bg-white rounded-lg p-1.5 border border-amber-200 shadow-2xs">
                    <div className="text-lg font-black font-mono text-[#14304A]">
                      {String(timeLeft.minutes).padStart(2, '0')}
                    </div>
                    <div className="text-[8.5px] uppercase font-bold text-slate-400">Minutes</div>
                  </div>
                  <div className="bg-white rounded-lg p-1.5 border border-amber-200 shadow-2xs">
                    <div className="text-lg font-black font-mono text-rose-600">
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </div>
                    <div className="text-[8.5px] uppercase font-bold text-slate-400">Seconds</div>
                  </div>
                </div>

                <p className="text-[11px] text-amber-900 leading-snug font-medium">
                  {isUnderfunded
                    ? `Seat #${seatPosition} reserved. Pay remaining balance to activate your seat and unlock dividend earnings.`
                    : timeLeft.isExpired
                    ? `48-hour window has expired. Seat #${seatPosition} is now open for queue claim.`
                    : `Seat #${seatPosition} reached the 5X Cap. Complete $300 USD re-topup to reset cap to $0.00 and resume payouts.`}
                </p>
              </div>

              {/* Financial Breakdown Table - Clean & Minimal */}
              <div className="p-3.5 rounded-xl bg-[#FAFBFD] border border-[#E2EEF9] space-y-2 text-xs">
                {isUnderfunded ? (
                  <>
                    <div className="flex items-center justify-between text-[#4F6D87]">
                      <span>Seat Entry Value:</span>
                      <span className="font-mono font-bold text-[#14304A]">
                        $300.00 USD (≈ {fullRequiredTrob.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TROB)
                      </span>
                    </div>

                    {creditTrob > 0 ? (
                      <div className="flex items-center justify-between text-emerald-700 bg-emerald-50/70 p-2 rounded-lg border border-emerald-200/60 font-medium">
                        <span>Credited Initial Deposit:</span>
                        <span className="font-mono font-bold text-emerald-700">
                          -{creditTrob.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TROB (~${(creditTrob * price).toFixed(2)} USD)
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-amber-800 bg-amber-50/70 p-2 rounded-lg border border-amber-200/60 font-medium">
                        <span>Initial Deposit Status:</span>
                        <span className="font-mono font-bold text-amber-700">
                          $0.00 Credited (Full $300 Entry Required)
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-blue-700 bg-blue-50/60 p-2 rounded-lg border border-blue-200/60">
                      <span className="flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>Live TROB Exchange Rate:</span>
                      </span>
                      <span className="font-mono font-bold">
                        1 TROB = ${price.toFixed(4)} USD
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[#14304A] pt-1 border-t border-[#E7EEF8] font-bold">
                      <span>Remaining Payable Amount:</span>
                      <span className="font-mono text-sm text-[#0E62E4]">
                        {retopupFeeTrob.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TROB (~${netUsd} USD)
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between text-[#4F6D87]">
                      <span>Re-topup Deposit:</span>
                      <span className="font-mono font-bold text-[#14304A]">
                        $300.00 USD
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-blue-700 bg-blue-50/60 p-2 rounded-lg border border-blue-200/60">
                      <span className="flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>Live TROB Exchange Rate:</span>
                      </span>
                      <span className="font-mono font-bold">
                        1 TROB = ${price.toFixed(4)} USD
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[#14304A] pt-1 border-t border-[#E7EEF8] font-bold">
                      <span>Required Payment:</span>
                      <span className="font-mono text-sm text-[#0E62E4]">
                        {fullRequiredTrob.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TROB
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#4F6D87] pt-0.5">
                      <span>Cap After Re-topup:</span>
                      <span className="font-semibold text-emerald-600">Resets to $0.00 / $1,500.00 USD</span>
                    </div>
                  </>
                )}
              </div>

              {/* Error Alert */}
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-shake">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Payer Address Indicator */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                <span>Interacting Wallet:</span>
                <span className="font-mono font-semibold text-slate-700">
                  {activeAddr ? `${activeAddr.slice(0, 6)}…${activeAddr.slice(-4)}` : 'Not connected'}
                </span>
              </div>

              {/* CTA Action Button */}
              <button
                onClick={handleRetopup}
                disabled={loading || (!isUnderfunded && timeLeft.isExpired) || !wallet.isConnected}
                className="w-full min-h-[46px] py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] text-center leading-snug"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Processing Re-topup Transaction…</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-white" />
                    <span>
                      {isUnderfunded
                        ? `Activate Seat #${seatPosition} (${retopupFeeTrob.toLocaleString()} TROB • $${netUsd} USD)`
                        : `Confirm Re-topup ($300 USD ≈ ${fullRequiredTrob.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TROB)`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
