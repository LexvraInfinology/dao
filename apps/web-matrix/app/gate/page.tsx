"use client";

import React, { Suspense } from "react";
import { MatrixAccessGate } from "@/components/matrix/MatrixAccessGate";

export default function GatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        </div>
      }
    >
      <MatrixAccessGate isStandaloneGate={true} />
    </Suspense>
  );
}
