# Equora.Fi — UI/UX Master Design Specification (Page-by-Page)

> **Document Classification:** Official Product & UI/UX Designer Handoff Blueprint  
> **Target Audience:** UI/UX Designers, Product Designers, Design System Engineers, Frontend Developers  
> **Brand Identity:** Equora.Fi (Autonomous Web3 Wealth & Governance Protocol)  
> **Version:** 3.2.0 (Post-Audit 300/N Redistribution & Multi-Pool Update)  
> **Last Updated:** September 19, 2026

---

## 1. Executive Design Philosophy & Visual Identity

Equora.Fi is an autonomous, decentralized Web3 protocol operating on **Trobium Blockchain** with **TROB Coin** (and compatible with EVM networks such as Polygon). The visual experience must feel **ultra-premium, sovereign, cryptographically secure, and mathematically pure**.

### 1.1 Core Aesthetic Pillars
1. **Obsidian Sovereign Dark Mode**: Deep void backgrounds (`#0A0E17`, `#0F172A`) paired with glassmorphic cards, luminous neon borders, and subtle radial backlights.
2. **Mathematical Precision & Transparency**: Every formula, percentage, and reward distribution (especially the **`300 / N` Genesis DAO queue** and **14-Node Matrix Engine**) must be visually tangible with real-time sliders, interactive boards, and animated progress tickers.
3. **Frictionless Web3 Interactions**: 1-click approvals, clear transaction confirmations, instant feedback toasts, and prominent warning states for time-sensitive events (such as the 48-Hour DAO Re-Topup window).
4. **Mobile DApp Browser Optimization**: Designed mobile-first for Web3 mobile wallet browsers (TrobSafe, MetaMask, TrustWallet) at 375px–428px widths with sticky bottom navigation and thumb-friendly touch targets (min 44x44px).

---

## 2. Global Design System & Tokens

### 2.1 Color Tokens

| Token Name | HEX Code | CSS Variable | Semantic Usage |
| :--- | :--- | :--- | :--- |
| **Obsidian Base (Background)** | `#0A0E17` | `--background` | Main page canvas background |
| **Surface Dark** | `#0F172A` | `--surface-dark` | Base containers and page wrappers |
| **Surface Elevated** | `#1E293B` | `--surface-elevated` | Primary cards, panels, and modals |
| **Surface Highest (Hover)** | `#334155` | `--surface-hover` | Card hover states, pill backgrounds |
| **Emerald Cyber (Primary Accent)** | `#00E599` | `--primary-emerald` | Positive yields, active buttons, claim states |
| **Emerald Dark / Muted** | `#059669` | `--primary-muted` | Progress fills, subtle badges |
| **Electric Indigo (Secondary Accent)**| `#6366F1` | `--secondary-indigo` | Technology highlights, network badges |
| **Electric Blue** | `#3B82F6` | `--secondary-blue` | Secondary buttons, links, informational pills |
| **Sovereign Gold (VIP / DAO Accent)**| `#F59E0B` | `--accent-gold` | Genesis DAO Council seats, badges, VIP cards |
| **Crimson Warning / Urgent** | `#EF4444` | `--status-danger` | 48-Hour re-topup urgency, expiry alert |
| **Amber Caution** | `#F97316` | `--status-warning` | Pending approvals, nearing capacity alerts |
| **Text Primary (On Surface)** | `#F8FAFC` | `--text-primary` | Headings, major data points, labels |
| **Text Secondary (Muted)** | `#94A3B8` | `--text-secondary` | Explanatory copy, subtitles, formulas |
| **Outline / Border Subtle** | `rgba(255,255,255,0.08)` | `--border-subtle` | 1px card borders, table row dividers |
| **Outline Focus / Glow** | `rgba(0, 229, 153, 0.3)` | `--border-glow` | Hover glow, active input field outlines |

### 2.2 Typography System

| Style Level | Font Family | Size (Desktop) | Size (Mobile) | Weight | Line Height |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Display** | DM Sans / Outfit | 48px – 56px | 32px – 38px | Bold (800) | 1.1 |
| **Page Headline** | DM Sans / Outfit | 32px – 40px | 24px – 28px | Bold (700) | 1.2 |
| **Section Title** | DM Sans / Inter | 20px – 24px | 18px – 20px | SemiBold (600) | 1.3 |
| **Body Large** | Inter | 16px | 15px | Regular (400) / Medium (500) | 1.5 |
| **Body Regular** | Inter | 14px | 13px | Regular (400) | 1.5 |
| **Caption / Subtext** | Inter | 12px | 11px | Regular (400) / Medium (500) | 1.4 |
| **Monospace / Numbers** | JetBrains Mono / Space Mono | 14px – 18px | 13px – 16px | Bold (700) / SemiBold (600) | 1.2 |

