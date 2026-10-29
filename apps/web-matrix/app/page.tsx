import React from "react";
import {
  HeroSection,
  HowItWorksSection,
  ActivitySection,
  MatrixMechanismSection,
  PoolsSection,
  BlindBoxSection,
  FaqSection,
  FooterSection,
} from "@/components/landing";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f1f5f9] text-[#0f172a] font-sans antialiased overflow-x-hidden m-0 p-0 flex flex-col">

      <HeroSection />

      <HowItWorksSection />

      <ActivitySection />

      <MatrixMechanismSection />

      <PoolsSection />

      <BlindBoxSection />

      <FaqSection />

      <FooterSection />
    </div>
  );
}
