"use client";

import React, { useState } from "react";
import { searchOperativeOnChain } from "@/lib/contracts";
import { useMatrixUser } from "@/lib/useMatrixUser";
import { toast } from "@/lib/toast";
import { formatAddress } from "@/lib/format";

interface HeaderSearchBarProps {
  className?: string;
}

export function HeaderSearchBar({ className = "" }: HeaderSearchBarProps) {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const { changeAddress } = useMatrixUser();
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Keyboard shortcut '/' to focus
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    setSearching(true);
    try {
      const res = await searchOperativeOnChain(q);

      if (res.type === "tx" && res.txUrl) {
        toast.info("Transaction Found", res.message || "Viewing on TrobChain Explorer...");
        window.open(res.txUrl, "_blank", "noopener,noreferrer");
        setQuery("");
      } else if (res.found && res.address) {
        changeAddress(res.address);
        toast.success(
          "Operative Synchronized",
          res.message || `Loaded operative ${formatAddress(res.address)}`
        );
        setQuery("");
      } else {
        toast.error(
          "Search Result",
          res.message || "No matching operative, wallet address, or transaction found on-chain."
        );
      }
    } catch (err: any) {
      toast.error("Query Notice", err?.message || "Search could not resolve on-chain.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className={`relative ${className}`}>
      <div className="relative w-full flex items-center">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
        </svg>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search member ID / wallet / tx..."
          disabled={searching}
          className="w-full h-[38px] pl-10 pr-9 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-[12.5px] text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all disabled:opacity-70"
        />

        {searching ? (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
            <span className="w-3.5 h-3.5 border-2 border-[#2563eb] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full hover:bg-[#e2e8f0] flex items-center justify-center text-[#94a3b8] hover:text-[#0f172a] cursor-pointer"
          >
            ✕
          </button>
        ) : (
          <button
            type="submit"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded bg-[#f1f5f9] border border-[#e2e8f0] flex items-center justify-center text-[11px] font-semibold text-[#94a3b8] hover:bg-[#e2e8f0] cursor-pointer"
            title="Press / to focus or Enter to search"
          >
            /
          </button>
        )}
      </div>
    </form>
  );
}
