import React from 'react';
import { DaoSidebar } from '@/components/layout/DaoSidebar';
import { DaoHeader } from '@/components/layout/DaoHeader';
import { DaoAccessGate } from '@/components/dao/DaoAccessGate';

export default function DaoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    /*
     * DaoAccessGate runs client-side checks:
     *   1. TrobSafe extension installed?
     *   2. Wallet connected?
     *   3. Address holds a Genesis Council seat?
     *   4. If not → show $300 TROB payment screen
     *   5. If yes → render the actual dashboard
     */
    <DaoAccessGate>
      <div className="min-h-screen bg-[#F6F9FF] flex text-[#071A4A] font-jakarta overflow-x-hidden">
        {/* Persistent sidebar — desktop only */}
        <DaoSidebar />

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
          <DaoHeader />
          <main className="flex-1 p-3 xs:p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </DaoAccessGate>
  );
}
