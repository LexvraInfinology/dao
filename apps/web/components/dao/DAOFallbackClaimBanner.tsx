"use client";

import React from "react";
import { formatUnits } from "viem";
import { useClaimFallback } from "../../hooks/btitan/useClaimFallback";

interface DAOFallbackClaimBannerProps {
  claimableAmount: bigint;
  bttPriceUsd?: number;
  onSuccess?: () => void;
}

export function DAOFallbackClaimBanner({
  claimableAmount,
  bttPriceUsd = 1.0,
  onSuccess,
}: DAOFallbackClaimBannerProps) {
  const { claim, isClaiming } = useClaimFallback();

  if (claimableAmount === 0n) return null;

  const formattedBtt = parseFloat(formatUnits(claimableAmount, 18)).toFixed(2);
  const formattedUsd = (parseFloat(formattedBtt) * bttPriceUsd).toFixed(2);

  const handleClaim = async () => {
    await claim();
    if (onSuccess) onSuccess();
  };

  return (
    <div className="bg-gradient-to-r from-amber-950/40 via-yellow-900/20 to-black border border-amber-500/40 rounded-2xl p-5 backdrop-blur-xl shadow-xl animate-pulse">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-amber-300">
                Uncollected Fallback Share Ready to Claim
              </h4>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold uppercase">
                Zero Fee
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-0.5">
              A previous instant push transfer was redirected to your secure fallback balance. Click to claim directly to your wallet.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <div className="text-base font-mono font-bold text-yellow-400">
              {formattedBtt} BTT
            </div>
            <div className="text-[11px] text-gray-400">≈ ${formattedUsd} USD</div>
          </div>

          <button
            onClick={handleClaim}
            disabled={isClaiming}
            className="px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black shadow-lg shadow-yellow-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {isClaiming ? "Claiming..." : "Claim Share"}
          </button>
        </div>
      </div>
    </div>
  );
}
