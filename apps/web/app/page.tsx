"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { LandingNavbar } from "../components/landing/LandingNavbar";
import { HeroSection } from "../components/landing/HeroSection";
import { AboutMovementSection } from "../components/landing/AboutMovementSection";
import { GlobalNetworkSection } from "../components/landing/GlobalNetworkSection";
import { ExplainerVideoSection } from "../components/landing/ExplainerVideoSection";
import { LiveActivityFeedSection } from "../components/landing/LiveActivityFeedSection";
import { TierLevelsSection } from "../components/landing/TierLevelsSection";
import { FaqSection } from "../components/landing/FaqSection";
import { LandingFooter } from "../components/landing/LandingFooter";
import { LoginRegisterModal } from "../components/auth/LoginRegisterModal";
import { TitanBot } from "../components/titanbot/TitanBot";

export default function LandingPage() {
  const { isConnected } = useAccount();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAssistantModal, setShowAssistantModal] = useState(false);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-col w-full bg-[#F0F4F8] text-[#0A1628] selection:bg-[#2563EB] selection:text-white min-h-screen overflow-x-hidden font-sans">
      {/* ─── 1. Header & Navigation ─────────────────────────────────────── */}
      <LandingNavbar onOpenAuth={() => setShowAuthModal(true)} />

      {/* ─── 2. Hero Section with Integrated 4-Feature Cards Dock ──────── */}
      <HeroSection
        onJoinMovement={() => setShowAuthModal(true)}
        onWatchStory={() => scrollToSection("network")}
      />

      {/* ─── 4. About Us / Movement Section ─────────────────────────────── */}
      <AboutMovementSection />

      {/* ─── 5. The EQUORA Global Network Section ───────────────────────── */}
      <GlobalNetworkSection />

      {/* ─── 6. Explainer Video Section ─────────────────────────────────── */}
      <ExplainerVideoSection />

      {/* ─── 7. Live Activity Stream Section ────────────────────────────── */}
      <LiveActivityFeedSection />

      {/* ─── 8. Tier Levels & Rewards Matrix ────────────────────────────── */}
      <TierLevelsSection />

      {/* ─── 9. FAQs Section ────────────────────────────────────────────── */}
      <FaqSection />

      {/* ─── 10. Footer ─────────────────────────────────────────────────── */}
      <LandingFooter />

      {/* ─── Modals & Floating Assistant ────────────────────────────────── */}
      <LoginRegisterModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* Floating AI Assistant Bot Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setShowAssistantModal(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer border-2 border-white/80"
          aria-label="Open AI Assistant"
        >
          <span className="text-2xl">🤖</span>
        </button>
      </div>

      {/* Assistant Support Modal */}
      {showAssistantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-slate-900 text-white border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setShowAssistantModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 text-sm cursor-pointer"
            >
              ✕
            </button>
            <div className="flex items-center gap-4 mb-4">
              <TitanBot variant="companion" state="welcome" interactive={false} />
              <div>
                <h3 className="text-base font-bold text-white">Equora AI Assistant</h3>
                <p className="text-xs text-blue-400 font-mono">Autonomous Protocol Support</p>
              </div>
            </div>
            <div className="bg-slate-950 rounded-2xl p-4 text-xs text-slate-300 space-y-2.5 border border-slate-800 mb-5">
              <p>🌐 <strong>Autonomous Architecture:</strong> 100% decentralized non-custodial execution.</p>
              <p>⚡ <strong>Genesis DAO:</strong> 100 founding seats receive instant push payouts directly to your wallet.</p>
              <p>🔢 <strong>12-Slot Matrix:</strong> 14-node hierarchy with auto-upgrades and 4-bucket reward pools.</p>
            </div>
            <button
              onClick={() => setShowAssistantModal(false)}
              className="w-full py-3.5 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-blue-500 transition-colors shadow-md cursor-pointer"
            >
              Close Assistant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
