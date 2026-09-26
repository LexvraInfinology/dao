'use client';

import React, { useState } from 'react';
import {
  RefreshCw, Users, CreditCard, Vote, Armchair, ArrowDownLeft,
  ArrowUpRight, Layers, ExternalLink, Info, ArrowLeft, ArrowRight, Loader2,
} from 'lucide-react';
import type { TransactionItem } from '@/hooks/useApi';

interface TransactionsTableProps {
  transactions?: TransactionItem[];
  loading?: boolean;
  onRefresh?: () => void;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  bttPriceUsd?: number;
}

function getTypeIcon(type: string) {
  const base = 'w-7 h-7 rounded-lg flex items-center justify-center shrink-0';
  if (type === 'withdrawal')
    return <div className={`${base} bg-[#FEF2F2] text-[#EF4444]`}><ArrowUpRight className="w-3.5 h-3.5" /></div>;
  if (type.startsWith('matrix_'))
    return <div className={`${base} bg-purple-50 text-purple-600`}><Layers className="w-3.5 h-3.5" /></div>;
  if (type === 'joined' || type === 'council_seat')
    return <div className={`${base} bg-[#EFF6FF] text-[#155EEF]`}><Armchair className="w-3.5 h-3.5" /></div>;
  if (type === 'pushed' || type === 'seat_distribution' || type === 'fallback_claimed')
    return <div className={`${base} bg-[#ECFDF5] text-[#059669]`}><ArrowDownLeft className="w-3.5 h-3.5" /></div>;
  if (type === 'vote' || type.includes('vote'))
    return <div className={`${base} bg-purple-50 text-purple-600`}><Vote className="w-3.5 h-3.5" /></div>;
  return <div className={`${base} bg-[#EFF6FF] text-[#155EEF]`}><Users className="w-3.5 h-3.5" /></div>;
}

