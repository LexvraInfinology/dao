"use client";

import React, { ReactNode } from "react";

interface DAOSlotTooltipProps {
  position: number;
  isFilled: boolean;
  isUser: boolean;
  address?: string;
  earnedBtt?: string;
  earnedUsd?: string;
  nftTokenId?: number;
  children: ReactNode;
}

export function DAOSlotTooltip({
  position,
  isFilled,
  isUser,
  address,
  earnedBtt,
  earnedUsd,
  nftTokenId,
  children,
}: DAOSlotTooltipProps) {
  return (
    <div className="group relative inline-block">
      {children}
      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-50 min-w-[200px]">
        <div className="bg-[#111827]/95 backdrop-blur-md border border-yellow-500/30 rounded-xl p-3 shadow-2xl text-xs text-white">
          <div className="flex items-center justify-between border-b border-white/10 pb-1 mb-2 gap-3">
            <span className="font-bold text-yellow-400">Seat #{position}</span>
            {isFilled && nftTokenId && (
              <span className="text-[10px] bg-yellow-500/20 text-yellow-300 px-1.5 py-0.5 rounded">
                NFT #{nftTokenId}
              </span>
            )}
          </div>

          {isFilled ? (
            <div className="space-y-1 text-gray-300">
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className={isUser ? "text-green-400 font-semibold" : "text-gray-200"}>
                  {isUser ? "Your Seat 👑" : "Filled"}
                </span>
              </div>
              {address && (
                <div className="flex justify-between gap-2">
                  <span className="text-gray-400">Owner:</span>
                  <span className="font-mono text-gray-300">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </span>
                </div>
              )}
              {earnedBtt && (
                <div className="flex justify-between pt-1 border-t border-white/5">
                  <span className="text-gray-400">Pushed:</span>
                  <span className="text-yellow-400 font-mono font-bold">
                    {earnedBtt} BTT
                    {earnedUsd && <span className="text-gray-400 text-[10px] font-normal ml-1">(${earnedUsd})</span>}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-400 py-1 text-center">
              Available for Join (300 BTT)
            </div>
          )}
        </div>
        {/* Pointer Arrow */}
        <div className="w-2 h-2 bg-[#111827] border-r border-b border-yellow-500/30 rotate-45 -mt-1" />
      </div>
    </div>
  );
}
