import React from 'react';
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

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F0F4F8] text-[#0B132B] selection:bg-[#155EEF] selection:text-white font-inter">
      {/* 1. Header / Navbar */}
      <LandingNavbar />

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

