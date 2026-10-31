"use client";

import React, { useState, useEffect } from "react";
import { toast } from "@/lib/toast";
import { useUserStore } from "@/lib/stores";
import {
  CONTRACT_ADDRESSES,
  EXPLORER_URL,
  NETWORK_NAME,
  getOnChainTokenBalance,
  getOnChainSlotCostSun,
  joinSlotOnChain,
} from "@/lib/contracts";

export interface SlotPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  slotNumber: number;
  cost: number;
  userAddress?: string;
  onConfirm: (slotNumber: number, txHash?: string) => Promise<void>;
}

export function SlotPurchaseModal({
  isOpen,
  onClose,
  slotNumber,
  cost,
  userAddress: propAddress,
  onConfirm,
}: SlotPurchaseModalProps) {
  const storeAddress = useUserStore((s) => s.address);
  const userAddress = propAddress || storeAddress || "";
  const [mode, setMode] = useState<"onchain" | "sandbox">("onchain");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"ready_to_join" | "joining" | "success">("ready_to_join");
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const [liveTrobCoins, setLiveTrobCoins] = useState<string>("807.54");
  const [livePriceUsd, setLivePriceUsd] = useState<number>(0.03715);

  const costUsd = "30.00";
  const slotStr = String(slotNumber).padStart(2, "0");

  // Fetch live on-chain TROB balance and live market rates
  useEffect(() => {
    if (!isOpen || !userAddress) return;
    let cancelled = false;

    async function loadOnChainState() {
      try {
        const bal = await getOnChainTokenBalance(userAddress);
        if (!cancelled) {
          setTokenBalance(bal);
          setStep("ready_to_join");
        }
      } catch (err) {
        console.warn("[Modal] Failed to load on-chain state:", err);
      }

      try {
        const pRes = await fetch("/api/price/trob", { cache: "no-store" }).catch(() => fetch("/api/price", { cache: "no-store" }));
        if (pRes && pRes.ok) {
          const pJson = await pRes.json();
          const p = Number(pJson?.data?.priceUsd ?? pJson?.priceUsd ?? pJson?.price);
          if (p > 0 && !cancelled) setLivePriceUsd(p);
        }
        const callValueSun = await getOnChainSlotCostSun(slotNumber);
        if (!cancelled && callValueSun > 0) {
          setLiveTrobCoins((callValueSun / 1_000_000).toFixed(2));
        }
      } catch {}
    }

    loadOnChainState();
    return () => {
      cancelled = true;
    };
  }, [isOpen, userAddress, slotNumber]);

  if (!isOpen) return null;

  // Handle On-Chain Join (Native TROB)
  const handleOnChainJoin = async () => {
    setLoading(true);
    setStep("joining");
    try {
      const callValueSun = await getOnChainSlotCostSun(slotNumber);
      const trobCoins = (callValueSun / 1_000_000).toFixed(2);
      toast.info("Broadcasting Transaction", `Confirm $30.00 USD (${trobCoins} TROB) in wallet...`);
      const txHash = await joinSlotOnChain(slotNumber, undefined, userAddress, callValueSun);
      setLastTxHash(txHash);
      toast.success("Slot Joined On-Chain!", `Tx: ${txHash.slice(0, 10)}...`);

      // Synchronize backend database ledger with real txHash
      await onConfirm(slotNumber, txHash);
      setStep("success");
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      toast.error("Transaction Failed", err?.message || "Failed to join slot on-chain.");
      setStep("ready_to_join");
    } finally {
      setLoading(false);
    }
  };

  // Handle Sandbox Simulation
  const handleSandboxConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(slotNumber);
      toast.success("Slot Unlocked (Sandbox)", `Slot #${slotStr} active in your matrix.`);
      onClose();
    } catch (err: any) {
      toast.error("Unlock Failed", err?.message || "Failed to unlock slot.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#e2e8f0] rounded-2xl w-full max-w-[460px] p-5 sm:p-6 shadow-2xl relative">
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
              <span className="text-[11px] text-[#2563eb] font-semibold flex items-center gap-1">
                <span>Equora Matrix Tier {slotNumber}</span>
                <span>•</span>
                <span className="text-[#16a34a]">{NETWORK_NAME}</span>
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

        {/* Mode Selector Tabs */}
        <div className="mt-3.5 flex p-1 bg-[#f1f5f9] rounded-xl text-[12px] font-bold">
          <button
            type="button"
            onClick={() => setMode("onchain")}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
              mode === "onchain"
                ? "bg-white text-[#2563eb] shadow-xs"
                : "text-[#64748b] hover:text-[#0f172a]"
            }`}
          >
            On-Chain ({NETWORK_NAME.replace("TrobChain ", "")})
          </button>
          <button
            type="button"
            onClick={() => setMode("sandbox")}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
              mode === "sandbox"
                ? "bg-white text-[#2563eb] shadow-xs"
                : "text-[#64748b] hover:text-[#0f172a]"
            }`}
          >
            Simulated Sandbox
          </button>
        </div>

        {/* Pricing Summary */}
        <div className="mt-3.5 p-3.5 rounded-xl bg-[#f8fafc] border border-[#f1f5f9]">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-[#64748b]">Activation Cost</span>
            <div className="text-right">
              <span className="text-[18px] font-black text-[#0f172a] block leading-none">
                ${cost}.00 USD
              </span>
              <span className="text-[11px] text-[#16a34a] font-medium block mt-0.5">
                ~{liveTrobCoins} TROB (Live Market: ${livePriceUsd.toFixed(5)}/TROB)
              </span>
            </div>
          </div>
        </div>

        {/* Mode-Specific Content */}
        {mode === "onchain" ? (
          <div className="mt-3.5 space-y-3">
            {slotNumber === 1 ? (
              <>
                {/* Live On-Chain Parameters */}
                <div className="p-3 bg-[#eff6ff]/60 border border-[#bfdbfe] rounded-xl text-[11px] space-y-1.5">
                  <div className="flex items-center justify-between text-[#1e40af]">
                    <span className="font-semibold">Contract Address:</span>
                    <a
                      href={`${EXPLORER_URL}/contract/${CONTRACT_ADDRESSES.matrix}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono hover:underline font-bold"
                    >
                      {CONTRACT_ADDRESSES.matrix.slice(0, 6)}...{CONTRACT_ADDRESSES.matrix.slice(-4)} ↗
                    </a>
                  </div>
                  <div className="flex items-center justify-between text-[#1e40af]">
                    <span className="font-semibold">Token Balance:</span>
                    <span className="font-bold">
                      {tokenBalance !== null ? `$${tokenBalance.toFixed(2)} USD` : "Checking..."}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#1e40af]">
                    <span className="font-semibold">Payment Currency:</span>
                    <span className="font-bold">Native TROB Coin</span>
                  </div>
                </div>

                {/* Last Transaction Link */}
                {lastTxHash && (
                  <div className="p-2.5 rounded-xl bg-[#ecfdf5] border border-[#bbf7d0] text-[11px] text-[#16a34a] flex items-center justify-between">
                    <span>Recent Tx:</span>
                    <a
                      href={`${EXPLORER_URL}/tx/${lastTxHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono font-bold hover:underline"
                    >
                      {lastTxHash.slice(0, 10)}...{lastTxHash.slice(-6)} ↗
                    </a>
                  </div>
                )}
              </>
            ) : (
              <div className="p-3.5 rounded-xl bg-[#fefce8] border border-[#fef08a] text-[11.5px] text-[#854d0e] space-y-1.5">
                <span className="font-extrabold flex items-center gap-1.5 text-[12px] text-[#a16207]">
                  <span>ℹ️ On-Chain Auto-Upgrade Protocol</span>
                </span>
                <p className="leading-relaxed">
                  Per the verified EquoraMatrix contract, Tier #01 is the direct entry point. Higher tiers (Slots 2–12) auto-unlock on-chain upon completing 14-node board cycles and auto-upgrade reserves.
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setMode("sandbox")}
                    className="text-[#2563eb] font-bold hover:underline cursor-pointer"
                  >
                    Switch to Instant Sandbox to test Tier #{slotStr} →
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-3.5 space-y-2">
            <div className="p-3 rounded-xl bg-[#ecfdf5] border border-[#bbf7d0] text-[11.5px] text-[#16a34a]">
              <span className="font-bold block mb-0.5">Instant Sandbox Mode</span>
              <span>Updates local matrix ledger, unlocks slot visuals, and streams demo spillover immediately.</span>
            </div>
          </div>
        )}

        {/* Matrix Benefits */}
        <div className="mt-3.5 space-y-1.5 text-[11.5px] text-[#475569]">
          <div className="flex items-start gap-2">
            <span className="text-[#16a34a] font-bold">✓</span>
            <span>Unlocks 14-Node 2×3 matrix placement for Tier #{slotStr}.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-[#16a34a] font-bold">✓</span>
            <span>Eligible for automatic spillover rewards from upline & downline.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="py-2.5 px-4 rounded-xl border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc] text-[12.5px] font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>

          {mode === "onchain" ? (
            slotNumber === 1 ? (
              <button
                type="button"
                onClick={handleOnChainJoin}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[12.5px] font-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {loading ? "Broadcasting..." : `Join Slot #01 On-Chain ($30 USD)`}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setMode("sandbox")}
                className="flex-1 py-2.5 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-white text-[12.5px] font-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                Switch to Sandbox to Test
              </button>
            )
          ) : (
            <button
              type="button"
              onClick={handleSandboxConfirm}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[12.5px] font-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {loading ? "Activating..." : "Confirm Sandbox Unlock"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
