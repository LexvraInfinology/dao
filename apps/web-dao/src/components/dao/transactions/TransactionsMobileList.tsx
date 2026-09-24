'use client';

import React, { useState } from 'react';
import {
  Users,
  CreditCard,
  Vote,
  Armchair,
  ArrowRight,
  ChevronRight,
  Landmark,
  ShieldCheck,
  Building2,
  Inbox,
} from 'lucide-react';
import { DAO_TRANSACTIONS_LIST, DaoTxItem } from '@/data/transactionsData';

export const TransactionsMobileList: React.FC = () => {
  const [selectedTx, setSelectedTx] = useState<DaoTxItem | null>(null);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'seat_distribution':
        return (
          <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE]/40 text-[#155EEF] flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
        );
      case 'withdrawal':
        return (
          <div className="w-8 h-8 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#EF4444] flex items-center justify-center shrink-0">
            <CreditCard className="w-4 h-4" />
          </div>
        );
      case 'governance':
        return (
          <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center shrink-0">
            <Vote className="w-4 h-4" />
          </div>
        );
      case 'council_seat':
        return (
          <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE]/40 text-[#155EEF] flex items-center justify-center shrink-0">
            <Armchair className="w-4 h-4" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3.5">
      {/* List of Transaction Cards */}
      <div className="space-y-3">
        {DAO_TRANSACTIONS_LIST.slice(0, 4).map((tx) => (
          <div
            key={tx.id}
            onClick={() => setSelectedTx(tx)}
            className="bg-white border border-[#E2ECF9] rounded-2xl p-4 shadow-[0_2px_10px_rgba(15,23,42,0.02)] space-y-3 hover:border-blue-200 transition-all cursor-pointer"
          >
            {/* Top Row: Type + Timestamp & Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {getTypeIcon(tx.type)}
                <span className="text-sm font-bold font-jakarta text-[#071A4A]">
                  {tx.typeLabel}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-[#60739A] font-medium font-jakarta">
                  {tx.date}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EEF5FF] border border-[#BFDBFE]/60 text-[10px] font-bold text-[#155EEF]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#155EEF]" />
                  <span>Success</span>
                </span>
              </div>
            </div>

            {/* Amount & Arrow Row */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div
                  className={`text-lg font-black font-jakarta tracking-tight ${
                    tx.isPositive === false ? 'text-[#DC2626]' : 'text-[#071A4A]'
                  }`}
                >
                  {tx.amountUsd} USD
                </div>
                <div
                  className={`text-xs font-bold font-jakarta ${
                    tx.isPositive === false ? 'text-[#DC2626]' : 'text-[#155EEF]'
                  }`}
                >
                  {tx.amountTrob}
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#64748B] hover:text-[#155EEF] transition-colors">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Bottom Entity & Badge Box */}
            <div className="bg-[#F8FAFC] border border-[#E2ECF9] rounded-xl p-2.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${
                    tx.type === 'withdrawal'
                      ? 'bg-[#FEF2F2] border-[#FECACA] text-[#EF4444]'
                      : 'bg-[#EFF6FF] border-[#BFDBFE]/60 text-[#155EEF]'
                  }`}
                >
                  {tx.type === 'withdrawal' ? (
                    <Building2 className="w-3.5 h-3.5" />
                  ) : (
                    <Inbox className="w-3.5 h-3.5" />
                  )}
                </div>

                <div className="space-y-0.5 min-w-0">
                  <div className="text-[11px] font-bold font-jakarta text-[#071A4A] truncate">
                    FROM: {tx.type === 'withdrawal' ? 'Equora Vault Treasury' : tx.fromTitle}
                  </div>
                  <div className="text-[10px] font-mono text-[#94A3B8] truncate">
                    {tx.fromAddress}
                  </div>
                </div>
              </div>

              <div className="shrink-0">
                {tx.badgeType === 'Outgoing' ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FEF2F2] border border-[#FECACA] text-[10px] font-bold text-[#EF4444]">
                    Outgoing
                  </span>
                ) : (
                  <span className="text-xs font-semibold font-jakarta text-[#155EEF]">
                    Verified
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Primary Bottom Action */}
      <div className="pt-2 space-y-2">
        <button
          onClick={() => {}}
          className="w-full py-3.5 px-4 rounded-2xl bg-[#155EEF] hover:bg-[#0052E6] text-white font-bold text-sm transition-all shadow-[0_4px_16px_rgba(21,94,239,0.32)] flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>View All Transactions</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-xs text-[#94A3B8] text-center font-jakarta">
          Showing 7 of 246 Genesis transactions
        </p>
      </div>

      {/* Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-[#E2ECF9] rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-[#E2ECF9] pb-3">
              <h3 className="text-sm font-bold text-[#071A4A] font-jakarta">
                Transaction Details
              </h3>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-[#94A3B8] hover:text-[#071A4A] text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-[#4F6184] font-jakarta">
              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2ECF9] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#60739A]">Type:</span>
                  <span className="font-bold text-[#071A4A]">{selectedTx.typeLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#60739A]">Timestamp:</span>
                  <span className="font-bold text-[#071A4A]">{selectedTx.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#60739A]">Amount:</span>
                  <span className="font-bold text-[#071A4A]">{selectedTx.amountUsd} ({selectedTx.amountTrob})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#60739A]">Origin:</span>
                  <span className="font-bold text-[#155EEF]">{selectedTx.fromTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#60739A]">Address:</span>
                  <span className="font-mono text-[#071A4A]">{selectedTx.fromAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#60739A]">Tx Hash:</span>
                  <span className="font-mono text-[#155EEF]">{selectedTx.txHash}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedTx(null)}
              className="w-full py-2.5 rounded-xl bg-[#155EEF] text-white font-bold text-xs hover:bg-[#0052E6] transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
