'use client';

import React, { useState } from 'react';
import {
  RefreshCw, Users, CreditCard, Vote, Armchair, ArrowDownLeft,
  ArrowUpRight, Layers, ExternalLink, ArrowLeft, ArrowRight, Loader2,
  Search, ChevronsLeft, ChevronsRight, Globe, Wallet, Filter, Check, Copy
} from 'lucide-react';
import type { TransactionItem } from '@/hooks/useApi';

interface TransactionsTableProps {
  transactions?: TransactionItem[];
  loading?: boolean;
  onRefresh?: () => void;
  page?: number;
  totalPages?: number;
  total?: number;
  limit?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  viewScope?: 'all' | 'my';
  onViewScopeChange?: (scope: 'all' | 'my') => void;
  typeFilter?: string;
  onTypeFilterChange?: (type: string) => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  activeAddress?: string | null;
  bttPriceUsd?: number;
  trobPriceUsd?: number;
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
  if (addr === 'EquoraDAO Protocol') return 'EquoraDAO Protocol';
  if (addr.length > 14) return `${addr.slice(0, 8)}…${addr.slice(-4)}`;
  return addr;
}

function timeAgoLabel(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${Math.max(1, s)}s ago`;
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
  total = 0,
  limit = 20,
  onPageChange,
  onLimitChange,
  viewScope = 'all',
  onViewScopeChange,
  typeFilter = 'all',
  onTypeFilterChange,
  searchQuery = '',
  onSearchChange,
  activeAddress,
  bttPriceUsd = 0,
  trobPriceUsd,
}) => {
  const effectiveTrobPrice = trobPriceUsd && trobPriceUsd > 0 ? trobPriceUsd : bttPriceUsd;
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null);
  const [jumpPage, setJumpPage] = useState<string>('');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleRefresh = () => {
    setRefreshing(true);
    onRefresh?.();
    setTimeout(() => setRefreshing(false), 600);
  };

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(jumpPage, 10);
    if (!isNaN(p) && p >= 1 && p <= totalPages) {
      onPageChange?.(p);
      setJumpPage('');
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 1500);
  };

  // Generate numbered pagination window
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (page < totalPages - 2) pages.push('...');
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  const startRecord = total === 0 ? 0 : (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, total);
  const canonicalMyAddr = activeAddress?.toLowerCase() || '';

  return (
    <div className="bg-white border border-[#E2ECF9] rounded-3xl shadow-[0_4px_25px_rgba(15,23,42,0.03)] overflow-hidden">
      {/* Table header bar with View Scope Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between px-6 py-4 border-b border-[#E2ECF9] gap-4 bg-white">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold font-jakarta text-[#071A4A]">Transaction History</h3>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]/60 text-[10px] font-bold text-[#059669]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />Live Ledger
            </span>
          </div>
          {loading && <Loader2 className="w-4 h-4 animate-spin text-[#155EEF]" />}
        </div>

        {/* View Scope Toggle (All vs My Wallet) */}
        <div className="flex items-center gap-2">
          <div className="inline-flex p-1 rounded-xl bg-[#F1F5F9] border border-slate-200 text-xs font-semibold font-jakarta">
            <button
              type="button"
              onClick={() => onViewScopeChange?.('all')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewScope === 'all'
                  ? 'bg-white text-[#155EEF] font-bold shadow-xs'
                  : 'text-[#60739A] hover:text-[#071A4A]'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>All Protocol Activity</span>
            </button>
            <button
              type="button"
              onClick={() => onViewScopeChange?.('my')}
              disabled={!activeAddress}
              title={!activeAddress ? 'Connect wallet to view personal transactions' : undefined}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewScope === 'my'
                  ? 'bg-white text-[#155EEF] font-bold shadow-xs'
                  : 'text-[#60739A] hover:text-[#071A4A]'
              } ${!activeAddress ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>My Wallet</span>
              {activeAddress && (
                <span className="ml-0.5 text-[10px] px-1.5 py-0.2 bg-blue-50 text-[#155EEF] rounded font-mono">
                  {shortAddr(activeAddress)}
                </span>
              )}
            </button>
          </div>

          {effectiveTrobPrice > 0 && (
            <span className="text-xs text-[#60739A] font-jakarta hidden xl:block ml-2">
              TROB @ <span className="font-bold text-[#071A4A]">${effectiveTrobPrice.toFixed(4)}</span>
            </span>
          )}

          <button
            onClick={handleRefresh}
            className={`p-2 rounded-xl border border-[#E2ECF9] text-[#60739A] hover:text-[#155EEF] hover:border-blue-200 transition-all ${
              refreshing ? 'animate-spin text-[#155EEF]' : ''
            }`}
            title="Refresh transactions"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="px-6 py-3 bg-[#F8FAFC] border-b border-[#E2ECF9] flex flex-wrap items-center justify-between gap-3 text-xs font-jakarta">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search by address, tx hash, or seat #..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#E2ECF9] bg-white text-[#071A4A] placeholder-[#94A3B8] focus:outline-hidden focus:border-[#155EEF] transition-all text-xs"
          />
        </div>

        {/* Filters and Limit */}
        <div className="flex items-center gap-3">
          {/* Type filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#60739A]" />
            <select
              value={typeFilter}
              onChange={(e) => onTypeFilterChange?.(e.target.value)}
              className="py-1.5 px-2.5 rounded-xl border border-[#E2ECF9] bg-white text-[#071A4A] font-semibold text-xs focus:outline-hidden focus:border-[#155EEF] cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="joined">Seat Activations</option>
              <option value="pushed">Cashback Dividends (300/N)</option>
              <option value="matrix">Matrix Bridge</option>
              <option value="withdrawal">Withdrawals</option>
            </select>
          </div>

          {/* Rows per page */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#60739A] text-[11px]">Rows:</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange?.(parseInt(e.target.value, 10))}
              className="py-1.5 px-2 rounded-xl border border-[#E2ECF9] bg-white text-[#071A4A] font-bold text-xs focus:outline-hidden focus:border-[#155EEF] cursor-pointer"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
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
          <div className="px-6 py-14 text-center space-y-2 font-jakarta">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-[#64748B]">
              <Search className="w-4 h-4" />
            </div>
            <div className="font-bold text-[#071A4A] text-sm">No transactions found</div>
            <p className="text-xs text-[#94A3B8] max-w-sm mx-auto">
              {viewScope === 'my'
                ? 'No transactions found for your connected wallet. Switch to "All Protocol Activity" to view the complete DAO ledger.'
                : 'No transactions matching your selected filters were found.'}
            </p>
          </div>
        )}
        {transactions.map((tx) => {
          const isToMe = canonicalMyAddr && tx.to.toLowerCase() === canonicalMyAddr;
          const isFromMe = canonicalMyAddr && tx.from.toLowerCase() === canonicalMyAddr;

          return (
            <div
              key={tx.id}
              onClick={() => setSelectedTx(tx)}
              className="grid grid-cols-12 gap-4 px-6 py-3.5 items-center hover:bg-[#F8FAFC] cursor-pointer transition-colors text-xs font-jakarta"
            >
              {/* Type icon */}
              <div className="col-span-1">{getTypeIcon(tx.type)}</div>
              {/* Label + time */}
              <div className="col-span-3 min-w-0">
                <div className="font-bold text-[#071A4A] truncate">{tx.typeLabel}</div>
                <div className="text-[#94A3B8] mt-0.5">{timeAgoLabel(tx.timestamp)}</div>
              </div>
              {/* From */}
              <div className="col-span-2 font-mono text-[#60739A] truncate">
                {shortAddr(tx.from)}
                {isFromMe && <span className="ml-1 text-[10px] text-[#155EEF] font-bold font-jakarta">(You)</span>}
              </div>
              {/* To */}
              <div className="col-span-2 font-mono text-[#60739A] truncate">
                {shortAddr(tx.to)}
                {isToMe && <span className="ml-1 text-[10px] text-[#059669] font-bold font-jakarta">(You)</span>}
              </div>
              {/* Amount */}
              <div className="col-span-2 text-right">
                {(() => {
                  const trobAmt = tx.amountTrob ?? tx.amountBtt;
                  return trobAmt > 0 || tx.amountUsd > 0 ? (
                    <>
                      <div
                        className={`font-black ${
                          tx.isPositive === false
                            ? 'text-[#DC2626]'
                            : tx.isPositive
                            ? 'text-[#059669]'
                            : 'text-[#071A4A]'
                        }`}
                      >
                        {tx.isPositive === false ? '-' : tx.isPositive ? '+' : ''}${tx.amountUsd.toFixed(2)}
                      </div>
                      <div className="text-[#94A3B8] text-[10px]">
                        {tx.isPositive === false ? '-' : '+'}
                        {trobAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TROB
                      </div>
                    </>
                  ) : (
                    <div className="text-[#94A3B8]">—</div>
                  );
                })()}
              </div>
              {/* Status */}
              <div className="col-span-1 text-right">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]/60 text-[10px] font-bold text-[#059669]">
                  <span className="w-1 h-1 rounded-full bg-[#059669]" />
                  {tx.status}
                </span>
              </div>
              {/* Explorer link */}
              <div className="col-span-1 flex justify-end">
                {tx.txHash && tx.txHash.length > 20 && !tx.txHash.startsWith('0x_claim') ? (
                  <a
                    href={`https://trobiumscan.io/tx/${tx.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#155EEF] hover:bg-blue-50 transition-colors"
                    title="View on TrobiumScan Explorer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="p-1.5 text-slate-300 cursor-not-allowed" title="On-chain block sync pending">
                    <ExternalLink className="w-3.5 h-3.5 opacity-30" />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Comprehensive Pagination Controls */}
      <div className="px-6 py-4 border-t border-[#E2ECF9] flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-jakarta bg-white">
        {/* Left: Summary text */}
        <div className="flex items-center gap-2 text-[#60739A]">
          <span>
            Showing <strong className="text-[#071A4A]">{startRecord}</strong>–<strong className="text-[#071A4A]">{endRecord}</strong> of{' '}
            <strong className="text-[#071A4A]">{total.toLocaleString()}</strong> transactions
          </span>
        </div>

        {/* Right: Full Navigation Controls (with sm:mr-28 clearance for floating WhatsApp circle) */}
        <div className="flex flex-wrap items-center gap-2 sm:mr-28">
          {/* First page */}
          <button
            type="button"
            onClick={() => onPageChange?.(1)}
            disabled={page <= 1}
            className="p-1.5 rounded-lg border border-[#E2ECF9] bg-white hover:bg-[#F0F6FF] text-[#071A4A] transition-colors disabled:opacity-30 disabled:hover:bg-white cursor-pointer shadow-2xs"
            title="First Page"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>

          {/* Previous */}
          <button
            type="button"
            onClick={() => onPageChange?.(page - 1)}
            disabled={page <= 1}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#E2ECF9] bg-white hover:bg-[#F0F6FF] text-[#071A4A] font-semibold transition-colors disabled:opacity-30 disabled:hover:bg-white cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          {/* Numbered page buttons */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((p, idx) =>
              p === '...' ? (
                <span key={`dots-${idx}`} className="px-1 text-[#94A3B8]">
                  …
                </span>
              ) : (
                <button
                  key={`page-${p}`}
                  type="button"
                  onClick={() => onPageChange?.(p as number)}
                  className={`min-w-[28px] h-7 px-1.5 rounded-md font-mono text-xs font-bold transition-all ${
                    page === p
                      ? 'bg-[#155EEF] text-white shadow-xs'
                      : 'bg-white border border-[#E2ECF9] text-[#071A4A] hover:bg-[#F0F6FF]'
                  }`}
                >
                  {p}
                </button>
              )
            )}
          </div>

          {/* Next */}
          <button
            type="button"
            onClick={() => onPageChange?.(page + 1)}
            disabled={page >= totalPages}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#E2ECF9] bg-white hover:bg-[#F0F6FF] text-[#071A4A] font-semibold transition-colors disabled:opacity-30 disabled:hover:bg-white cursor-pointer shadow-2xs"
          >
            <span className="hidden sm:inline">Next</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Last page */}
          <button
            type="button"
            onClick={() => onPageChange?.(totalPages)}
            disabled={page >= totalPages}
            className="p-1.5 rounded-lg border border-[#E2ECF9] bg-white hover:bg-[#F0F6FF] text-[#071A4A] transition-colors disabled:opacity-30 disabled:hover:bg-white cursor-pointer shadow-2xs"
            title="Last Page"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>

          {/* Quick Jump Input */}
          {totalPages > 3 && (
            <form onSubmit={handleJumpSubmit} className="flex items-center gap-1 ml-2">
              <span className="text-[11px] text-[#94A3B8]">Go:</span>
              <input
                type="number"
                min="1"
                max={totalPages}
                value={jumpPage}
                onChange={(e) => setJumpPage(e.target.value)}
                placeholder={String(page)}
                className="w-12 py-1 px-1.5 rounded-md border border-[#E2ECF9] bg-white text-center font-mono text-xs text-[#071A4A] focus:outline-hidden focus:border-[#155EEF]"
              />
            </form>
          )}
        </div>
      </div>

      {/* Detail modal */}
      {selectedTx && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
          onClick={() => setSelectedTx(null)}
        >
          <div
            className="bg-white border border-[#E2ECF9] rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E2ECF9] pb-3">
              <h3 className="text-sm font-bold text-[#071A4A] font-jakarta">Transaction Details</h3>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-[#94A3B8] hover:text-[#071A4A] text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2ECF9] space-y-2 text-xs font-jakarta">
              {[
                ['Type', selectedTx.typeLabel],
                ['Time', timeAgoLabel(selectedTx.timestamp)],
                [
                  'Amount',
                  (selectedTx.amountTrob ?? selectedTx.amountBtt) > 0 || selectedTx.amountUsd > 0
                    ? `$${selectedTx.amountUsd.toFixed(2)} / ${(selectedTx.amountTrob ?? selectedTx.amountBtt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TROB`
                    : '—',
                ],
                ['From', selectedTx.from],
                ['To', selectedTx.to],
                ['Status', selectedTx.status],
                ['Tx Hash', selectedTx.txHash],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between gap-2 items-start">
                  <span className="text-[#60739A] shrink-0">{label}:</span>
                  <div className="flex items-center gap-1 font-bold text-[#071A4A] font-mono text-right break-all">
                    <span>{val}</span>
                    {label === 'Tx Hash' && (
                      <button
                        type="button"
                        onClick={() => handleCopy(val)}
                        className="text-[#94A3B8] hover:text-[#155EEF] p-0.5"
                        title="Copy Tx Hash"
                      >
                        {copiedHash === val ? <Check className="w-3 h-3 text-[#059669]" /> : <Copy className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedTx(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#155EEF] text-white font-bold text-xs hover:bg-[#0052E6] transition-all"
              >
                Close
              </button>
              <a
                href={`https://trobiumscan.io/tx/${selectedTx.txHash}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 rounded-xl border border-[#E2ECF9] text-[#155EEF] font-bold text-xs hover:bg-blue-50 transition-all flex items-center justify-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                TrobiumScan
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