*Note: All wallet addresses, transaction hashes, mathematical formulas, and numerical balances must strictly use monospace styling.*

### 2.3 Glassmorphism & Elevation Specs
- **Glass Card Background**: `background: rgba(15, 23, 42, 0.70); backdrop-filter: blur(20px);`
- **Glass Card Border**: `1px solid rgba(255, 255, 255, 0.08);`
- **Inner Top Bevel**: `box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.12);`
- **Outer Drop Shadow**: `box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5);`
- **Glow Accents**: Colored radial blur gradients (`width: 300px; height: 300px; filter: blur(120px); opacity: 0.15`) placed behind hero and featured cards.

---

## 3. Global Navigation & Layout Shell

### 3.1 Top Navigation Bar (`EquoraHeader`)
- **Height**: 72px (Desktop), 64px (Mobile).
- **Position**: Sticky (`top-0`, `z-50`) with `backdrop-blur-md` and subtle border bottom.
- **Components (Left to Right)**:
  1. **Brand Logo**: 3D Equora.Fi emblem + wordmark (`font-bold`, uppercase, emerald dot).
  2. **Desktop Navigation Links**:
     - *Dashboard* (`/dashboard`)
     - *Genesis DAO* (`/dao`) — with a pulsing Gold `100 Seats` badge
     - *Matrix Engine* (`/matrix`) — with an Emerald `12 Slots` pill
     - *Referrals* (`/referrals`)
     - *Value Pools* (`/rewards`)
     - *Internal Wallet* (`/wallet`)
  3. **Network Selector Pill**: Dropdown showing current network (Trobium Mainnet / Polygon PoS) with latency indicator (Green dot, "32ms").
  4. **Referral Badge (When Connected)**: Pill displaying user's 5-digit code (`ID: #10042`) with 1-click copy icon.
  5. **Language Switcher**: Globe icon dropdown (EN, ES, ZH, RU, HI, AR).
  6. **Wallet Connect Button**:
     - *Disconnected State*: "Connect Wallet" (Gradient button: Emerald to Indigo).
     - *Connected State*: Identicon avatar + shortened address (`0x7a2...4f9b`) + TROB balance pill.
  7. **Mobile Hamburger Menu**: Triggers full-screen slide-over drawer with all links, socials, and wallet disconnect.

### 3.2 Mobile Bottom Navigation Bar (DApp Viewport < 768px)
- **Height**: 60px fixed at bottom (`bottom-0`, `z-50`).
- **5 Icon Tabs**:
  1. Home / Dashboard (Icon: `dashboard`)
  2. Genesis DAO (Icon: `account_balance`, highlighted in Gold)
  3. Matrix (Icon: `hub`, highlighted in Emerald)
  4. Pools (Icon: `token`)
  5. Wallet (Icon: `account_balance_wallet`)

---

## 4. Page-by-Page UI/UX Specifications

---

### PAGE 1: Landing Page (`/`)
*Purpose: Educate visitors, present mathematical integrity, demonstrate perpetual cashflow mechanics, and convert visitors into registered members or Genesis DAO founders.*

#### Section 1: Hero Section
- **Background**: Deep obsidian canvas with animated geometric grid and dynamic particle orbs.
- **Tagline Pill**: Glowing badge: `✨ 100% Autonomous • Zero Admin Keys • Immutable Smart Contracts`.
- **Headline**: "Autonomous Wealth Architecture Built on Immutable Game Theory."
- **Subheadline**: "Equora merges a 100-Seat Sovereign Genesis DAO Council with a self-recycling 12-Slot Community Matrix, distributing 100% of all inflows instantly without human intermediaries."
- **Dual CTA Buttons**:
  - Primary CTA: "Enter DApp / Connect Wallet" (High-contrast emerald gradient, hover glow).
  - Secondary CTA: "Explore Genesis DAO Pass (300 TROB)" (Gold border, VIP icon).
- **Live Metric Ticker (4 Metrics in Glass Bar)**:
  1. Total Matrix Inflow Volume ($)
  2. Active Matrix Cycles Completed
  3. Genesis DAO Council Seats Claimed (X / 100)
  4. Distributed Protocol Royalties ($)

#### Section 2: Why Equora Solves Broken Ponzi / Drainer Flaws
- **Layout**: 2-Column Comparison Card (Old Fragile Models vs Equora Autonomous Architecture).
- **Left (Red Accent - Legacy Failures)**:
  - Central treasury honeypots vulnerable to rug-pulls.
  - Asymmetric founder pre-mines.
  - Unsustainable exponential debt spiral.
- **Right (Emerald Accent - Equora Invariants)**:
  - Zero protocol debt: Every dollar entering is distributed in the exact same transaction block.
  - Autonomous 14-Node auto-upgrades and board recycles.
  - Sovereign 300/N DAO redistribution engine.

