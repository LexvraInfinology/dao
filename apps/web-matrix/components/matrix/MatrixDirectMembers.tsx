"use client";

import React from "react";

export interface DirectMemberItem {
  address: string;
  userId: number;
  username: string;
  joinedAt: string;
  activeSlots: number;
  totalContributed: number;
}

import { useMatrixStore } from "@/lib/stores";
import { formatAddress, formatDateSafe, toTrobBase58 } from "@/lib/format";

export interface MatrixDirectMembersProps {
  handleCopy?: (text: string) => void;
  copied?: boolean;
  members?: DirectMemberItem[];
}

export function MatrixDirectMembers(props: MatrixDirectMembersProps = {}) {
  const storeMembers = useMatrixStore((s) => s.directMembers);
  const members = props.members ?? storeMembers;
  const handleCopy = props.handleCopy ?? ((text: string) => navigator.clipboard?.writeText(text));
  const copied = props.copied ?? false;
  const hasMembers = members && members.length > 0;
  const count = members ? members.length : 0;

  return (
    <div className="bg-white border border-[#e8ecf1] rounded-2xl p-4 sm:p-5 lg:p-6 shadow-xs mb-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 lg:pb-4 border-b border-[#f1f5f9]">
        <div className="flex items-baseline gap-1.5">
          <h2 className="text-[15px] sm:text-[16px] font-extrabold text-[#0f172a]">
            Direct Members
          </h2>
          <span className="text-[12px] sm:text-[13px] font-semibold text-[#64748b]">
            (Referrals)
          </span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe] text-[11px] sm:text-[11.5px] font-bold">
          {count} Registered
        </span>
      </div>

      {/* Member Rows */}
      <div className="divide-y divide-[#f1f5f9] mt-2 overflow-x-auto">
        <div className="min-w-[560px]">
          {hasMembers ? (
            members.map((m, idx) => (
              <div
                key={m.address}
                className="py-3.5 px-3 rounded-xl flex items-center justify-between hover:bg-[#f8fafc] transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-[#eff6ff] text-[#2563eb] font-bold text-[12px] flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="w-9 h-9 rounded-full bg-[radial-gradient(circle_at_30%_30%,#93c5fd,#3b82f6_60%,#1d4ed8_100%)] flex-shrink-0 flex items-center justify-center text-white text-[11px] font-bold">
                    {m.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span
                      onClick={() => handleCopy(toTrobBase58(m.address))}
                      className="font-mono font-bold text-[13.5px] text-[#0f172a] hover:text-[#2563eb] cursor-pointer"
                      title="Click to copy"
                    >
                      {formatAddress(m.address)}
                    </span>
                    <span className="text-[10px] text-[#94a3b8]">{m.username}</span>
                  </div>
                </div>

                <div className="text-[12.5px] text-[#64748b]">
                  {formatDateSafe(m.joinedAt, "Active")}
                </div>

                {m.activeSlots >= 1 ? (
                  <div className="px-3 py-1 rounded-full bg-[#ecfdf5] border border-[#bbf7d0] text-[#16a34a] text-[11px] font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
                    <span>Active ($30 Paid)</span>
                  </div>
                ) : (
                  <div className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span>Pending $30</span>
                  </div>
                )}

                <div className="text-[12.5px] font-semibold text-[#64748b]">
                  Slot #{m.activeSlots}
                </div>

                <div className="text-right">
                  <div className="font-extrabold text-[13.5px] text-[#0f172a]">
                    ${m.totalContributed.toFixed(2)} USD
                  </div>
                  <div className="text-[10px] text-[#94a3b8]">Volume Contributed</div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 px-4 text-center flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-xl bg-[#eff6ff] text-[#2563eb] flex items-center justify-center mb-2.5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" />
                  <line x1="22" y1="11" x2="16" y2="11" />
                </svg>
              </div>
              <p className="text-[14px] font-bold text-[#0f172a] mb-1">No Direct Operatives Registered Yet</p>
              <p className="text-[12px] text-[#64748b] max-w-sm leading-relaxed">
                Operatives who register with your referral link will appear here. You receive 100% direct rewards on their activation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
