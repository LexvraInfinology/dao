"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import Link from "next/link";
import { formatBTT } from "../../utils/equora/matrixHelpers";
import { formatAddress } from "../../utils/equora/formatters";
import { useDAOData } from "../../hooks/equora/useDAOData";
import { useMatrixData } from "../../hooks/equora/useMatrixData";
import { useUserProfile } from "../../hooks/equora/useUserProfile";
import { useClaimPoolShare } from "../../hooks/equora/useClaimPoolShare";
import { DAOHistoryTable } from "../../components/dao/DAOHistoryTable";
import { AuthGuard } from "../../components/auth/AuthGuard";
import { notification } from "../../utils/scaffold-eth/notification";
import { siteConfig } from "../../config/env";

const MATRIX_LEVELS_CONFIG = [
  { id: 1, cost: "30", multiplier: "1.0x" },
  { id: 2, cost: "60", multiplier: "1.2x" },
  { id: 3, cost: "120", multiplier: "1.5x" },
  { id: 4, cost: "240", multiplier: "2.0x" },
  { id: 5, cost: "480", multiplier: "2.5x" },
  { id: 6, cost: "960", multiplier: "3.0x" },
  { id: 7, cost: "1,920", multiplier: "4.0x" },
  { id: 8, cost: "3,840", multiplier: "5.0x" },
  { id: 9, cost: "7,680", multiplier: "7.0x" },
  { id: 10, cost: "15,360", multiplier: "10.0x" },
  { id: 11, cost: "30,720", multiplier: "15.0x" },
  { id: 12, cost: "61,440", multiplier: "25.0x" },
];

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}

