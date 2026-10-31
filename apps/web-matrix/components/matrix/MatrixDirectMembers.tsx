"use client";

import React, { useState, useEffect } from "react";
import { useMatrixStore, useUserStore } from "@/lib/stores";
import { formatAddress, formatDateSafe, toTrobBase58 } from "@/lib/format";
import { getOnChainDirectMembers } from "@/lib/contracts";
import { matrixApi } from "@/lib/api";
import { Copy, Check, Users, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { toast } from "@/lib/toast";

export interface DirectMemberItem {
  address: string;
  userId: number;
  username: string;
  joinedAt: string;
  activeSlots: number;
  totalContributed: number;
  txHash?: string | null;
}

export interface MatrixDirectMembersProps {
  handleCopy?: (text: string) => void;
  copied?: boolean;
  members?: DirectMemberItem[];
}

const PAGE_SIZE = 10;

export function MatrixDirectMembers(props: MatrixDirectMembersProps = {}) {
  const storeMembers = useMatrixStore((s) => s.directMembers);
  const address = useUserStore((s) => s.address);
  const profile = useUserStore((s) => s.profile);
  const [liveDirects, setLiveDirects] = useState<DirectMemberItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedLink, setCopiedLink] = useState(false);

  // Live on-chain & backend polling for direct teammates
  useEffect(() => {
    let isMounted = true;
    const fetchDirects = async () => {
      if (!address || !address.startsWith("0x")) return;
      try {
        const onChain = await getOnChainDirectMembers(address);
        if (isMounted && onChain && onChain.length > 0) {
          setLiveDirects(onChain);
          return;
        }
        const apiDirects = await matrixApi.getDirectMembers(address);
        if (isMounted && apiDirects && apiDirects.length > 0) {
          setLiveDirects(apiDirects);
        }
      } catch (err) {
        console.warn("[MatrixDirectMembers] Directs fetch notice:", err);
      }
    };

    fetchDirects();
    const timer = setInterval(fetchDirects, 4000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [address]);

  const members: DirectMemberItem[] =
    props.members && props.members.length > 0
      ? props.members
      : liveDirects.length > 0
      ? liveDirects
      : storeMembers.length > 0
      ? storeMembers
      : [];

  const count = members.length;
  const hasMembers = count > 0;
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  // Reset page if out of bounds
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [count, totalPages, currentPage]);

  const paginatedMembers = members.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const totalDirectVolume = members.reduce(
    (sum, m) => sum + (m.totalContributed || (m.activeSlots || 1) * 30),
    0
  );

  const referralUrl =
    typeof window !== "undefined" && address
      ? `${window.location.origin}/?ref=${profile?.referralCode || toTrobBase58(address)}`
      : "";

  const handleCopyText = (text: string, label = "Text") => {
    if (props.handleCopy) {
      props.handleCopy(text);
    } else {
      navigator.clipboard?.writeText(text);
    }
    toast.copy(text, label);
  };

  const handleCopyReferral = () => {
    if (!referralUrl) return;
    navigator.clipboard?.writeText(referralUrl);
    setCopiedLink(true);
    toast.copy(referralUrl, "Referral Link");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="bg-white border border-[#e8ecf1] rounded-2xl p-3.5 sm:p-5 lg:p-6 shadow-xs mb-8 w-full min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 lg:pb-4 border-b border-[#f1f5f9] gap-2 flex-wrap">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <h2 className="text-[15px] sm:text-[16px] font-extrabold text-[#0f172a]">
            Direct Members
          </h2>
          <span className="text-[12px] sm:text-[13px] font-semibold text-[#64748b]">
            (Referrals)
          </span>
          {count > 0 && (
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 ml-1">
              ${totalDirectVolume.toFixed(2)} USD Contributed
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe] text-[11px] sm:text-[11.5px] font-bold">
            {count} Registered
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[#ecfdf5] text-[#16a34a] border border-[#bbf7d0] text-[10px] font-bold hidden xs:inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-pulse" />
            Live On-Chain & DB
          </span>
        </div>
      </div>

      {hasMembers ? (
        <>
          {/* MOBILE RESPONSIVE CARDS VIEW (< sm, 320px - 640px) */}
          <div className="divide-y divide-[#f1f5f9] mt-2 block sm:hidden">
            {paginatedMembers.map((m, idx) => {
              const b58 = toTrobBase58(m.address) || m.address;
              const globalIdx = (currentPage - 1) * PAGE_SIZE + idx + 1;
              const activeSlotCount = m.activeSlots || 1;
              const contributed = m.totalContributed || activeSlotCount * 30;

              return (
                <div key={m.address + globalIdx} className="py-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-md bg-[#eff6ff] text-[#2563eb] font-bold text-[10.5px] flex items-center justify-center shrink-0">
                        {globalIdx}
                      </div>
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                        {m.username.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <button
                          type="button"
                          onClick={() => handleCopyText(b58, "Operative Address")}
                          className="font-mono font-bold text-[12px] text-[#0f172a] hover:text-[#2563eb] text-left truncate flex items-center gap-1 cursor-pointer"
                          title="Click to copy"
                        >
                          <span>{formatAddress(b58)}</span>
                          <Copy className="w-3 h-3 text-slate-400 shrink-0" />
                        </button>
                        <span className="text-[9.5px] text-[#94a3b8] truncate">
                          {m.username}
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-[#ecfdf5] border border-[#bbf7d0] text-[#16a34a] text-[9.5px] font-bold shrink-0">
                      Active (${contributed} Paid)
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#64748b] bg-slate-50 px-2.5 py-1.5 rounded-lg">
                    <span>
                      {activeSlotCount > 1 ? `Slots #1-${activeSlotCount}` : `Slot #${activeSlotCount}`}
                    </span>
                    <span className="font-extrabold text-[#0f172a]">
                      ${contributed.toFixed(2)} USD
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {formatDateSafe(m.joinedAt, "Active")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* DESKTOP TABLE VIEW (sm: and up) */}
          <div className="divide-y divide-[#f1f5f9] mt-2 overflow-x-auto hidden sm:block">
            <div className="min-w-[560px]">
              {paginatedMembers.map((m, idx) => {
                const b58 = toTrobBase58(m.address) || m.address;
                const globalIdx = (currentPage - 1) * PAGE_SIZE + idx + 1;
                const activeSlotCount = m.activeSlots || 1;
                const contributed = m.totalContributed || activeSlotCount * 30;

                return (
                  <div
                    key={m.address + globalIdx}
                    className="py-3.5 px-3 rounded-xl flex items-center justify-between hover:bg-[#f8fafc] transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#eff6ff] text-[#2563eb] font-bold text-[12px] flex items-center justify-center flex-shrink-0">
                        {globalIdx}
                      </div>
                      <div className="w-9 h-9 rounded-full bg-[radial-gradient(circle_at_30%_30%,#93c5fd,#3b82f6_60%,#1d4ed8_100%)] flex-shrink-0 flex items-center justify-center text-white text-[11px] font-bold">
                        {m.username.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <button
                          type="button"
                          onClick={() => handleCopyText(b58, "Address")}
                          className="font-mono font-bold text-[13.5px] text-[#0f172a] hover:text-[#2563eb] cursor-pointer flex items-center gap-1.5"
                          title="Click to copy"
                        >
                          <span>{formatAddress(b58)}</span>
                          <Copy className="w-3 h-3 text-slate-400" />
                        </button>
                        <span className="text-[10px] text-[#94a3b8] truncate">{m.username}</span>
                      </div>
                    </div>

                    <div className="text-[12.5px] text-[#64748b]">
                      {formatDateSafe(m.joinedAt, "Active")}
                    </div>

                    <div className="px-3 py-1 rounded-full bg-[#ecfdf5] border border-[#bbf7d0] text-[#16a34a] text-[11px] font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
                      <span>Active (${contributed} Paid)</span>
                    </div>

                    <div className="text-[12.5px] font-semibold text-[#64748b]">
                      {activeSlotCount > 1 ? `Slots #1-${activeSlotCount}` : `Slot #${activeSlotCount}`}
                    </div>

                    <div className="text-right">
                      <div className="font-extrabold text-[13.5px] text-[#0f172a]">
                        ${contributed.toFixed(2)} USD
                      </div>
                      <div className="text-[10px] text-[#94a3b8]">Volume Contributed</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-4 pt-3 border-t border-[#f1f5f9] flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[11.5px] text-[#64748b] font-medium">
                Showing{" "}
                <strong className="text-[#0f172a]">
                  {(currentPage - 1) * PAGE_SIZE + 1}-
                  {Math.min(currentPage * PAGE_SIZE, count)}
                </strong>{" "}
                of <strong className="text-[#0f172a]">{count}</strong> direct referrals
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-all"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>

                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first, last, current, and neighbours
                    if (
                      totalPages > 6 &&
                      page !== 1 &&
                      page !== totalPages &&
                      Math.abs(page - currentPage) > 1
                    ) {
                      if (page === 2 || page === totalPages - 1) {
                        return (
                          <span key={page} className="text-xs text-slate-400 px-1">
                            ...
                          </span>
                        );
                      }
                      return null;
                    }
                    return (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          currentPage === page
                            ? "bg-[#2563eb] text-white shadow-xs"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-all"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Empty State */
        <div className="py-7 px-3 text-center flex flex-col items-center justify-center w-full max-w-full">
          <div className="w-11 h-11 rounded-2xl bg-[#eff6ff] text-[#2563eb] flex items-center justify-center mb-3 shadow-xs">
            <Users className="w-5 h-5 text-[#2563eb]" />
          </div>
          <p className="text-[14px] font-bold text-[#0f172a] mb-1">
            No Direct Operatives Registered Yet
          </p>
          <p className="text-[11.5px] text-[#64748b] max-w-xs leading-relaxed mb-4">
            Operatives who register with your referral link receive 100% direct rewards on their activation.
          </p>

          {/* Referral link copy card */}
          {referralUrl && (
            <div className="w-full max-w-sm p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center gap-2 justify-between">
              <span className="font-mono text-[11px] text-slate-700 font-bold truncate max-w-full text-center sm:text-left">
                {referralUrl}
              </span>
              <button
                type="button"
                onClick={handleCopyReferral}
                className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-[#2563eb] hover:bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
