import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Web3Providers } from "../components/web3/Web3Providers";
import { Navbar } from "../components/layout/Navbar";
import { BottomNav } from "../components/layout/BottomNav";
import "../styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "B-TITAN — Web3 Matrix Platform",
  description:
    "Join the B-TITAN decentralized matrix platform. Earn with the Genesis DAO, 12-slot matrix, referral rewards, and Magic Box milestones.",
  keywords: ["Web3", "Matrix", "DAO", "DeFi", "Crypto", "B-TITAN", "Earn"],
  openGraph: {
    title: "B-TITAN — Web3 Matrix Platform",
    description: "Earn with the B-TITAN decentralized matrix",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} data-scroll-behavior="smooth">
      <body className="btitan-app">
        <Web3Providers>
          {/* Desktop + Mobile Top Navbar */}
          <Navbar />

          {/* Main Content Area */}
          <main className="main-content">
            {children}
          </main>

          {/* Mobile Bottom Navigation */}
          <BottomNav />
        </Web3Providers>
      </body>
    </html>
  );
}
