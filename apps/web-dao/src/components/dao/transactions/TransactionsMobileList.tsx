'use client';

import React, { useState } from 'react';
import {
  Users, CreditCard, Vote, Armchair, ChevronRight, Loader2,
  ArrowDownLeft, ArrowUpRight, Layers, Building2, Inbox, ArrowLeft,
  ArrowRight, Globe, Wallet, Filter, Check, Copy, ExternalLink, X, Zap
} from 'lucide-react';
import type { TransactionItem } from '@/hooks/useApi';
import { getExplorerTxUrl } from '@/utils/explorer';
import { formatUsd, formatTrob } from '@/utils/formatAmount';
import { TransactionDetailModal } from './TransactionDetailModal';

interface TransactionsMobileListProps {
  transactions?: TransactionItem[];
  loading?: boolean;
  onRefresh?: () => void;
  page?: number;
  totalPages?: number;
  total?: number;
  limit?: number;
  onPageChange?: (page: number) => void;
  viewScope?: 'all' | 'my';
  onViewScopeChange?: (scope: 'all' | 'my') => void;
  typeFilter?: string;
  onTypeFilterChange?: (type: string) => void;
  activeAddress?: string | null;
}

function getTypeIcon(type: string, typeLabel: string = '') {
  const base = 'w-8 h-8 rounded-xl flex items-center justify-center shrink-0';
  const l = (typeLabel || '').toLowerCase();
  const t = (type || '').toLowerCase();
  if (t === 'retopup' || l.includes('retopup') || l.includes('cap') || l.includes('bypassed'))
    return <div className={`${base} bg-amber-50 border border-amber-300 text-amber-700`}><Zap className="w-4 h-4 fill-amber-500 text-amber-600" /></div>;
  if (type === 'withdrawal')
    return <div className={`${base} bg-[#FEF2F2] border border-[#FECACA] text-[#EF4444]`}><CreditCard className="w-4 h-4" /></div>;
  if (type.startsWith('matrix_'))
    return <div className={`${base} bg-purple-50 border border-purple-200 text-purple-600`}><Layers className="w-4 h-4" /></div>;
  if (type === 'joined' || type === 'council_seat')
    return <div className={`${base} bg-[#EFF6FF] border border-[#BFDBFE]/40 text-[#155EEF]`}><Armchair className="w-4 h-4" /></div>;
  if (type === 'pushed' || type === 'seat_distribution' || type === 'fallback_claimed')
    return <div className={`${base} bg-[#ECFDF5] border border-[#A7F3D0]/60 text-[#059669]`}><ArrowDownLeft className="w-4 h-4" /></div>;
  if (type.includes('vote') || type === 'governance')
    return <div className={`${base} bg-purple-50 border border-purple-200 text-purple-600`}><Vote className="w-4 h-4" /></div>;
  return <div className={`${base} bg-[#EFF6FF] border border-[#BFDBFE]/40 text-[#155EEF]`}><Users className="w-4 h-4" /></div>;
}

function parseUtcTimestamp(ts: string | number | Date | null | undefined): number {
  if (!ts) return Date.now();
  if (ts instanceof Date) return ts.getTime();
  if (typeof ts === 'number') return ts;
  const s = String(ts).trim();
  if (s.endsWith('Z') || s.includes('+') || (s.lastIndexOf('-') > 10)) {
    return new Date(s).getTime();
  }
  return new Date(s.replace(' ', 'T') + 'Z').getTime();
}

