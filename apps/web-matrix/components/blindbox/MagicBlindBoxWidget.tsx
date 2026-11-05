"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useUserStore } from "@/lib/stores";
import {
  isUserRegisteredInMatrix,
  getUserMagicBoxStatus,
  claimMagicBoxRewardOnChain,
  UserMagicBoxStatus,
} from "@/lib/contracts";
import { toast } from "@/lib/toast";

interface MagicBlindBoxWidgetProps {
  userAddress?: string;
  isQualified?: boolean;
}

export function MagicBlindBoxWidget({
  userAddress,
  isQualified = false,
}: MagicBlindBoxWidgetProps) {
  const pathname = usePathname();
  const storeProfile = useUserStore((s) => s.profile);
  const storeAddress = useUserStore((s) => s.address);
  const activeAddress = userAddress || storeProfile?.address || storeAddress;

  // Active matrix membership check
  const [isActiveMember, setIsActiveMember] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const currentAddr = (
      activeAddress ||
      localStorage.getItem("equora_user_address") ||
      localStorage.getItem("equora_auth_address") ||
      ""
    ).trim().toLowerCase();
    if (!currentAddr) return false;
    if (localStorage.getItem(`equora_matrix_registered_${currentAddr}`) === "true") {
      return true;
    }
    if (
      storeProfile?.isRegistered ||
      (storeProfile?.userId && storeProfile.userId > 0) ||
      (storeProfile?.highestUnlockedSlot && storeProfile.highestUnlockedSlot >= 1) ||
      (storeProfile?.directReferralsCount && storeProfile.directReferralsCount > 0) ||
      (storeProfile?.totalEarnings && storeProfile.totalEarnings > 0)
    ) {
      return true;
    }
    return false;
  });

  useEffect(() => {
    let mounted = true;
    const checkActive = async () => {
      const target = (
        activeAddress ||
        (typeof window !== "undefined" ? localStorage.getItem("equora_user_address") : "") ||
        ""
      ).trim().toLowerCase();
      if (!target) {
        if (mounted) setIsActiveMember(false);
        return;
      }
      if (
        storeProfile?.isRegistered ||
        (storeProfile?.userId && storeProfile.userId > 0) ||
        (storeProfile?.highestUnlockedSlot && storeProfile.highestUnlockedSlot >= 1) ||
        (storeProfile?.directReferralsCount && storeProfile.directReferralsCount > 0) ||
        (storeProfile?.totalEarnings && storeProfile.totalEarnings > 0) ||
        (typeof window !== "undefined" && localStorage.getItem(`equora_matrix_registered_${target}`) === "true")
      ) {
        if (mounted) setIsActiveMember(true);
        return;
      }
      try {
        const isReg = await isUserRegisteredInMatrix(target);
        if (mounted) setIsActiveMember(isReg);
      } catch {
        if (mounted) setIsActiveMember(false);
      }
    };
    checkActive();
    return () => {
      mounted = false;
    };
  }, [activeAddress, storeProfile]);

  // Modal visibility states
  const [isOpen, setIsOpen] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [rewardRevealed, setRewardRevealed] = useState(false);
  const [autoCloseSeconds, setAutoCloseSeconds] = useState(4);
  const [isMinimized, setIsMinimized] = useState(false);

  // Live on-chain Magic Box status for current connected operative
  const [magicBoxStatus, setMagicBoxStatus] = useState<UserMagicBoxStatus>({
    canClaim: false,
    hasClaimed: false,
    tier: 0,
    tierName: "NONE",
    prizeTrob: 0,
    prizeUsd: 0,
    round: 0,
  });

  const [isClaimingTx, setIsClaimingTx] = useState(false);
  const [claimTxHash, setClaimTxHash] = useState<string | null>(null);

  // Fetch live on-chain claimable state
  const refreshMagicBoxStatus = async () => {
    if (!activeAddress) return;
    try {
      const status = await getUserMagicBoxStatus(activeAddress);
      setMagicBoxStatus(status);
    } catch (err) {
      console.warn("Failed to fetch Magic Box status:", err);
    }
  };

  useEffect(() => {
    refreshMagicBoxStatus();
  }, [activeAddress]);

  // Universal 3-Month Smart Contract Countdown
  // Contract baseline: 1 Oct 2026 00:00:00 UTC (1790812800)
  // Interval: 90 days (7,776,000 seconds) targeting 11th settlement window
  const CYCLE_SECONDS = 90 * 24 * 60 * 60;
  const BASE_CYCLE_START = 1790812800;

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 });

  const autoCloseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoCloseIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate live contract timer
  useEffect(() => {
    const calculateTimer = () => {
      // If contract has canClaim active on-chain, timer is officially 0 (Ready to claim!)
      if (magicBoxStatus.canClaim) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 });
        return;
      }

      const now = Math.floor(Date.now() / 1000);
      const elapsed = Math.max(0, now - BASE_CYCLE_START);
      const currentCycleRemaining = Math.max(0, CYCLE_SECONDS - (elapsed % CYCLE_SECONDS));

      const days = Math.floor(currentCycleRemaining / (24 * 3600));
      const hours = Math.floor((currentCycleRemaining % (24 * 3600)) / 3600);
      const minutes = Math.floor((currentCycleRemaining % 3600) / 60);
      const seconds = currentCycleRemaining % 60;

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        totalSeconds: currentCycleRemaining,
      });
    };

    calculateTimer();
    const interval = setInterval(calculateTimer, 1000);
    return () => clearInterval(interval);
  }, [magicBoxStatus.canClaim]);

  const isTimeOver = timeLeft.totalSeconds <= 0 || magicBoxStatus.canClaim;

  // Route & Membership checks:
  const isLanding = pathname === "/" || !pathname;
  const isGate = pathname === "/gate";
  const isMemberRoute =
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/matrix") ||
    pathname?.startsWith("/earnings") ||
    pathname?.startsWith("/leaderboard") ||
    pathname?.startsWith("/profile") ||
    pathname?.startsWith("/settings") ||
    pathname?.startsWith("/transactions");

  // Show Protocol Pool 3 window once when operative arrives on /dashboard after slot activation
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pathname === "/dashboard" && isActiveMember && !magicBoxStatus.hasClaimed) {
      const justPurchased = sessionStorage.getItem("equora_just_purchased_slot") === "true";
      const dashboardSeen = sessionStorage.getItem("equora_blindbox_dashboard_seen") === "true";
      if (justPurchased || !dashboardSeen) {
        setIsOpen(true);
        sessionStorage.setItem("equora_blindbox_dashboard_seen", "true");
        sessionStorage.removeItem("equora_just_purchased_slot");
      }
    }
  }, [pathname, isActiveMember, magicBoxStatus.hasClaimed]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // When modal is open before time is over, auto-close automatically after 4 seconds
  useEffect(() => {
    if (isOpen && !isTimeOver) {
      setAutoCloseSeconds(4);
      autoCloseIntervalRef.current = setInterval(() => {
        setAutoCloseSeconds((prev) => (prev > 1 ? prev - 1 : 1));
      }, 1000);

      autoCloseTimerRef.current = setTimeout(() => {
        setIsOpen(false);
      }, 4000);
    } else {
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
      if (autoCloseIntervalRef.current) clearInterval(autoCloseIntervalRef.current);
    }

    return () => {
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
      if (autoCloseIntervalRef.current) clearInterval(autoCloseIntervalRef.current);
    };
  }, [isOpen, isTimeOver]);

  // Play video with audio when triggered
  useEffect(() => {
    if (isPlayingVideo && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch((err) => {
        console.warn("Fullscreen video autoplay error:", err);
      });
    }
  }, [isPlayingVideo]);

  const handleCloseModal = () => {
    if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
    if (autoCloseIntervalRef.current) clearInterval(autoCloseIntervalRef.current);
    setIsOpen(false);
  };

  // Handle tap on the giftbox icon or modal button
  const handleStartClaimFlow = () => {
    if (isTimeOver) {
      // Time is over: play full-screen video with sound without controls
      setIsPlayingVideo(true);
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  };

  // When video completes, it vanishes and shows the live smart contract distribution amount
  const handleVideoEnded = async () => {
    setIsPlayingVideo(false);
    await refreshMagicBoxStatus();
    setRewardRevealed(true);
  };

  // On-Chain Claim Transaction Execution
  const handleExecuteOnChainClaim = async () => {
    if (!activeAddress) {
      toast.error("Wallet Required", "Please connect your active matrix wallet to claim.");
      return;
    }
    setIsClaimingTx(true);
    try {
      const tx = await claimMagicBoxRewardOnChain(activeAddress);
      setClaimTxHash(tx);
      setMagicBoxStatus((prev) => ({
        ...prev,
        hasClaimed: true,
        canClaim: false,
      }));
      toast.success(
        "Magic Blind Box Claimed!",
        `Native TROB reward sent to your wallet on-chain. Tx: ${tx.slice(0, 10)}...`
      );
    } catch (err: any) {
      console.error("Claim error:", err);
      toast.error("Claim Error", err?.message || "Failed to claim reward on-chain.");
    } finally {
      setIsClaimingTx(false);
    }
  };

  if (!mounted) {
    return null;
  }

  if (isGate) {
    return null;
  }

  if (isLanding && !isTimeOver) {
    return null;
  }

  if (isMemberRoute && !isActiveMember) {
    return null;
  }

  // Strictly 1x lifetime gift rule: if user has already received gift, hide the floating trigger on regular routes
  if (magicBoxStatus.hasClaimed && !rewardRevealed) {
    return null;
  }

  return (
    <>
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* 1. PROFESSIONAL TRANSPARENT FLOATING GIFT BOX (Big 3D Interactive Artwork) */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end select-none group pointer-events-auto">
        {isMinimized ? (
          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/95 hover:bg-slate-950 backdrop-blur-md border border-amber-500/50 shadow-xl text-white text-[11px] font-bold cursor-pointer transition-all active:scale-95"
            title="Expand Magic Blind Box"
          >
            <div className="w-6 h-6 relative shrink-0 animate-bounce">
              <Image
                src="/blindbox/blind-box-3d.png"
                alt="Box"
                width={28}
                height={28}
                className="w-full h-full object-contain"
              />
            </div>
            {isTimeOver ? (
              <span className="font-mono text-emerald-400 font-extrabold text-[12px] animate-pulse">
                Claim Ready 🎁
              </span>
            ) : (
              <span className="font-mono text-amber-300 font-extrabold text-[12px]">
                {timeLeft.days}d {timeLeft.hours}h
              </span>
            )}
            <span className="text-amber-400 text-xs ml-0.5">▲</span>
          </button>
        ) : (
          <div className="relative flex flex-col items-center">
            {/* Quick minimize toggle button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(true);
              }}
              title="Minimize to Corner"
              className="absolute -top-1 -right-1 z-20 w-6 h-6 rounded-full bg-slate-900/90 hover:bg-slate-950 text-slate-300 hover:text-white text-[11px] flex items-center justify-center border border-slate-700/80 shadow-md cursor-pointer transition-transform hover:scale-110 active:scale-95"
            >
              ✕
            </button>

            <button
              type="button"
              onClick={handleStartClaimFlow}
              title={isTimeOver ? "Tap to Claim Magic Blind Box" : "Magic Blind Box Universal Countdown — Tap to view Protocol Pool 3"}
              aria-label="Magic Blind Box"
              className="relative flex flex-col items-center focus:outline-none transition-transform duration-300 hover:scale-105 active:scale-95 cursor-pointer bg-transparent border-0 p-0 m-0 group/box"
            >
              {/* Glowing golden & indigo background aura */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400/30 via-indigo-500/25 to-blue-500/30 blur-2xl group-hover/box:blur-3xl transition-all duration-300 pointer-events-none" />

              {/* Big, High-Definition 3D Gift Box Image */}
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 drop-shadow-[0_16px_32px_rgba(99,102,241,0.5)] animate-[bounce_3.5s_ease-in-out_infinite]">
                <Image
                  src="/blindbox/blind-box-3d.png"
                  alt="Magic Blind Box"
                  width={160}
                  height={160}
                  priority
                  className="w-full h-full object-contain pointer-events-none filter drop-shadow(0 6px 14px rgba(0,0,0,0.25))"
                />
              </div>

              {/* High-Contrast Timer Pill or Tap to Claim Pill */}
              <div className="-mt-2 sm:-mt-1 relative z-10">
                {isTimeOver ? (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 text-[11.5px] font-black uppercase tracking-wider shadow-xl shadow-orange-500/50 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
                    Tap to Claim 🎁
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-950/95 backdrop-blur-md text-white text-[11px] sm:text-[12.5px] font-mono font-bold shadow-xl border border-amber-500/40 group-hover/box:border-amber-400 transition-colors">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#f59e0b]" />
                    <span className="text-amber-300 font-extrabold tracking-tight">
                      {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
                    </span>
                  </span>
                )}
              </div>
            </button>
          </div>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* 2. THEME-MATCHING INFORMATION MODAL (Connected to Smart Contract Timer)  */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {isOpen && !isPlayingVideo && !rewardRevealed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-[420px] bg-white rounded-3xl border border-[#e2e8f0] shadow-2xl p-6 sm:p-7 flex flex-col items-center text-center overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Close 'X' button */}
            <button
              type="button"
              onClick={handleCloseModal}
              title="Close"
              aria-label="Close"
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer z-10"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            {/* Protocol Tag */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10.5px] font-bold uppercase tracking-wider mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
              Protocol Pool 3 • 10% Magic Blind Box
            </div>

            {/* Big Transparent 3D Gift Box at Start */}
            <div className="relative my-2 w-[180px] h-[180px] flex items-center justify-center">
              <Image
                src="/blindbox/blind-box-3d.png"
                alt="Magic Blind Box"
                width={180}
                height={180}
                priority
                className="object-contain drop-shadow-[0_16px_32px_rgba(99,102,241,0.35)] hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Smart Contract Countdown Timer / 0 Hours Status */}
            <div className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-3.5 my-3">
              <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between px-1">
                <span>Contract Settlement Timer</span>
                {isTimeOver ? (
                  <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Drop Active!
                  </span>
                ) : (
                  <span className="text-amber-600 font-extrabold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                    Quarterly Window
                  </span>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-white border border-[#e2e8f0] rounded-xl py-2 shadow-xs">
                  <span className="text-[20px] font-extrabold text-[#0f172a] font-mono leading-none block">
                    {String(timeLeft.days).padStart(2, "0")}
                  </span>
                  <span className="text-[9.5px] uppercase font-bold text-slate-400 mt-0.5 block">Days</span>
                </div>
                <div className="bg-white border border-[#e2e8f0] rounded-xl py-2 shadow-xs">
                  <span className="text-[20px] font-extrabold text-[#0f172a] font-mono leading-none block">
                    {String(timeLeft.hours).padStart(2, "0")}
                  </span>
                  <span className="text-[9.5px] uppercase font-bold text-slate-400 mt-0.5 block">Hours</span>
                </div>
                <div className="bg-white border border-[#e2e8f0] rounded-xl py-2 shadow-xs">
                  <span className="text-[20px] font-extrabold text-[#0f172a] font-mono leading-none block">
                    {String(timeLeft.minutes).padStart(2, "0")}
                  </span>
                  <span className="text-[9.5px] uppercase font-bold text-slate-400 mt-0.5 block">Mins</span>
                </div>
                <div className="bg-white border border-[#e2e8f0] rounded-xl py-2 shadow-xs">
                  <span className="text-[20px] font-extrabold text-[#0f172a] font-mono leading-none block">
                    {String(timeLeft.seconds).padStart(2, "0")}
                  </span>
                  <span className="text-[9.5px] uppercase font-bold text-slate-400 mt-0.5 block">Secs</span>
                </div>
              </div>
            </div>

            {/* Dynamic Status Notice & Claim Trigger */}
            {isTimeOver ? (
              <div className="w-full flex flex-col gap-2.5 mb-2">
                <div className="w-full bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 text-center">
                  <p className="text-[13px] font-extrabold text-emerald-950 leading-snug">
                    🎉 Timer Expired! Your Magic Blind Box is Ready to Open.
                  </p>
                  <p className="text-[11px] text-emerald-700 mt-1">
                    Strict 1x lifetime gift for new matrix operatives. Tap below to watch the reveal animation!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleStartClaimFlow}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-[14px] uppercase tracking-wider shadow-lg shadow-orange-500/30 transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Tap to Claim Magic Box</span>
                  <span className="text-lg">➔</span>
                </button>
              </div>
            ) : (
              <>
                <div className="w-full bg-indigo-50/70 border border-indigo-100 rounded-xl p-3 text-center mb-3">
                  <p className="text-[12.5px] font-semibold text-indigo-950 leading-snug">
                    You will receive your Magic Blind Box gift after{" "}
                    <span className="font-extrabold text-indigo-600">
                      {timeLeft.days} days {timeLeft.hours} hours {timeLeft.minutes} minutes
                    </span>
                    .
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Random distribution from the 10% Magic Blind Box protocol pool to active matrix operatives on-chain.
                  </p>
                </div>

                {/* Auto-closing countdown indicator when timer active */}
                <div className="w-full flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                  <span>Auto-closing in {autoCloseSeconds}s...</span>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="font-medium text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Close Now
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* 3. FULL-SCREEN VIDEO (NO CONTROLLERS, PLAYS WITH SOUND, THEN VANISHES)   */}
      {/* Responsive on all devices (mobile, tablet, desktop)                     */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {isPlayingVideo && (
        <div className="fixed inset-0 w-screen h-screen z-[100] bg-black flex items-center justify-center overflow-hidden">
          {/* Entire video plays with audio, without any video controllers or pause buttons */}
          <video
            ref={videoRef}
            src="/blindbox/video.mp4"
            autoPlay
            playsInline
            controls={false}
            onEnded={handleVideoEnded}
            className="w-full h-full object-cover pointer-events-none select-none"
          />
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* 4. POST-VIDEO RANDOM DISTRIBUTION REVEAL (Clean theme card)              */}
      {/* Connected to live on-chain data & instant claiming                       */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {rewardRevealed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in zoom-in-95 duration-200">
          <div className="relative w-full max-w-[440px] bg-white rounded-3xl border border-[#e2e8f0] shadow-2xl p-6 sm:p-7 flex flex-col items-center text-center overflow-hidden">
            <button
              type="button"
              onClick={() => setRewardRevealed(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer z-10"
            >
              ✕
            </button>

            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-3 shadow-xs">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10.5px] font-bold uppercase tracking-wider mb-2">
              Smart Contract 4 Protocols Settlement
            </div>

            <h3 className="text-[20px] font-extrabold text-[#0f172a] leading-tight">
              Magic Blind Box Distribution
            </h3>

            {/* Revealed Prize Details Card */}
            <div className="w-full bg-gradient-to-br from-amber-50 via-orange-50 to-white border border-amber-200/80 rounded-2xl p-4 my-4 text-center shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Your Distributed Protocol Reward:
              </span>
              <span className="text-[34px] sm:text-[38px] font-black text-amber-600 block tracking-tight mt-1 font-mono">
                ${magicBoxStatus.prizeUsd > 0 ? magicBoxStatus.prizeUsd.toFixed(2) : "0.50"}{" "}
                <span className="text-[20px] font-sans font-bold text-slate-800">USD</span>
              </span>
              <span className="text-[14px] font-extrabold text-slate-700 mt-0.5 block font-mono">
                ~{magicBoxStatus.prizeTrob > 0 ? magicBoxStatus.prizeTrob.toFixed(2) : "8.93"} TROB
              </span>
              <div className="mt-3 pt-2.5 border-t border-amber-200/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">Assigned Tier:</span>
                <span className="font-extrabold text-amber-800 font-mono">
                  {magicBoxStatus.tierName || "Tier 1 (Common 85%)"}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">Rule Enforcement:</span>
                <span className="font-bold text-emerald-700">Strict 1x Lifetime Gift ✓</span>
              </div>
            </div>

            {/* Action Button: Claim on Blockchain or Confirmed Badge */}
            {claimTxHash || magicBoxStatus.hasClaimed ? (
              <div className="w-full flex flex-col gap-2">
                <div className="w-full p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[12.5px] font-bold flex flex-col items-center gap-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-600 text-base">✓</span>
                    <span>Reward Confirmed on Blockchain!</span>
                  </div>
                  {claimTxHash && (
                    <span className="text-[10px] text-slate-500 font-mono truncate max-w-full">
                      Tx: {claimTxHash.slice(0, 16)}...{claimTxHash.slice(-8)}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setRewardRevealed(false)}
                  className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-950 text-white font-bold text-[13px] shadow-sm transition-colors cursor-pointer"
                >
                  Return to Dashboard
                </button>
              </div>
            ) : (
              <div className="w-full flex flex-col gap-2">
                <button
                  type="button"
                  disabled={isClaimingTx}
                  onClick={handleExecuteOnChainClaim}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-[13.5px] uppercase tracking-wider shadow-md transition-all active:scale-95 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isClaimingTx ? (
                    <>
                      <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Broadcasting Claim on Blockchain...</span>
                    </>
                  ) : (
                    <span>Claim ${magicBoxStatus.prizeUsd > 0 ? magicBoxStatus.prizeUsd.toFixed(2) : "0.50"} USD Directly to Wallet</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setRewardRevealed(false)}
                  className="w-full py-2.5 rounded-xl text-slate-500 hover:text-slate-800 font-bold text-[12px] transition-colors cursor-pointer"
                >
                  Claim Later
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
