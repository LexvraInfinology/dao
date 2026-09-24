'use client';

import React from 'react';
import { Shield } from 'lucide-react';

export default function YourPrivacyCard() {
  return (
    <div className="rounded-3xl bg-white border border-[#E2ECF9] p-7 shadow-[0_4px_25px_rgba(21,94,239,0.03)] font-jakarta relative overflow-hidden min-h-[190px] flex flex-col justify-between">
      {/* Top Content */}
      <div className="z-10 max-w-[320px]">
        <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#155EEF] mb-3.5">
          <Shield className="w-5 h-5" />
        </div>
        <h4 className="text-base sm:text-lg font-bold text-[#071A4A] mb-2">
          Your Privacy
        </h4>
        <p className="text-xs text-[#64748B] leading-relaxed">
          Your wallet remains strictly under your control. Blockchain transactions are public, transparent, and cannot be edited or removed from the network by any authority.
        </p>
      </div>

      {/* Wireframe Faceted Crystal Graphic on bottom-right */}
      <div className="absolute -right-3 -bottom-6 w-36 h-36 shrink-0 pointer-events-none opacity-85 select-none">
        <img
          src="/dao/Background Faceted Crystal Artwork.png"
          alt="Wireframe Faceted Crystal"
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
}