function timeAgoLabel(ts: string): string {
  const diff = Date.now() - parseUtcTimestamp(ts);
  const s = Math.max(0, Math.floor(diff / 1000));
  if (s < 10) return 'just now';
  if (s < 60) return `${Math.max(1, s)}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function shortAddr(addr: string) {
  if (!addr) return '—';
  if (addr === 'EquoraDAO Protocol') return 'EquoraDAO';
  if (addr.length > 14) return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
  return addr;
}

export const TransactionsMobileList: React.FC<TransactionsMobileListProps> = ({
  transactions = [],
  loading = false,
  onRefresh,
  page = 1,
  totalPages = 1,
  total = 0,
  limit = 20,
  onPageChange,
  viewScope = 'all',
  onViewScopeChange,
  typeFilter = 'all',
  onTypeFilterChange,
  activeAddress,
}) => {
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 1500);
  };

  const startRecord = total === 0 ? 0 : (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, total);
  const canonicalMyAddr = activeAddress?.toLowerCase() || '';

  return (
    <div className="space-y-3.5">
      {/* Scope toggle and filter controls */}
      <div className="bg-white border border-[#E2ECF9] rounded-2xl p-3 shadow-2xs space-y-2.5">
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#F1F5F9] rounded-xl text-xs font-semibold font-jakarta">
          <button
            type="button"
            onClick={() => onViewScopeChange?.('all')}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
              viewScope === 'all'
                ? 'bg-white text-[#155EEF] font-bold shadow-xs'
                : 'text-[#60739A]'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>All Protocol</span>
          </button>
          <button
            type="button"
            onClick={() => onViewScopeChange?.('my')}
            disabled={!activeAddress}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
              viewScope === 'my'
                ? 'bg-white text-[#155EEF] font-bold shadow-xs'
                : 'text-[#60739A]'
            } ${!activeAddress ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>My Wallet</span>
          </button>
        </div>

        {/* Quick Filter Pills for Mobile */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px] font-semibold font-jakarta">
          <button
            type="button"
            onClick={() => onTypeFilterChange?.('all')}
            className={`px-3 py-1.5 rounded-xl shrink-0 transition-all ${
              typeFilter === 'all'
                ? 'bg-[#071A4A] text-white font-bold shadow-xs'
                : 'bg-[#F1F5F9] text-[#60739A] hover:text-[#071A4A]'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => onTypeFilterChange?.('pushed')}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl shrink-0 transition-all ${
              typeFilter === 'pushed'
                ? 'bg-[#ECFDF5] text-[#059669] font-bold shadow-xs border border-[#A7F3D0]'
                : 'bg-[#F1F5F9] text-[#60739A] hover:text-[#059669]'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-[#059669]" />
            <span>Dividends Received</span>
          </button>
          <button
            type="button"
            onClick={() => onTypeFilterChange?.('joined')}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl shrink-0 transition-all ${
              typeFilter === 'joined'
                ? 'bg-[#EFF6FF] text-[#155EEF] font-bold shadow-xs border border-[#BFDBFE]'
                : 'bg-[#F1F5F9] text-[#60739A] hover:text-[#155EEF]'
            }`}
          >
            <Armchair className="w-3.5 h-3.5 text-[#155EEF]" />
            <span>Seat Activations</span>
          </button>
          <button
            type="button"
            onClick={() => onTypeFilterChange?.('retopup')}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl shrink-0 transition-all ${
              typeFilter === 'retopup'
                ? 'bg-amber-100 text-amber-900 font-bold shadow-xs border border-amber-300'
                : 'bg-[#F1F5F9] text-[#60739A] hover:text-amber-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
            <span>5X Retopups</span>
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && transactions.length === 0 && (
        <div className="flex items-center justify-center py-12 text-sm text-[#94A3B8] font-jakarta gap-2 bg-white rounded-2xl border border-[#E2ECF9]">
          <Loader2 className="w-4 h-4 animate-spin text-[#155EEF]" />
          Loading transactions…
        </div>
      )}

      {/* Empty state */}
      {!loading && transactions.length === 0 && (
        <div className="py-12 px-4 text-center text-sm text-[#94A3B8] font-jakarta bg-white rounded-2xl border border-[#E2ECF9]">
          No transactions found for the selected view.
        </div>
      )}

      {/* Transactions list */}
      <div className="space-y-3">
        {transactions.map((tx) => {
          const isToMe = canonicalMyAddr && tx.to.toLowerCase() === canonicalMyAddr;
          const isFromMe = canonicalMyAddr && tx.from.toLowerCase() === canonicalMyAddr;

          return (
            <div
              key={tx.id}
              onClick={() => setSelectedTx(tx)}
              className="bg-white border border-[#E2ECF9] rounded-2xl p-4 shadow-[0_2px_10px_rgba(15,23,42,0.02)] space-y-3 hover:border-blue-200 transition-all cursor-pointer"
            >
              {/* Top row */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {getTypeIcon(tx.type, tx.typeLabel)}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs sm:text-sm font-bold font-jakarta text-[#071A4A] truncate">{tx.typeLabel}</span>
                      {tx.categoryBadge && (
                        <span className="px-1.5 py-0.2 rounded-md text-[8.5px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                          {tx.categoryBadge}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <span className="text-[11px] sm:text-xs text-[#60739A] font-medium font-jakarta whitespace-nowrap">{timeAgoLabel(tx.timestamp)}</span>
                  <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]/60 text-[9.5px] sm:text-[10px] font-bold text-[#059669] whitespace-nowrap">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                    {tx.status}
                  </span>
                </div>
              </div>

              {/* Amount row */}
              {(() => {
                const trobAmt = tx.amountTrob ?? tx.amountBtt;
                return trobAmt > 0 || tx.amountUsd > 0 ? (
                  <div className="flex items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <div
                        className={`text-lg font-black font-jakarta tracking-tight ${
                          tx.isPositive === false ? 'text-[#DC2626]' : tx.isPositive ? 'text-[#059669]' : 'text-[#071A4A]'
                        }`}
                      >
                        {tx.isPositive === false ? '-' : tx.isPositive ? '+' : ''}${formatUsd(tx.amountUsd)} USD
                      </div>
                      <div
                        className={`text-xs font-bold font-jakarta ${
                          tx.isPositive === false ? 'text-[#DC2626]' : 'text-[#155EEF]'
                        }`}
                      >
                        {tx.isPositive === false ? '-' : '+'}
                        {formatTrob(trobAmt)} TROB
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#64748B]">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Entity box */}
              <div className="bg-[#F8FAFC] border border-[#E2ECF9] rounded-xl p-2.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${
                      tx.type === 'withdrawal'
                        ? 'bg-[#FEF2F2] border-[#FECACA] text-[#EF4444]'
                        : 'bg-[#EFF6FF] border-[#BFDBFE]/60 text-[#155EEF]'
                    }`}
                  >
                    {tx.type === 'withdrawal' ? <Building2 className="w-3.5 h-3.5" /> : <Inbox className="w-3.5 h-3.5" />}
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <div className="text-[11px] font-bold font-jakarta text-[#071A4A] truncate">
                      FROM: {shortAddr(tx.from)} {isFromMe && '(You)'}
                    </div>
                    <div className="text-[10px] font-mono text-[#94A3B8] truncate">
                      → {shortAddr(tx.to)} {isToMe && '(You)'}
                    </div>
                  </div>
                </div>
                <div className="shrink-0">
                  {tx.isPositive === false ? (
                    <span className="px-2 py-0.5 rounded-full bg-[#FEF2F2] border border-[#FECACA] text-[10px] font-bold text-[#EF4444]">
                      Outgoing
                    </span>
                  ) : (
                    <span className="text-xs font-semibold font-jakarta text-[#155EEF]">Verified</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Pagination Controls */}
      {total > 0 && (
        <div className="bg-white border border-[#E2ECF9] rounded-2xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-xs text-[#60739A] font-jakarta">
            <span>
              Showing <strong className="text-[#071A4A]">{startRecord}</strong>–<strong className="text-[#071A4A]">{endRecord}</strong> of{' '}
              <strong className="text-[#071A4A]">{total.toLocaleString()}</strong>
            </span>
            <span>
              Page <strong className="text-[#071A4A]">{page}</strong> of <strong className="text-[#071A4A]">{totalPages}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onPageChange?.(page - 1)}
              disabled={page <= 1}
              className="py-2.5 px-3 rounded-xl border border-[#E2ECF9] bg-white hover:bg-[#F0F6FF] text-[#071A4A] font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-40"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <button
              type="button"
              onClick={() => onPageChange?.(page + 1)}
              disabled={page >= totalPages}
              className="py-2.5 px-3 rounded-xl border border-[#E2ECF9] bg-white hover:bg-[#F0F6FF] text-[#071A4A] font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-40"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Rich On-Chain Transaction & Dividend Detail Modal */}
      <TransactionDetailModal
        tx={selectedTx}
        onClose={() => setSelectedTx(null)}
        activeAddress={activeAddress}
      />
    </div>
  );
};

