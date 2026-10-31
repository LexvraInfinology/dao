"use client";

import React from "react";
import Image from "next/image";

interface EquoraLogoLoaderProps {
  message?: string;
  submessage?: string;
  fullScreen?: boolean;
}

export function EquoraLogoLoader({
  message = "Syncing on-chain matrix data...",
  submessage = "Verifying live blockchain positions, cycles, and rewards",
  fullScreen = true,
}: EquoraLogoLoaderProps) {
  const containerClasses = fullScreen
    ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-[#f7fbff] via-[#f3f8ff] to-[#f7faff] p-4 select-none"
    : "w-full py-16 flex flex-col items-center justify-center bg-transparent p-4 select-none";

  return (
    <div className={containerClasses}>
      {/* ── BIG CIRCULAR LOGO LOADER ── */}
      <div className="relative flex items-center justify-center">
        {/* Ambient Glow Aura */}
        <div className="absolute w-44 h-44 rounded-full bg-gradient-to-tr from-[#2868e8]/20 via-[#5ba8ff]/15 to-[#0e9f79]/20 blur-2xl animate-pulse pointer-events-none" />

        {/* Outer Rotating Gradient Ring */}
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full p-[3px] bg-gradient-to-tr from-[#2868e8] via-[#5ba8ff] to-[#0e9f79] animate-spin [animation-duration:2.5s]">
          <div className="w-full h-full rounded-full bg-white" />
        </div>

        {/* Counter-Rotating Dashed Orbit Ring */}
        <div className="absolute w-36 h-36 sm:w-40 sm:h-40 rounded-full border border-dashed border-[#2868e8]/30 animate-spin [animation-duration:8s] [animation-direction:reverse]" />

        {/* Orbiting Satellite Particle */}
        <div className="absolute w-36 h-36 sm:w-40 sm:h-40 rounded-full animate-spin [animation-duration:3s]">
          <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#2868e8] shadow-[0_0_8px_#2868e8]" />
        </div>

        {/* Inner Solid White Circle with Logo */}
        <div className="absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white shadow-[0_10px_30px_rgba(37,91,159,0.12)] border border-[#e0eaf7] flex flex-col items-center justify-center z-10 transition-transform">
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center animate-pulse [animation-duration:2s]">
            <Image
              src="/new-logo.png"
              alt="EQUORA.FI Logo"
              width={64}
              height={64}
              priority
              className="w-full h-full object-contain drop-shadow-[0_4px_10px_rgba(40,104,232,0.2)]"
            />
          </div>
        </div>
      </div>

      {/* ── BRAND LABEL & STATUS ── */}
      <div className="mt-7 flex flex-col items-center text-center max-w-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[15px] font-black tracking-tight text-[#102341]">
            EQUORA_FI
          </span>
          <span className="px-2 py-0.5 rounded-md bg-[#eaf2ff] text-[#2465dc] text-[10px] font-black tracking-wider uppercase border border-[#cde0ff]">
            MATRIX
          </span>
        </div>

        <h3 className="text-[14px] sm:text-[15px] font-extrabold text-[#102341] tracking-tight mt-1">
          {message}
        </h3>

        <p className="text-[11.5px] text-[#657895] mt-1 leading-relaxed max-w-[280px]">
          {submessage}
        </p>

        {/* On-Chain Syncing Pill */}
        <div className="mt-3.5 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#e0eaf7] shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0e9f79] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0e9f79]" />
          </span>
          <span className="text-[10.5px] font-bold text-[#102341] tracking-wide font-mono">
            TrobChain Node Live
          </span>
        </div>
      </div>
    </div>
  );
}
