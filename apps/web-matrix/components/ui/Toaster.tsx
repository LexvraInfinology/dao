"use client";

import React from "react";
import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      theme="light"
      toastOptions={{
        style: {
          fontFamily: "var(--font-plus-jakarta), sans-serif",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          boxShadow:
            "0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)",
          padding: "14px 16px",
        },
        classNames: {
          toast: "font-sans",
          title: "text-[13.5px] font-bold text-[#0f172a]",
          description: "text-[12px] text-[#64748b] mt-0.5",
          actionButton:
            "bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[12px] font-bold rounded-xl px-3 py-1.5 transition-colors",
          cancelButton:
            "bg-[#f1f5f9] text-[#64748b] text-[12px] font-medium rounded-xl px-3 py-1.5",
          closeButton:
            "border-[#e2e8f0] text-[#94a3b8] hover:text-[#0f172a] hover:bg-[#f1f5f9] transition-colors",
        },
      }}
    />
  );
}
