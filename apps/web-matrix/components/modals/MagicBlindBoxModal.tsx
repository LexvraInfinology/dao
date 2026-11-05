"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, X, CheckCircle2, Loader2 } from "lucide-react";
import { claimMagicBoxRewardOnChain, getUserMagicBoxStatus, UserMagicBoxStatus } from "@/lib/contracts";
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
  claimableAmountTrob,
  claimableAmountUsd,
  onRewardClaimed,
}: MagicBlindBoxModalProps) {
  const [stage, setStage] = useState<"ready" | "playing" | "revealed">("ready");
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimedTx, setClaimedTx] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [liveStatus, setLiveStatus] = useState<UserMagicBoxStatus | null>(null);

  useEffect(() => {
    if (userAddress && isOpen) {
      getUserMagicBoxStatus(userAddress).then((res) => {
        setLiveStatus(res);
        if (res.hasClaimed) {
          setStage("revealed");
        }
      });
    }
  }, [userAddress, isOpen]);

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
      toast.success("Magic Box Claimed!", `Reward sent to your wallet. Tx: ${tx.slice(0, 10)}...`);
      if (onRewardClaimed) onRewardClaimed();
    } catch (err: any) {
      toast.error("Claim Notice", err.message || "Failed to claim on-chain reward.");
    } finally {
      setIsClaiming(false);
    }
  };

  const finalUsd = liveStatus?.prizeUsd || claimableAmountUsd || 0.50;
  const finalTrob = liveStatus?.prizeTrob || claimableAmountTrob || 8.93;

  // ── Stage 2: Full Screen Video Playback ────────────────────────────────────
  if (stage === "playing") {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          src="/blindbox/video.mp4"
          playsInline
          autoPlay
          controls={false}
          onEnded={handleVideoEnded}
          className="w-full h-full object-cover pointer-events-none select-none"
        />
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
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
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
              ${finalUsd.toFixed(2)}{" "}
              <span className="text-[20px] sm:text-[24px] text-amber-600 font-sans">USD</span>
            </div>
            <div className="text-[14px] sm:text-[15px] font-extrabold text-slate-600 mt-0.5 font-mono">
              ~{finalTrob.toFixed(2)} TROB
            </div>
          </div>

          {/* Prize Breakdown Card */}
          <div className="mt-5 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-left">
            <div className="flex items-center justify-between text-[11.5px] font-bold text-slate-700 mb-1.5">
              <span>Prize Source:</span>
              <span className="font-extrabold text-amber-700">10% Platform Blind Box Pool</span>
            </div>
            <div className="flex items-center justify-between text-[11.5px] font-bold text-slate-700 mb-1.5">
              <span>Distribution Tier:</span>
              <span className="text-slate-900 font-bold">{liveStatus?.tierName || "Tier 1 (Common 85%)"}</span>
            </div>
            <div className="flex items-center justify-between text-[11.5px] font-bold text-slate-700">
              <span>Rule Enforcement:</span>
              <span className="font-mono text-emerald-700 font-extrabold">1 Gift Per Wallet Lifetime ✓</span>
            </div>
          </div>

          {/* Action Button */}
          {claimedTx || liveStatus?.hasClaimed ? (
            <div className="mt-6 flex flex-col gap-2">
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[13px] font-bold flex flex-col items-center gap-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Reward Claim Confirmed On-Chain!</span>
                </div>
                {claimedTx && (
                  <span className="text-[10px] text-slate-500 font-mono truncate max-w-full">
                    Tx: {claimedTx}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-[13px] hover:bg-slate-950 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="mt-6">
              <button
                onClick={handleClaim}
                disabled={isClaiming}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-[14px] uppercase tracking-wider shadow-lg shadow-amber-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isClaiming ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Claiming on Blockchain...</span>
                  </>
                ) : (
                  <span>Claim ${finalUsd.toFixed(2)} USD to Wallet</span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Stage 1: Ready to Open Modal ───────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-center p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10.5px] font-bold uppercase tracking-wider mb-3">
          Protocol Pool 3 • 10% Magic Blind Box
        </div>

        <h3 className="text-[22px] font-black text-slate-900 tracking-tight">
          Magic Blind Box is Ready!
        </h3>
        <p className="text-[12.5px] text-slate-500 mt-1 mb-4 leading-relaxed">
          Open your box now to play the full-screen cinematic video and reveal your on-chain settlement allocation.
        </p>

        {/* 3D Box Artwork */}
        <div className="relative w-44 h-44 mx-auto my-2 flex items-center justify-center drop-shadow-[0_20px_40px_rgba(99,102,241,0.35)] animate-[bounce_3.5s_ease-in-out_infinite]">
          <img
            src="/blindbox/blind-box-3d.png"
            alt="Magic Box"
            className="w-full h-full object-contain"
          />
        </div>

        <button
          onClick={handleStartPlay}
          className="w-full mt-4 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-[14px] uppercase tracking-wider shadow-lg shadow-amber-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Open Magic Blind Box</span>
          <span className="text-lg">➔</span>
        </button>
      </div>
    </div>
  );
}