#### Section 3: The 4 Protocol Value Pools Overview
- **Interactive 4-Card Grid**:
  1. **35% Genesis DAO Treasury**: Continuous passive royalties from matrix nodes 4, 5, and 14.
  2. **40% Monthly Salary Pool**: Predictable recurring income for leaders achieving Alpha, Beta, Gamma, and Crown milestones.
  3. **10% Magic Blind Box**: Quarterly decentralized mystery rewards for all active participants.
  4. **15% Community Lucky Drops**: Automated random yield distributions rewarding active slot holders.

#### Section 4: Interactive Matrix & Yield Calculator
- **Component**: Interactive slider where users pick starting slot (Slot 1: $30 up to Slot 12: $61,440) and simulated direct partners.
- **Output Cards**:
  - Immediate Direct Cashflow (600% ROI on 6 payout nodes).
  - Value Pools Contribution ($90 per cycle).
  - Monthly Salary Tier unlocked.

#### Section 5: Security, Audits, & Open Source Invariants
- Cards displaying Smart Contract addresses (Registry, Vault, Matrix, DAO, Pools) with 1-click copy and verified Trobium / Polygon block explorer links.
- Non-custodial guarantee badge.

#### Section 6: FAQ Accordion & Protocol Footer
- 8 searchable accordion items (Registration, $30 Entry, DAO 300/N math, 48h re-topup, Wallet compatibility).
- Footer: Documentation links (Whitepapers, Guides, Devops, Slide Decks), GitHub repo, Telegram, Twitter/X, Discord, and Disclaimer.

---

### PAGE 2: Executive Dashboard (`/dashboard`)
*Purpose: Central command center for authenticated users to view their network status, cumulative earnings, active matrix slots, and DAO council participation.*

#### Component 2.1: User Identity & VIP Rank Banner
- **Left Column**: User Avatar / Identicon + Connected Address (`0x1a23...7b89`) with copy button.
- **Center Column**:
  - 5-Digit Referral Code Badge: `ID: #10042` with 1-click shareable link.
  - Direct Sponsor Info: `Sponsor: #10001 (Root)`.
  - Qualification Status: `Qualified (2+ Directs)` in Emerald OR `Unqualified (Needs 2 Directs)` in Amber.
- **Right Column**: VIP Badges:
  - Genesis DAO Member badge (if owned: `Seat #14 • Soulbound NFT #14`).
  - Active Salary Tier badge (`Alpha Builder`).

#### Component 2.2: 4 Primary KPI Metric Tiles
1. **Total Net Protocol Yield**: Large font (e.g. `1,840.50 TROB / $1,840.50`), with all-time historical graph mini-sparkline.
2. **Direct Matrix Cashflow**: Total earned from 600% direct matrix payout nodes.
3. **DAO Treasury Dividends**: Cumulative yield pushed from 300/N queue and 35% global matrix stream.
4. **Internal Ledger Balance**: Immediately withdrawable funds (`Available: 420.00 TROB`) + "Instant Withdraw" button.

#### Component 2.3: Quick-Action Feature Gateway (3 Cards)
- **Card 1: Genesis DAO Council (3D Card Artwork)**:
  - Displays remaining seats (`82/100 claimed`).
  - Shows personal seat status or "Claim Seat #83 for 300 TROB".
  - CTA: "View 100-Seat Council & 300/N Calculator".
- **Card 2: 12-Slot Matrix Engine (Visual Matrix Slots)**:
  - Shows active slot progression (e.g., Slots 1–4 Active, Slot 5 Ready to Upgrade).
  - Quick upgrade CTA.
- **Card 3: 4 Value Pools & Monthly Salary**:
  - Live pool balances ticker.
  - Current milestone progress bar (e.g., 65% towards Beta Leader).

#### Component 2.4: Recent Protocol Events & Earnings Stream
- Real-time event log: "Received 150 TROB from DAO Member #2", "Slot 1 Cycle #3 completed (+$180)", "Referral #10088 registered".

---

### PAGE 3: Genesis DAO Council (`/dao`) — *DETAILED FOCUS AREA*
*Purpose: Dedicated governance and elite founding member dashboard featuring the 100-Seat visual council, the updated 300/N redistribution engine, the 3X earnings cap tracker, and the 48-hour re-topup urgency flow.*

