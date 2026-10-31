"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MatrixAccessGate } from "@/components/matrix/MatrixAccessGate";
import { useUserStore } from "@/lib/stores";
import {
  isUserRegisteredInMatrix,
  toHexAddress,
  toTrobBase58,
  GENESIS_ROOT_MEMBER_BASE58,
  GENESIS_ROOT_MEMBER_HEX,
} from "@/lib/contracts";
import { getInjectedAuthorizedAccount } from "@/lib/web3Wallet";

function GateContent() {
  const router = useRouter();
  const address = useUserStore((s) => s.address);
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;
    const checkStatus = async () => {
      const active =
        address ||
        (typeof window !== "undefined" ? getInjectedAuthorizedAccount() : null) ||
        (typeof window !== "undefined" ? localStorage.getItem("equora_user_address") : null) ||
        (typeof window !== "undefined" ? localStorage.getItem("equora_auth_address") : null);

      if (!active) {
        if (isMounted) setIsRegistered(false);
        return;
      }

      // Genesis Root Member check
      const isRoot =
        toTrobBase58(active) === GENESIS_ROOT_MEMBER_BASE58 ||
        toHexAddress(active).toLowerCase() === GENESIS_ROOT_MEMBER_HEX.toLowerCase();

      if (isRoot) {
        if (isMounted) {
          setIsRegistered(true);
          router.replace("/dashboard");
        }
        return;
      }

      const registered = await isUserRegisteredInMatrix(active);
      if (registered && isMounted) {
        setIsRegistered(true);
        router.replace("/dashboard");
        return;
      }

      if (isMounted) {
        setIsRegistered(false);
      }
    };

    checkStatus();
    return () => {
      isMounted = false;
    };
  }, [address, router]);

  if (isRegistered === true) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mb-3" />
        <div className="text-[14px] font-bold text-[#0F172A]">Matrix Slot 1 Active</div>
        <div className="text-[12px] text-slate-500 mt-1">Redirecting to your live dashboard...</div>
      </div>
    );
  }

  return <MatrixAccessGate isStandaloneGate={true} />;
}

export default function GatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        </div>
      }
    >
      <GateContent />
    </Suspense>
  );
}
