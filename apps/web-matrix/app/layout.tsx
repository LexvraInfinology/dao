import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/Toaster";

const plusJakartaSans = {
  variable: "--font-plus-jakarta",
};

export const metadata: Metadata = {
  title: "EquoraFiMatrix | The Matrix Built to Move",
  description: "EquoraFiMatrix — Next-gen decentralized recursive matrix system engineered for sustainable yield, automated spillover, and verified on-chain transparency.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

import { ReferralTracker } from "@/components/common/ReferralTracker";
import { MagicBlindBoxWidget } from "@/components/blindbox/MagicBlindBoxWidget";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} antialiased`} suppressHydrationWarning>
      <body className="min-h-screen bg-[#f1f5f9] text-[#0f172a] font-sans overflow-x-hidden selection:bg-blue-600 selection:text-white" suppressHydrationWarning>
        <ReferralTracker />
        {children}
        <MagicBlindBoxWidget />
        <Toaster />
      </body>
    </html>
  );
}
