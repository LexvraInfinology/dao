'use client';

import React from 'react';
import { Bell } from 'lucide-react';

export default function StayInformedCard() {
  return (
    <>
      {/* ================= DESKTOP VIEW (lg:flex) ================= */}
      <div className="hidden lg:flex items-center justify-between rounded-3xl bg-white border border-[#E2ECF9] p-7 shadow-[0_4px_25px_rgba(21,94,239,0.03)] font-jakarta relative overflow-hidden min-h-[170px]">
        {/* Left Content */}
        <div className="z-10 max-w-[310px]">
          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#155EEF] mb-3.5">
            <Bell className="w-5 h-5" />
          </div>
          <h4 className="text-sm sm:text-base font-bold text-[#071A4A] mb-1.5">
            Stay Informed
          </h4>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Get real-time updates on your council seat, governance proposals and important DAO activity.
          </p>
        </div>

        {/* Right 3D Faceted Crystal Graphic */}
        <div className="relative w-28 h-32 shrink-0 flex items-center justify-center opacity-90 -mr-2 pointer-events-none">
          <img
            src="/dao/Diamond Crystal Graphic Graphic Accent.png"
            alt="3D Faceted Crystal Diamond"
            className="w-full h-full object-contain drop-shadow-[0_4px_16px_rgba(21,94,239,0.15)]"
          />
        </div>
      </div>

      {/* ================= MOBILE VIEW (lg:flex) ================= */}
      <div className="lg:hidden rounded-2xl bg-white border border-[#E2ECF9] p-4 flex items-center justify-between shadow-xs font-jakarta relative overflow-hidden">
        {/* Left Info */}
        <div className="flex items-start gap-3 z-10 max-w-[240px]">
          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#155EEF] shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[#071A4A]">
              Stay Informed
            </h4>
            <p className="text-[11px] text-[#64748B] leading-relaxed mt-0.5">
              Get real-time updates on your council seat, governance proposals, and important DAO activity.
            </p>
          </div>
        </div>

        {/* Right Wireframe Isometric Cube */}
        <div className="relative w-16 h-16 shrink-0 flex items-center justify-center opacity-70 -mr-2 pointer-events-none">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full stroke-[#93C5FD]"
            fill="none"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Hexagon outer perimeter */}
            <polygon points="50,15 85,35 85,75 50,95 15,75 15,35" />
            {/* Inner isometric Y lines */}
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
