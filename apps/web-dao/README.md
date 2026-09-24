# EQUORA_Fi

EQUORA_Fi is a Web3 decentralized protocol frontend application built with Next.js (App Router), React, TypeScript, and Tailwind CSS. The application consists of a public-facing marketing landing page and the Genesis DAO suite for protocol governance, seat allocation, treasury monitoring, and member lounge interactions.

---

## Tech Stack

- Framework: Next.js 14.2.15 (App Router)
- Library: React 18.3.1
- Language: TypeScript 5.6.3
- Styling: Tailwind CSS 3.4.14, PostCSS 8.4.47, Autoprefixer 10.4.20
- Icons: Lucide React 0.453.0
- Utility Libraries: clsx 2.1.1, tailwind-merge 2.5.4, sharp 0.35.4
- Fonts: Inter, Plus Jakarta Sans, Sora, JetBrains Mono (imported via Google Fonts in globals.css)

---

## Project Structure

```
eq/
├── figma_reference/              # Design references, exports, and screen comparisons
├── public/                       # Static assets
│   ├── assets/                   # Feature graphics and pool card illustrations
│   ├── dao/                      # 3D visuals, crystal graphics, and avatars for the DAO suite
│   ├── landing/                  # Panoramic backgrounds and illustrations for the landing page
│   ├── apple-touch-icon.png
│   ├── favicon.ico
│   ├── favicon.svg
│   └── icon.png
├── src/
│   ├── app/                      # Next.js App Router routes and root configurations
│   │   ├── dao/                  # Genesis DAO application routes
│   │   │   ├── lounge/page.tsx
│   │   │   ├── matrix/page.tsx   # Alias redirect to matrix-bridge
│   │   │   ├── matrix-bridge/page.tsx
│   │   │   ├── profile/page.tsx
│   │   │   ├── seats/page.tsx
│   │   │   ├── settings/page.tsx
│   │   │   ├── transactions/page.tsx
│   │   │   ├── treasury/page.tsx
│   │   │   ├── layout.tsx        # Persistent DAO shell (Sidebar and Header)
│   │   │   └── page.tsx          # Main DAO Council Dashboard
│   │   ├── globals.css           # Global typography, color scheme, and 3D card CSS utilities
│   │   ├── layout.tsx            # Root HTML layout and metadata configuration
│   │   └── page.tsx              # Public Landing Page (/)
│   ├── components/               # React UI components
│   │   ├── dao/                  # Components scoped to the DAO suite
│   │   │   ├── lounge/           # Member lounge cards and Soulbound pass inspection
│   │   │   ├── matrix/           # Matrix bridge countdown and feature cards
│   │   │   ├── profile/          # Member profile metrics and recent activity
│   │   │   ├── seats/            # 100-seat interactive matrix and seat inspector
│   │   │   ├── settings/         # Account identity, wallet, security, privacy, and notifications
│   │   │   ├── transactions/     # Transaction table, mobile list, and filters
│   │   │   └── treasury/         # Reserve balances, asset breakdown, and withdrawal simulation
│   │   ├── landing/              # Components for the public landing page sections
│   │   ├── layout/               # Shared structural components (DaoHeader, DaoSidebar, Navbar, Footer)
│   │   └── ui/                   # Reusable UI primitives (FlipCard, VideoModal, WalletModal)
│   ├── data/                     # Mock data sets, navigation links, and content definitions
│   │   ├── councilSeatsData.ts
│   │   ├── daoData.ts
│   │   ├── navigation.ts
│   │   ├── siteContent.ts
│   │   └── transactionsData.ts
│   └── types/                    # TypeScript interfaces and shared type declarations
│       └── index.ts
├── next.config.mjs               # Next.js configuration
├── package.json                  # Dependencies, scripts, and package metadata
├── postcss.config.mjs            # PostCSS plugin definitions
├── tailwind.config.ts            # Tailwind breakpoints, custom color palette, and shadows
└── tsconfig.json                 # TypeScript compiler configuration
```

---

## Main Pages and Routes

### Public Landing Page
- `/`: Marketing landing page presenting the protocol value proposition, the 100-seat Genesis Queue, 300/N cashback algorithm, queue simulator, live on-chain activity stream, TrobChain integration, FAQ accordion, and footer navigation.

