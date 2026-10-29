# EQUORA_Fi

EQUORA_Fi is a Web3 decentralized protocol frontend application built with Next.js (App Router), React, TypeScript, and Tailwind CSS. The application consists of a public-facing marketing landing page and the Genesis DAO suite for protocol governance, seat allocation, treasury monitoring, and member lounge interactions.

---

## Tech Stack

- Framework: Next.js 14.2.15 (App Router)
- Library: React 18.3.1
- Language: TypeScript 5.6.3
- State Management: Zustand 5.0.15 (with DevTools, atomic selectors, and SSR hydration utilities)
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
│   ├── stores/                   # Standardized Zustand state management architecture
│   │   ├── templates/            # Boilerplate templates for new domain stores
│   │   ├── utils/                # Atomic selector generator and SSR hydration helpers
│   │   ├── types.ts              # Store types and action resetters
│   │   ├── useAppStore.ts        # Foundational application & global UI state store
│   │   ├── README.md             # In-depth store documentation and guides
│   │   └── index.ts              # Central state management barrel export
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

## State Management (Zustand Architecture)

The application utilizes Zustand 5 for lightweight, modular, and reactive state management. It is designed to prepare `web-dao` for future features, eliminating prop-drilling and preserving shared client state across page navigation without triggering hard page reloads.

### Architectural Highlights

1. **State Persistence Across Page Navigation**:
   - Navigation across the DAO suite (`/dao`, `/dao/seats`, `/dao/treasury`, etc.) is powered by Next.js App Router client-side routing (`<Link href="...">`).
   - In-memory Zustand stores remain intact during client route transitions. Navigating between views does not discard active selections, draft form state, or cached data.
2. **Prop-Drilling Prevention via Atomic Selectors**:
   - Rather than passing state through deeply nested component trees, components directly hook into stores.
   - The custom `createSelectors` utility auto-generates atomic selector hooks (`useStore.use.<key>()`). Components only re-render when the exact field they subscribe to updates.
3. **SSR Hydration Safety**:
   - When stores use `persist` middleware with browser storage (`localStorage`), `useHydratedStore` and `useHydration` utilities prevent React 18 SSR hydration mismatches.
4. **DevTools & Resetability**:
   - Every store integrates with Redux DevTools for clear state inspection and action tracking in development.
   - Every store includes a typed `reset()` action restoring `initialState` cleanly.

### Directory Structure (`src/stores/`)

```
src/stores/
├── index.ts                      # Central barrel export for all stores, hooks, and types
├── types.ts                      # Shared types (AppNotification, StoreResetter)
├── useAppStore.ts                # Foundational application & global UI state store
├── utils/
│   ├── createSelectors.ts        # Auto-generates atomic selector hooks (.use.<property>())
│   └── useHydratedStore.ts       # SSR hydration-safe hooks for persisted stores
└── templates/
    └── createStoreTemplate.ts    # Standard copy-paste template for new domain stores
```

### Foundational Store: `useAppStore`

Provides foundational, app-wide UI and shell state:
- `sidebarOpen`: Controls responsive mobile/tablet navigation drawer.
- `activeModal` & `modalData`: Manages global modal state (wallet connection, video playback, etc.).
- `notification`: Global notification banner/toast messaging.

```tsx
'use client';

import { useAppStore } from '@/stores';

export const MyComponent = () => {
  // Option A: Auto-generated atomic selector (recommended)
  const sidebarOpen = useAppStore.use.sidebarOpen();
  const toggleSidebar = useAppStore.use.toggleSidebar();

  // Option B: Standard selector function
  const activeModal = useAppStore((state) => state.activeModal);

  return (
    <button onClick={toggleSidebar}>
      Toggle Drawer (Currently: {sidebarOpen ? 'Open' : 'Closed'})
    </button>
  );
};
```

### Guide: Adding New Domain Stores

When creating a new domain store (e.g. `useSeatsStore`, `useWalletStore`, `useProposalStore`):

1. **Copy the Template**: Duplicate `src/stores/templates/createStoreTemplate.ts` to `src/stores/use[Domain]Store.ts`.
2. **Define State & Actions**: Separate data interfaces from action methods:
   ```typescript
   export interface DomainState { ... }
   export interface DomainActions { ... }
   export type DomainStore = DomainState & DomainActions;
   ```
3. **Define `initialState`**: Ensure a clean baseline object is defined and used in your `reset()` action.
4. **Add Middleware**: Wrap with `devtools` (and optionally `persist` with `createJSONStorage(() => localStorage)` if persistence across browser reloads is needed).
5. **Export with Selectors**:
   ```typescript
   export const useDomainStore = createSelectors(useDomainStoreBase);
   ```
6. **Export from Barrel**: Add to `src/stores/index.ts`.

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
