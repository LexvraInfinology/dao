"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "@/lib/toast";
import { getOnChainUserByCode, isDeployerAddress } from "@/lib/contracts";

function Tracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref =
      searchParams?.get("ref") ||
      searchParams?.get("sponsor") ||
      searchParams?.get("code");

    if (ref) {
      const trimmed = ref.trim();
      if (!trimmed || isDeployerAddress(trimmed)) return;
      if (/^\d{5}$/.test(trimmed)) {
        // Persist synchronously immediately so fast navigation to /gate never loses the referrer
        localStorage.setItem("equora_sponsor", trimmed);
        localStorage.setItem("equora_sponsor_code", trimmed);
        try {
          sessionStorage.setItem("equora_sponsor", trimmed);
        } catch {}
        const codeNum = parseInt(trimmed, 10);
        getOnChainUserByCode(codeNum)
          .then((resolvedAddr) => {
            if (resolvedAddr && !isDeployerAddress(resolvedAddr)) {
              localStorage.setItem("equora_sponsor", resolvedAddr);
              localStorage.setItem("equora_sponsor_code", trimmed);
              try {
                sessionStorage.setItem("equora_sponsor", resolvedAddr);
              } catch {}
              toast.info("Referral Code Detected", `Sponsor Operative #${trimmed} verified.`);
            }
          })
          .catch(() => {
            // Keep raw 5-digit code stored so MatrixAccessGate can re-resolve on-chain
          });
      } else if (trimmed.startsWith("0x") || trimmed.startsWith("T")) {
        const cleanRef = trimmed.startsWith("0x") ? trimmed.toLowerCase() : trimmed;
        const existing = localStorage.getItem("equora_sponsor");
        try {
          sessionStorage.setItem("equora_sponsor", cleanRef);
        } catch {}
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

