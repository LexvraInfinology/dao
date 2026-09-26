'use client';

import React, { useState } from 'react';
import { CreditCard, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useTrobPrice } from '@/hooks/useApi';
import { useWallet } from '@/context/WalletContext';

interface TreasuryWithdrawCardProps {
  availableBalance?: number;
  onWithdrawSuccess?: (amount: number) => void;
  variant?: 'desktop' | 'mobile' | 'auto';
  walletAddress?: string;
}

export const TreasuryWithdrawCard: React.FC<TreasuryWithdrawCardProps> = ({
  availableBalance = 420.50,
  onWithdrawSuccess,
  variant = 'auto',
  walletAddress,
}) => {
  const wallet  = useWallet();
  const { data: priceData } = useTrobPrice(30_000);

  const [amount, setAmount]         = useState('');
  const [status, setStatus]         = useState<'idle' | 'withdrawing' | 'success' | 'error'>('idle');
  const [activeChip, setActiveChip] = useState<number | null>(null);
  const [txHash, setTxHash]         = useState<string | null>(null);
  const [error, setError]           = useState<string | null>(null);

  const trobRate      = priceData?.priceUsd ?? 0.151688;
  const numAmount     = parseFloat(amount) || 0;
  const trobReceived  = trobRate > 0
    ? (numAmount / trobRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '0.00';

  const shortDest = walletAddress
    ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`
    : wallet.base58Address
    ? `${wallet.base58Address.slice(0, 6)}…${wallet.base58Address.slice(-4)}`
    : wallet.hexAddress
    ? `${wallet.hexAddress.slice(0, 6)}…${wallet.hexAddress.slice(-4)}`
    : '—';

  const handleChipClick = (pct: number) => {
    setActiveChip(pct);
    setAmount((availableBalance * pct).toFixed(2));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
    setActiveChip(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0 || numAmount > availableBalance || status !== 'idle') return;

    setError(null);
    setStatus('withdrawing');

    try {
      const vaultAddress = process.env.NEXT_PUBLIC_VAULT_ADDRESS ?? '';
      if (vaultAddress && wallet.isConnected) {
        // withdraw(uint256 amount) — amount in smallest unit
        const amountSun = Math.ceil(numAmount / trobRate * 1_000_000);
        const result = await wallet.callContract({
          contract_address:  vaultAddress,
          function_selector: 'withdraw(uint256)',
          parameter:         amountSun.toString(16).padStart(64, '0'),
          call_value:        0,
          fee_limit:         100_000_000,
          owner_address:     wallet.base58Address ?? wallet.hexAddress ?? '',
        });
        if (!result.result) throw new Error('Transaction rejected by contract.');
        setTxHash(result.txid);
      }

      setStatus('success');
      if (onWithdrawSuccess) onWithdrawSuccess(numAmount);
      setTimeout(() => { setStatus('idle'); setAmount(''); setActiveChip(null); setTxHash(null); }, 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Transaction failed.');
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const chips = [0.25, 0.5, 0.75, 1] as const;

  const AmountInput = ({ compact = false }: { compact?: boolean }) => (
    <div className="relative">
      <input type="number" step="0.01" min="0" max={availableBalance}
        value={amount} onChange={handleInputChange} placeholder="0.00"
        className={`w-full ${compact ? 'px-4 py-3.5 rounded-xl' : 'px-5 py-3.5 rounded-2xl'} bg-[#F8FAFC] border border-[#E2ECF9] focus:border-[#155EEF] focus:bg-white text-base font-bold text-[#071A4A] placeholder-[#94A3B8] transition-all font-jakarta pr-16 focus:outline-none`}
      />
      <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#60739A]">USD</span>
    </div>
  );

  const ChipRow = ({ gap = 3 }: { gap?: number }) => (
    <div className={`grid grid-cols-4 gap-${gap} pt-0.5`}>
      {chips.map((pct) => (
        <button key={pct} type="button" onClick={() => handleChipClick(pct)}
          className={`py-2 px-2 sm:px-3 rounded-xl border text-xs font-bold font-jakarta transition-all text-center ${
            activeChip === pct
              ? 'border-[#155EEF] bg-[#EEF5FF] text-[#155EEF]'
              : 'border-[#E2ECF9] bg-[#F8FAFC] hover:bg-[#EEF5FF] hover:border-blue-200 text-[#071A4A]'
          }`}>
          {pct === 1 ? 'MAX' : `${pct * 100}%`}
        </button>
      ))}
    </div>
  );

  const SubmitButton = () => (
    <button type="submit" disabled={status !== 'idle' || numAmount <= 0 || numAmount > availableBalance}
      className="w-full py-3.5 px-4 rounded-2xl bg-[#155EEF] hover:bg-[#0052E6] disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm transition-all shadow-[0_4px_16px_rgba(21,94,239,0.32)] flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed">
      {status === 'withdrawing'
        ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /><span>Processing…</span></>
        : status === 'success'
        ? <><CheckCircle2 className="w-4 h-4 text-emerald-300" /><span>Withdrawn!</span></>
        : status === 'error'
        ? <><AlertTriangle className="w-4 h-4 text-red-300" /><span>Failed — try again</span></>
        : <><span>Withdraw to Wallet</span><ArrowRight className="w-4 h-4" /></>
      }
    </button>
  );

  return (
    <div className="bg-white border border-[#E2ECF9] rounded-2xl sm:rounded-3xl p-5 sm:p-7 lg:p-8 shadow-[0_4px_25px_rgba(15,23,42,0.03)] space-y-5 sm:space-y-6">
      <div>
        <h2 className="text-base sm:text-lg font-bold font-jakarta text-[#071A4A]">Withdraw</h2>
        <p className="text-xs text-[#60739A] font-jakarta mt-0.5 hidden lg:block">
          Move available treasury funds to your connected wallet.
        </p>
        <p className="text-xs text-[#60739A] font-jakarta mt-0.5 lg:hidden">
          Available: <span className="font-bold text-[#071A4A]">${availableBalance.toFixed(2)}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Desktop 2-col layout */}
        {(variant === 'desktop' || variant === 'auto') && (
          <div className={`hidden lg:grid grid-cols-12 gap-6 items-end ${variant === 'desktop' ? '!grid' : ''}`}>
            <div className="col-span-8 space-y-3">
              <label className="block text-xs font-bold font-jakarta text-[#071A4A]">Amount</label>
              <AmountInput />
              <ChipRow gap={3} />
            </div>
            <div className="col-span-4 space-y-3">
              <div className="rounded-2xl border border-[#E2ECF9] bg-[#F8FAFC] p-3.5 sm:p-4 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#E2ECF9] flex items-center justify-center text-[#155EEF] shrink-0 shadow-2xs">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="text-[11px] font-medium font-jakarta text-[#60739A]">You will receive</div>
                  <div className="text-sm sm:text-base font-black font-jakarta text-[#071A4A] truncate">{trobReceived} TROB</div>
                  <div className="text-[10px] font-medium font-jakarta text-[#94A3B8]">≈ ${numAmount > 0 ? numAmount.toFixed(2) : '0.00'} USD</div>
                </div>
              </div>
              <SubmitButton />
            </div>
          </div>
        )}

        {/* Mobile stacked layout */}
        {(variant === 'mobile' || variant === 'auto') && (
          <div className={`space-y-4 ${variant === 'auto' ? 'lg:hidden' : ''}`}>
            <div className="space-y-2">
              <label className="block text-xs font-bold font-jakarta text-[#071A4A]">Amount</label>
              <AmountInput compact />
              <ChipRow gap={2} />
            </div>
            <SubmitButton />
          </div>
        )}
      </form>

      {/* Error notice */}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-xs text-red-600 font-semibold font-jakarta">
          <AlertTriangle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      {/* Success notice */}
      {status === 'success' && (
        <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center gap-2.5 text-xs text-[#047857] font-semibold font-jakarta">
          <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
          <span>
            Withdrawal of ${numAmount.toFixed(2)} submitted to {shortDest}
            {txHash && ` · TX: ${txHash.slice(0, 12)}…`}
          </span>
        </div>
      )}
    </div>
  );
};
