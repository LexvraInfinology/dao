"use client";

import React from "react";
import { DAOSlot } from "./DAOSlot";

interface DAOQueueProps {
  filledCount: number;
  userPosition?: number;
  allMembers?: string[];
  bttPriceUsd?: number;
}

export function DAOQueue({
  filledCount,
  userPosition,
  allMembers = [],
  bttPriceUsd = 1.0,
}: DAOQueueProps) {
  const slots = Array.from({ length: 100 }, (_, i) => i + 1);

  return (
    <div className="bg-surface-container/40 backdrop-blur-xl border border-outline-variant/20 rounded-3xl p-6 sm:p-8 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/15 pb-5 mb-6">
        <div>
          <h2 className="text-xl font-headline-md font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary">grid_on</span>
            Founding Member Grid (100 Seats)
          </h2>
          <p className="text-xs text-on-surface-variant mt-1">
            Real-time visual queue map of all 100 immutable Soulbound Founder seats.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-sm bg-tertiary/20 border border-tertiary shadow-sm" />
            <span className="text-on-surface">Claimed ({filledCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-sm bg-surface-variant border border-outline/30" />
            <span className="text-on-surface-variant">Available ({Math.max(0, 100 - filledCount)})</span>
          </div>
        </div>
      </div>

      {/* 100-Slot Grid (10 columns x 10 rows) */}
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-3 justify-items-center">
        {slots.map((pos) => {
          const isFilled = pos <= filledCount;
          const isUser = pos === userPosition;
          const isNext = pos === filledCount + 1 && filledCount < 100;
          const memberAddress = allMembers[pos - 1];

          return (
            <DAOSlot
              key={pos}
              position={pos}
              isFilled={isFilled}
              isUser={isUser}
              isNext={isNext}
              address={memberAddress}
              nftTokenId={isFilled ? pos : undefined}
            />
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="mt-6 pt-5 border-t border-outline-variant/15">
        <div className="flex justify-between text-xs text-on-surface-variant mb-2 font-bold">
          <span>Council Capacity: {filledCount} / 100</span>
          <span className="text-tertiary font-code">{((filledCount / 100) * 100).toFixed(0)}% Filled</span>
        </div>
        <div className="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-tertiary to-primary rounded-full transition-all duration-700"
            style={{ width: `${(filledCount / 100) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
