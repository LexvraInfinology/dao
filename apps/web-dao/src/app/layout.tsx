import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/context/Providers';

export const metadata: Metadata = {
  title: 'EQUORA_Fi — Higher Ranks. A Brighter Tomorrow.',
  description:
    'A global decentralized community built on trust, transparency, and shared growth. 12 Levels, 4 Dedicated Reward Pools, Genesis DAO Council.',
  keywords: [
    'EQUORA',
    'EQUORA_Fi',
    'Genesis DAO',
    'DeFi',
    'Web3',
    'Decentralized Autonomous Organization',
  ],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon.png', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-[#F0F4F8] text-[#071A4A] antialiased selection:bg-[#155EEF] selection:text-white"
      >
        {/* WalletProvider → AuthProvider must be nested in this order */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
