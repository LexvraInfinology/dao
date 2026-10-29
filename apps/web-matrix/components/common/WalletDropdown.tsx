"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/stores";
import { formatAddress, toTrobBase58 } from "@/lib/format";
import { toast } from "@/lib/toast";
import { getOnChainTokenBalance } from "@/lib/contracts";
import { WalletConnectModal } from "./WalletConnectModal";

export function WalletDropdown() {
  const router = useRouter();
  const address = useUserStore((s) => s.address);
  const setAddress = useUserStore((s) => s.setAddress);
  const profile = useUserStore((s) => s.profile);
  const disconnectStore = useUserStore((s) => s.disconnect);

  const [isOpen, setIsOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [balanceUsd, setBalanceUsd] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch live on-chain balance when connected and dropdown opens
  useEffect(() => {
    if (address && isOpen) {
      getOnChainTokenBalance(address)
        .then((bal: number | null) => setBalanceUsd(bal))
        .catch(() => setBalanceUsd(null));
    }
  }, [address, isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleCopy = () => {
    if (!address) return;
    const base58 = toTrobBase58(address);
    navigator.clipboard.writeText(base58 || address);
    setCopied(true);
    toast.success("Address Copied", "Wallet address copied to clipboard.");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDisconnect = () => {
    setIsOpen(false);
    disconnectStore();
    if (typeof window !== "undefined") {
      localStorage.setItem("equora_wallet_explicit_disconnect", "true");
      localStorage.removeItem("equora_auth_address");
      localStorage.removeItem("equora_matrix_address");
      localStorage.removeItem("trobsafe_address");
      localStorage.removeItem("equora_user_address");
      localStorage.removeItem("walletconnect");
      if (address) {
        localStorage.removeItem(`equora_matrix_registered_${address.toLowerCase()}`);
      }
    }
    toast.info("Wallet Disconnected", "You have disconnected your TrobSafe wallet.");
    window.location.href = "/";
  };

  if (!mounted) {
    return (
      <div className="w-[120px] h-[36px] rounded-xl bg-[#f8fafc] border border-[#e2e8f0] animate-pulse" />
    );
  }

  if (!address) {
    return (
      <>
        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined") {
              localStorage.removeItem("equora_wallet_explicit_disconnect");
            }
            setWalletModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[11.5px] sm:text-[12px] font-bold shadow-xs transition-colors cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M7 15h0M2 10h20" />
          </svg>
          <span>Connect TrobSafe</span>
        </button>
        <WalletConnectModal
          isOpen={walletModalOpen}
          onClose={() => setWalletModalOpen(false)}
          currentAddress={address}
          onSelectAddress={(addr) => {
            if (typeof window !== "undefined") {
              localStorage.removeItem("equora_wallet_explicit_disconnect");
            }
            setAddress(addr);
            setWalletModalOpen(false);
          }}
        />
      </>
    );
  }

  const base58Display = toTrobBase58(address);
  const explorerUrl = `https://testnet.trobchain.com/#/address/${base58Display || address}`;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border text-[11.5px] sm:text-[12px] font-medium transition-all cursor-pointer ${
          isOpen
            ? "bg-white border-[#2563eb] ring-2 ring-blue-100 text-[#0f172a] shadow-xs"
            : "bg-[#f8fafc] border-[#e2e8f0] hover:bg-white hover:border-[#cbd5e1] text-[#334155]"
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse shrink-0" />
        <span className="font-mono font-bold text-[#0f172a]">
          {formatAddress(address)}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className={`text-[#64748b] transition-transform duration-200 ${isOpen ? "rotate-180 text-[#2563eb]" : ""}`}
        >
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Floating Dropdown Card */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[310px] sm:w-[330px] rounded-2xl bg-white border border-[#e2e8f0] shadow-xl z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#eff6ff] flex items-center justify-center text-[#2563eb]">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12V7H5a2 2 0 010-4h14v4" />
                  <path d="M3 5v14a2 2 0 002 2h16v-5" />
                  <path d="M18 12a2 2 0 000 4h4v-4z" />
                </svg>
              </div>
              <div>
                <div className="text-[12.5px] font-black text-[#0f172a]">TrobSafe Wallet</div>
                <div className="text-[10.5px] text-[#64748b] font-medium">TrobChain L1 Network</div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ecfdf5] border border-[#bbf7d0] text-[#16a34a] text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
              Connected
            </span>
          </div>

          {/* Address Box */}
          <div className="mt-3 p-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
            <div className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1">
              Wallet Address
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[11.5px] font-bold text-[#0f172a] truncate select-all">
                {base58Display || address}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1 rounded-lg hover:bg-white text-[#64748b] hover:text-[#2563eb] transition-colors cursor-pointer shrink-0"
                title="Copy Address"
              >
                {copied ? (
                  <span className="text-[10px] font-bold text-[#16a34a]">Copied!</span>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Balance & Network Row */}
          <div className="grid grid-cols-2 gap-2 mt-2.5">
            <div className="p-2.5 rounded-xl bg-[#eff6ff]/60 border border-[#dbeafe]">
              <div className="text-[10px] font-bold text-[#3b82f6] uppercase tracking-wider">
                On-Chain Balance
              </div>
              <div className="text-[15px] font-black text-[#1e40af] mt-0.5">
                ${balanceUsd !== null ? balanceUsd.toFixed(2) : (profile?.availableBalance ?? 0).toFixed(2)}{" "}
                <span className="text-[10px] font-bold text-[#3b82f6]">USD</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
              <div className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">
                Network
              </div>
              <div className="text-[12px] font-black text-[#0f172a] mt-0.5 truncate">
                TrobChain Testnet
              </div>
              <div className="text-[10px] text-[#94a3b8] font-mono">Chain ID: 1000</div>
            </div>
          </div>

          {/* Quick Actions List */}
          <div className="mt-3 space-y-1 pt-2 border-t border-[#f1f5f9]">
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-2.5 py-2 rounded-xl text-[12px] font-semibold text-[#475569] hover:text-[#2563eb] hover:bg-[#eff6ff] transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                View on TrobScan
              </span>
              <span className="text-[10.5px] text-[#94a3b8]">↗</span>
            </a>

            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between px-2.5 py-2 rounded-xl text-[12px] font-semibold text-[#475569] hover:text-[#2563eb] hover:bg-[#eff6ff] transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Matrix Profile & Ranks
              </span>
              <span className="text-[10.5px] text-[#94a3b8]">→</span>
            </Link>

            <Link
              href="/matrix"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between px-2.5 py-2 rounded-xl text-[12px] font-semibold text-[#475569] hover:text-[#2563eb] hover:bg-[#eff6ff] transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                12-Slot Progression Tree
              </span>
              <span className="text-[10.5px] text-[#94a3b8]">→</span>
            </Link>
          </div>

          {/* Disconnect Button */}
          <div className="mt-2.5 pt-2 border-t border-[#f1f5f9]">
            <button
              type="button"
              onClick={handleDisconnect}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-[12px] transition-colors cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Disconnect Wallet</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