```
+----------------------------------------------------------------------------------------------------+
|  GENESIS DAO FOUNDING COUNCIL (100 SOVEREIGN SEATS HARD-CAPPED)                                    |
|  Phase 1 Genesis Window: [ 14 Days 06 Hours Remaining ] | Capacity: [ 42 / 100 Seats Claimed ]     |
+----------------------------------------------------------------------------------------------------+
|  [ 100-SEAT VISUAL MATRIX GRID: 10 x 10 ]                                                          |
|  [01] [02] [03] [04] [05] ... [10]   Legend:                                                       |
|  [11] [12] [13] [14*] ...     [20]   [■] Filled (Claimed)  [★] Your Seat (#14)                    |
|  ...                                 [○] Available (Next)  [!] Urgent Re-topup (48h Default)       |
|  [91] [92] ...               [100]                                                                 |
+----------------------------------------------------------------------------------------------------+
|  300 / N INSTANT REDISTRIBUTION CALCULATOR & SIMULATOR                                             |
|  Slider: Select Incoming Member Position N: [======== 3 ========]                                  |
|  +------------------------+------------------------+----------------------+----------------------+ |
|  | Seat Entry Fee         | Instant Cashback       | Paid to Prior N-1    | Net Out-Of-Pocket    | |
|  | 300 TROB ($300)        | 100 TROB (300 / 3)     | 200 TROB (100 each)  | 200 TROB ($200)      | |
|  +------------------------+------------------------+----------------------+----------------------+ |
|  Live Payout Distribution Rule: Deposit (300) / Position (N) distributed equally to all active    |
|  members 1 to N, resulting in IMMEDIATE CASHBACK back to the joining member's wallet.             |
+----------------------------------------------------------------------------------------------------+
|  YOUR COUNCIL MEMBERSHIP STATUS: SEAT #14                                                           |
|  Cumulative Pushed Yield: 450 / 1,500 TROB [==================>             ] 30% of 5X Cap        |
|  48-Hour Re-Topup Timer: [ INACTIVE - Safe ] (Triggers when yield hits 1,500 TROB)                 |
|  35% Global Matrix Royalties Unclaimed: 124.50 TROB [ Claim Dividends Button ]                     |
+----------------------------------------------------------------------------------------------------+
```

#### Component 3.1: Council Header & Phase 1 Timer
- **Badge**: Sovereign Gold with Crown icon: `Genesis DAO • Sovereign Council`.
- **Title**: "Genesis DAO 100-Seat Council" (36px bold).
- **Description**: "An exclusive, immutable council capped at exactly 100 Soulbound seats. Council members receive an equal share of every incoming member's 300 TROB fee via the instant `300 / N` redistribution formula, plus 35% perpetual royalties from all global matrix operations."
- **Countdown Banner**: Phase 1 21-Day Genesis Countdown Clock (Days, Hours, Minutes, Seconds) with progress fill.

#### Component 3.2: The 100-Seat Visual Matrix Grid (10 x 10)
- **Grid Layout**: 10 columns by 10 rows on desktop; 5 columns by 20 rows on mobile.
- **Seat Cell Visual Specifications (Each Seat 1 to 100)**:
  - **Size**: 48x48px (Desktop), 40x40px (Mobile).
  - **Border Radius**: 12px.
  - **State 1: Filled / Claimed Seat**:
    - Background: `rgba(245, 158, 11, 0.12)`.
    - Border: `1px solid rgba(245, 158, 11, 0.4)`.
    - Content: Seat number (`#01`, `#02`, etc.) in gold monospace font + tiny verified badge.
  - **State 2: Available Seat (Next in Queue)**:
    - Background: `rgba(0, 229, 153, 0.10)`.
    - Border: `2px solid #00E599` with active pulsing animation.
    - Content: Seat number with a pulsing `+` icon indicating "Next Available".
  - **State 3: User's Own Seat**:
    - Background: Gradient from `#F59E0B` to `#00E599` with elevated drop-shadow glow.
    - Content: Crown icon 👑 + "YOU" + Seat number.
  - **State 4: Vacant / Defaulted Seat (Missed 48-Hour Re-Topup)**:
    - Background: `rgba(239, 68, 68, 0.15)`.
    - Border: `1px dashed #EF4444`.
    - Content: Warning exclamation icon `!` + "VACANT" (Claimable by any user).
  - **State 5: Future Locked Seat**:
    - Background: `rgba(255, 255, 255, 0.03)`.
    - Border: `1px solid rgba(255, 255, 255, 0.06)`.
    - Content: Dimmed seat number (`#89`).

#### Component 3.3: Seat Hover & Click Tooltip (`DAOSlotTooltip`)
When hovering over or tapping any seat:
- **Header**: `Seat #[N] • Soulbound NFT #[N]`.
- **Status**: `Active Founder` / `Your Seat 👑` / `Available to Claim`.
- **Owner Address**: Monospace short address (`0x8b3...22c1`) with block explorer link.
- **Total Yield Received**: In TROB and USD (`542.50 TROB ($542.50)`).
- **Cap Status**: Current yield progress towards 1,500 TROB (5X cap).

