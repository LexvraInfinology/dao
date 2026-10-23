import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/Toaster";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://equorafimatrix.com"),
  title: "Equora Matrix | The Matrix Built to Move",
  description: "Next-gen decentralized multi-layered matrix system engineered for sustainable peer-to-peer distribution, automated spillover, and verified on-chain transparency on TrobChain.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Equora Matrix | The Matrix Built to Move",
    description: "Algorithmic 12-Slot, 14-Node decentralized matrix protocol with non-custodial payouts on TrobChain.",
    url: "https://equorafimatrix.com",
    siteName: "Equora Matrix",
    locale: "en_US",
    type: "website",
  },
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
        <Toaster />
      </body>
    </html>
  );
}
