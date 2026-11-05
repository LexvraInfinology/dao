"use client";

import React, { useState, useRef } from "react";
import { Sparkles, X, Gift, CheckCircle2, ArrowRight, Loader2, Volume2, VolumeX, ShieldCheck } from "lucide-react";
import { claimMagicBoxRewardOnChain } from "@/lib/contracts";
import { toast } from "@/lib/toast";

export interface MagicBlindBoxModalProps {
  isOpen: boolean;
  onClose: () => void;
  userAddress: string;
  claimableAmountTrob?: number;
  claimableAmountUsd?: number;
  onRewardClaimed?: () => void;
}

export function MagicBlindBoxModal({
  isOpen,
  onClose,
  userAddress,
  claimableAmountTrob = 88.25,
  claimableAmountUsd = 2.50,
  onRewardClaimed,
}: MagicBlindBoxModalProps) {
  const [stage, setStage] = useState<"ready" | "playing" | "revealed">("ready");
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimedTx, setClaimedTx] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  if (!isOpen) return null;

  const handleStartPlay = () => {
    setStage("playing");
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play().catch((err) => {
          console.warn("Auto-play prevented, showing reveal:", err);
          setStage("revealed");
        });
      }
    }, 100);
  };

  const handleVideoEnded = () => {
    setStage("revealed");
  };

  const handleClaim = async () => {
    setIsClaiming(true);
    try {
      const tx = await claimMagicBoxRewardOnChain(userAddress);
      setClaimedTx(tx);
      toast.success("Magic Box Claimed!", `Reward sent to your wallet. Tx: ${tx.slice(0, 8)}...`);
      if (onRewardClaimed) onRewardClaimed();
    } catch (err: any) {
      toast.error("Claim Notice", err.message || "Failed to claim on-chain reward.");
    } finally {
      setIsClaiming(false);
    }
  };

  // ── Stage 2: Full Screen Video Playback ────────────────────────────────────
  if (stage === "playing") {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
        <video
          ref={videoRef}
          src="/blindbox/video.mp4"
          playsInline
          autoPlay
          onEnded={handleVideoEnded}
          className="w-full h-full object-cover"
        />
        {/* Skip button for seamless user control */}
        <button
          onClick={() => setStage("revealed")}
          className="absolute top-6 right-6 z-[110] px-4 py-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-[12px] font-bold border border-white/20 transition-all"
        >
          Skip to Reveal ➔
        </button>
      </div>
    );
  }

  // ── Stage 3: Revealed Reward Modal ─────────────────────────────────────────
  if (stage === "revealed") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
        <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-amber-200 overflow-hidden text-center p-6 sm:p-8">
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Top Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-black uppercase tracking-wider mb-4 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Quarterly Shared Lottery Winner</span>
          </div>

          {/* Big Amount */}
          <div className="my-3">
            <span className="text-[12px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
              You Have Received
            </span>
            <div className="text-[36px] sm:text-[44px] font-black text-slate-900 tracking-tight font-mono">
              ${claimableAmountUsd.toFixed(2)}{" "}
              <span className="text-[20px] sm:text-[24px] text-amber-600 font-sans">USD</span>
            </div>
            <div className="text-[14px] sm:text-[15px] font-extrabold text-slate-600 mt-0.5 font-mono">
              ~{claimableAmountTrob.toFixed(2)} TROB
            </div>
          </div>

          {/* Prize Breakdown Card */}
          <div className="mt-5 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-left">
            <div className="flex items-center justify-between text-[11.5px] font-bold text-slate-700 mb-1.5">
              <span>Prize Source:</span>
              <span className="font-extrabold text-amber-700">10% Platform Blind Box Pool</span>
            </div>
            <div className="flex items-center justify-between text-[11.5px] font-bold text-slate-700 mb-1.5">
              <span>Distribution Mechanism:</span>
              <span className="text-slate-900">On-Chain Weighted Entropy</span>
            </div>
            <div className="flex items-center justify-between text-[11.5px] font-bold text-slate-700">
              <span>Rule Enforcement:</span>
              <span className="font-mono text-emerald-700 font-extrabold">1 Gift Per Wallet Lifetime ✓</span>
            </div>
          </div>

          {/* Action Button */}
          {claimedTx ? (
            <div className="mt-6 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[13px] font-bold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Reward Claim Confirmed On-Chain!</span>
            </div>
          ) : (
            <button
              onClick={handleClaim}
              disabled={isClaiming}
              className="w-full mt-6 py-3.5 px-4 rounded-xl text-white font-extrabold text-[14px] shadow-lg shadow-amber-500/25 transition-all transform active:scale-95 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:opacity-95 disabled:opacity-50"
            >
              {isClaiming ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Confirming On-Chain Claim...</span>
                </>
              ) : (
                <>
                  <Gift className="w-4 h-4" />
                  <span>Claim ${claimableAmountUsd.toFixed(2)} USD to Wallet</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Stage 1: Tap to Claim Intro ───────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-amber-200 overflow-hidden text-center p-6 sm:p-8">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Gift Icon with pulsating glow */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 mx-auto flex items-center justify-center shadow-lg shadow-amber-500/30 text-white mb-4 animate-bounce">
          <Gift className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-black uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Quarterly Settlement Window Open</span>
        </div>

        <h2 className="text-[21px] sm:text-[23px] font-black text-slate-900 tracking-tight">
          Magic Blind Box is Ready!
        </h2>
        <p className="text-[12.5px] text-slate-500 mt-2 px-2 leading-relaxed">
          The 90-day community pool cycle has reached its conclusion. Tap below to initiate the authentic lottery draw and reveal your allocation!
        </p>

        <button
          onClick={handleStartPlay}
          className="w-full mt-6 py-4 px-4 rounded-2xl text-white font-black text-[15px] shadow-xl shadow-amber-500/30 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600"
        >
          <Sparkles className="w-5 h-5" />
          <span>Tap to Claim Magic Blind Box</span>
        </button>
      </div>
    </div>
  );
}