#### Component 3.4: The `300 / N` Instant Redistribution Engine & Calculator
*Crucial Section: Designers must clearly illustrate the `300 / N` formula so users instantly understand that the joiner gets money back on the spot.*

- **Interactive Seat Slider**: Slider range from `1` to `100`.
- **Mathematical Formula Display**:
  $$\text{Payout Per Member} = \frac{300 \text{ TROB}}{N}$$
- **4 Live Metric Tiles (React dynamically as user adjusts slider $N$)**:
  1. **Fixed Deposit Fee**: Always `300 TROB ($300)`.
  2. **Instant Cashback to Joining Member**: Calculated as `300 / N TROB` (Paid directly into new member's wallet in the same transaction!).
  3. **Paid to Prior Existing Members**: Total `300 - (300 / N) TROB` split equally among prior $N - 1$ members.
  4. **Effective Net Out-of-Pocket Cost**: `300 - (300 / N) TROB`.
- **Step-by-Step Practical Examples in Design Callout**:
  - **Member 1 ($N = 1$)**: Deposits 300 TROB $\rightarrow$ Receives $300 / 1 = \mathbf{300\text{ TROB}}$ returned instantly into their wallet. **Effective cost: \$0.00**. Seat #1 is permanently secured!
  - **Member 2 ($N = 2$)**: Deposits 300 TROB $\rightarrow$ Receives $300 / 2 = \mathbf{150\text{ TROB}}$ back immediately. Remaining **150 TROB** goes to Member 1.
  - **Member 3 ($N = 3$)**: Deposits 300 TROB $\rightarrow$ Receives $300 / 3 = \mathbf{100\text{ TROB}}$ back immediately. Member 1 receives **100 TROB**, Member 2 receives **100 TROB**.
  - **Member 100 ($N = 100$)**: Deposits 300 TROB $\rightarrow$ All 100 members (including Member 100) receive exactly **3.00 TROB** each!
- **Cumulative Lifetime Earnings Projection for Member 1**:
  - Based on the Harmonic Series: $\sum_{k=1}^{100} \frac{300}{k} = 300 \times H_{100} \approx \mathbf{1,556.21\text{ TROB}}$ (**5.19X ROI** on a net \$0 seat!).

#### Component 3.5: 5X Earnings Cap & 48-Hour Re-Topup Urgency Module
- **Cap Progress Bar**: Displays `Earned / 1,500 TROB` with percentage fill.
- **Normal State (< 1,500 TROB)**:
  - Green progress bar with caption: "Safe — Re-topup not required yet."
- **Urgent State (≥ 1,500 TROB Earned)**:
  - Vibrant Red/Amber flashing alert border.
  - Flashing Icon: Warning Triangle.
  - Headline: "⚠️ 5X CAP REACHED (1,500 TROB) — 48-HOUR RE-TOPUP WINDOW ACTIVE".
  - Countdown Clock: Huge digital timer showing exact remaining time: `41h : 22m : 18s`.
  - Explanation: "To keep your seat active and continue receiving payouts from incoming members and the 35% matrix pool, re-topup with 300 TROB before the timer hits zero. If the timer expires, your seat will be blanked and opened for public claim."
  - Action Button: Prominent red-to-amber button: "Re-Topup 300 TROB (Reset 5X Cap)".

#### Component 3.6: 1–100 Vacancy Scan & Claim Mechanism
- When a member fails to re-topup within 48 hours, their seat is blanked on-chain.
- The next incoming user automatically fills the **lowest vacant seat index between 1 and 100**.
- Visual representation: A banner appears if a vacant seat < current filled count exists:
  - "⚡ Rare Vacancy Detected! Seat #7 is open for takeover. Join now to claim an elite low-index seat!"

#### Component 3.7: 35% Global Matrix Treasury Stream Widget
- **Live Treasury Accumulator**: Shows real-time balance of TROB routed from Matrix Nodes 4, 5, and 14 across the entire network.
- **Your Unclaimed Dividend**: E.g., `87.40 TROB ($87.40)`.
- **Action Button**: "Claim DAO Dividends" (Calls `claimYield()`).

---

### PAGE 4: 12-Slot Community Matrix Engine (`/matrix`)
*Purpose: Interactive visualization of the 14-Node single-leg matrix board, slot navigation (Slots 1–12), auto-upgrade triggers, and payout distribution.*

```
+----------------------------------------------------------------------------------------------------+
|  12-SLOT MATRIX ENGINE                                                                             |
|  [Slot 1: $30] [Slot 2: $60] [Slot 3: $120] [Slot 4: $240] ... [Slot 12: $61,440]                  |
+----------------------------------------------------------------------------------------------------+
|  ACTIVE BOARD: SLOT 1 ($30 TROB) — CYCLE #4                                                        |
|                                                                                                    |
|                                     [ SPONSOR NODE ]                                               |
|                                            |                                                       |
|                         +------------------+------------------+                                    |
|                         |                                     |                                    |
|                   [ NODE 1 ]                            [ NODE 2 ]                                 |
|                   (Upline 1)                            (Upline 2)                                 |
|                         |                                     |                                    |
|              +----------+----------+               +----------+----------+                         |
|              |                     |               |                     |                         |
|          [ NODE 3 ]            [ NODE 4 ]      [ NODE 5 ]            [ NODE 6 ]                    |
|          ($30 Cash)            ($30 Pools)     ($30 Upgrade)         ($30 Cash)                    |
|              |                     |               |                     |                         |
|         +----+----+           +----+----+     +----+----+           +----+----+                    |
|         |         |           |         |     |         |           |         |                    |
|       [N 7]     [N 8]       [N 9]     [N 10] [N 11]    [N 12]     [N 13]    [N 14]                 |
|      ($30 Cash)($30 Cash)  ($30 Cash)($30 Cash)($30 Cash)($30 Cash)($30 Cash) (Recycle)            |
+----------------------------------------------------------------------------------------------------+
|  BOARD CASHFLOW ACCOUNTING (14 NODES x $30 = $420 GROSS):                                           |
|  • Instant Direct Cash (600% ROI): $180 (Nodes 3, 6, 7, 8, 9, 11, 12 directly to you)              |
|  • Auto-Upgrade to Next Slot: $60 (Nodes 5 & 10 accumulate to unlock Slot 2)                       |
|  • Protocol Value Pools: $90 (Nodes 4, 5, 14 route 35% DAO, 40% Salary, 10% Box, 15% Drops)       |
|  • Board Recycling: $30 (Node 14 permanently archives board and starts Cycle #5)                   |
+----------------------------------------------------------------------------------------------------+
```

#### Component 4.1: Slot Selector Carousel / Ribbon
- Horizontal scrollable ribbon showing all 12 slots:
  - **Slot 1**: $30 | **Slot 2**: $60 | **Slot 3**: $120 | **Slot 4**: $240 | **Slot 5**: $480 | **Slot 6**: $960
  - **Slot 7**: $1,920 | **Slot 8**: $3,840 | **Slot 9**: $7,680 | **Slot 10**: $15,360 | **Slot 11**: $30,720 | **Slot 12**: $61,440
- **Slot Card States**:
  - *Active / Current*: Emerald border, glowing, "View Board", Cycle counter (`Cycle #3`).
  - *Unlocked*: Muted blue border, clickable.
  - *Ready for Auto-Upgrade*: Glowing purple, badge "Ready to Unlock".
  - *Locked*: Dimmed grey, padlock icon, prerequisite: must activate previous slot first.

#### Component 4.2: The 14-Node Visual Matrix Board
- **Tree Visualization**: Clear geometric tree with glowing connectors.
- **Node Design Tokens**:
  - Circle / Hexagon badge (56px diameter).
  - Empty State: Dashed border, translucent center.
  - Filled State: Glowing solid avatar with entrant's 5-digit ID (`#10056`) and time timestamp.
- **Color-Coded Routing Tags on Nodes**:
  - **Nodes 1 & 2 (Level 1)**: Indigo pill `Upline Payout` (Direct uplines or protocol fallback).
  - **Nodes 3, 6, 7, 8, 9, 11, 12**: Emerald pill `Direct Cash (+$30)` (Pushed 100% directly to board owner).
  - **Node 4**: Gold pill `4 Value Pools` ($30 split into 35% DAO, 40% Salary, 10% Box, 15% Lucky Drops).
  - **Node 5**: Purple pill `Auto-Upgrade` ($30 reserved to unlock the next higher slot).
  - **Node 14**: Cyan pill `Board Recycle` (Triggers fresh board cycle).

#### Component 4.3: Live Matrix Statistics Card
- Direct Payouts Received ($ / TROB).
- Cycles Completed (e.g. 4 cycles = $720 pure profit from a single $30 slot).
- Downline Spillover Tracker (Direct recruits vs Spillover from upline leaders).

---

### PAGE 5: Referrals & Team Genealogy (`/referrals`)
*Purpose: Provide members with referral links, team statistics, and an interactive tree explorer of their downline network.*

#### Component 5.1: 5-Digit Referral Code & Share Center
- **Prominent Card**: Displays the user's permanent 5-digit code in 40px monospace: `ID: #10042`.
- **One-Click Share Actions**:
  - Copy Referral Link (`https://equora.fi/register?ref=10042`).
  - Generate QR Code modal (for mobile scanning in live events).
  - Direct share to Telegram, Twitter/X, and WhatsApp.

#### Component 5.2: 2-Referral Qualification Status Card
- **Visual Alert**:
  - If `< 2 directs`: Amber warning banner: "⚠️ You currently have 1 / 2 direct referrals. Sponsor 1 more member to unlock 100% matrix payout eligibility."
  - If `≥ 2 directs`: Emerald verified badge: "✅ Fully Qualified Leader. All matrix upline payouts active."

#### Component 5.3: Team KPI Metric Grid
1. Total Direct Referrals (e.g. `8`).
2. Total Network Downline Size (e.g. `142 members across 6 levels`).
3. Total Referral Commissions Earned (`$1,420.00`).
4. Current Direct Sponsor Info: `Sponsor #10001`.

#### Component 5.4: Interactive Downline Genealogy Tree
- Visual expandable tree explorer allowing users to inspect their network structure level-by-level.
- Each node displays: Member 5-digit ID, Join date, Highest active matrix slot, Direct recruits count.

---

### PAGE 6: Rewards & 4 Value Pools (`/rewards`)
*Purpose: Transparent tracking of the 4 autonomous protocol pools fed by Nodes 4, 5, and 14, as well as the monthly leadership salary program.*

#### Component 6.1: The 4 Protocol Value Pools
Four distinct large-format cards with animated progress rings:

1. **Pool 1: Genesis DAO Treasury Pool (35%)**:
   - Total accumulated balance.
   - Payout cadence: Continuous / Real-time claims.
   - Beneficiaries: The 100 Genesis DAO Council seat holders.

2. **Pool 2: Monthly Leadership Salary Pool (40%)**:
   - Total accumulated monthly balance (e.g. `$48,200.00`).
   - Distribution countdown: Monthly on the 1st (e.g. `11 Days 14 Hours`).
   - 4 Milestone Tiers display:
     - **Alpha Builder**: 5 Directs + $1,500 Team Volume $\rightarrow$ Equal share of 25% of pool.
     - **Beta Leader**: 15 Directs + $5,000 Team Volume $\rightarrow$ Equal share of 25% of pool.
     - **Gamma Master**: 30 Directs + $20,000 Team Volume $\rightarrow$ Equal share of 25% of pool.
     - **Crown Sovereign**: 50 Directs + $100,000 Team Volume $\rightarrow$ Equal share of 25% of pool.
   - Personal Progress: Visual stepper showing user's current progress toward the next salary tier.

3. **Pool 3: Magic Blind Box Pool (10%)**:
   - 3D Interactive Mystery Box graphic (`mystery_box.jpg`) with floating particle effects.
   - Quarterly countdown timer to box unlocking.
   - Probability Drop Table: Common (50%), Rare (30%), Epic (15%), Legendary Sovereign (5%).
   - "Claim Blind Box Ticket" button.

4. **Pool 4: Community Lucky Drops Pool (15%)**:
   - Randomized weekly yield distribution to all active matrix participants.
   - Recent winners ticker displaying wallet addresses and prize amounts.

---

### PAGE 7: Internal Wallet & Financial Ledger (`/wallet`)
*Purpose: Internal non-custodial accounting balance, 1-click instant withdrawals to Web3 wallets, deposit address generation, and full transaction history.*

#### Component 7.1: Balance Overview Cards
- **Card 1: Available Internal Balance**:
  - Large monospace balance: `450.00 TROB ($450.00)`.
  - Subtext: "Immediately withdrawable to your connected TrobSafe / Web3 wallet."
  - Action: Primary "Withdraw to Wallet" button.
- **Card 2: Connected Web3 Wallet Balance**:
  - Displays TROB coin balance in the user's external Web3 wallet (e.g. `1,250.00 TROB`).
  - Network indicator: Trobium Mainnet / Polygon PoS.

#### Component 7.2: 1-Click Instant Withdrawal Widget
- **Input Field**: Amount of TROB to withdraw with quick-select buttons (`25%`, `50%`, `75%`, `100% / MAX`).
- **Gas Fee Estimate**: Estimated network gas in TROB / MATIC (typically `< $0.01`).
- **Destination Address**: Pre-filled with user's connected wallet address (immutable for security).
- **Confirmation CTA**: "Confirm Instant Withdrawal" (Triggers on-chain transaction).

#### Component 7.3: Comprehensive Financial Transaction Ledger
- Tabbed filters:
  - *All Transactions*
  - *Matrix Payouts* (600% direct cash)
  - *DAO Queue Push* (Incoming member 300/N distributions)
  - *Value Pool Distributions* (Salary, Lucky Drops)
  - *Withdrawals*
- **Table Columns**:
  1. Transaction Type (with color-coded badge).
  2. Amount (TROB & USD).
  3. Source / Trigger (e.g. "DAO Member #12 Joined", "Matrix Slot 1 Node 7").
  4. Date & Timestamp.
  5. Status (Confirmed / Completed with green check).
  6. Block Explorer Link (Transaction Hash with external link icon).

---

### PAGE 8: Authentication & Global Modals

#### 8.1 Register Modal / Page (`/register`)
- **Step 1: Sponsor 5-Digit Code**:
  - Input field for 5-digit sponsor code (`10001–99999`).
  - Auto-validation indicator: Shows Sponsor name/avatar or verifies code validity.
  - Fallback message: If no sponsor, auto-defaults to Root (`10000`).
- **Step 2: Connect Web3 Wallet**:
  - Select wallet: TrobSafe (Recommended), MetaMask, WalletConnect, Coinbase Wallet.
- **Step 3: One-Time Registration Fee**:
  - $30 Slot 1 Matrix activation.
  - Approval transaction + Activation transaction with progress indicator.

#### 8.2 Web3 Transaction Processing Modal
- 4-Stage visual stepper:
  1. *Initiating*: Preparing transaction parameters.
  2. *Awaiting Signature*: Flashing wallet icon ("Please sign in your wallet").
  3. *Confirming on Blockchain*: Animated spinning loader with block confirmations counter.
  4. *Success / Confirmed*: Luminous emerald checkmark with confetti animation and direct explorer link.

#### 8.3 48-Hour Re-Topup Urgency Modal (`DAO Re-Topup`)
- Triggered when user clicks "Re-Topup 300 TROB" on the DAO page or alert banner.
- Explains that the 300 TROB deposit resets the 5X cap to 0 / 1,500 TROB and secures the user's permanent seat index.
- One-click "Approve & Deposit 300 TROB" action.

---

## 5. Responsive Breakpoint & Mobile UI Guidelines

Equora is heavily used inside **mobile Web3 wallets** (TrobSafe app, MetaMask Mobile, TrustWallet in-app browsers). The design must be flawless at mobile screen dimensions.

| Breakpoint | Viewport Width | Layout Adaptations |
| :--- | :--- | :--- |
| **Mobile S / M** | 360px – 390px | Single column cards, 5-col DAO grid, sticky bottom nav bar, collapsed table to swipeable cards. |
| **Mobile L** | 390px – 428px | Optimized thumb reach zone, 48px min button heights, horizontal scroll for matrix slot ribbon. |
| **Tablet** | 768px – 1024px | 2-column card layouts, 10-col DAO grid, top navigation with hamburger menu. |
| **Desktop** | 1280px – 1440px | Full 12-column grid, persistent top navigation, side-by-side matrix tree and analytics panels. |
| **Ultra-Wide** | 1440px+ | Max container width 1360px centered with ambient background glow. |

---

## 6. Designer Handoff Checklist for Figma / Sketch

When preparing the Figma file, the UI/UX design team should deliver:
- [ ] **Design Tokens Library**: Colors, typography styles, elevation/shadows, and spacing variables configured as Figma Styles / Variables.
- [ ] **Component Library**:
  - Buttons (Primary Emerald, Secondary Blue, Gold VIP, Danger Red, Disabled, Loading).
  - Cards (Glassmorphism default, Elevated, Highlighted, Urgency alert).
  - Navigation (Desktop top bar, Mobile bottom bar, Mobile drawer).
  - Modals (Wallet connect, Transaction pending/success, Re-topup urgency, QR code).
- [ ] **Page Screens (Desktop 1440px + Mobile 390px)**:
  - [ ] 01_Landing_Page (Normal, Video/Simulator active, Mobile)
  - [ ] 02_Dashboard (Connected, Unqualified vs Qualified, Mobile)
  - [ ] 03_Genesis_DAO_Council (100-Seat grid, 300/N Calculator, Safe state, 48h Urgency state, Vacancy alert, Mobile)
  - [ ] 04_Matrix_Engine (Slots 1–12 selector, 14-Node visual board, Auto-upgrade state, Mobile)
  - [ ] 05_Referrals_Genealogy (Share center, Downline tree, Mobile)
  - [ ] 06_Rewards_Value_Pools (4 Pools, Salary milestones, 3D Blind Box, Mobile)
  - [ ] 07_Wallet_Ledger (Balance, Withdraw form, History table, Mobile)
  - [ ] 08_Modals_and_Notifications (Toasts, Transaction steppers, Disconnect)
- [ ] **Micro-Interactions & Animation Specs**:
  - Tooltip hover delay: 150ms.
  - Card hover lift: `translateY(-3px)` with transition `200ms ease-out`.
  - Urgency countdown timer: Soft pulse animation on seconds change.
  - Confetti / Particle effect trigger on Matrix Cycle completion and Magic Box opening.
