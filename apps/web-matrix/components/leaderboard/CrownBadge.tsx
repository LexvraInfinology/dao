"use client";

import React from "react";
import Image from "next/image";

export interface CrownBadgeProps {
  rank: 1 | 2 | 3;
  size?: "sm" | "md";
}

export function CrownBadge({ rank, size = "md" }: CrownBadgeProps) {
  const src = rank === 1 ? "/crown-gold.png" : rank === 2 ? "/crown-silver.png" : "/crown-bronze.png";
  const alt = rank === 1 ? "Rank 1 Gold Crown" : rank === 2 ? "Rank 2 Silver Crown" : "Rank 3 Bronze Crown";
  const dim = size === "sm" ? "w-[18px]" : "w-5 lg:w-6";
  return (
    <Image
      src={src}
      alt={alt}
      width={28}
      height={24}
      className={`${dim} h-auto object-contain select-none`}
    />
  );
}