function DashboardContent() {
  const { address } = useAccount();
  const [copied, setCopied] = useState(false);

  const { memberInfo, poolShareClaimable, refetch: refetchDAO } = useDAOData(address);
  const { slots, financials, refetch: refetchMatrix } = useMatrixData(address);
  const { profile } = useUserProfile(address);
  const { claim: claimPoolShare, isClaiming: isClaimingPoolShare } = useClaimPoolShare(() => {
    refetchDAO();
  });

  const totalWithdrawable = (memberInfo?.availableBalance ?? 0n) + (financials?.availableBalance ?? 0n);
  const totalEarned = (memberInfo?.totalEarned ?? 0n) + (financials?.lifetimeEarned ?? 0n);
  const isQualified = (profile?.directReferralCount ?? 0) >= 2;
  const highestUnlockedSlot = financials?.highestSlot || 1;

  const referralCode = profile?.referralCode || (profile?.userId ? profile.userId + 9999 : 10000);
  const referralLink = typeof window !== "undefined"
    ? `${window.location.origin}/register?ref=${referralCode}`
    : `${siteConfig.matrixUrl}/register?ref=${referralCode}`;

  const handleCopyLink = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      notification.success("Referral link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col w-full p-4 sm:p-6 lg:p-8 gap-6 sm:gap-8 relative overflow-hidden font-body-md text-on-surface">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-tertiary/5 pointer-events-none -z-10" />

      {/* ─── Top Welcome & Identity Banner (Equora Video Phase 6) ─────────── */}
      <section className="bg-surface-container/60 backdrop-blur-xl rounded-2xl p-5 sm:p-6 border border-outline-variant/20 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-[#0a1120] border border-tertiary/30 shadow-md p-1 shrink-0">
            <img
              src="/assets/branding/equorafilogo.jpeg"
              alt="Equora Brand"
              className="w-full h-full object-cover rounded-[12px]"
            />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-label-md uppercase tracking-wider text-tertiary font-bold">
                Equora Sovereign Terminal
              </span>
              <span className="text-[11px] bg-primary/20 text-primary border border-primary/30 px-2.5 py-0.5 rounded-full font-code font-bold">
                ID: #{referralCode}
              </span>
              <span className="text-[11px] bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full font-code flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Active Node
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-on-surface mt-1 flex items-center gap-2">
              <span>Welcome Back, Leader</span>
              <span className="text-xs text-outline font-code font-normal">
                ({address ? formatAddress(address) : "0x000...000"})
              </span>
            </h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Direct Referrals: <span className="text-primary font-bold">{profile?.directReferralCount || 0}</span> •
              Matrix Qualified: <span className={isQualified ? "text-green-400 font-bold" : "text-amber-400 font-bold"}>{isQualified ? "Qualified (✓)" : "Need 2 Referrals"}</span>
            </p>
          </div>
        </div>

        {/* 1-Click Referral Link Copy */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="px-3.5 py-2.5 rounded-xl bg-surface-container-lowest/80 border border-outline-variant/30 font-code text-xs text-on-surface-variant flex items-center gap-2 select-all overflow-hidden max-w-sm">
            <span className="material-symbols-outlined text-[16px] text-tertiary shrink-0">link</span>
            <span className="truncate">{referralLink}</span>
          </div>
          <button
            onClick={handleCopyLink}
            className="px-5 py-2.5 bg-tertiary hover:bg-tertiary/90 text-on-tertiary rounded-xl text-xs font-bold font-label-md uppercase tracking-wider transition-all flex items-center justify-center gap-2 shrink-0 shadow-md active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">
              {copied ? "check" : "content_copy"}
            </span>
            <span>{copied ? "Copied!" : "Copy Link"}</span>
          </button>
        </div>
      </section>

      {/* ─── 3 Financial Overview Cards Grid ────────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        {/* Card 1: Total Withdrawable */}
        <div className="bg-surface-container/50 backdrop-blur-xl rounded-2xl p-6 border border-outline-variant/20 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-label-md uppercase tracking-wider text-on-surface-variant font-bold">
                Total Withdrawable
              </span>
              <span className="text-[10px] font-code bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full font-bold">
                Liquid
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl sm:text-4xl font-black text-on-surface">
                {formatBTT(totalWithdrawable)}
              </span>
              <span className="text-sm text-primary font-bold font-code">TROB</span>
            </div>
            <span className="text-xs text-outline font-code">
              ≈ ${(Number(totalWithdrawable) / 1e18 || 0).toFixed(2)} USD
            </span>
          </div>
          <div className="mt-5 flex gap-2.5">
            <Link
              href="/wallet"
              className="flex-1 py-2.5 bg-secondary-container hover:bg-secondary-container/90 text-on-secondary rounded-xl text-xs font-bold uppercase tracking-wider text-center transition-colors shadow"
            >
              Withdraw
            </Link>
            <Link
              href="/wallet"
              className="px-4 py-2.5 bg-surface-variant hover:bg-surface-variant/80 text-on-surface rounded-xl text-xs font-bold uppercase tracking-wider text-center transition-colors border border-outline-variant/30"
            >
              History
            </Link>
          </div>
        </div>

        {/* Card 2: Lifetime Total Earnings */}
        <div className="bg-surface-container/50 backdrop-blur-xl rounded-2xl p-6 border border-outline-variant/20 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-label-md uppercase tracking-wider text-on-surface-variant font-bold">
                Lifetime Total Earned
              </span>
              <span className="text-[10px] font-code bg-tertiary/10 text-tertiary border border-tertiary/20 px-2 py-0.5 rounded-full font-bold">
                100% P2P
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl sm:text-4xl font-black text-on-surface">
                {formatBTT(totalEarned)}
              </span>
              <span className="text-sm text-tertiary font-bold font-code">TROB</span>
            </div>
            <span className="text-xs text-outline font-code">
              ≈ ${(Number(totalEarned) / 1e18 || 0).toFixed(2)} USD
            </span>
          </div>
          <div className="mt-5 flex items-center justify-between text-xs text-on-surface-variant pt-2 border-t border-outline-variant/10">
            <span>Matrix + Genesis DAO</span>
            <span className="text-tertiary font-bold font-code">0% Platform Cut</span>
          </div>
        </div>

        {/* Card 3: 35% Matrix Vault Pool Share */}
        <div className="bg-surface-container/50 backdrop-blur-xl rounded-2xl p-6 border border-primary/30 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-label-md uppercase tracking-wider text-primary font-bold">
                35% DAO Pool Yield
              </span>
              <span className="text-[10px] font-code bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold">
                Continuous
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl sm:text-4xl font-black text-primary">
                {formatBTT(poolShareClaimable)}
              </span>
              <span className="text-sm text-on-surface font-bold font-code">TROB</span>
            </div>
            <span className="text-xs text-outline font-code">
              Pending dividends from Matrix Nodes 4, 5, 14
            </span>
          </div>
          <button
            onClick={claimPoolShare}
            disabled={isClaimingPoolShare || poolShareClaimable === 0n}
            className="mt-5 w-full py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow disabled:opacity-50"
          >
            {isClaimingPoolShare ? "Claiming..." : poolShareClaimable > 0n ? "Claim 35% Matrix Yield" : "No Yield To Claim"}
          </button>
        </div>
      </section>

      {/* ─── 3 Feature Cards (Genesis DAO, Matrix Slots, Rewards) ───────────── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Feature 1: Genesis DAO Council (dao_card.jpg) */}
        <Link
          href="/dao"
          className="group bg-surface-container/40 hover:bg-surface-container/70 backdrop-blur-xl rounded-2xl p-5 border border-tertiary/20 shadow-lg transition-all duration-300 flex flex-col justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-20 rounded-xl overflow-hidden bg-black/40 border border-tertiary/30 shadow-md shrink-0 group-hover:scale-105 transition-transform duration-300">
              <img
                src="/assets/branding/dao_card.jpg"
                alt="Genesis DAO Card"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-tertiary uppercase tracking-widest font-label-md">
                100-Seat Council
              </span>
              <h3 className="text-base font-bold text-on-surface group-hover:text-tertiary transition-colors">
                Genesis DAO Pass
              </h3>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                {memberInfo?.isMember
                  ? `Active Seat #${memberInfo.position} • 1 Vote (1.0%) • 35% Global Matrix Royalties`
                  : "Secure 1 of only 100 founding seats • $300 Entry • $300/N Instant Redistribution"}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-outline-variant/10 flex items-center justify-between text-xs font-bold text-tertiary">
            <span>{memberInfo?.isMember ? "View Governance & 5X Cap" : "Claim Council Seat (300 TROB)"}</span>
            <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </div>
        </Link>

        {/* Feature 2: 12-Slot Matrix (matrix_slots.jpg) */}
        <Link
          href="/matrix"
          className="group bg-surface-container/40 hover:bg-surface-container/70 backdrop-blur-xl rounded-2xl p-5 border border-primary/20 shadow-lg transition-all duration-300 flex flex-col justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-20 rounded-xl overflow-hidden bg-black/40 border border-primary/30 shadow-md shrink-0 group-hover:scale-105 transition-transform duration-300">
              <img
                src="/assets/branding/matrix_slots.jpg"
                alt="Matrix Slots"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest font-label-md">
                14-Node Engine
              </span>
              <h3 className="text-base font-bold text-on-surface group-hover:text-primary transition-colors">
                Matrix Slots (1–12)
              </h3>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                Slot {highestUnlockedSlot} Unlocked • 600% ROI per cycle • Automatic board progression & recycling.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-outline-variant/10 flex items-center justify-between text-xs font-bold text-primary">
            <span>Explore 14-Node Matrix</span>
            <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </div>
        </Link>

        {/* Feature 3: Magic Blind Box & Rewards (mystery_box.jpg) */}
        <Link
          href="/rewards"
          className="group bg-surface-container/40 hover:bg-surface-container/70 backdrop-blur-xl rounded-2xl p-5 border border-secondary/20 shadow-lg transition-all duration-300 flex flex-col justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-20 rounded-xl overflow-hidden bg-black/40 border border-secondary/30 shadow-md shrink-0 group-hover:scale-105 transition-transform duration-300">
              <img
                src="/assets/branding/mystery_box.jpg"
                alt="Magic Blind Box"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-secondary uppercase tracking-widest font-label-md">
                Protocol Pools
              </span>
              <h3 className="text-base font-bold text-on-surface group-hover:text-secondary transition-colors">
                Magic Box & Salary
              </h3>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                40% Monthly Salary Pool on 11th • 10% Quarterly Blind Box • Milestone Cash Drops (Alpha–Crown).
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-outline-variant/10 flex items-center justify-between text-xs font-bold text-secondary">
            <span>View 4 Protocol Pools</span>
            <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </div>
        </Link>
      </section>

      {/* ─── 12-Slot Matrix Quick Progression Grid ─────────────────────────── */}
      <section className="bg-surface-container/40 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-outline-variant/20 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">grid_view</span>
              12-Slot Matrix Progression
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Cost doubles each tier ($30 to $61,440). Higher slots amplify earnings across all 14-node cycles.
            </p>
          </div>
          <Link
            href="/matrix"
            className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
          >
            <span>Open Matrix Board</span>
            <span className="material-symbols-outlined text-sm">open_in_new</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {MATRIX_LEVELS_CONFIG.map((lvl) => {
            const slotData = slots.find((s: any) => s.slotNumber === lvl.id);
            const isUnlocked = slotData ? slotData.isUnlocked : lvl.id <= highestUnlockedSlot;
            const isCurrent = lvl.id === highestUnlockedSlot;

            let bgClass = "bg-surface-container-low border-outline-variant/10 opacity-60";
            let icon = "lock";
            let iconColor = "text-outline";
            let textColor = "text-on-surface-variant";

            if (isUnlocked) {
              bgClass = "bg-primary/10 border-primary/30 shadow-[0_0_15px_rgba(185,199,228,0.08)]";
              icon = "check_circle";
              iconColor = "text-green-400";
              textColor = "text-primary font-bold";
            } else if (isCurrent) {
              bgClass = "bg-tertiary/15 border-tertiary shadow-[0_0_20px_rgba(233,193,118,0.2)]";
              icon = "key";
              iconColor = "text-tertiary";
              textColor = "text-tertiary font-bold";
            }

            return (
              <Link
                key={lvl.id}
                href="/matrix"
                className={`rounded-xl p-4 border ${bgClass} flex flex-col items-center justify-between min-h-[110px] transition-all duration-300 hover:scale-[1.03] cursor-pointer`}
              >
                <div className="flex w-full justify-between items-center text-[11px] font-code">
                  <span className={textColor}>SLOT {lvl.id}</span>
                  <span className={`material-symbols-outlined text-[16px] ${iconColor}`}>{icon}</span>
                </div>
                <div className="flex flex-col items-center my-1">
                  <span className="text-lg font-black text-on-surface">
                    {lvl.cost} <span className="text-[10px] font-normal text-outline">TROB</span>
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
                    {lvl.multiplier}
                  </span>
                </div>
                <span className="text-[9px] font-code uppercase text-outline">
                  {isUnlocked ? "Unlocked" : "Locked"}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ─── Live Activity Feed & Audit Trail (Equora Video Phase 6) ──────── */}
      <section className="w-full">
        <DAOHistoryTable />
      </section>
    </div>
  );
}
