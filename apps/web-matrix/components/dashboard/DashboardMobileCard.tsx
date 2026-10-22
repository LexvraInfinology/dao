"use client";

import React from "react";
import Image from "next/image";

export function DashboardMobileCard() {
  return (
          <div className="mt-6 lg:hidden">
            <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#1e3a5f] to-[#0f172a] p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-[28px] h-[28px] rounded-full bg-gradient-to-br from-[#2563eb] to-[#1e40af] flex items-center justify-center flex-shrink-0">
                    <Image
                      src="/image 36.png"
                      alt="EQUORA.FI"
                      width={119}
                      height={44}
                      className="w-[14px] h-[14px] object-contain brightness-0 invert"
                    />
                  </div>
                  <span className="text-[12px] font-bold text-white">EQUORA_FI MATRIX</span>
                </div>
                <span className="text-[10px] font-medium text-white/60">v3.2.0</span>
              </div>
              <p className="text-[13px] text-white/80 leading-relaxed mb-4">
                A Stronger Tomorrow, Built Together. Decentralized algorithmic matrix distribution on Trobitum.
              </p>
              <div className="flex gap-6">
                <div>
                  <div className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Global Members</div>
                  <div className="text-[18px] font-extrabold text-white">128,420</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Total Volume</div>
                  <div className="text-[18px] font-extrabold text-white">$12.4M USD</div>
                </div>
              </div>
            </div>
          </div>
  );
}
