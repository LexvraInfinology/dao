'use client';

import React, { useState } from 'react';
import { Zap, CheckCircle2, ShieldCheck, ArrowRight, Wallet, Info } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { getActiveDaoAddress } from '@/utils/trobAddress';

interface ClaimableDividendsCardProps {
  initialAmount?: number;     // Total claimable USD (fallback + pool)
  pushedAmountUsd?: number;   // Total USD pushed directly to wallet
  pushedAmountTrob?: number;  // Total TROB pushed directly to wallet
  priceUsd?: number;          // Live TROB/USD market price
  walletAddress?: string;
  isCapped?: boolean;
  poolClaimableTrob?: number;
  fallbackClaimableTrob?: number;
}

export const ClaimableDividendsCard: React.FC<ClaimableDividendsCardProps> = ({
  initialAmount = 0,
  pushedAmountUsd = 0,
  pushedAmountTrob = 0,
  priceUsd = 0.056,
  walletAddress,
  isCapped = false,
  poolClaimableTrob = 0,
  fallbackClaimableTrob = 0,
}) => {
  const wallet = useWallet();
  const [balance, setBalance] = useState<number>(initialAmount);
  const [status, setStatus]   = useState<'idle' | 'claiming' | 'success'>('idle');
  const [txHash, setTxHash]   = useState<string | null>(null);
  const [error, setError]     = useState<string | null>(null);

  // Sync when prop changes (parent refetches)
  React.useEffect(() => {
    setBalance(initialAmount);
  }, [initialAmount]);

  const shortAddr = walletAddress
    ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`
    : wallet.base58Address
    ? `${wallet.base58Address.slice(0, 6)}…${wallet.base58Address.slice(-4)}`
    : '—';

  // Claim handler for either 35% matrix pool rewards or emergency fallback buffer
  const handleClaim = async () => {
    if (balance <= 0 || status !== 'idle') return;
    setError(null);
    setStatus('claiming');

    try {
      const daoAddress = getActiveDaoAddress();
      if (!daoAddress || !wallet.isConnected) {
        throw new Error('Please connect your TrobSafe wallet first.');
      }

      // If pool rewards are available, claim pool share; otherwise claim fallback buffer
      const targetFunction = poolClaimableTrob > 0 ? 'claimPoolShare()' : 'claimFallback()';

      const result = await wallet.callContract({
        contract_address:  daoAddress,
        function_selector: targetFunction,
        parameter:         '',
        call_value:        0,
        fee_limit:         50_000_000,
        owner_address:     wallet.base58Address ?? wallet.hexAddress ?? '',
      });

      if (!result.result) throw new Error('Transaction rejected by contract.');
      setTxHash(result.txid);

      setStatus('success');
      setTimeout(() => {
        setBalance(0);
        setStatus('idle');
        setTxHash(null);
      }, 3500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Transaction failed.');
      setStatus('idle');
    }
  };

  const isCapHit = Boolean(isCapped || pushedAmountUsd >= 1500);
  const displayPushedUsd = isCapHit ? 1500 : (pushedAmountUsd > 0 ? pushedAmountUsd : 0);

  return (
    <div className="bg-white border border-[#E2ECF9] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_4px_20px_rgba(15,23,42,0.03)] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE]/40 text-[#155EEF] flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-[#155EEF]" />
          </div>
          <h3 className="text-base font-bold font-jakarta text-[#071A4A]">Direct-to-Wallet Payouts</h3>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${
          isCapHit ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-emerald-50 border-emerald-200/80 text-[#059669]'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isCapHit ? 'bg-amber-500 animate-pulse' : 'bg-[#10B981] animate-pulse'}`} />
          {isCapHit ? '5X Cap Reached' : 'Zero Gas Fees'}
        </span>
      </div>

      {/* Main Counter: Total Pushed to Wallet */}
      <div className="space-y-1">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#60739A] font-jakarta">
          Total Pushed Directly to Wallet
        </div>
        <div className="text-3xl sm:text-4xl font-black font-jakarta text-[#071A4A] tracking-tight">
          ${displayPushedUsd.toFixed(2)} <span className="text-lg font-normal text-slate-400">USD</span>
        </div>
        <div className={`text-xs font-semibold font-jakarta flex items-center gap-1.5 ${
          isCapHit ? 'text-amber-700' : 'text-[#10B981]'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isCapHit ? 'bg-amber-500 animate-pulse' : 'bg-[#10B981] animate-pulse'}`} />
          <span>{isCapHit ? 'Max 5X Cap Reached · Dividends Paused (Re-topup to Resume)' : 'Delivered On-Chain Directly to Wallet'}</span>
        </div>
      </div>

      {/* Autonomous Push Explainer */}
      <div className={`p-3.5 rounded-2xl border space-y-1.5 ${
        isCapHit ? 'bg-amber-50/80 border-amber-200' : 'bg-[#F0FDF4] border-[#BBF7D0]'
      }`}>
        <div className={`flex items-center gap-2 text-xs font-bold font-jakarta ${
          isCapHit ? 'text-amber-900' : 'text-[#166534]'
        }`}>
          <CheckCircle2 className={`w-4 h-4 shrink-0 ${isCapHit ? 'text-amber-600' : 'text-[#16A34A]'}`} />
          <span>{isCapHit ? '5X Maximum Cap Reached ($1,500.00 USD)' : '100% Autonomous On-Chain Push'}</span>
        </div>
        <p className={`text-[11px] font-jakarta leading-relaxed ${
          isCapHit ? 'text-amber-800' : 'text-[#15803D]'
        }`}>
          {isCapHit
            ? 'Your seat has accumulated the maximum $1,500.00 USD under 5X capping policy. Dividends are currently paused and redirected to other active council members until your $300 USD re-topup is completed.'
            : 'Instant cashback (300/N split) and pool distributions are sent automatically by smart contracts directly into your connected wallet. No manual withdraw button or gas fees needed.'}
        </p>
      </div>

      {/* Specifications */}
      <div className="divide-y divide-[#F1F5F9] text-xs font-jakarta pt-1">
        <div className="py-2 flex items-center justify-between">
          <span className="text-[#60739A]">Transfer Protocol</span>
          <span className="font-bold text-[#071A4A] flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#155EEF]" />
            Blockchain PUSH (Instant)
          </span>
        </div>
        <div className="py-2 flex items-center justify-between">
          <span className="text-[#60739A]">Your Gas Fee to Receive</span>
          <span className="font-bold text-[#10B981]">$0.00 (Paid by Depositor)</span>
        </div>
        <div className="py-2 flex items-center justify-between gap-2">
          <span className="text-[#60739A] shrink-0">Destination Wallet</span>
          <span className="font-mono font-bold text-[#155EEF] flex items-center gap-1 min-w-0">
            <Wallet className="w-3 h-3 text-[#155EEF] shrink-0" />
            <span className="truncate max-w-[130px] min-[360px]:max-w-[170px] sm:max-w-none">{shortAddr}</span>
          </span>
        </div>
      </div>

      {/* On-Chain Claimable Rewards (Matrix Pool or Fallback Buffer) */}
      {balance > 0 && (
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 font-jakarta">
            <Info className="w-3.5 h-3.5 text-amber-600" />
            <span>
              {poolClaimableTrob > 0
                ? `Claimable Pool Share: $${balance.toFixed(2)} USD (${poolClaimableTrob.toFixed(2)} TROB)`
                : `Claimable Buffer: $${balance.toFixed(2)} USD`}
            </span>
          </div>
          <p className="text-[11px] text-amber-700 font-jakarta leading-tight">
            {poolClaimableTrob > 0
              ? 'Accumulated 35% global matrix pool rewards ready to be claimed directly to your wallet.'
              : 'A direct push was buffered on-chain. Click below to pull your dividend balance.'}
          </p>
          <button
            onClick={handleClaim}
            disabled={status !== 'idle'}
            className="w-full py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
          >
            {status === 'claiming' ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Claiming On-Chain…</span>
              </>
            ) : status === 'success' ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>Claimed!</span>
              </>
            ) : (
              <>
                <span>Claim Available Balance</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-semibold">{error}</div>
      )}

      {txHash && txHash !== 'pending' && (
        <div className="p-2.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-[10px] text-[#047857] font-mono text-center">
          TX: {txHash.slice(0, 20)}…
        </div>
      )}
    </div>
  );
};
