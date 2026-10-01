'use client';

import React, { useState } from 'react';
import { Zap, CheckCircle2, ShieldCheck, ArrowRight, Wallet, Info } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';

interface ClaimableDividendsCardProps {
  initialAmount?: number;     // Unclaimed fallback if any (normally 0)
  pushedAmountUsd?: number;   // Total USD pushed directly to wallet
  pushedAmountTrob?: number;  // Total TROB pushed directly to wallet
  priceUsd?: number;          // Live TROB/USD market price
  walletAddress?: string;
}

export const ClaimableDividendsCard: React.FC<ClaimableDividendsCardProps> = ({
  initialAmount = 0,
  pushedAmountUsd = 0,
  pushedAmountTrob = 0,
  priceUsd,
  walletAddress,
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

  // Only used in extreme edge-case where contract push failed to non-standard address
  const handleClaimFallback = async () => {
    if (balance <= 0 || status !== 'idle') return;
    setError(null);
    setStatus('claiming');

    try {
      const daoAddress = process.env.NEXT_PUBLIC_DAO_ADDRESS ?? '';
      if (daoAddress && wallet.isConnected) {
        // claimFallback() on the EquoraDAO contract
        const result = await wallet.callContract({
          contract_address:  daoAddress,
          function_selector: 'claimFallback()',
          parameter:         '',
          call_value:        0,
          fee_limit:         50_000_000,
          owner_address:     wallet.base58Address ?? wallet.hexAddress ?? '',
        });
        if (!result.result) throw new Error('Transaction rejected by contract.');
        setTxHash(result.txid);
      }

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

  const displayPushedUsd = pushedAmountUsd > 0 ? pushedAmountUsd : 0;
  const effectivePrice = priceUsd && priceUsd > 0 ? priceUsd : 0.056;
  const displayPushedTrob = pushedAmountTrob > 0
    ? pushedAmountTrob.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : displayPushedUsd > 0
    ? (displayPushedUsd / effectivePrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '0.00';

  return (
    <div className="bg-white border border-[#E2ECF9] rounded-3xl p-6 shadow-[0_4px_20px_rgba(15,23,42,0.03)] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE]/40 text-[#155EEF] flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-[#155EEF]" />
          </div>
          <h3 className="text-base font-bold font-jakarta text-[#071A4A]">Direct-to-Wallet Payouts</h3>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[10px] font-bold text-[#059669]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
          Zero Gas Fees
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
        <div className="text-xs font-semibold font-jakarta text-[#10B981] flex items-center gap-1.5">
          <span>≈ {displayPushedTrob} TROB</span>
          <span className="text-[#94A3B8]">·</span>
          <span>Delivered On-Chain</span>
        </div>
      </div>

      {/* Autonomous Push Explainer */}
      <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] space-y-1.5">
        <div className="flex items-center gap-2 text-xs font-bold text-[#166534] font-jakarta">
          <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
          <span>100% Autonomous On-Chain Push</span>
        </div>
        <p className="text-[11px] text-[#15803D] font-jakarta leading-relaxed">
          Instant cashback (300/N split) and pool distributions are sent automatically by smart contracts directly into your connected wallet. No manual withdraw button or gas fees needed.
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
        <div className="py-2 flex items-center justify-between">
          <span className="text-[#60739A]">Destination Wallet</span>
          <span className="font-mono font-bold text-[#155EEF] flex items-center gap-1">
            <Wallet className="w-3 h-3 text-[#155EEF]" />
            {shortAddr}
          </span>
        </div>
      </div>

      {/* Emergency Fallback Claim (Only visible if contract push failed) */}
      {balance > 0 && (
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 font-jakarta">
            <Info className="w-3.5 h-3.5 text-amber-600" />
            <span>Fallback Buffer: ${balance.toFixed(2)} USD</span>
          </div>
          <p className="text-[11px] text-amber-700 font-jakarta leading-tight">
            A direct push failed (non-standard wallet recipient). Click below to claim your reserve balance.
          </p>
          <button
            onClick={handleClaimFallback}
            disabled={status !== 'idle'}
            className="w-full py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
          >
            {status === 'claiming' ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Claiming Fallback…</span>
              </>
            ) : status === 'success' ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>Claimed!</span>
              </>
            ) : (
              <>
                <span>Claim Fallback Balance</span>
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
