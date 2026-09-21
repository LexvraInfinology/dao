"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { formatBTT } from "../../utils/equora/matrixHelpers";
import { formatAddress } from "../../utils/equora/formatters";
import { useDAOData } from "../../hooks/equora/useDAOData";
import { useJoinDAO } from "../../hooks/equora/useJoinDAO";
import { useClaimFallback } from "../../hooks/equora/useClaimFallback";
import { useClaimPoolShare } from "../../hooks/equora/useClaimPoolShare";
import { useUserProfile } from "../../hooks/equora/useUserProfile";
import { DAOHistoryTable } from "../../components/dao/DAOHistoryTable";
import { notification } from "../../utils/scaffold-eth/notification";
import { AuthGuard } from "../../components/auth/AuthGuard";

function formatCountdown(seconds: number) {
  if (seconds <= 0) return "00h 00m 00s";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`;
}

export default function DAOPage() {
  return (
    <AuthGuard>
      <DAOContent />
    </AuthGuard>
  );
}

function DAOContent() {
  const { address } = useAccount();
  const { profile } = useUserProfile(address as `0x${string}`);
  const [copied, setCopied] = useState(false);
  const [calcSeat, setCalcSeat] = useState<number>(2);

  const referralCode = profile?.referralCode || (profile?.userId ? profile.userId + 9999 : 10000);
  const referralLink = typeof window !== "undefined"
    ? `${window.location.origin}/register?ref=${referralCode}`
    : `https://equora.fi/register?ref=${referralCode}`;

  const handleCopyLink = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      notification.success("Referral link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };
  const {
    totalMembers,
    isFull,
    memberInfo,
    capEarned,
    capMax,
    capProgressPct,
    retopupSecondsLeft,
    isCapped,
    isBlank,
    totalClaimable,
    poolShareClaimable,
    totalPoolReceived,
    totalPoolDistributed,
    remainingPositions,
    refetch: refetchDAO,
  } = useDAOData(address);

  const { isApproving, isJoining, isRetopping, handleJoinDAO, retopup } = useJoinDAO(() => {
    refetchDAO();
  });

  const { claim: claimFallback, isClaiming: isClaimingFallback } = useClaimFallback();
  const { claim: claimPoolShare, isClaiming: isClaimingPoolShare } = useClaimPoolShare(() => {
    refetchDAO();
  });

  const seatsClaimed = totalMembers;
  const totalStakedBtt = BigInt(totalMembers) * 300n;
  const isMember = memberInfo?.isMember;
  const userSeat = memberInfo?.position;

  return (
    <div className="flex flex-col w-full relative min-h-full font-body-md text-on-surface">
      {/* ─── Decorative Background Glow ────────────────────────────────────── */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none mix-blend-screen -z-10" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-tertiary/5 rounded-full blur-[100px] pointer-events-none mix-blend-screen -z-10" />

      {/* ─── Header Section with TitanBot ──────────────────────────────────── */}
      <section className="relative z-10 px-4 sm:px-8 pt-8 pb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-tertiary/10 rounded-full mb-4 border border-tertiary/20">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
            <span className="text-[11px] font-label-md text-tertiary tracking-widest uppercase font-bold">
              Equora Governance Live
            </span>
          </div>
          <h1 className="font-headline-xl text-3xl sm:text-headline-xl font-black text-on-background mb-3">
            Genesis DAO Council
          </h1>
          <p className="font-body-lg text-sm sm:text-body-lg text-on-surface-variant leading-relaxed">
            The founding council on the Equora.Fi protocol. The first 100 members secure lifetime governance rights, instant push dividend streams, and a 5X earnings cap with renewable 48-hour re-topup windows.
          </p>
        </div>

        <div className="relative w-44 h-44 sm:w-52 sm:h-52 shrink-0 rounded-2xl overflow-hidden border border-tertiary/30 shadow-2xl group">
          <div className="absolute inset-0 bg-tertiary/20 rounded-2xl blur-2xl animate-pulse pointer-events-none" />
          <img
            alt="Genesis DAO Council 3D Pass"
            className="relative z-10 w-full h-full object-cover rounded-2xl drop-shadow-[0_0_20px_rgba(233,193,118,0.3)] group-hover:scale-105 transition-transform duration-500"
            src="/assets/branding/dao_card.jpg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-20 flex items-end p-3">
            <span className="text-[10px] font-code font-bold text-tertiary bg-black/60 px-2 py-0.5 rounded border border-tertiary/30 backdrop-blur-sm">
              Genesis Pass • 100 Seats
            </span>
          </div>
        </div>
      </section>

      {/* ─── Personal Genesis Referral & Leader Identity Card (Adapted from Equora UX) ──── */}
      <section className="px-4 sm:px-8 mb-6 relative z-10">
        <div className="bg-surface-container/60 backdrop-blur-xl rounded-2xl p-5 sm:p-6 border border-tertiary/25 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-tertiary/20 to-primary/20 border border-tertiary/40 flex items-center justify-center shrink-0 shadow-inner">
              <span className="text-2xl">👑</span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-label-md uppercase tracking-wider text-tertiary font-bold">
                  Genesis Member Identity
                </span>
                <span className="text-[11px] bg-primary/20 text-primary border border-primary/30 px-2.5 py-0.5 rounded-full font-code font-bold">
                  5-Digit ID: #{referralCode}
                </span>
                {isMember && (
                  <span className="text-[10px] bg-tertiary/20 text-tertiary border border-tertiary/30 px-2 py-0.5 rounded-full font-bold">
                    Council Seat #{userSeat}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-on-surface mt-1 flex items-center gap-2">
                <span>{isMember ? "Genesis Council Seat Holder" : "Equora Platform Participant"}</span>
                {isMember && <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded font-mono">1 Vote (1.0%)</span>}
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Direct Referrals: <span className="text-primary font-bold">{profile?.directReferralCount || 0}</span> •
                Matrix Qualified: <span className={profile?.isQualified ? "text-green-400 font-bold" : "text-amber-400 font-bold"}>{profile?.isQualified ? "Qualified (✓)" : "0 / 2 Referrals"}</span>
              </p>
            </div>
          </div>

          {/* Referral Link & Copy Action */}
          <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="px-3.5 py-2.5 rounded-xl bg-surface-container-lowest/80 border border-outline-variant/30 font-code text-xs text-on-surface-variant flex items-center gap-2 select-all overflow-hidden max-w-md">
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
        </div>
      </section>

      {/* ─── Main Content Grid (12 Columns) ────────────────────────────────── */}
      <div className="px-4 sm:px-8 pb-20 grid grid-cols-1 xl:grid-cols-12 gap-6 relative z-10">
        {/* Left Column: Council Grid & Stats (8 cols) */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {/* Seats Claimed */}
            <div className="bg-surface-container/50 backdrop-blur-xl rounded-xl p-6 relative overflow-hidden group hover:bg-surface-container transition-colors duration-300 border border-outline-variant/15">
              <div className="absolute top-0 left-0 w-1 h-full bg-tertiary" />
              <span className="text-label-md font-label-md text-on-surface-variant block mb-2 uppercase tracking-wider text-xs font-bold">
                Seats Claimed
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-headline-xl font-headline-xl font-black text-on-surface">
                  {seatsClaimed}
                </span>
                <span className="text-body-md text-outline font-code">/ 100</span>
              </div>
              <div className="mt-4 w-full bg-surface-variant rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-tertiary h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${(seatsClaimed / 100) * 100}%` }}
                />
              </div>
            </div>

            {/* Total Staked */}
            <div className="bg-surface-container/50 backdrop-blur-xl rounded-xl p-6 relative overflow-hidden group hover:bg-surface-container transition-colors duration-300 border border-outline-variant/15">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
              <span className="text-label-md font-label-md text-on-surface-variant block mb-2 uppercase tracking-wider text-xs font-bold">
                Total Staked (TROB)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-headline-xl font-headline-xl font-black text-on-surface">
                  {formatBTT(totalStakedBtt)}
                </span>
              </div>
              <div className="mt-4 flex items-center gap-2 text-[12px] text-primary font-code font-bold">
                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                <span>100% Instant Push Payouts</span>
              </div>
            </div>

            {/* Join Council / Status */}
            <div
              onClick={!isMember && !isFull ? handleJoinDAO : undefined}
              className={`bg-surface-container/50 backdrop-blur-xl rounded-xl p-6 relative overflow-hidden flex flex-col justify-center items-center text-center group hover:bg-surface-container transition-colors duration-300 border border-outline-variant/15 ${
                !isMember && !isFull ? "cursor-pointer" : ""
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-secondary-container/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform text-secondary">
                <span className="material-symbols-outlined text-[24px]">
                  {isMember ? "workspace_premium" : isFull ? "lock" : "add"}
                </span>
              </div>
              <span className="text-label-md font-label-md text-on-surface font-bold text-xs uppercase tracking-wider">
                {isMember ? `Seat #${userSeat} Member` : isFull ? "Council Filled (100/100)" : "Join Council"}
              </span>
              <span className="text-[12px] text-on-surface-variant mt-1">
                {isMember ? "Full Governance Active" : isFull ? "0 Seats Remaining" : "Requires 300 TROB"}
              </span>
            </div>
          </div>

          {/* 100-Seat Grid Visualization */}
          <div className="bg-surface-container/30 backdrop-blur-md rounded-2xl p-6 sm:p-8 relative border border-outline-variant/15">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <h2 className="text-lg sm:text-headline-md font-headline-md text-on-surface flex items-center gap-2 font-bold">
                <span className="material-symbols-outlined text-tertiary">grid_on</span>
                Founding Member Grid (100 Seats)
              </h2>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-tertiary/20 border border-tertiary" />
                  <span className="text-[12px] text-outline font-code">Claimed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-surface-variant border border-outline/30" />
                  <span className="text-[12px] text-outline font-code">Available</span>
                </div>
              </div>
            </div>

            {/* 100-Seat Grid */}
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-3">
              {Array.from({ length: 100 }, (_, i) => i + 1).map((seatNum) => {
                const isClaimed = seatNum <= seatsClaimed;
                const isUserSeat = isMember && userSeat === seatNum;

                return (
                  <div
                    key={seatNum}
                    className={`aspect-square rounded-md flex items-center justify-center text-[10px] font-code transition-all duration-300 cursor-pointer ${
                      isUserSeat
                        ? "bg-tertiary/25 border-2 border-tertiary text-tertiary shadow-[0_0_12px_rgba(233,193,118,0.4)] scale-105 font-bold"
                        : isClaimed
                        ? "bg-tertiary/10 border border-tertiary/50 text-tertiary hover:bg-tertiary/20 hover:scale-110 shadow-[0_0_10px_rgba(233,193,118,0.2)]"
                        : "bg-surface-variant/30 border border-outline/10 text-outline-variant hover:border-outline/50 hover:bg-surface-variant"
                    }`}
                    title={`Seat #${seatNum} - ${isClaimed ? (isUserSeat ? "YOU" : "Claimed") : "Available"}`}
                  >
                    {isUserSeat ? (
                      <span className="text-xs">👑</span>
                    ) : isClaimed ? (
                      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        star
                      </span>
                    ) : (
                      <span>{seatNum}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ─── 300 / N Instant Cashback & Redistribution Engine ─── */}
            <div className="mt-6 pt-6 border-t border-outline-variant/15">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary text-[20px]">sync_alt</span>
                    <h3 className="font-bold text-sm text-on-surface">
                      300 / N Instant Redistribution Engine
                    </h3>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    When Member N joins, the 300 TROB deposit is split equally across all N members. Member N gets their share returned instantly!
                  </p>
                </div>
                <span className="text-[10px] font-code font-bold bg-tertiary/10 text-tertiary px-2.5 py-1 rounded-full border border-tertiary/30 shrink-0">
                  Zero Platform Fee • 100% P2P
                </span>
              </div>

              {/* Interactive Seat Slider */}
              <div className="bg-surface-container-lowest/60 rounded-xl p-4 border border-outline-variant/20 mb-4">
                <div className="flex justify-between items-center text-xs font-code mb-2">
                  <span className="text-on-surface-variant font-bold">Simulate Joining as Member Position (N):</span>
                  <span className="text-tertiary font-black text-sm bg-tertiary/10 px-2 py-0.5 rounded border border-tertiary/30">
                    Position #{calcSeat}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={calcSeat}
                  onChange={(e) => setCalcSeat(Number(e.target.value))}
                  className="w-full h-2 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-tertiary"
                />
                <div className="flex justify-between text-[10px] font-code text-outline mt-1">
                  <span>#1 (100% Cash Back)</span>
                  <span>#2 ($150 each)</span>
                  <span>#3 ($100 each)</span>
                  <span>#10 ($30 each)</span>
                  <span>#100 ($3 each)</span>
                </div>
              </div>

              {/* 4 Stat Breakdown Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-surface-container/60 rounded-xl p-3 border border-outline-variant/15 text-center">
                  <span className="text-[10px] text-outline font-label-md uppercase block">Deposit</span>
                  <span className="text-sm font-bold font-code text-on-surface mt-1 block">300 TROB</span>
                  <span className="text-[9px] text-on-surface-variant">Standard Entry</span>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-center">
                  <span className="text-[10px] text-emerald-400 font-label-md uppercase block font-bold">Instant Cashback</span>
                  <span className="text-sm font-bold font-code text-emerald-400 mt-1 block">
                    +{(300 / calcSeat).toFixed(2)} TROB
                  </span>
                  <span className="text-[9px] text-emerald-400/80">Returned to Member #{calcSeat}</span>
                </div>

                <div className="bg-primary/10 border border-primary/30 rounded-xl p-3 text-center">
                  <span className="text-[10px] text-primary font-label-md uppercase block font-bold">Paid to Prior Members</span>
                  <span className="text-sm font-bold font-code text-primary mt-1 block">
                    {(300 / calcSeat).toFixed(2)} TROB
                  </span>
                  <span className="text-[9px] text-primary/80">Each to Members 1..{calcSeat > 1 ? calcSeat - 1 : 1}</span>
                </div>

                <div className="bg-tertiary/10 border border-tertiary/30 rounded-xl p-3 text-center">
                  <span className="text-[10px] text-tertiary font-label-md uppercase block font-bold">Net Out-of-Pocket</span>
                  <span className="text-sm font-bold font-code text-tertiary mt-1 block">
                    {(300 - 300 / calcSeat).toFixed(2)} TROB
                  </span>
                  <span className="text-[9px] text-tertiary/80">{calcSeat === 1 ? "100% Free Seat!" : `Effective Cost`}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Soulbound NFT + 5X Cap & Fallback (4 cols) */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          {/* Soulbound NFT Preview */}
          <div className="bg-gradient-to-b from-surface-container-high to-surface-container-low rounded-2xl p-1 relative overflow-hidden group border border-outline-variant/20">
            <div className="absolute inset-0 bg-gradient-to-r from-tertiary/0 via-tertiary/30 to-tertiary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />
            <div className="bg-surface-dim rounded-[14px] p-6 h-full relative z-10 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <span className="text-label-md font-label-md text-on-surface-variant uppercase tracking-widest text-xs font-bold">
                  Soulbound Credential
                </span>
                <span className="material-symbols-outlined text-tertiary">workspace_premium</span>
              </div>

              {/* Card Graphic with 3D DAO Pass Asset */}
              <div
                className="aspect-[3/4] w-full max-w-[240px] mx-auto rounded-xl relative overflow-hidden mb-6 shadow-[0_10px_30px_rgba(0,0,0,0.6)] transform transition-transform duration-500 hover:scale-105 border border-tertiary/30 group/card"
                style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
              >
                <img
                  src="/assets/branding/dao_card.jpg"
                  alt="Genesis DAO Pass"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a1120] via-transparent to-black/40 p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                    <span className="font-headline-md font-black text-xs text-white drop-shadow">EQUORA.FI</span>
                    <span className="text-[10px] font-code text-tertiary bg-black/70 px-2 py-0.5 rounded border border-tertiary/40 font-bold backdrop-blur-sm">
                      SBT #{isMember ? String(userSeat).padStart(3, "0") : "000"}
                    </span>
                  </div>

                  <div className="bg-surface-container-lowest/90 backdrop-blur-md p-3 rounded-xl border border-tertiary/30 shadow-xl">
                    <div className="text-[10px] text-tertiary uppercase tracking-wider font-bold">Soulbound Council Pass</div>
                    <div className="text-xs font-label-md text-white font-bold mt-0.5">
                      {isMember ? `Council Seat #${userSeat} (Active)` : "Unclaimed (300 TROB)"}
                    </div>
                    <div className="w-full h-px bg-gradient-to-r from-tertiary/50 to-transparent my-1.5" />
                    <div className="text-[9px] font-code text-primary break-all">
                      {address ? formatAddress(address) : "0x0000...0000"}
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-on-surface-variant text-center mb-6 leading-relaxed">
                Non-transferable identity token proving Founding Council status. Grants access to permanent governance and instant push yield distributions.
              </p>

              {!isMember ? (
                <button
                  onClick={handleJoinDAO}
                  disabled={isApproving || isJoining || isFull}
                  className="w-full py-4 bg-secondary-container hover:bg-secondary-container/90 text-on-secondary text-label-md font-label-md rounded-lg transition-colors flex items-center justify-center gap-2 mt-auto font-bold text-xs uppercase tracking-wider shadow-lg disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">lock_open</span>
                  <span>
                    {isApproving
                      ? "Approving 300 TROB..."
                      : isJoining
                      ? "Minting Pass..."
                      : isFull
                      ? "Council Full (100/100)"
                      : "Mint Governance Pass (300 TROB)"}
                  </span>
                </button>
              ) : (
                <div className="text-center py-3 bg-tertiary/10 border border-tertiary/30 rounded-lg text-xs font-bold text-tertiary mt-auto">
                  ✓ Founding Pass Active (Seat #{userSeat})
                </div>
              )}
            </div>
          </div>

          {/* 5X Earnings Cap & 48-Hour Re-topup Widget */}
          {isMember && (
            <div className="bg-surface-container/50 backdrop-blur-xl rounded-2xl p-6 border border-outline-variant/15 shadow-md flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-label-md uppercase tracking-wider text-on-surface font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-tertiary">speed</span>
                  5X Earnings Cap Monitor
                </h3>
                <span
                  className={`text-[10px] font-code font-bold px-2 py-0.5 rounded ${
                    isBlank
                      ? "bg-error/20 text-error border border-error/30"
                      : isCapped
                      ? "bg-warning/20 text-warning border border-warning/30"
                      : "bg-primary/10 text-primary border border-primary/20"
                  }`}
                >
                  {isBlank ? "SLOT BLANKED" : isCapped ? "CAP HIT" : "ACTIVE"}
                </span>
              </div>

              {/* Progress bar */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-code">
                  <span className="text-on-surface-variant">Lifetime Earned:</span>
                  <span className="font-bold text-on-surface">
                    {formatBTT(capEarned)} / {formatBTT(capMax)} TROB
                  </span>
                </div>
                <div className="w-full bg-surface-variant rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isCapped || isBlank ? "bg-error" : "bg-gradient-to-r from-primary to-tertiary"
                    }`}
                    style={{ width: `${Math.min(100, capProgressPct)}%` }}
                  />
                </div>
                <span className="text-[11px] text-outline font-code text-right">{capProgressPct}% of 5X cap reached</span>
              </div>

              {/* 48-hour countdown if capped */}
              {isCapped && !isBlank && (
                <div className="p-3 bg-warning/10 border border-warning/30 rounded-xl flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-warning font-bold text-xs">
                    <span className="material-symbols-outlined text-[16px]">alarm</span>
                    <span>48-Hour Re-topup Countdown</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">
                    You have reached the 5X (1,500 TROB) cap! Re-topup within 48 hours or your seat will become vacant and available for new buyers.
                  </p>
                  <div className="text-center py-2 bg-surface-container rounded-lg font-code font-black text-warning text-base">
                    {formatCountdown(retopupSecondsLeft)}
                  </div>
                </div>
              )}

              {/* Blanked alert if expired */}
              {isBlank && (
                <div className="p-3 bg-error/10 border border-error/30 rounded-xl flex flex-col gap-1.5 text-error">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <span className="material-symbols-outlined text-[16px]">block</span>
                    <span>Seat Is Blanked</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">
                    The 48-hour window has expired. Call Re-topup (300 TROB) to reactivate your council seat and restart distributions.
                  </p>
                </div>
              )}

              {/* Retopup button */}
              {(isCapped || isBlank) && (
                <button
                  onClick={retopup}
                  disabled={isRetopping || isApproving}
                  className="w-full py-3 bg-tertiary hover:bg-tertiary/90 text-on-tertiary rounded-lg font-label-md text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">autorenew</span>
                  <span>{isRetopping ? "Re-topping up..." : "Re-topup Seat (300 TROB)"}</span>
                </button>
              )}
            </div>
          )}

          {/* DAO Plan Share Benefit (35% Matrix Volume Yield) Claim Card */}
          {isMember && (
            <div className="bg-surface-container/50 backdrop-blur-xl rounded-2xl p-6 border border-primary/30 shadow-md flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-label-md uppercase tracking-wider text-primary font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">pie_chart</span>
                  DAO Plan Share Benefit
                </h3>
                <span className="text-[10px] font-code font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  35% Matrix Pool
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-on-surface-variant">Claimable Yield:</span>
                <span className="text-xl font-headline-lg font-black text-primary">
                  {formatBTT(poolShareClaimable)} <span className="text-xs font-normal text-on-surface">TROB</span>
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-on-surface-variant font-code py-1 border-y border-outline-variant/10">
                <span>Total Pool Inflow:</span>
                <span className="font-bold text-on-surface">{formatBTT(totalPoolReceived)} TROB</span>
              </div>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                Ongoing revenue from matrix positions 4, 5, and 14 across the entire network. Distributed equally to active founding members with zero 5X cap restriction.
              </p>
              <button
                onClick={claimPoolShare}
                disabled={isClaimingPoolShare || poolShareClaimable === 0n}
                className="w-full py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-lg font-label-md text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
                <span>{isClaimingPoolShare ? "Claiming..." : poolShareClaimable > 0n ? "Claim 35% Matrix Yield" : "No Yield to Claim"}</span>
              </button>
            </div>
          )}

          {/* Fallback Claim Balance Widget */}
          {isMember && totalClaimable > 0n && (
            <div className="bg-surface-container/50 backdrop-blur-xl rounded-2xl p-6 border border-tertiary/30 shadow-md flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-label-md uppercase tracking-wider text-tertiary font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">savings</span>
                  Uncollected Fallback Balance
                </h3>
                <span className="text-[10px] font-code font-bold px-2 py-0.5 rounded bg-tertiary/10 text-tertiary">
                  0 Fee Claim
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-on-surface-variant">Pending Payout:</span>
                <span className="text-xl font-headline-lg font-black text-tertiary">
                  {formatBTT(totalClaimable)} <span className="text-xs font-normal text-on-surface">TROB</span>
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                Direct push payout fallback. Claim your earnings directly to your connected wallet anytime with zero fees.
              </p>
              <button
                onClick={claimFallback}
                disabled={isClaimingFallback}
                className="w-full py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-lg font-label-md text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>{isClaimingFallback ? "Claiming..." : "Claim Fallback Balance"}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Dual Economic Benefit Models (Specification Reference) ───────── */}
      <section className="px-4 sm:px-8 pb-20 relative z-10 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full w-fit border border-primary/20">
            <span className="material-symbols-outlined text-primary text-[14px]">auto_awesome</span>
            <span className="text-[11px] font-label-md text-primary tracking-widest uppercase font-bold">
              Economic Architecture
            </span>
          </div>
          <h2 className="font-headline-lg text-2xl sm:text-headline-lg font-black text-on-background">
            Genesis DAO Dual Benefit Streams
          </h2>
          <p className="text-sm text-on-surface-variant max-w-3xl leading-relaxed">
            Genesis DAO founding council members participate in two distinct economic streams: the queue-based entry fee distribution and the permanent matrix protocol volume share.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Benefit 1: DAO Deposit Share Benefit */}
          <div className="bg-surface-container/40 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-outline-variant/15 flex flex-col gap-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-label-md text-tertiary uppercase tracking-widest font-bold">
                  Benefit Stream #1
                </span>
                <h3 className="text-xl font-bold text-on-surface mt-1">
                  DAO Deposit Share Benefit
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-code font-bold bg-tertiary/10 text-tertiary border border-tertiary/20">
                5X (1,500 TROB) Cap
              </span>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              Every new member pays a fixed <strong>300 TROB</strong> seat fee. 100% of this fee is pushed directly and equally across all active founding members ($300 / N$), including instant cashback directly back into the new joiner's wallet.
            </p>

            <div className="p-4 rounded-xl bg-surface-container-highest/30 border border-outline-variant/10 flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-on-surface-variant font-medium">Deposit Fee:</span>
                <span className="font-bold text-on-surface font-code">300 TROB</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-on-surface-variant font-medium">Member #1 Cumulative Yield:</span>
                <span className="font-bold text-tertiary font-code">1,556 TROB (5.19X)</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-on-surface-variant font-medium">Re-topup Window:</span>
                <span className="font-bold text-warning font-code">48 Hours</span>
              </div>
            </div>

            {/* Queue Payout Steps Table */}
            <div className="overflow-x-auto rounded-xl border border-outline-variant/10">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-container-highest/50 text-[11px] uppercase tracking-wider text-on-surface-variant font-label-md">
                  <tr>
                    <th className="py-2.5 px-3">Entry #</th>
                    <th className="py-2.5 px-3">Split Pool</th>
                    <th className="py-2.5 px-3">Share / Member</th>
                    <th className="py-2.5 px-3 text-right">#1 Cumulative</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 font-code text-on-surface">
                  <tr className="hover:bg-surface-container-highest/20">
                    <td className="py-2 px-3">Join #2</td>
                    <td className="py-2 px-3">300 TROB</td>
                    <td className="py-2 px-3 font-bold text-tertiary">300 TROB</td>
                    <td className="py-2 px-3 text-right">300 TROB</td>
                  </tr>
                  <tr className="hover:bg-surface-container-highest/20">
                    <td className="py-2 px-3">Join #3</td>
                    <td className="py-2 px-3">300 TROB / 2</td>
                    <td className="py-2 px-3">150 TROB</td>
                    <td className="py-2 px-3 text-right">450 TROB</td>
                  </tr>
                  <tr className="hover:bg-surface-container-highest/20">
                    <td className="py-2 px-3">Join #4</td>
                    <td className="py-2 px-3">300 TROB / 3</td>
                    <td className="py-2 px-3">100 TROB</td>
                    <td className="py-2 px-3 text-right">550 TROB</td>
                  </tr>
                  <tr className="hover:bg-surface-container-highest/20">
                    <td className="py-2 px-3">Join #10</td>
                    <td className="py-2 px-3">300 TROB / 9</td>
                    <td className="py-2 px-3">33 TROB</td>
                    <td className="py-2 px-3 text-right">868 TROB</td>
                  </tr>
                  <tr className="hover:bg-surface-container-highest/20">
                    <td className="py-2 px-3">Join #50</td>
                    <td className="py-2 px-3">300 TROB / 49</td>
                    <td className="py-2 px-3">6 TROB</td>
                    <td className="py-2 px-3 text-right">1,305 TROB</td>
                  </tr>
                  <tr className="hover:bg-surface-container-highest/20 bg-tertiary/5">
                    <td className="py-2 px-3 font-bold text-tertiary">Join #100</td>
                    <td className="py-2 px-3 font-bold">300 TROB / 99</td>
                    <td className="py-2 px-3 font-bold text-tertiary">3 TROB</td>
                    <td className="py-2 px-3 text-right font-black text-tertiary">1,535 TROB</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-outline leading-relaxed italic">
              * When any member hits the 1,500 TROB (5X) cap, they have 48 hours to re-topup (300 TROB). Re-topup fees are distributed to all other active members, continuing the cycle indefinitely.
            </p>
          </div>

          {/* Benefit 2: DAO Plan Share Benefit */}
          <div className="bg-surface-container/40 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-outline-variant/15 flex flex-col gap-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-label-md text-primary uppercase tracking-widest font-bold">
                  Benefit Stream #2
                </span>
                <h3 className="text-xl font-bold text-on-surface mt-1">
                  DAO Plan Share Benefit
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-code font-bold bg-primary/10 text-primary border border-primary/20">
                35% Matrix Share
              </span>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              In each 14-node matrix cycle, positions <strong>P4, P5, and P14</strong> (3 of 14 nodes = <strong>21.43%</strong> of network volume) flow directly to the protocol vault. <strong>35%</strong> of this volume is continuously distributed to DAO members.
            </p>

            {/* Matrix Network Volume Projections Table */}
            <div className="overflow-x-auto rounded-xl border border-outline-variant/10">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-container-highest/50 text-[11px] uppercase tracking-wider text-on-surface-variant font-label-md">
                  <tr>
                    <th className="py-2.5 px-3">Network IDs</th>
                    <th className="py-2.5 px-3">Qualifies (21.4%)</th>
                    <th className="py-2.5 px-3">Matrix Vol ($)</th>
                    <th className="py-2.5 px-3">DAO Pool (35%)</th>
                    <th className="py-2.5 px-3 text-right">If 100 DAO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 font-code text-on-surface">
                  <tr className="hover:bg-surface-container-highest/20">
                    <td className="py-2 px-3 font-bold">1,000</td>
                    <td className="py-2 px-3 text-on-surface-variant">214</td>
                    <td className="py-2 px-3">$6,429</td>
                    <td className="py-2 px-3 font-semibold text-primary">$2,250</td>
                    <td className="py-2 px-3 text-right font-bold text-primary">$23 / seat</td>
                  </tr>
                  <tr className="hover:bg-surface-container-highest/20">
                    <td className="py-2 px-3 font-bold">10,000</td>
                    <td className="py-2 px-3 text-on-surface-variant">2,143</td>
                    <td className="py-2 px-3">$64,286</td>
                    <td className="py-2 px-3 font-semibold text-primary">$22,500</td>
                    <td className="py-2 px-3 text-right font-bold text-primary">$225 / seat</td>
                  </tr>
                  <tr className="hover:bg-surface-container-highest/20">
                    <td className="py-2 px-3 font-bold">25,000</td>
                    <td className="py-2 px-3 text-on-surface-variant">5,357</td>
                    <td className="py-2 px-3">$160,714</td>
                    <td className="py-2 px-3 font-semibold text-primary">$56,250</td>
                    <td className="py-2 px-3 text-right font-bold text-primary">$562 / seat</td>
                  </tr>
                  <tr className="hover:bg-surface-container-highest/20">
                    <td className="py-2 px-3 font-bold">50,000</td>
                    <td className="py-2 px-3 text-on-surface-variant">10,714</td>
                    <td className="py-2 px-3">$321,429</td>
                    <td className="py-2 px-3 font-semibold text-primary">$112,500</td>
                    <td className="py-2 px-3 text-right font-bold text-primary">$1,125 / seat</td>
                  </tr>
                  <tr className="hover:bg-surface-container-highest/20 bg-primary/5">
                    <td className="py-2 px-3 font-black text-primary">100,000</td>
                    <td className="py-2 px-3 text-on-surface-variant">21,429</td>
                    <td className="py-2 px-3 font-bold">$642,857</td>
                    <td className="py-2 px-3 font-black text-primary">$225,000</td>
                    <td className="py-2 px-3 text-right font-black text-primary">$2,250 / seat</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 text-[11px] text-on-surface-variant leading-relaxed flex items-start gap-2.5">
              <span className="material-symbols-outlined text-primary text-[16px] shrink-0 mt-0.5">info</span>
              <span>
                <strong>Ongoing Platform Yield:</strong> Unlike the deposit queue, the DAO Plan Share Benefit has no 5X cap. Founding members claim their share of global platform volume continuously through the live claim button above.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Live Genesis Council Audit Trail (Indexed from Backend & Postgres) ─ */}
      <section className="px-4 sm:px-8 pb-20 relative z-10">
        <DAOHistoryTable />
      </section>
    </div>
  );
}