### Genesis DAO Suite
- `/dao`: Council Dashboard with protocol metrics, countdown timer, interactive 300/N calculator, protocol video modal trigger, and retail matrix launch preview.
- `/dao/seats`: Council Seats Matrix featuring an interactive 100-seat visual grid, seat inspection drawer/modal, cashback breakdown, and minting instructions.
- `/dao/lounge`: Member Lounge showcasing a 3D holographic Soulbound Pass card, earnings cap gauge, income channels breakdown, and claimable dividends.
- `/dao/matrix-bridge`: Retail Matrix Bridge providing a countdown to the Day 22 matrix launch, cross-chain distribution stats, and matrix level preview. `/dao/matrix` routes directly to this page.
- `/dao/treasury`: DAO Treasury with on-chain reserve vault totals, asset composition, and an interactive withdrawal simulator.
- `/dao/transactions`: Transactions Ledger containing verified on-chain transactions with search, type filters, desktop table view, and mobile card list.
- `/dao/profile`: Member Profile displaying connected identity details, voting power, participation statistics, and recent activity history.
- `/dao/settings`: Account and protocol preferences organized across five tabbed views: Identity, Connected Wallet, Security, Privacy, and Notifications.

---

## Important Components and Purpose

### Layout Components (`src/components/layout/`)
- `DaoSidebar.tsx`: Desktop sidebar providing persistent navigation across all eight DAO screens, brand logo, community links, and active route indication.
- `DaoHeader.tsx`: Top header for DAO views containing global search, live protocol status indicator, notification trigger, connected wallet chip, avatar, and mobile navigation drawer.
- `Navbar.tsx` & `Footer.tsx`: Modular navigation bar and footer components.

### Landing Page Components (`src/components/landing/`)
- `LandingNavbar.tsx`: Fixed navigation bar with a subtle frosted background (`bg-white/95 backdrop-blur-xl`), smooth-scroll section links, and Launch App CTA.
- `LandingHero.tsx`: Primary landing hero section with headline, CTA buttons, background artwork, and two-statistic capsule card.
- `LandingMovement.tsx`: Community narrative section highlighting core protocol principles.
- `LandingQueueArena.tsx`: Visual display of the 100-seat Genesis Queue structure and mechanics.
- `LandingSimulator.tsx`: Interactive seat calculator demonstrating cashback and net cost outcomes.
- `LandingLiveActivity.tsx`: Live stream of protocol activity with status badges and full-width panoramic background composition.
- `LandingTrobChain.tsx`: Technical section detailing network advantages and TrobChain integration.
- `LandingFaq.tsx`: Expandable/collapsible accordion addressing frequently asked questions.
- `LandingFooter.tsx`: Cosmic landscape footer containing brand information, sitemap columns, and social links.

### Shared UI Components (`src/components/ui/`)
- `FlipCard.tsx`: Reusable CSS 3D perspective wrapper for two-sided interactive card reveals.
- `VideoModal.tsx`: Accessible dialog modal for embedded protocol video playback.
- `WalletModal.tsx`: Web3 wallet connection modal interface.

---

## Asset Organization

Static media files are separated by application domain within the `public/` directory:

- `public/landing/`: High-resolution graphics and panoramic illustrations used on the landing page (`hero-bg.png`, `activity-boy.png`, `queue-arena.png`, `movement-hands.png`, `trobchain-cube.png`, `footer-cosmic.png`).
- `public/dao/`: 3D crystal shapes, polyhedral vectors, avatars, and badge graphics used across the DAO portal (`Central 3D Vector Polygonal Floating Ethereum-Style Shape.png`, `Futuristic 3D Crystalline Soulbound Asset graphic.png`, `Logos.png`, etc.).
- `public/assets/`: Specific pool and tier illustrations.
- `public/`: Root static assets including `favicon.ico`, `favicon.svg`, `icon.png`, and `apple-touch-icon.png`.

---

## How to Run Locally

### Prerequisites
- Node.js version 18.17.0 or higher (v20+ recommended)
- npm or yarn

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

---

## Development Notes and Conventions

1. Custom Breakpoints:
   The Tailwind configuration (`tailwind.config.ts`) customizes the breakpoint scale:
   - `xs`: 320px
   - `sm`: 375px
   - `mds`: 425px
   - `md`: 768px
   - `lg`: 1024px
   - `xl`: 1280px
   - `2xl`: 1440px
   Because `sm` is defined as `375px` (unlike Tailwind's default `640px`), layout-switching responsive rules between mobile and desktop/tablet presentation should use `md:` (768px) or `lg:` (1024px).

2. Viewport Safety on Narrow Screens:
   All page views and root containers enforce `overflow-x-hidden` and `w-full max-w-full`. Spacing and padding scales down gracefully to `320px` viewports (`px-3.5`) to prevent horizontal layout overflow.

3. Client vs Server Components:
   Interactive views that utilize React state, effects, event handlers, or browser APIs declare `'use client'` at the top of the file in accordance with Next.js App Router conventions.

4. Centralized Data:
   Mock metrics, member details, transaction records, and navigation links are maintained in `src/data/` to keep component implementations clean and maintainable.
