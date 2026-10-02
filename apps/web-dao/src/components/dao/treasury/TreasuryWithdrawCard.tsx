'use client';

import React, { useState } from 'react';
import { CheckCircle2, ShieldCheck, Zap, Wallet, Layers, ArrowRight, Info, AlertTriangle, Check } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';

interface TreasuryWithdrawCardProps {
  availableBalance?: number;
  onWithdrawSuccess?: (amount: number) => void;
  variant?: 'desktop' | 'mobile' | 'auto';
  walletAddress?: string;
}

export const TreasuryWithdrawCard: React.FC<TreasuryWithdrawCardProps> = ({
  availableBalance = 0,
  onWithdrawSuccess,
  variant = 'auto',
  walletAddress,
}) => {
  const wallet = useWallet();
  const [status, setStatus] = useState<'idle' | 'claiming' | 'success' | 'error'>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError]   = useState<string | null>(null);

  const shortDest = walletAddress
    ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`
    : wallet.base58Address
    ? `${wallet.base58Address.slice(0, 6)}…${wallet.base58Address.slice(-4)}`
    : wallet.hexAddress
    ? `${wallet.hexAddress.slice(0, 6)}…${wallet.hexAddress.slice(-4)}`
    : '—';

  // Only used if an unverified contract wallet caused a push failure (pull fallback balance > 0)
  const handleClaimFallback = async () => {
    if (availableBalance <= 0 || status !== 'idle') return;
    setError(null);
    setStatus('claiming');

    try {
      const daoAddress = process.env.NEXT_PUBLIC_DAO_ADDRESS ?? '';
      if (daoAddress && wallet.isConnected) {
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
      if (onWithdrawSuccess) onWithdrawSuccess(availableBalance);
      setTimeout(() => {
        setStatus('idle');
        setTxHash(null);
      }, 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Transaction failed.');
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <div className="bg-white border border-[#E2ECF9] rounded-2xl sm:rounded-3xl p-5 sm:p-7 lg:p-8 shadow-[0_4px_25px_rgba(15,23,42,0.03)] space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE]/40 text-[#155EEF] flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-[#155EEF]" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold font-jakarta text-[#071A4A]">
              Autonomous Treasury Stream
            </h2>
            <p className="text-xs text-[#60739A] font-jakarta">
              Direct-to-wallet on-chain payouts without manual withdrawal buttons
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-bold text-[#059669]">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Zero Gas Fees to Receive
        </span>
      </div>

      {/* Autonomous Direct Distribution Channels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Channel 1: Instant Cashback & Queue Splits */}
        <div className="rounded-2xl border border-[#E2ECF9] bg-[#F8FAFC] p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#155EEF] font-jakarta flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#155EEF]" />
              Genesis Seats (300 / N)
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100/70 text-[10px] font-bold text-emerald-700">
              Auto-Push
            </span>
          </div>
          <div className="text-sm font-bold text-[#071A4A] font-jakarta">
            Instant Deposit Splitting
          </div>
          <p className="text-xs text-[#60739A] font-jakarta leading-relaxed">
            Every $300 USD entry deposit is divided equally among members 1 to N and pushed directly to their wallets in the deposit transaction block.
          </p>
          <div className="text-[11px] font-semibold text-[#10B981] font-jakarta pt-1 flex items-center gap-1">
            <Check className="w-3.5 h-3.5 shrink-0" />
            <span>Recipient Gas Fee: $0.00 (Zero Gas)</span>
          </div>
        </div>

        {/* Channel 2: Retail Matrix Pools */}
        <div className="rounded-2xl border border-[#E2ECF9] bg-[#F8FAFC] p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#155EEF] font-jakarta flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#155EEF]" />
              Matrix Pools (35% Share)
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100/70 text-[10px] font-bold text-emerald-700">
              Autonomous
            </span>
          </div>
          <div className="text-sm font-bold text-[#071A4A] font-jakarta">
            Direct Protocol Royalties
          </div>
          <p className="text-xs text-[#60739A] font-jakarta leading-relaxed">
            35% of matrix slot inflows stream directly into eligible member wallets on-chain when matrix slots are activated.
          </p>
          <div className="text-[11px] font-semibold text-[#10B981] font-jakarta pt-1 flex items-center gap-1">
            <Check className="w-3.5 h-3.5 shrink-0" />
            <span>Recipient Gas Fee: $0.00 (Zero Gas)</span>
          </div>
        </div>
      </div>

      {/* Wallet Settlement Verification */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] border border-[#86EFAC] flex items-center justify-center text-[#15803D] shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <div className="text-xs font-bold text-[#166534] font-jakarta flex items-center gap-1.5">
              <span>Direct-to-Wallet Blockchain Settlement</span>
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
            </div>
            <div className="text-xs text-[#15803D] font-jakarta">
              Funds are never held on the frontend. Smart contracts push tokens directly to your connected address.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#BBF7D0] text-xs font-mono font-bold text-[#071A4A] shrink-0">
          <Wallet className="w-3.5 h-3.5 text-[#155EEF]" />
          <span>{shortDest}</span>
        </div>
      </div>

      {/* Emergency Fallback (Only shown if a contract push failed) */}
      {availableBalance > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-800 font-jakarta">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Fallback Claim Buffer: ${availableBalance.toFixed(2)} USD</span>
          </div>
          <p className="text-xs text-amber-700 font-jakarta leading-relaxed">
            A direct push was redirected to the on-chain fallback reserve (typically if the receiver is an unverified contract). You can claim it below.
          </p>
          <button
            onClick={handleClaimFallback}
            disabled={status !== 'idle'}
            className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
          >
            {status === 'claiming' ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Claiming Fallback…</span>
              </>
            ) : status === 'success' ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>Claimed Successfully!</span>
              </>
            ) : (
              <>
                <span>Claim Fallback Reserve</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-xs text-red-600 font-semibold font-jakarta">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {txHash && (
        <div className="p-3 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-xs text-[#047857] font-mono text-center">
          TX Confirmed: {txHash.slice(0, 24)}…
        </div>
      )}
    </div>
  );
};
