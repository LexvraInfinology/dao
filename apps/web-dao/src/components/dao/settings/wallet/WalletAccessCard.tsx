'use client';

import React from 'react';
import { Shield } from 'lucide-react';

export default function WalletAccessCard() {
  return (
    <>
      {/* ================= DESKTOP VIEW (lg:flex) ================= */}
      <div className="hidden lg:flex items-center justify-between rounded-3xl bg-white border border-[#E2ECF9] p-7 shadow-[0_4px_25px_rgba(21,94,239,0.03)] font-jakarta relative overflow-hidden min-h-[160px]">
        {/* Left Content */}
        <div className="z-10 max-w-[310px]">
          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#155EEF] mb-3.5">
            <Shield className="w-5 h-5" />
          </div>
          <h4 className="text-sm sm:text-base font-bold text-[#071A4A] mb-1.5">
            Your Wallet, Your Access
          </h4>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Your wallet gives you access to the EQUORA_FI Genesis DAO platform. Keep your private key secure and never share it with anyone.
          </p>
        </div>

        {/* Right Wireframe Diamond Graphic */}
        <div className="relative w-32 h-36 shrink-0 flex items-center justify-center opacity-85 -mr-4 pointer-events-none">
          <img
            src="/dao/Background Faceted Crystal Artwork.png"
            alt="Faceted Crystal Wireframe"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* ================= MOBILE VIEW (lg:flex) ================= */}
      <div className="lg:hidden rounded-2xl bg-white border border-[#E2ECF9] p-3.5 sm:p-4 flex items-center justify-between shadow-xs font-jakarta relative overflow-hidden">
        {/* Left Info */}
        <div className="flex items-start gap-2.5 sm:gap-3 z-10 flex-1 min-w-0 pr-2">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#155EEF] shrink-0">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-[#071A4A]">
              Your Wallet, Your Access
            </h4>
            <p className="text-[11px] text-[#64748B] leading-relaxed mt-0.5">
              Your wallet gives you access to the EQUORA_FI Genesis DAO platform. Keep your private key secure and never share it with anyone.
            </p>
          </div>
        </div>

        {/* Right Wireframe Isometric Cube */}
        <div className="relative w-12 h-12 sm:w-16 sm:h-16 shrink-0 flex items-center justify-center opacity-70 -mr-1 sm:-mr-2 pointer-events-none">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full stroke-[#93C5FD]"
            fill="none"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="50,15 85,35 85,75 50,95 15,75 15,35" />
            <line x1="50" y1="55" x2="50" y2="15" />
            <line x1="50" y1="55" x2="15" y2="35" />
            <line x1="50" y1="55" x2="85" y2="35" />
            <line x1="50" y1="55" x2="50" y2="95" />
          </svg>
        </div>
      </div>
    </>
  );
}
