'use client';

import React from 'react';
import { Shield } from 'lucide-react';

export default function SecurityMattersCard() {
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
            Your Security Matters
          </h4>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Your wallet controls access to your Genesis DAO account. Never share your private key or recovery phrase with anyone.
          </p>
        </div>

        {/* Right Wireframe Graphic */}
        <div className="relative w-32 h-36 shrink-0 flex items-center justify-center opacity-85 -mr-4 pointer-events-none">
          <img
            src="/dao/Background Faceted Crystal Artwork.png"
            alt="Faceted Crystal Wireframe"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* ================= MOBILE VIEW (lg:hidden) ================= */}
      <div className="lg:hidden rounded-2xl bg-[#F0F5FB]/70 border border-[#E2ECF9] p-4 flex items-start gap-3.5 font-jakarta">
        <div className="w-10 h-10 rounded-xl bg-white border border-[#E2ECF9] flex items-center justify-center text-[#155EEF] shrink-0 shadow-xs">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-[#071A4A]">
            Your Security Matters
          </h4>
          <p className="text-[11px] text-[#64748B] leading-relaxed mt-0.5">
            Your wallet controls access to your Genesis DAO account. Never share your private key or recovery phrase with anyone.
          </p>
        </div>
      </div>
    </>
  );
}
