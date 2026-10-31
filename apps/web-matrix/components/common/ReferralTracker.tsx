"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "@/lib/toast";
import { getOnChainUserByCode } from "@/lib/contracts";

function Tracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref =
      searchParams?.get("ref") ||
      searchParams?.get("sponsor") ||
      searchParams?.get("code");

    if (ref) {
      const trimmed = ref.trim();
      if (/^\d{5}$/.test(trimmed)) {
        const codeNum = parseInt(trimmed, 10);
        getOnChainUserByCode(codeNum)
          .then((resolvedAddr) => {
            if (resolvedAddr) {
              localStorage.setItem("equora_sponsor", resolvedAddr);
              localStorage.setItem("equora_sponsor_code", trimmed);
              toast.info("Referral Code Detected", `Sponsor Operative #${trimmed} verified.`);
            } else {
              localStorage.setItem("equora_sponsor", trimmed);
              toast.info("Referral Code Detected", `Sponsor Code #${trimmed} applied.`);
            }
          })
          .catch(() => {
            localStorage.setItem("equora_sponsor", trimmed);
          });
      } else {
        const cleanRef = trimmed.startsWith("0x") ? trimmed.toLowerCase() : trimmed;
        const existing = localStorage.getItem("equora_sponsor");
        if (existing !== cleanRef) {
          localStorage.setItem("equora_sponsor", cleanRef);
          toast.info("Referral Link Detected", `Your sponsor is set to ${cleanRef.slice(0, 8)}...`);
        }
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

