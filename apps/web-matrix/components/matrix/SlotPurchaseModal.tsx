"use client";

import React, { useState } from "react";
import { toast } from "@/lib/toast";

export interface SlotPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  slotNumber: number;
  cost: number;
  onConfirm: (slotNumber: number) => Promise<void>;
}

export function SlotPurchaseModal({
  isOpen,
  onClose,
  slotNumber,
  cost,
  onConfirm,
}: SlotPurchaseModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const costUsd = (cost * 0.15).toFixed(2);
  const slotStr = String(slotNumber).padStart(2, "0");

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(slotNumber);
      toast.success("Slot Unlocked!", `Slot #${slotStr} is now active in your matrix.`);
      onClose();
    } catch (err: any) {
      toast.error("Unlock Failed", err?.message || "Failed to unlock slot.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#e8ecf1] rounded-2xl w-full max-w-[440px] p-5 sm:p-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#f1f5f9]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#2563eb] text-white font-black text-[18px] flex items-center justify-center shadow-md shadow-blue-500/20">
              {slotNumber}
            </div>
            <div>
              <h3 className="text-[17px] font-extrabold text-[#0f172a] leading-tight">
                Unlock Slot #{slotStr}
              </h3>
              <span className="text-[11px] text-[#2563eb] font-semibold">
                Equora Matrix Tier {slotNumber}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-8 h-8 rounded-lg bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#64748b] flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Pricing Summary */}
        <div className="mt-4 p-4 rounded-xl bg-[#f8fafc] border border-[#f1f5f9]">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-[#64748b]">Activation Cost</span>
            <div className="text-right">
              <span className="text-[18px] font-black text-[#0f172a] block leading-none">
                {cost} TROB
              </span>
              <span className="text-[11px] text-[#94a3b8] font-medium block mt-0.5">
                ≈ ${costUsd} USD
              </span>
            </div>
          </div>
        </div>

        {/* Matrix Benefits */}
        <div className="mt-4 space-y-2">
          <div className="flex items-start gap-2.5 text-[12px] text-[#475569]">
            <span className="text-[#16a34a] font-bold text-[14px]">✓</span>
            <span>Unlocks 14-Node 2×3 matrix placement for Tier #{slotStr}.</span>
          </div>
          <div className="flex items-start gap-2.5 text-[12px] text-[#475569]">
            <span className="text-[#16a34a] font-bold text-[14px]">✓</span>
            <span>Eligible for automatic spillover rewards from upline & downline.</span>
          </div>
          <div className="flex items-start gap-2.5 text-[12px] text-[#475569]">
            <span className="text-[#16a34a] font-bold text-[14px]">✓</span>
            <span>Enables continuous cycle recycling and auto-upgrade progression.</span>
          </div>
        </div>

        {/* Test Simulation Notice */}
        <div className="mt-4 p-2.5 rounded-xl bg-[#ecfdf5] border border-[#bbf7d0] flex items-center gap-2 text-[11px] text-[#16a34a]">
          <span className="text-[14px]">🧪</span>
          <span className="font-semibold">
            Dummy Test Simulation Mode • Zero real funds or gas required.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc] text-[13px] font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[13px] font-bold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {loading ? "Activating..." : "Confirm Unlock"}
          </button>
        </div>
      </div>
    </div>
  );
}
