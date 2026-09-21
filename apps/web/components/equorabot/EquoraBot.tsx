"use client";

import React, { useState } from "react";

export type EquoraBotState =
  | "idle"
  | "welcome"
  | "guide"
  | "thinking"
  | "success"
  | "celebration"
  | "salute"
  | "transaction-pending"
  | "transaction-success"
  | "transaction-error"
  | "rank-up";

export type EquoraBotVariant = "hero" | "companion" | "card" | "salute" | "dialog" | "mini";

export interface EquoraBotProps {
  state?: EquoraBotState;
  variant?: EquoraBotVariant;
  message?: string;
  className?: string;
  interactive?: boolean;
}

const EQUORABOT_IMAGE_URL = "/assets/branding/equorafilogo.jpeg";

function EquoraBotAvatarSvg({ size = 32 }: { size?: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full bg-gradient-to-br from-primary/30 via-surface-container to-secondary/30 border border-primary/40 flex items-center justify-center shadow-lg relative overflow-hidden shrink-0"
    >
      <div className="absolute inset-0 bg-primary/10 animate-pulse rounded-full" />
      <span className="material-symbols-outlined text-primary" style={{ fontSize: `${Math.round(size * 0.58)}px`, fontVariationSettings: "'FILL' 1" }}>
        smart_toy
      </span>
      <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-surface-container" />
    </div>
  );
}

export function EquoraBot({
  state = "idle",
  variant = "companion",
  message,
  className = "",
  interactive = true,
}: EquoraBotProps) {
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const getStatusBadge = () => {
    switch (state) {
      case "transaction-pending":
        return { label: "Processing Tx...", color: "bg-amber-500", text: "text-amber-400" };
      case "transaction-success":
      case "success":
        return { label: "On-Chain Verified", color: "bg-green-500", text: "text-green-400" };
      case "transaction-error":
        return { label: "Tx Alert", color: "bg-red-500", text: "text-red-400" };
      case "celebration":
      case "rank-up":
        return { label: "Milestone Unlocked!", color: "bg-tertiary", text: "text-tertiary" };
      case "salute":
        return { label: "Founding Member", color: "bg-tertiary", text: "text-tertiary" };
      default:
        return { label: "Equora AI Assistant", color: "bg-primary", text: "text-primary" };
    }
  };

  const badge = getStatusBadge();

  if (variant === "mini") {
    return (
      <div className={`relative inline-flex items-center gap-2 ${className}`}>
        {imgError ? (
          <EquoraBotAvatarSvg size={28} />
        ) : (
          <img
            src={EQUORABOT_IMAGE_URL}
            alt="EquoraBot Mini"
            onError={() => setImgError(true)}
            className="w-7 h-7 object-contain drop-shadow-md hover:scale-110 transition-transform cursor-pointer"
          />
        )}
        {message && (
          <span className="text-[11px] font-label-md text-on-surface-variant truncate max-w-[200px]">
            {message}
          </span>
        )}
      </div>
    );
  }

  if (variant === "hero") {
    return (
      <div className={`relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 flex items-center justify-center ${className}`}>
        <div className="absolute inset-0 bg-primary/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -inset-4 bg-tertiary/10 rounded-full blur-2xl" />
        {imgError ? (
          <div className="w-56 h-56 sm:w-72 sm:h-72 rounded-3xl bg-gradient-to-br from-primary-container via-surface-container to-surface-dim border border-primary/40 shadow-2xl flex flex-col items-center justify-center p-6 relative">
            <span className="material-symbols-outlined text-primary text-6xl mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>
              smart_toy
            </span>
            <span className="text-sm font-headline-md font-bold text-on-surface">EQUORA-BOT AI</span>
            <span className="text-[10px] text-tertiary font-code uppercase mt-1">Autonomous Protocol Assistant</span>
          </div>
        ) : (
          <img
            src={EQUORABOT_IMAGE_URL}
            alt="EquoraBot Hero"
            onError={() => setImgError(true)}
            className="relative z-10 w-full h-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
          />
        )}
        {message && (
          <div className="absolute -bottom-2 -left-2 sm:-left-6 bg-surface-container-highest/90 backdrop-blur-2xl border border-primary/30 px-4 sm:px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-30 animate-in fade-in slide-in-from-bottom-3 duration-300 max-w-[90vw] sm:max-w-xs">
            <span className="material-symbols-outlined text-secondary text-2xl shrink-0">verified_user</span>
            <div className="flex flex-col overflow-hidden">
              <span className="text-[10px] font-label-md uppercase tracking-wider text-outline">
                {badge.label}
              </span>
              <span className="text-xs font-semibold text-on-surface truncate">{message}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative group flex items-center gap-3 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:bg-tertiary/20 transition-all duration-300" />
        {imgError ? (
          <EquoraBotAvatarSvg size={56} />
        ) : (
          <img
            src={EQUORABOT_IMAGE_URL}
            alt="EquoraBot Assistant"
            onError={() => setImgError(true)}
            className={`relative z-10 w-full h-full object-contain drop-shadow-lg transition-transform duration-300 ${
              interactive ? "hover:scale-110 cursor-pointer" : ""
            }`}
          />
        )}
      </div>

      {message && !dismissed && (
        <div className="relative z-20 bg-surface-container-high/90 backdrop-blur-xl border border-outline-variant/30 px-3.5 py-2.5 rounded-xl shadow-xl max-w-[220px] sm:max-w-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className={`text-[10px] font-label-md uppercase tracking-wider ${badge.text}`}>
              {badge.label}
            </span>
            {interactive && (
              <button
                onClick={() => setDismissed(true)}
                className="text-outline hover:text-on-surface text-[12px] p-0.5"
                title="Dismiss"
              >
                ✕
              </button>
            )}
          </div>
          <p className="text-xs text-on-surface font-medium leading-relaxed">{message}</p>
        </div>
      )}
    </div>
  );
}
