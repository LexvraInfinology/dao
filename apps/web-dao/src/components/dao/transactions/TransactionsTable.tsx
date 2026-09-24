'use client';

import React, { useState } from 'react';
import {
  RefreshCw,
  Users,
  CreditCard,
  Vote,
  Armchair,
  ExternalLink,
  Info,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { DAO_TRANSACTIONS_LIST, DaoTxItem } from '@/data/transactionsData';

export const TransactionsTable: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTx, setSelectedTx] = useState<DaoTxItem | null>(null);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'seat_distribution':
        return (
          <div className="w-7 h-7 rounded-lg bg-[#EFF6FF] text-[#155EEF] flex items-center justify-center shrink-0">
            <Users className="w-3.5 h-3.5" />
          </div>
        );
      case 'withdrawal':
        return (
          <div className="w-7 h-7 rounded-lg bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center shrink-0">
            <CreditCard className="w-3.5 h-3.5" />
          </div>
        );
      case 'governance':
        return (
          <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Vote className="w-3.5 h-3.5" />
          </div>
        );
      case 'council_seat':
        return (
          <div className="w-7 h-7 rounded-lg bg-[#EFF6FF] text-[#155EEF] flex items-center justify-center shrink-0">
            <Armchair className="w-3.5 h-3.5" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white border border-[#E2ECF9] rounded-3xl p-6 sm:p-8 shadow-[0_4px_25px_rgba(15,23,42,0.03)] space-y-6">
      {/* Table Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold font-jakarta text-[#071A4A]">
            Transaction History
          </h2>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF5FF] border border-[#BFDBFE]/60 text-[11px] font-bold text-[#155EEF]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#155EEF] animate-pulse" />
            <span>LIVE STREAM</span>
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 font-bold font-jakarta text-[#155EEF] hover:text-[#0052E6] transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button className="font-bold font-jakarta text-[#155EEF] hover:underline flex items-center gap-0.5 cursor-pointer">
            <span>View All</span>
            <span>&gt;</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#F1F5F9] text-[10px] font-bold uppercase tracking-wider text-[#60739A] font-jakarta">
              <th className="pb-3.5 font-semibold">DATE</th>
              <th className="pb-3.5 font-semibold">TYPE</th>
              <th className="pb-3.5 font-semibold">AMOUNT (USD)</th>
              <th className="pb-3.5 font-semibold">AMOUNT (TROB)</th>
              <th className="pb-3.5 font-semibold">FROM</th>
              <th className="pb-3.5 font-semibold">STATUS</th>
              <th className="pb-3.5 font-semibold text-right">TX HASH</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F8FAFC] text-xs font-jakarta">
            {DAO_TRANSACTIONS_LIST.map((tx) => (
              <tr
                key={tx.id}
                className="hover:bg-[#F8FAFC]/90 transition-colors group cursor-pointer"
                onClick={() => setSelectedTx(tx)}
              >
                {/* DATE */}
                <td className="py-4 text-[#60739A] font-medium whitespace-nowrap">
                  {tx.date}
                </td>

                {/* TYPE */}
                <td className="py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2.5">
                    {getTypeIcon(tx.type)}
                    <span className="font-bold text-[#071A4A]">{tx.typeLabel}</span>
                  </div>
                </td>

                {/* AMOUNT (USD) */}
                <td className="py-4 whitespace-nowrap font-black">
                  <span
                    className={
                      tx.isPositive === true
                        ? 'text-[#0284C7]'
                        : tx.isPositive === false
                        ? 'text-[#EF4444]'
                        : 'text-[#94A3B8]'
                    }
                  >
                    {tx.amountUsd}
                  </span>
                </td>

                {/* AMOUNT (TROB) */}
                <td className="py-4 whitespace-nowrap text-[#60739A] font-medium">
                  {tx.amountTrob}
                </td>

                {/* FROM */}
                <td className="py-4 whitespace-nowrap">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 font-bold text-[#155EEF] group-hover:underline">
                      <span>{tx.fromTitle}</span>
                      {tx.id === 'tx-1' && (
                        <Info className="w-3 h-3 text-[#94A3B8]" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-mono text-[#94A3B8]">
                      <span>{tx.fromAddress}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </div>
                  </div>
                </td>

                {/* STATUS */}
                <td className="py-4 whitespace-nowrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#EFF6FF] border border-[#BFDBFE]/60 text-[10px] font-bold text-[#155EEF]">
                    {tx.status}
                  </span>
                </td>

                {/* TX HASH */}
                <td className="py-4 whitespace-nowrap text-right">
                  <div className="inline-flex items-center gap-1 font-mono font-bold text-[#155EEF] group-hover:underline">
                    <span>{tx.txHash}</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-[#F8FAFC] text-xs font-jakarta">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="px-3.5 py-1.5 rounded-xl border border-[#E2ECF9] bg-[#F8FAFC] hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-[#071A4A] font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Previous</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage(1)}
            className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center transition-all cursor-pointer ${
              currentPage === 1
                ? 'bg-[#155EEF] text-white shadow-xs'
                : 'text-[#60739A] hover:bg-slate-100'
            }`}
          >
            1
          </button>
          <button
            onClick={() => setCurrentPage(2)}
            className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center transition-all cursor-pointer ${
              currentPage === 2
                ? 'bg-[#155EEF] text-white shadow-xs'
                : 'text-[#60739A] hover:bg-slate-100'
            }`}
          >
            2
          </button>
          <button
            onClick={() => setCurrentPage(3)}
            className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center transition-all cursor-pointer ${
              currentPage === 3
                ? 'bg-[#155EEF] text-white shadow-xs'
                : 'text-[#60739A] hover:bg-slate-100'
            }`}
          >
            3
          </button>
          <span className="text-[#94A3B8] px-1 font-bold">...</span>
          <button
            onClick={() => setCurrentPage(25)}
            className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center transition-all cursor-pointer ${
              currentPage === 25
                ? 'bg-[#155EEF] text-white shadow-xs'
                : 'text-[#60739A] hover:bg-slate-100'
            }`}
          >
            25
          </button>
        </div>

        <button
          onClick={() => setCurrentPage((p) => Math.min(25, p + 1))}
          disabled={currentPage === 25}
          className="px-3.5 py-1.5 rounded-xl border border-[#E2ECF9] bg-[#F8FAFC] hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-[#071A4A] font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
        >
          <span>Next</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-[#E2ECF9] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-[#E2ECF9] pb-3">
              <h3 className="text-base font-bold text-[#071A4A] font-jakarta flex items-center gap-2">
                {getTypeIcon(selectedTx.type)}
                <span>{selectedTx.typeLabel} Details</span>
              </h3>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-[#94A3B8] hover:text-[#071A4A] text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-[#4F6184] font-jakarta">
              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2ECF9] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#60739A]">Timestamp:</span>
                  <span className="font-bold text-[#071A4A]">{selectedTx.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#60739A]">Amount USD:</span>
                  <span className="font-bold text-[#071A4A]">{selectedTx.amountUsd}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#60739A]">Amount TROB:</span>
                  <span className="font-bold text-[#071A4A]">{selectedTx.amountTrob}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#60739A]">From Entity:</span>
                  <span className="font-bold text-[#155EEF]">{selectedTx.fromTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#60739A]">From Address:</span>
                  <span className="font-mono text-[#071A4A]">{selectedTx.fromAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#60739A]">Full Hash:</span>
                  <span className="font-mono text-[10px] text-[#155EEF] truncate max-w-[200px]">{selectedTx.fullTxHash}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedTx(null)}
              className="w-full py-2.5 rounded-xl bg-[#155EEF] text-white font-bold text-xs hover:bg-[#0052E6] transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
