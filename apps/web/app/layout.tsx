import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Web3Providers } from "../components/web3/Web3Providers";
import { EquoraAppShell } from "../components/layout/EquoraAppShell";
import "../styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "EQUORA_Fi — Autonomous Web3 Protocol",
  description:
    "Join EQUORA_Fi — the fully autonomous, peer-to-peer decentralized financial protocol. Earn with the 100-Seat Genesis DAO, 12-slot matrix, referral rewards, and Magic Box milestones.",
  keywords: ["Web3", "Matrix", "DAO", "DeFi", "Crypto", "EQUORA_Fi", "Equora", "Earn", "TROB"],
  openGraph: {
    title: "EQUORA_Fi — Autonomous Web3 Protocol",
    description: "Earn with the EQUORA_Fi decentralized matrix platform",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} dark`} data-scroll-behavior="smooth">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Inter:wght@100..900&display=swap"
        />
      </head>
      <body className="bg-background text-on-surface">
        <Web3Providers>
          <EquoraAppShell>{children}</EquoraAppShell>
        </Web3Providers>
      </body>
    </html>
  );
}
