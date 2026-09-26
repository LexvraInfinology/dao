'use client';

import React, { useState } from 'react';
import {
  Users, CreditCard, Vote, Armchair, ChevronRight, Loader2,
  ArrowDownLeft, ArrowUpRight, Layers, Building2, Inbox, ArrowRight,
} from 'lucide-react';
import type { TransactionItem } from '@/hooks/useApi';

interface TransactionsMobileListProps {
  transactions?: TransactionItem[];
  loading?: boolean;
  onRefresh?: () => void;
}

function getTypeIcon(type: string) {
  const base = 'w-8 h-8 rounded-xl flex items-center justify-center shrink-0';
  if (type === 'withdrawal')
    return <div className={`${base} bg-[#FEF2F2] border border-[#FECACA] text-[#EF4444]`}><CreditCard className="w-4 h-4" /></div>;
  if (type.startsWith('matrix_'))
    return <div className={`${base} bg-purple-50 border border-purple-200 text-purple-600`}><Layers className="w-4 h-4" /></div>;
  if (type === 'joined' || type === 'council_seat')
    return <div className={`${base} bg-[#EFF6FF] border border-[#BFDBFE]/40 text-[#155EEF]`}><Armchair className="w-4 h-4" /></div>;
  if (type === 'pushed' || type === 'seat_distribution' || type === 'fallback_claimed')
    return <div className={`${base} bg-[#EFF6FF] border border-[#BFDBFE]/40 text-[#155EEF]`}><Users className="w-4 h-4" /></div>;
  if (type.includes('vote') || type === 'governance')
    return <div className={`${base} bg-purple-50 border border-purple-200 text-purple-600`}><Vote className="w-4 h-4" /></div>;
  return <div className={`${base} bg-[#EFF6FF] border border-[#BFDBFE]/40 text-[#155EEF]`}><Users className="w-4 h-4" /></div>;
}

function timeAgoLabel(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function shortAddr(addr: string) {
  if (!addr) return '—';
  if (addr.length > 14) return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
  return addr;
}

export const TransactionsMobileList: React.FC<TransactionsMobileListProps> = ({
  transactions = [],
  loading = false,
  onRefresh,
}) => {
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null);

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-[#94A3B8] font-jakarta gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-[#155EEF]" />
        Loading transactions…
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-[#94A3B8] font-jakarta">
        No transactions yet.
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      <div className="space-y-3">
        {transactions.slice(0, 7).map((tx) => (
          <div key={tx.id} onClick={() => setSelectedTx(tx)}
            className="bg-white border border-[#E2ECF9] rounded-2xl p-4 shadow-[0_2px_10px_rgba(15,23,42,0.02)] space-y-3 hover:border-blue-200 transition-all cursor-pointer">
            {/* Top row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {getTypeIcon(tx.type)}
                <span className="text-sm font-bold font-jakarta text-[#071A4A]">{tx.typeLabel}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#60739A] font-medium font-jakarta">{timeAgoLabel(tx.timestamp)}</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EEF5FF] border border-[#BFDBFE]/60 text-[10px] font-bold text-[#155EEF]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#155EEF]" />Success
                </span>
              </div>
            </div>

            {/* Amount row */}
            {tx.amountBtt > 0 && (
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className={`text-lg font-black font-jakarta tracking-tight ${tx.isPositive === false ? 'text-[#DC2626]' : 'text-[#071A4A]'}`}>
                    {tx.isPositive === false ? '-' : tx.isPositive ? '+' : ''}${tx.amountUsd.toFixed(2)} USD
                  </div>
                  <div className={`text-xs font-bold font-jakarta ${tx.isPositive === false ? 'text-[#DC2626]' : 'text-[#155EEF]'}`}>
                    {tx.isPositive === false ? '-' : '+'}{tx.amountBtt.toFixed(2)} TROB
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#64748B]">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            )}

            {/* Entity box */}
            <div className="bg-[#F8FAFC] border border-[#E2ECF9] rounded-xl p-2.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${tx.type === 'withdrawal' ? 'bg-[#FEF2F2] border-[#FECACA] text-[#EF4444]' : 'bg-[#EFF6FF] border-[#BFDBFE]/60 text-[#155EEF]'}`}>
                  {tx.type === 'withdrawal' ? <Building2 className="w-3.5 h-3.5" /> : <Inbox className="w-3.5 h-3.5" />}
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="text-[11px] font-bold font-jakarta text-[#071A4A] truncate">FROM: {shortAddr(tx.from)}</div>
                  <div className="text-[10px] font-mono text-[#94A3B8] truncate">→ {shortAddr(tx.to)}</div>
                </div>
              </div>
              <div className="shrink-0">
                {tx.isPositive === false
                  ? <span className="px-2.5 py-0.5 rounded-full bg-[#FEF2F2] border border-[#FECACA] text-[10px] font-bold text-[#EF4444]">Outgoing</span>
                  : <span className="text-xs font-semibold font-jakarta text-[#155EEF]">Verified</span>
                }
              </div>
            </div>
          </div>
        ))}
      </div>

      {transactions.length > 0 && (
        <div className="pt-2 space-y-2">
          <button onClick={onRefresh}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#155EEF] hover:bg-[#0052E6] text-white font-bold text-sm transition-all shadow-[0_4px_16px_rgba(21,94,239,0.32)] flex items-center justify-center gap-2">
            <span>View All Transactions</span><ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-xs text-[#94A3B8] text-center font-jakarta">
            Showing {Math.min(7, transactions.length)} of {transactions.length} transactions
          </p>
        </div>
      )}

      {/* Detail modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs" onClick={() => setSelectedTx(null)}>
          <div className="bg-white border border-[#E2ECF9] rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#E2ECF9] pb-3">
              <h3 className="text-sm font-bold text-[#071A4A] font-jakarta">Transaction Details</h3>
              <button onClick={() => setSelectedTx(null)} className="text-[#94A3B8] text-sm font-bold">✕</button>
            </div>
            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2ECF9] space-y-1.5 text-xs font-jakarta">
              {[
                ['Type',    selectedTx.typeLabel],
                ['Time',    timeAgoLabel(selectedTx.timestamp)],
                ['Amount',  selectedTx.amountBtt > 0 ? `$${selectedTx.amountUsd.toFixed(2)} / ${selectedTx.amountBtt.toFixed(2)} TROB` : '—'],
                ['From',    selectedTx.from],
                ['To',      selectedTx.to],
                ['Tx Hash', selectedTx.txHash],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between gap-2">
                  <span className="text-[#60739A] shrink-0">{label}:</span>
                  <span className="font-bold text-[#071A4A] font-mono text-right break-all">{val}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setSelectedTx(null)} className="w-full py-2.5 rounded-xl bg-[#155EEF] text-white font-bold text-xs hover:bg-[#0052E6] transition-all">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};
