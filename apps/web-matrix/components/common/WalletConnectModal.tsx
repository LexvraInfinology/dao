"use client";

import React, { useState } from "react";
import {
  hasInjectedProvider,
  connectInjectedWallet,
  DUMMY_TEST_ACCOUNTS,
} from "@/lib/web3Wallet";
import { toast } from "@/lib/toast";

export interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAddress?: string;
  onSelectAddress: (address: string) => void;
}

export function WalletConnectModal({
  isOpen,
  onClose,
  currentAddress,
  onSelectAddress,
}: WalletConnectModalProps) {
  const [connecting, setConnecting] = useState(false);
  const [customAddress, setCustomAddress] = useState("");
  const hasInjected = hasInjectedProvider();

  if (!isOpen) return null;

  const handleInjectedConnect = async () => {
    setConnecting(true);
    try {
      const address = await connectInjectedWallet();
      onSelectAddress(address);
      toast.success("Wallet Connected", `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`);
      onClose();
    } catch (err: any) {
      toast.error("Connection Failed", err.message);
    } finally {
      setConnecting(false);
    }
  };

  const handleSelectDummy = (address: string, name: string) => {
    onSelectAddress(address);
    toast.success("Test Account Active", `Switched to ${name}`);
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customAddress.trim().toLowerCase();
    if (!clean.startsWith("0x") || clean.length !== 42) {
      toast.error("Invalid Address", "Must be a valid 42-character 0x hex address.");
      return;
    }
    onSelectAddress(clean);
    toast.success("Custom Account Loaded", `Active address: ${clean.slice(0, 6)}...${clean.slice(-4)}`);
    setCustomAddress("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#e8ecf1] rounded-2xl w-full max-w-[460px] p-5 sm:p-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#f1f5f9]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#eff6ff] text-[#2563eb] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="6" width="20" height="12" rx="2" />
                <path d="M16 12h.01M2 10h20" />
              </svg>
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-[#0f172a] leading-tight">
                Connect Wallet
              </h2>
              <span className="text-[11px] text-[#16a34a] font-semibold flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
                100% Safe • Read-Only Identity Check
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#64748b] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Current Active Account */}
        {currentAddress && (
          <div className="mt-4 p-3 bg-[#f8fafc] border border-[#f1f5f9] rounded-xl flex items-center justify-between">
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
                Active Account
              </span>
              <span className="font-mono text-[12.5px] font-bold text-[#0f172a] truncate block">
                {currentAddress}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                toast.copy(currentAddress, "Active Address");
              }}
              className="px-2.5 py-1 rounded-lg bg-white border border-[#e2e8f0] text-[11px] font-semibold text-[#2563eb] hover:bg-[#eff6ff] transition-colors cursor-pointer shrink-0"
            >
              Copy
            </button>
          </div>
        )}

        {/* Primary Injected Web3 Connect Button */}
        <div className="mt-4">
          <button
            type="button"
            disabled={connecting}
            onClick={handleInjectedConnect}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-[13.5px] shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-[18px]">🦊</span>
              <span>{connecting ? "Connecting Wallet..." : "Browser Wallet (MetaMask / Rabby)"}</span>
            </div>
            <span className="text-[11px] font-medium bg-white/20 px-2 py-0.5 rounded-full">
              {hasInjected ? "Detected" : "Web3"}
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-4 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#f1f5f9]" />
          </div>
          <span className="relative bg-white px-3 text-[10.5px] font-bold uppercase tracking-wider text-[#94a3b8]">
            Or Switch to Dummy Test Account
          </span>
        </div>

        {/* Dummy Accounts List for Simulation */}
        <div className="space-y-2">
          {DUMMY_TEST_ACCOUNTS.map((acc) => {
            const isCurrent = currentAddress?.toLowerCase() === acc.address.toLowerCase();
            return (
              <button
                key={acc.address}
                type="button"
                onClick={() => handleSelectDummy(acc.address, acc.name)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-[#eff6ff] border-[#bfdbfe] text-[#1d4ed8]"
                    : "bg-[#f8fafc] border-[#f1f5f9] hover:bg-white hover:border-[#cbd5e1] text-[#334155]"
                }`}
              >
                <div className="min-w-0">
                  <div className="text-[12.5px] font-bold leading-tight truncate">
                    {acc.name}
                  </div>
                  <div className="text-[10.5px] text-[#64748b] font-mono truncate mt-0.5">
                    {acc.address.slice(0, 10)}...{acc.address.slice(-6)} • {acc.tier}
                  </div>
                </div>
                {isCurrent && (
                  <span className="text-[11px] font-bold bg-[#2563eb] text-white px-2 py-0.5 rounded-full shrink-0">
                    Active
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Custom Dummy Address Input */}
        <form onSubmit={handleCustomSubmit} className="mt-3.5 flex gap-2">
          <input
            type="text"
            placeholder="Or enter custom 0x... address"
            value={customAddress}
            onChange={(e) => setCustomAddress(e.target.value)}
            className="flex-1 px-3 py-2 text-[12px] font-mono rounded-xl border border-[#e2e8f0] bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]"
          />
          <button
            type="submit"
            className="px-3 py-2 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-white text-[12px] font-bold transition-colors cursor-pointer shrink-0"
          >
            Load
          </button>
        </form>
      </div>
    </div>
  );
}
