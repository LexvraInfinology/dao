import React from 'react';
import { DaoSidebar } from '@/components/layout/DaoSidebar';
import { DaoHeader } from '@/components/layout/DaoHeader';

export default function DaoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F6F9FF] flex text-[#071A4A] font-jakarta overflow-x-hidden">
      {/* Persistent Sidebar for Desktop */}
      <DaoSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <DaoHeader />
        <main className="flex-1 p-3 xs:p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
