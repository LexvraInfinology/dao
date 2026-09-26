'use client';

import React, { useState } from 'react';
import { Database, ArrowRight, CheckCircle2, Info } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';

interface ClaimableDividendsCardProps {
  initialAmount?: number;
  walletAddress?: string;
}

export const ClaimableDividendsCard: React.FC<ClaimableDividendsCardProps> = ({
  initialAmount = 0,
  walletAddress,
}) => {
  const wallet   = useWallet();
  const [balance, setBalance]   = useState<number>(initialAmount);
  const [status, setStatus]     = useState<'idle' | 'claiming' | 'success'>('idle');
  const [txHash, setTxHash]     = useState<string | null>(null);
  const [error, setError]       = useState<string | null>(null);

  // Sync when prop changes (parent refetches)
  React.useEffect(() => {
    setBalance(initialAmount);
  }, [initialAmount]);

  const shortAddr = walletAddress
    ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`
    : wallet.base58Address
    ? `${wallet.base58Address.slice(0, 6)}…${wallet.base58Address.slice(-4)}`
    : '—';

  const handleWithdraw = async () => {
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

  return (
    <div className="bg-white border border-[#E2ECF9] rounded-3xl p-6 shadow-[0_4px_20px_rgba(15,23,42,0.03)] space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE]/40 text-[#155EEF] flex items-center justify-center shrink-0">
          <Database className="w-4 h-4" />
        </div>
        <h3 className="text-base font-bold font-jakarta text-[#071A4A]">Claimable Dividends</h3>
      </div>

      <div className="space-y-1">
        <div className="text-3xl sm:text-4xl font-black font-jakarta text-[#071A4A] tracking-tight">
          ${balance.toFixed(2)} <span className="text-lg font-normal text-slate-400">USD</span>
        </div>
        <div className="text-xs font-semibold font-jakarta text-[#10B981] flex items-center gap-1.5">
          {balance > 0
            ? <><span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" /><span>Ready to withdraw</span></>
            : <span className="text-[#94A3B8]">No pending dividends</span>
          }
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-semibold">{error}</div>
      )}

      <button onClick={handleWithdraw} disabled={balance === 0 || status !== 'idle'}
        className="w-full py-3.5 px-4 rounded-2xl bg-[#155EEF] hover:bg-[#0052E6] disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm sm:text-base transition-all shadow-[0_4px_16px_rgba(21,94,239,0.32)] flex items-center justify-center gap-2">
        {status === 'claiming'
          ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /><span>Processing On-Chain…</span></>
          : status === 'success'
          ? <><CheckCircle2 className="w-4 h-4 text-emerald-300" /><span>Transferred to {shortAddr}!</span></>
          : <><span>Withdraw to Wallet</span><ArrowRight className="w-4 h-4" /></>
        }
      </button>

      {txHash && txHash !== 'pending' && (
        <div className="p-2.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-[10px] text-[#047857] font-mono text-center">
          TX: {txHash.slice(0, 20)}…
        </div>
      )}

      <div className="flex items-center justify-between text-xs pt-1 border-t border-[#F8FAFC]">
        <span className="text-[#60739A] font-medium font-jakarta">Estimated Gas Fee</span>
        <div className="flex items-center gap-1 text-[#071A4A] font-bold font-jakarta">
          <span>&lt; $0.005</span>
          <Info className="w-3.5 h-3.5 text-[#94A3B8]" />
        </div>
      </div>
    </div>
  );
};
