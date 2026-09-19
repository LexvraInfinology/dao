"use client";

import React from "react";

export function DAOClosedBanner() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-yellow-900/30 via-amber-900/20 to-black/40 border border-yellow-500/40 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(234,179,8,0.3)]">
            🔒
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white tracking-wide">
                Genesis DAO Closed (100 / 100 Filled)
              </h3>
              <span className="text-[11px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-bold uppercase">
                Immutable
              </span>
            </div>
            <p className="text-sm text-gray-300 mt-1 max-w-xl">
              All 100 Genesis Founder seats have been claimed. The smart contract is permanently sealed with zero admin keys.
            </p>

          </div>
        </div>

        <div className="shrink-0 text-center sm:text-right bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
          <div className="text-xs text-gray-400">Next Step</div>
          <div className="text-sm font-semibold text-yellow-400">Join Matrix Slot 1 (30 BTT) →</div>
        </div>
      </div>
    </div>
  );
}
