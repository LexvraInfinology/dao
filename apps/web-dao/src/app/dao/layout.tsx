import React from 'react';
import { DaoSidebar } from '@/components/layout/DaoSidebar';
import { DaoHeader } from '@/components/layout/DaoHeader';
import { DaoOnboardingModal } from '@/components/dao/DaoOnboardingModal';
import { DaoWhatsAppCircle } from '@/components/dao/DaoWhatsAppCircle';

export default function DaoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F7FBFF] flex text-[#14304A] font-sans antialiased overflow-x-hidden relative">
      {/* Persistent sidebar — desktop only */}
      <DaoSidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <DaoHeader />
        <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-[1400px] w-full mx-auto overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* New user onboarding modal gate */}
      <DaoOnboardingModal />

      {/* Round circle for WhatsApp — strictly for verified DAO seat members */}
      <DaoWhatsAppCircle variant="floating" />
    </div>
  );
}
