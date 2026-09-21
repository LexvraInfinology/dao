# Equora.Fi — Exclusive DAO Members UI/UX Design Specification & Plan
**Document Version:** 2.1 (DAO-Exclusive Visual & Data Edition)  
**Target Audience:** Lead UI/UX Designer, Product Design Team, Frontend Engineers  
**Scope:** Sovereign Genesis DAO Council Portal & Member Experience (Excluding Matrix Normal User Flow)  
**Currency Standard:** TROB / USD (1 TROB = $1.00 USD)

---

## 1. Visual Page Designs & Screen Gallery

The UI/UX designer can reference the actual live visual renderings of the Genesis DAO portal below:

### 1.1 Desktop Command Center View (1440 × 900)
The sovereign council dashboard featuring the Genesis scarcity header, 100-Seat Holographic Grid, 300/N dynamic simulator, and 5X cap health monitor:

![Genesis DAO Council Desktop Viewport](file:///c:/Users/Dell/Documents/codes/equora/docs/assets/screenshots/dao_desktop.png)

---

### 1.2 Mobile DApp Browser View (390 × 844)
Optimized for mobile Web3 browsers (TrobSafe, MetaMask Mobile, Trust Wallet) with touch-friendly 10x10 seat navigation and sticky action drawers:

![Genesis DAO Council Mobile DApp Viewport](file:///c:/Users/Dell/Documents/codes/equora/docs/assets/screenshots/dao_mobile.png)

---

### 1.3 Soulbound ERC-721 VIP Governance Pass Card Artwork
The 3D metallic gold holographic badge minted to each member upon claiming a seat (#01 to #100):

![Genesis DAO Soulbound NFT Pass](file:///c:/Users/Dell/Documents/codes/equora/docs/assets/dao_card.jpg)

---

## 2. Strategic Plan: Segregation of DAO vs. Normal Matrix Users

### 2.1 The Dual-Tier Protocol Architecture
Equora.Fi establishes a fundamental separation between **Retail Matrix Users** and **Sovereign Genesis DAO Council Members**:
1. **Normal Matrix Users (Tier 2):** Retail network participants progressing through 12 cyclical matrix slots ($30 to $61,440), requiring 2 direct referrals, and managing downlines.
2. **Genesis DAO Council Members (Tier 1 — VIP Sovereign Tier):** An ultra-exclusive cohort of **exactly 100 Founding Seats**. DAO members do **not** need referrals or matrix recruitment to earn. They hold permanent founding co-ownership of the protocol, receive **instant cashback via the $300 / N$ distribution engine**, and capture **35% of all network-wide matrix transactions** indefinitely.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       EQUORA.FI ECOSYSTEM SEGREGATION                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
        ┌──────────────────────────────┴──────────────────────────────┐
        ▼                                                             ▼
┌──────────────────────────────────────┐    ┌─────────────────────────────────┐
│     GENESIS DAO COUNCIL (100 SEATS)  │    │      NORMAL MATRIX USERS        │
│          ★ EXCLUSIVE FOCUS ★         │    │      (RETAIL / NETWORK)         │
├──────────────────────────────────────┤    ├─────────────────────────────────┤
│ • Entry: Flat 300 TROB ($300)        │    │ • Entry: $30 Slot 1             │
│ • Referral Requirement: NONE (0)     │    │ • Requirement: 2 Direct Referrals│
│ • Governance: Soulbound ERC-721      │    │ • Progression: Slots 1 to 12    │
│ • Payouts: Instant 300/N Cashback    │    │ • Payouts: 600% direct cashflow │
│ • Passive Yield: 35% Matrix Stream   │    │ • Team Genealogy & Spillover    │
│ • Cap: 5X ($1,500) with 48h Top-Up   │    │ • Blind Box & Salary Pools      │
│ • Voting Power: 1 Seat = 1% (1 Vote) │    │ • Standard User Dashboard       │
└──────────────────────────────────────┘    └─────────────────────────────────┘
```

> [!IMPORTANT]
> **Designer Directive:**  
> The DAO interface must feel like an **exclusive high-net-worth sovereign terminal** (think Bloomberg Terminal meets luxury Swiss Private Banking and Web3 Cyber-Aesthetics). It must look significantly more prestigious, refined, and institutional than a retail MLM dApp.

---

## 3. Core DAO Mathematical Mechanics (Designer Reference)

### 3.1 The $300 / N$ Instant Redistribution Formula
Every incoming member deposits 300 TROB. The smart contract immediately calculates:
$$\text{Payout Per Member} = \frac{300}{N}$$
Where $N$ is the total active seat count **including the incoming member**.

| Seat Number ($N$) | Gross Deposit | Instant Cashback to Joiner | Amount Distributed to Prior ($N-1$) Members | Net Out-of-Pocket Cost |
|:---:|:---:|:---:|:---:|:---:|
| **Seat #1** | $300 | **$300** ($300 / 1$) | $0 | **$0.00 (FREE!)** |
| **Seat #2** | $300 | **$150** ($300 / 2$) | $150 to Member #1 | **$150.00** |
| **Seat #3** | $300 | **$100** ($300 / 3$) | $100 to M1, $100 to M2 | **$200.00** |
| **Seat #4** | $300 | **$75** ($300 / 4$) | $75 each to M1, M2, M3 | **$225.00** |
| **Seat #10** | $300 | **$30** ($300 / 10$) | $30 each to M1–M9 | **$270.00** |
| **Seat #50** | $300 | **$6** ($300 / 50$) | $6 each to M1–M49 | **$294.00** |
| **Seat #100** | $300 | **$3** ($300 / 100$) | $3 each to M1–M99 | **$297.00** |

*Invariant Check:* Total paid out is always **strictly $300 TROB** ($\sum_{i=1}^N \frac{300}{N} = 300$). Zero unbacked debt.

### 3.2 Permanent Queue & 35% Global Matrix Dividend Stream
- DAO seats do **NOT** expire on a timer (unlike legacy 15-day schemes). Membership is permanent as long as the 5X re-topup rule is honored.
- Whenever **any** user across the entire global platform completes Node 4, 5, or 14 in the 12-Slot Matrix, **35% of the transaction is routed directly into the DAO Treasury**.
- All 100 DAO members continuously accumulate claimable dividends in real-time.

### 3.3 The 5X ($1,500 TROB) Earnings Cap & 48-Hour Urgency Window
- **Cap Limit:** Each 300 TROB deposit allows a member to earn up to **5X ($1,500 TROB)** in cumulative payouts.
- **Urgency Trigger:** The moment a seat's total earnings hit $\ge 1,500$ TROB, the contract freezes further yield accumulation and triggers a **strict 48-hour countdown**.
- **Re-Topup:** The member must deposit 300 TROB within 48 hours:
  - **If Re-Topped Up:** The 5X cap resets (allowing another $1,500 TROB in earnings), and the member preserves their exact seat number (#1 to #100).
  - **If Defaulted (48h Expired):** The seat is marked **VACANT / DEFAULTED**. It immediately becomes open for any outside user to claim on the 10x10 grid, taking over the seat and minting a fresh Soulbound NFT!

---

## 4. Complete Component-by-Component Data Schemas ("Sata" Specifications)

Below are the exact data models, smart contract functions, data types, and live values that the UI must display across each section of the page:

### 4.1 Genesis Council Scarcity & Capacity Header
Displays the protocol phase, remaining seat inventory, and genesis deadline.

```
+-----------------------------------------------------------------------------------+
|  ✦ GENESIS DAO FOUNDING COUNCIL ✦           [Seats Remaining: 14 / 100]           |
|  Phase 1 Exclusive Window: 18d : 14h : 22m  | Capacity: [====== 86% ===== ]       |
+-----------------------------------------------------------------------------------+
```

| UI Data Element | Smart Contract Source | Type | Example Production Value | Empty / Fallback State | Display Formatting Rule |
|:---|:---|:---:|:---|:---|:---|
| **Seats Claimed** | `EquoraDAO.getDAOStats().memberCount` | `uint256` | `86` | `0` | Decimal integer |
| **Seats Capacity** | `EquoraDAO.MAX_MEMBERS()` | `uint256` | `100` | `100` | Fixed constant |
| **Seats Remaining** | `EquoraDAO.getRemainingPositions()` | `uint256` | `14` | `100` | Highlight in gold if $< 20$ |
| **Capacity Progress** | Calculated: `(memberCount / 100) * 100` | `percentage` | `86.0%` | `0%` | Emerald progress bar |
| **Genesis Deadline** | `EquoraDAO.GENESIS_WINDOW_END()` | `uint256` (timestamp)| `1,791,240,000` | `Timer Active` | Digital flip clock `DD:HH:MM:SS` |
| **Total Distributed** | `EquoraDAO.getDAOStats().totalDistributed` | `uint256` (wei) | `25,800.00 TROB` | `0.00 TROB` | 2 decimals + Monospace |

---

### 4.2 Soulbound NFT Governance Identity Card
Rendered for connected users who hold a Genesis Council seat.

```
+-----------------------------------------------------------------------------------+
|  [HOLOGRAPHIC 3D PASS #12]                                                        |
|  Tier: Founding Sovereign Co-Owner          Owner: 0x4B71...89F2                  |
|  Token ID: #0012                           Voting Power: 1.0% (1 Seat = 1 Vote)   |
|  Mint Block: #19,420,110                   Status: ACTIVE & QUALIFIED             |
+-----------------------------------------------------------------------------------+
```

| UI Data Element | Smart Contract Source | Type | Example Production Value | Empty / Fallback State | Display Formatting Rule |
|:---|:---|:---:|:---|:---|:---|
| **Is Council Member** | `EquoraDAO.getMemberDetails(addr)[0]` | `bool` | `true` | `false` | If false, show Pre-Claim View |
| **Seat Index** | `EquoraDAO.getMemberDetails(addr)[1]` | `uint256` | `12` | `0` | Format: `Council Seat #12` |
| **Soulbound Token ID** | `EquoraDAOMembership.tokenOfOwnerByIndex(addr, 0)` | `uint256` | `12` | `N/A` | Format: `#0012` |
| **Owner Address** | `userAddress` (from Web3 provider) | `address` | `0x4B71a...89F2` | `Not Connected` | Shortened `0x...` with copy icon |
| **Governance Weight** | Fixed: `1 / 100` | `percentage` | `1.0%` | `0.0%` | Tag badge: `1 Seat = 1 Vote` |
| **Soulbound Check** | `EquoraDAOMembership.isSoulbound()` | `bool` | `true` | `true` | Lock icon: `Non-Transferable` |

---

### 4.3 The 5X ($1,500 TROB) Earnings Cap & 48h Urgency Monitor
Protects protocol sustainability by enforcing periodic 300 TROB re-topups every $1,500 in earnings.

```
+-----------------------------------------------------------------------------------+
|  5X EARNINGS CAP HEALTH: $840.00 / $1,500.00 TROB                                |
|  [=========================== 56.0% Progress =====================          ]     |
|  Status: SAFE ZONE ($660.00 Remaining before Re-Topup Required)                   |
+-----------------------------------------------------------------------------------+
```

| UI Data Element | Smart Contract Source | Type | Example Production Value | Empty / Fallback State | Display Formatting Rule |
|:---|:---|:---:|:---|:---|:---|
| **Cumulative Earned** | `EquoraDAO.getMemberDetails(addr)[4]` | `uint256` (wei) | `840.00 TROB` | `0.00 TROB` | Formatted ether, 2 decimals |
| **Max Cap Ceiling** | `EquoraDAO.getCapProgress(addr)[1]` | `uint256` (wei) | `1,500.00 TROB` | `1,500.00 TROB` | Constant ($300 \times 5$) |
| **Cap Percentage** | Calculated: `(earned / 1500) * 100` | `percentage` | `56.0%` | `0%` | Dynamic color: Green / Amber / Red |
| **Cap Status** | `EquoraDAO.getMemberDetails(addr)[5]` | `bool` (`isCapped`) | `false` | `false` | Green: Safe, Red: Capped Urgency |
| **48h Deadline** | `EquoraDAO.getMemberDetails(addr)[6]` | `uint256` (timestamp)| `1,791,326,400` | `0` | Unix timestamp |
| **Seconds Remaining** | `EquoraDAO.retopupTimeRemaining(addr)` | `uint256` | `172,400` (47h 53m) | `0` | Digital countdown `HH:MM:SS` |
| **Seat Forfeited Flag**| `EquoraDAO.getMemberDetails(addr)[7]` | `bool` (`isBlank`) | `false` | `false` | If true, seat is vacant defaulted |

---

### 4.4 Claimable Revenue & 1-Click Withdrawal Data
The financial hub allowing members to sweep accumulated dividends directly into their wallet.

```
+-----------------------------------------------------------------------------------+
|  TOTAL WITHDRAWABLE BALANCE: $420.50 TROB                                         |
|  - 300/N Queue Distributions:  $120.50 TROB                                       |
|  - 35% Global Matrix Pool:     $300.00 TROB                                       |
|  [ ⚡ CLAIM TO TROBSAFE WALLET (1-CLICK) ]       [ 🔄 RE-TOPUP / COMPOUND ]        |
+-----------------------------------------------------------------------------------+
```

| UI Data Element | Smart Contract Source | Type | Example Production Value | Empty / Fallback State | Display Formatting Rule |
|:---|:---|:---:|:---|:---|:---|
| **Matrix Pool Claimable** | `EquoraDAO.getMemberDetails(addr)[8]` | `uint256` (wei) | `300.00 TROB` | `0.00 TROB` | Formatted ether with Claim action |
| **Fallback Claimable** | `EquoraDAO.getMemberDetails(addr)[3]` | `uint256` (wei) | `120.50 TROB` | `0.00 TROB` | Pushed queue fallback balance |
| **Total Claimable** | Sum: `poolClaimable + fallbackClaimable` | `uint256` (wei) | `420.50 TROB` | `0.00 TROB` | Large prominent emerald ticker |
| **Estimated Gas Fee** | Provider estimation | `string` | `< $0.005 USD` | `~ $0.005` | Monospace footnote |

---

### 4.5 The 100-Seat Council Grid Array Data (10x10 Matrix)
The complete dataset driving the 100 tiles on the holographic board.

```
Grid Query: EquoraDAO.getAllMembers() -> Array of 100 Member Structs
```

| UI Data Element per Tile | Source of Truth | Type | Possible Values | Visual Mapping on Grid |
|:---|:---|:---:|:---|:---|
| **Seat Number** | Array Index ($0 \dots 99$) + 1 | `uint8` | `1` to `100` | Tile centered numeral label |
| **Seat Status** | Evaluated on-chain state | `enum` | `CLAIMED`, `USER`, `NEXT`, `DEFAULTED`, `LOCKED` | Distinct color & border (see below) |
| **Occupant Address** | `members[i].memberAddress` | `address` | `0x4B71...89F2` or `0x0` | Tooltip flyout occupant line |
| **Cumulative Yield** | `members[i].totalEarned` | `uint256` | `1,280.40 TROB` | Tooltip flyout earnings metric |
| **Cap Health %** | `(members[i].totalEarned / 1500) * 100` | `percentage` | `85.3%` | Tooltip flyout progress bar |

#### Visual Tile State Legend:
1. 🟡 **Gold Solid Tile (`#F59E0B`):** Active occupied seat.
2. 🟢 **Emerald Crown Glowing Tile (`#00E599`):** Connected user's personal seat. Features an ambient glowing halo and gold crown icon.
3. 🔵 **Pulsing Electric Cyan Tile (`#06B6D4`):** Next available seat in line (e.g. Seat #87).
4. 🔴 **Flashing Crimson Dashed Tile (`#EF4444`):** **DEFAULTED VACANT SEAT** (Former member missed 48h deadline; clickable by anyone to sniper-claim!).
5. ⚫ **Dark Slate Tile (`#1E293B`):** Locked future seats.

---

### 4.6 300 / N Dynamic Calculator & Simulator Data
Drives the interactive slider from Seat 1 to 100.

```
+-----------------------------------------------------------------------------------+
|  Interactive Slider Position: [=============O==================] Seat #35         |
|  - Gross Entry Fee:             $300.00 TROB                                      |
|  - Instant Cashback to Joiner:  $8.57 TROB  (300 / 35)                            |
|  - Payout to 34 Prior Members:  $8.57 TROB each ($291.43 Total)                  |
|  - Net Out-of-Pocket Cost:      $291.43 TROB                                      |
+-----------------------------------------------------------------------------------+
```

| UI Data Element | Calculation Formula | Type | Example at Seat #35 | Example at Seat #1 (Genesis) |
|:---|:---|:---:|:---|:---|
| **Selected Seat ($N$)** | User Slider State (`calcSeat`) | `integer` | `35` | `1` |
| **Gross Deposit** | Constant: `300.00` | `number` | `$300.00 TROB` | `$300.00 TROB` |
| **Instant Cashback** | Formula: `300 / calcSeat` | `number` | **`$8.57 TROB`** | **`$300.00 TROB` (100%!)** |
| **Payout Per Prior Member**| Formula: `300 / calcSeat` | `number` | `$8.57 TROB` | `$0.00 TROB` |
| **Net Out-of-Pocket** | Formula: `300 - (300 / calcSeat)` | `number` | **`$291.43 TROB`** | **`$0.00 (FREE!)`** |

---

## 5. Critical UX Edge Cases & Modal Flows

### 5.1 The 48-Hour Re-Topup Urgency Modal (CRITICAL)
When `totalEarned >= 1500 TROB` and `isCapped == true`:
1. **Screen Ambient Tint:** Subtle red gradient vignette on page borders.
2. **Persistent Urgency Banner:**  
   `⚠️ URGENT: Your Council Seat #12 has reached the 5X Earnings Cap ($1,500). Countdown: [ 47:58:22 ]. Re-topup 300 TROB to avoid seat forfeiture!`
3. **Modal Content:**
   - Digital Flip Clock: `47 : 58 : 22`
   - Primary Action Button: `[ RE-TOPUP 300 TROB NOW ]`
   - Outcome: Calls `EquoraDAO.retopup()`, resets earnings cap to $0, and preserves the member's exact seat index.

### 5.2 Defaulted Seat Sniping Flow
When a member allows their 48-hour clock to expire:
1. Smart contract marks the seat `isBlank = true`.
2. The seat tile on the 10x10 grid turns **Crimson Dashed with a "CLAIM VACANCY" badge**.
3. Any prospective user can click the vacant tile:
   - Modal Header: `Claim Defaulted Seat #12`
   - Information: `Original occupant forfeited after 48h deadline. Pay 300 TROB to become the new owner of Seat #12.`
   - Action Button: `[ CLAIM & MINT FRESH SOULBOUND NFT ]`
   - Outcome: Smart contract transfers seat co-ownership, burns old metadata, and issues a fresh Soulbound NFT to the sniper.

---

## 6. Visual Design System & Design Tokens (Sovereign VIP Theme)

The UI/UX designer must apply the institutional design tokens established below:

| Token Name | Hex Code / Value | Semantic Usage |
|:---|:---:|:---|
| **Base Obsidian** | `#06080F` | Deep space background (richer than retail dashboard) |
| **Slate Surface** | `#0B111E` (`backdrop-filter: blur(16px)`) | Elevated card panels with glassmorphic depth |
| **Card Border** | `rgba(245, 158, 11, 0.20)` | Subtle gold hairline border |
| **Sovereign Gold Accent** | `#F59E0B` / `#FBBF24` | Council headers, VIP badges, crowns, and primary CTA buttons |
| **Radiant Emerald** | `#00E599` | Instant cashback values, positive yield tickers, Safe Zone |
| **Urgency Crimson** | `#EF4444` | 48h countdown digital clock, default warnings, vacancy alerts |
| **Cyber Cyan** | `#06B6D4` | Next available seat indicator, interactive simulation sliders |
| **Headline Font** | `Cinzel` / `Cabinet Grotesk` | Institutional titles, council badges, VIP prestige headers |
| **Monospace Font** | `JetBrains Mono` / `DM Mono` | Tabular numbers, TROB amounts, countdown timers, addresses |

---

## 7. Designer Deliverables Checklist

The UI/UX designer is requested to produce the following Figma / Sketch artifacts:
- [ ] **Frame 1 (Desktop 1440px):** Public Genesis Council Gateway (Pre-Claim visitor view with Scarcity Meter).
- [ ] **Frame 2 (Desktop 1440px):** Active Member Command Center (VIP Soulbound NFT, Yield Trackers, 1-Click Claim).
- [ ] **Frame 3 (Desktop 1440px):** 100-Seat Holographic Council Matrix Grid with all 5 tile state variations & Hover Flyout.
- [ ] **Frame 4 (Desktop 1440px):** 300/N Dynamic Instant Redistribution Engine with interactive slider.
- [ ] **Frame 5 (Modal Component):** 48-Hour Urgency Re-Topup Countdown Modal with digital flip clock.
- [ ] **Frame 6 (Modal Component):** Defaulted Vacant Seat Sniping & Takeover Flow.
- [ ] **Frame 7 (Mobile 390px):** Full responsive mobile viewports for Web3 in-app browsers.
