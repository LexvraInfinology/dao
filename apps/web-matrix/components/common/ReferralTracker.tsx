"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "@/lib/toast";

function Tracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams?.get("ref") || searchParams?.get("sponsor");
    if (ref) {
      const trimmed = ref.trim();
      const cleanRef = trimmed.startsWith("0x") ? trimmed.toLowerCase() : trimmed;
      const existing = localStorage.getItem("equora_sponsor");
      if (existing !== cleanRef) {
        localStorage.setItem("equora_sponsor", cleanRef);
        toast.info("Referral Link Detected", `Your sponsor is set to ${cleanRef.slice(0, 8)}...`);
      }
    }
  }, [searchParams]);

  return null;
}

export function ReferralTracker() {
  return (
    <Suspense fallback={null}>
      <Tracker />
    </Suspense>
  );
}
