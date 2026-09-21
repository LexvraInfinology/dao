"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { EquoraSidebar } from "../navigation/EquoraSidebar";
import { EquoraHeader } from "../navigation/EquoraHeader";
import { EquoraMobileNav } from "../navigation/EquoraMobileNav";

export function EquoraAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col relative font-body-md antialiased selection:bg-secondary/30 selection:text-white">
      {/* 280px Fixed Terminal Sidebar (for dApp routes) */}
      <EquoraSidebar />

      {/* Top Header Bar (Only for dApp routes) */}
      {!isLanding && <EquoraHeader />}

      {/* Main Content Area */}
      <main
        className={`flex-1 w-full min-h-screen transition-all ${
          isLanding ? "pl-0 pt-0 pb-0" : "pl-0 lg:pl-[280px] pt-16 pb-20 lg:pb-8"
        }`}
      >
        {children}
      </main>

      {/* Mobile Bottom Navigation (for screens < 1024px) */}
      <EquoraMobileNav />
    </div>
  );
}

export const TitanAppShell = EquoraAppShell;