function shortAddr(addr: string) {
  if (!addr || addr === '—') return addr;
  if (addr.length > 14) return `${addr.slice(0, 8)}…${addr.slice(-4)}`;
  return addr;
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

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions = [],
  loading = false,
  onRefresh,
  page = 1,
  totalPages = 1,
  onPageChange,
  bttPriceUsd = 1,
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null);

  const handleRefresh = () => {
    setRefreshing(true);
    onRefresh?.();
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <div className="bg-white border border-[#E2ECF9] rounded-3xl shadow-[0_4px_25px_rgba(15,23,42,0.03)] overflow-hidden">
      {/* Table header bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2ECF9]">
        <div className="flex items-center gap-2.5">
          <h3 className="text-base font-bold font-jakarta text-[#071A4A]">Transaction History</h3>
          {loading && <Loader2 className="w-4 h-4 animate-spin text-[#155EEF]" />}
        </div>
        <div className="flex items-center gap-2">
          {bttPriceUsd > 0 && (
            <span className="text-xs text-[#60739A] font-jakarta hidden sm:block">
              TROB @ <span className="font-bold text-[#071A4A]">${bttPriceUsd.toFixed(4)}</span>
            </span>
          )}
          <button onClick={handleRefresh}
            className={`p-2 rounded-xl border border-[#E2ECF9] text-[#60739A] hover:text-[#155EEF] hover:border-blue-200 transition-all ${refreshing ? 'animate-spin text-[#155EEF]' : ''}`}
            title="Refresh">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Column headers */}
      <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-2.5 bg-[#F8FAFC] border-b border-[#F1F5F9] text-[10px] font-bold uppercase tracking-wider text-[#64748B] font-jakarta">
        <div className="col-span-1">Type</div>
        <div className="col-span-3">Details</div>
        <div className="col-span-2">From</div>
        <div className="col-span-2">To</div>
        <div className="col-span-2 text-right">Amount</div>
        <div className="col-span-1 text-right">Status</div>
        <div className="col-span-1 text-right">Action</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-[#F8FAFC]">
        {transactions.length === 0 && !loading && (
          <div className="px-6 py-12 text-center text-sm text-[#94A3B8] font-jakarta">
            No transactions found.
          </div>
        )}
        {transactions.map((tx) => (
          <div key={tx.id}
            onClick={() => setSelectedTx(tx)}
            className="grid grid-cols-12 gap-4 px-6 py-3.5 items-center hover:bg-[#F8FAFC] cursor-pointer transition-colors text-xs font-jakarta">
            {/* Type icon */}
            <div className="col-span-1">{getTypeIcon(tx.type)}</div>
            {/* Label + time */}
            <div className="col-span-3 min-w-0">
              <div className="font-bold text-[#071A4A] truncate">{tx.typeLabel}</div>
              <div className="text-[#94A3B8] mt-0.5">{timeAgoLabel(tx.timestamp)}</div>
            </div>
            {/* From */}
            <div className="col-span-2 font-mono text-[#60739A] truncate">{shortAddr(tx.from)}</div>
            {/* To */}
            <div className="col-span-2 font-mono text-[#60739A] truncate">{shortAddr(tx.to)}</div>
            {/* Amount */}
            <div className="col-span-2 text-right">
              {tx.amountBtt > 0 ? (
                <>
                  <div className={`font-black ${tx.isPositive === false ? 'text-[#DC2626]' : tx.isPositive ? 'text-[#059669]' : 'text-[#071A4A]'}`}>
                    {tx.isPositive === false ? '-' : tx.isPositive ? '+' : ''}${tx.amountUsd.toFixed(2)}
                  </div>
                  <div className="text-[#94A3B8] text-[10px]">
                    {tx.isPositive === false ? '-' : '+'}{tx.amountBtt.toFixed(2)} TROB
                  </div>
                </>
              ) : (
                <div className="text-[#94A3B8]">—</div>
              )}
            </div>
            {/* Status */}
            <div className="col-span-1 text-right">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]/60 text-[10px] font-bold text-[#059669]">
                <span className="w-1 h-1 rounded-full bg-[#059669]" />{tx.status}
              </span>
            </div>
            {/* Explorer link */}
            <div className="col-span-1 flex justify-end">
              <a href={`https://tronscan.io/#/transaction/${tx.txHash}`} target="_blank" rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#155EEF] hover:bg-blue-50 transition-colors">
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-[#E2ECF9] flex items-center justify-between text-xs font-jakarta">
          <span className="text-[#60739A]">Page {page} of {totalPages}</span>
          <div className="flex items-center gap-2">
            <button onClick={() => onPageChange?.(page - 1)} disabled={page <= 1}
              className="p-1.5 rounded-lg border border-[#E2ECF9] text-[#60739A] hover:text-[#155EEF] disabled:opacity-40">
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onPageChange?.(page + 1)} disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-[#E2ECF9] text-[#60739A] hover:text-[#155EEF] disabled:opacity-40">
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs" onClick={() => setSelectedTx(null)}>
          <div className="bg-white border border-[#E2ECF9] rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#E2ECF9] pb-3">
              <h3 className="text-sm font-bold text-[#071A4A] font-jakarta">Transaction Details</h3>
              <button onClick={() => setSelectedTx(null)} className="text-[#94A3B8] hover:text-[#071A4A] text-sm font-bold">✕</button>
            </div>
            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2ECF9] space-y-1.5 text-xs font-jakarta">
              {[
                ['Type',      selectedTx.typeLabel],
                ['Time',      timeAgoLabel(selectedTx.timestamp)],
                ['Amount',    selectedTx.amountBtt > 0 ? `$${selectedTx.amountUsd.toFixed(2)} / ${selectedTx.amountBtt.toFixed(2)} TROB` : '—'],
                ['From',      selectedTx.from],
                ['To',        selectedTx.to],
                ['Status',    selectedTx.status],
                ['Tx Hash',   selectedTx.txHash],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between gap-2">
                  <span className="text-[#60739A] shrink-0">{label}:</span>
                  <span className="font-bold text-[#071A4A] font-mono text-right break-all">{val}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSelectedTx(null)} className="flex-1 py-2.5 rounded-xl bg-[#155EEF] text-white font-bold text-xs hover:bg-[#0052E6] transition-all">Close</button>
              <a href={`https://tronscan.io/#/transaction/${selectedTx.txHash}`} target="_blank" rel="noreferrer"
                className="flex-1 py-2.5 rounded-xl border border-[#E2ECF9] text-[#155EEF] font-bold text-xs hover:bg-blue-50 transition-all flex items-center justify-center gap-1">
                <ExternalLink className="w-3 h-3" />Explorer
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
