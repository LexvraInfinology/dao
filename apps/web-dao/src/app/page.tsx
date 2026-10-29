import React from 'react';
import { Poppins } from 'next/font/google';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingHero } from '@/components/landing/LandingHero';
import { LandingMovement } from '@/components/landing/LandingMovement';
import { LandingQueueArena } from '@/components/landing/LandingQueueArena';
import { LandingSimulator } from '@/components/landing/LandingSimulator';
import { LandingLiveActivity } from '@/components/landing/LandingLiveActivity';
import { LandingTrobChain } from '@/components/landing/LandingTrobChain';
import { LandingTrobSafeDownload } from '@/components/landing/LandingTrobSafeDownload';
import { LandingFaq } from '@/components/landing/LandingFaq';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { UnderfundedAlertBanner } from '@/components/dao/UnderfundedAlertBanner';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

export default function HomePage() {
  return (
    <main className={`${poppins.variable} font-poppins landing-page-root min-h-screen bg-[#F0F4F8] text-[#0B132B] selection:bg-[#155EEF] selection:text-white overflow-x-clip`}>
      {/* 1. Header / Navbar */}
      <LandingNavbar />

      {/* Underfunded Status Banner (Renders ONLY when member has incomplete deposit, leaves 0px gap when inactive) */}
      <UnderfundedAlertBanner className="mt-20 sm:mt-24 mb-2 px-4 sm:px-6 max-w-7xl mx-auto w-full z-20 relative" />

      {/* 2. Hero Section: 100 Seats. One Council A Shared Future. */}
      <LandingHero />

      {/* 3. Movement Section: We're not just a DAO. We're a movement. */}
      <LandingMovement />

      {/* 4. Genesis Queue Section: 100 Seats One Genesis Queue. */}
      <LandingQueueArena />

      {/* 5. Simulator Section: Your Seat Is Next. Your Position Is Automatic. */}
      <LandingSimulator />

      {/* 6. Live Activity Section: The Genesis Queue Is Always Moving. */}
      <LandingLiveActivity />

      {/* 7. TrobChain Section: Why We Choose TrobChain. */}
      <LandingTrobChain />

      {/* 8. Official TrobSafe Wallet Download Section */}
      <LandingTrobSafeDownload />

      {/* 9. FAQ Section: Got Questions? */}
      <LandingFaq />

      {/* 10. Cosmic Landscape Footer */}
      <LandingFooter />
    </main>
  );
}

