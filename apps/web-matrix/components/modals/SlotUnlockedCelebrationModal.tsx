"use client";

import React from "react";
import { Sparkles, X, ArrowRight, Zap, CheckCircle2, Lock } from "lucide-react";

export interface SlotUnlockedCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  unlockedSlot: number;
  completedSlot: number;
  onNavigateToSlot?: (slotNumber: number) => void;
}

export function SlotUnlockedCelebrationModal({
  isOpen,
  onClose,
  unlockedSlot,
  completedSlot,
  onNavigateToSlot,
}: SlotUnlockedCelebrationModalProps) {
  if (!isOpen) return null;

  const handleNavigate = () => {
    onClose();
    if (onNavigateToSlot) {
      onNavigateToSlot(unlockedSlot);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-blue-200 overflow-hidden text-center p-6 sm:p-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Glow Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 mx-auto flex items-center justify-center shadow-lg shadow-blue-500/30 text-white mb-4 animate-bounce">
          <Zap className="w-8 h-8 fill-current" />
        </div>

        {/* Top Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-black uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Autonomous $0 Auto-Escalation</span>
        </div>

        {/* Headline */}
        <h2 className="text-[21px] sm:text-[23px] font-black text-slate-900 tracking-tight">
          Congratulations!
        </h2>
        <p className="text-[14px] font-bold text-blue-600 mt-1">
          Slot {unlockedSlot} is Now Active for Team Placements!
        </p>
        <p className="text-[12px] text-slate-500 mt-2 px-2 leading-relaxed">
          Positions 4 & 5 on your Slot {completedSlot} board were successfully placed by active operatives, automatically funding and activating Slot {unlockedSlot} at <strong>$0 out-of-pocket cost</strong>.
        </p>

        {/* Info Box */}
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-left">
          <div className="flex items-center justify-between text-[11.5px] font-bold text-slate-700 mb-1.5">
            <span>Entry Valuation:</span>
            <span className="font-mono text-emerald-600 font-extrabold">$30.00 USD (Covered 100%)</span>
          </div>
          <div className="flex items-center justify-between text-[11.5px] font-bold text-slate-700 mb-1.5">
            <span>Yield Capacity:</span>
            <span className="font-mono text-slate-900">14 Seats Organic Cascade</span>
          </div>
          <div className="flex items-center justify-between text-[11.5px] font-bold text-slate-700">
            <span>Cycle State:</span>
            <span className="font-mono text-blue-600 font-extrabold">Cycle #1 Active • Ready to Earn</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-[13px] hover:bg-slate-50 transition-colors"
          >
            Stay on Slot {completedSlot}
          </button>
          <button
            onClick={handleNavigate}
            className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[13px] shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5"
          >
            <span>View Slot {unlockedSlot}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

