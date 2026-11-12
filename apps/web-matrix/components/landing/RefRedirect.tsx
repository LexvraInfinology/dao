"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function RefRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const search = window.location.search;
    if (!search) return;

    const params = new URLSearchParams(search);
    const ref = (params.get("ref") || params.get("sponsor") || params.get("code") || "").trim();
    if (ref) {
      localStorage.setItem("equora_sponsor", ref);
      try {
        sessionStorage.setItem("equora_sponsor", ref);
      } catch {}
      router.replace(`/gate${search}`);
    }
  }, [router]);

  return null;
}

