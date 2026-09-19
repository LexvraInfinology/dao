"use client";

import React from "react";
import { DAOSlotTooltip } from "./DAOSlotTooltip";

interface DAOSlotProps {
  position: number;
  isFilled: boolean;
  isUser: boolean;
  isNext: boolean;
  address?: string;
  earnedBtt?: string;
  earnedUsd?: string;
  nftTokenId?: number;
}

export function DAOSlot({
  position,
  isFilled,
  isUser,
  isNext,
  address,
  earnedBtt,
  earnedUsd,
  nftTokenId,
}: DAOSlotProps) {
  let styleClasses = "border-outline-variant/15 bg-surface-container-low/60 text-outline hover:border-outline-variant/40";

  if (isUser) {
    styleClasses =
      "border-tertiary bg-tertiary/25 text-tertiary shadow-[0_0_15px_rgba(233,193,118,0.4)] animate-pulse font-bold scale-105";
  } else if (isFilled) {
    styleClasses =
      "border-tertiary/40 bg-tertiary/10 text-tertiary hover:border-tertiary hover:bg-tertiary/20 shadow-sm";
  } else if (isNext) {
    styleClasses =
      "border-primary/80 bg-primary/10 text-primary animate-pulse shadow-[0_0_12px_rgba(185,199,228,0.3)] font-semibold";
  }

  return (
    <DAOSlotTooltip
      position={position}
      isFilled={isFilled}
      isUser={isUser}
      address={address}
      earnedBtt={earnedBtt}
      earnedUsd={earnedUsd}
      nftTokenId={nftTokenId}
    >
      <div
        className={`w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl border flex flex-col items-center justify-center transition-all duration-200 cursor-pointer ${styleClasses}`}
      >
        <span className="text-[11px] sm:text-xs font-code font-bold leading-none">{position}</span>
        {isFilled && (
          <span className="text-[9px] text-tertiary mt-0.5 leading-none">
            {isUser ? "👑" : "★"}
          </span>
        )}
        {isNext && (
          <span className="text-[8px] text-primary font-code tracking-tight leading-none mt-0.5 font-bold">
            OPEN
          </span>
        )}
      </div>
    </DAOSlotTooltip>
  );
}
