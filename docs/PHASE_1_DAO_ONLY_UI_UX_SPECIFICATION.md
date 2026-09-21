# Equora.Fi — Phase 1: Genesis DAO Exclusive UI/UX Design Specification
**Document Version:** 3.0 (Phase 1 Dedicated Launch & Locked Matrix Guide)  
**Target Audience:** Lead UI/UX Designer, Product Design Team, Frontend Developers  
**Scope:** Phase 1 (Genesis DAO Council 100 Seats) Exclusive Experience & Locked Matrix ($30 ID) 21-Day Countdown  
**Currency Standard:** TROB / USD (1 TROB = $1.00 USD)

---

## 1. Executive Product Architecture: Phase 1 vs. Day 22 Matrix Launch

The client has mandated that the current product launch is **Phase 1: Genesis DAO Council ONLY**. The entire platform must direct 100% of user focus to claiming the **100 Sovereign DAO Seats**, while the retail matrix ($30 ID) is locked behind a **21-Day Countdown Timer**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   EQUORA.FI LAUNCH TIMELINE & ARCHITECTURE                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
        ┌──────────────────────────────┴──────────────────────────────┐
        ▼                                                             ▼
┌──────────────────────────────────────┐    ┌─────────────────────────────────┐
│       PHASE 1: DAYS 1 TO 21          │    │          PHASE 2: DAY 22+       │
│    ★ GENESIS DAO COUNCIL ONLY ★      │    │    ★ NORMAL MATRIX UNLOCKS ★    │
├──────────────────────────────────────┤    ├─────────────────────────────────┤
│ • STATUS: 100% LIVE & ACTIVE         │    │ • STATUS: LOCKED (21-DAY TIMER) │
│ • Target: Exactly 100 Founding Seats │    │ • Entry: $30 Slot 1 Normal ID   │
│ • Entry: Flat 300 TROB ($300)        │    │ • Requirement: 2 Direct Referrals│
│ • Referrals Required: ZERO (0)       │    │ • Payouts: 600% Direct Cash     │
│ • Payouts: Instant 300/N Cashback    │    │ • Day 22 Action: Normal seats   │
│ • Governance: Soulbound ERC-721      │    │   start filling dynamically!    │
│ • Cap: 5X ($1,500) with 48h Top-Up   │    │ • 35% of all matrix volume      │
│ • Goal: Fund liquidity & governance  │    │   streams to Phase 1 DAO seats! │
└──────────────────────────────────────┘    └─────────────────────────────────┘
```

> [!IMPORTANT]
> **Designer Directive (Phase 1 Focus):**  
> 1. Designers must **NOT** present the Matrix or multi-slot recruitment as active features today.  
> 2. When a user navigates to the Matrix view, they must see a **Luxury Locked Vault State** featuring a prominent **21-Day Digital Countdown Clock** (`Days : Hours : Mins : Secs`).  
> 3. The locked screen explicitly states: *"Phase 1 Genesis DAO Exclusive Window Active. Matrix Slot 1 ($30 ID) Unlocks on Day 22. Secure your sovereign co-ownership seat in the Genesis DAO before public retail network launch!"*

---

## 2. Visual Mockups & Screenshots Gallery

The UI/UX designer can reference the visual mockups below for Phase 1:

### 2.1 Genesis DAO Primary Screen (Desktop 1440 × 900)
Features the Genesis 21-day window banner, 100-Seat Council Grid, 300/N dynamic simulator, and 5X cap health monitor:

![Genesis DAO Desktop](file:///c:/Users/Dell/Documents/codes/b-titan/docs/assets/screenshots/dao_desktop.png)

---

### 2.2 Genesis DAO Mobile DApp Viewport (390 × 844)
Optimized for mobile Web3 in-app browsers (TrobSafe, MetaMask Mobile, Trust Wallet) with touch-friendly 10x10 seat navigation and bottom sticky drawers:

![Genesis DAO Mobile](file:///c:/Users/Dell/Documents/codes/b-titan/docs/assets/screenshots/dao_mobile.png)

---

### 2.3 Soulbound ERC-721 VIP Pass Card Artwork
The 3D metallic gold holographic badge issued to each council member upon claiming a seat (`#01` to `#100`):

![Soulbound NFT Pass](file:///c:/Users/Dell/Documents/codes/b-titan/docs/assets/dao_card.jpg)

---

## 3. Core DAO Mathematical Mechanics (Designer Reference)

### 3.1 The $300 / N$ Instant Redistribution Formula
Every incoming member deposits 300 TROB. The smart contract immediately calculates:
$$\text{Payout Per Member} = \frac{300}{N}$$
Where $N$ is the total active seat count **including the incoming member**.

| Seat Number ($N$) | Gross Deposit | Instant Cashback to Joiner | Amount Distributed to Prior ($N-1$) Members | Net Out-of-Pocket Cost |
|:---:|:---:|:---:|:---:|:---:|
| **Seat #1 (Genesis Alpha)** | $300 | **$300** ($300 / 1$) | $0 | **$0.00 (100% FREE!)** |
| **Seat #2** | $300 | **$150** ($300 / 2$) | $150 to Member #1 | **$150.00** |
| **Seat #3** | $300 | **$100** ($300 / 3$) | $100 to M1, $100 to M2 | **$200.00** |
| **Seat #4** | $300 | **$75** ($300 / 4$) | $75 each to M1, M2, M3 | **$225.00** |
| **Seat #10** | $300 | **$30** ($300 / 10$) | $30 each to M1–M9 | **$270.00** |
| **Seat #50** | $300 | **$6** ($300 / 50$) | $6 each to M1–M49 | **$294.00** |
| **Seat #100 (Final Seat)** | $300 | **$3** ($300 / 100$) | $3 each to M1–M99 | **$297.00** |

*Zero-Debt Invariant:* Total paid out is always **strictly $300 TROB** ($\sum_{i=1}^N \frac{300}{N} = 300$). Zero debt spiral.

### 3.2 The 5X ($1,500 TROB) Earnings Cap & 48-Hour Urgency Window
- **Cap Limit:** Each 300 TROB deposit allows a member to earn up to **5X ($1,500 TROB)** in cumulative payouts.
- **Urgency Trigger:** The moment a seat's total earnings hit $\ge 1,500$ TROB, the contract freezes further yield accumulation and triggers a **strict 48-hour countdown**.
- **Re-Topup:** The member must deposit 300 TROB within 48 hours:
  - **If Re-Topped Up:** The 5X cap resets (allowing another $1,500 TROB in earnings), and the member preserves their exact seat number (#1 to #100).
  - **If Defaulted (48h Expired):** The seat is marked **VACANT / DEFAULTED**. It immediately becomes open for any outside user to claim on the 10x10 grid, taking over the seat and minting a fresh Soulbound NFT!

---

## 4. Complete Screen-by-Screen UI/UX Specifications for Phase 1

Phase 1 consists of **4 Active DAO Screens** and **1 Locked Teaser Screen**:

---

### Screen 1: Genesis DAO Council Portal (`/dao`) — *THE CORE APPLICATION SCREEN*
*The sovereign portal where users inspect the 100-seat grid, claim passes, monitor payouts, and manage re-topups.*

#### Layout Wireframe
```
+-----------------------------------------------------------------------------------+
|  [LOGO] Equora.Fi DAO         [Seats Left: 14/100]           [CONNECT TROBSAFE]    |
+-----------------------------------------------------------------------------------+
|  ✦ GENESIS FOUNDING COUNCIL (PHASE 1 ACTIVE) ✦                                    |
|  Phase 1 Window Closes In: [ 18d : 14h : 22m : 10s ] | Capacity: [=== 86% === ]   |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  LEFT (60%): 10x10 HOLOGRAPHIC COUNCIL GRID          RIGHT (40%): COUNCIL ACTION   |
|  [ 01 ] [ 02 ] [ 03 ] [ 04 ] [ 05 ] [ 06 ] ...       +--------------------------+ |
|  [ 11 ] [★12★] [ 13 ] [ 14 ] [ 15 ] [ 16 ] ...       | SOULBOUND NFT PASS       | |
|  ...                                                 | Status: Active Council   | |
|  [ 81 ] [ 82 ] [ 83 ] [ 84 ] [ 85 ] [⚡87] ...       | Seat: #12 • Power: 1.0%  | |
|                                                      +--------------------------+ |
|  LEGEND:                                             | 5X EARNINGS CAP HEALTH   | |
|  🟡 Occupied (Gold)   🟢 Your Seat (Crown)           | $840.00 / $1,500.00      | |
|  🔵 Next In Line (Cyan) 🔴 Defaulted (Crimson)       | [===== 56% Safe ====== ] | |
|                                                      +--------------------------+ |
|                                                      | [ CLAIM $420.50 (1-CLICK)| |
+-----------------------------------------------------------------------------------+
|  BOTTOM: 300/N INSTANT REDISTRIBUTION SIMULATOR                                   |
|  Drag Seat Slider: [=======================O======] Seat #35                     |
|  Gross Fee: $300 | Instant Cashback: $8.57 | Distributed: $291.43 | Net: $291.43  |
+-----------------------------------------------------------------------------------+
```

#### Component Data ("Sata") Schema
| UI Field | Contract Function | Type | Live Production Value | Empty State | Display Rule |
|:---|:---|:---:|:---|:---|:---|
| **Seats Claimed** | `EquoraDAO.getDAOStats().memberCount` | `uint256` | **`86`** | `0` | Number `86 / 100` |
| **Seats Remaining** | `EquoraDAO.getRemainingPositions()` | `uint256` | **`14`** | `100` | Highlight gold if $< 20$ |
| **Genesis Countdown**| `EquoraDAO.GENESIS_WINDOW_END()` | `timestamp` | **`1,791,240,000`** | Active | Clock: `DD:HH:MM:SS` |
| **Soulbound Token ID**| `BTitanDAOMembership.tokenOfOwnerByIndex()`| `uint256` | **`#0012`** | `N/A` | Padded `#0012` |
| **5X Cap Earned** | `EquoraDAO.getMemberDetails()[4]` | `uint256` | **`$840.00 TROB`** | `$0.00` | Formatted ether |
| **5X Cap Ceiling** | `EquoraDAO.getCapProgress()[1]` | `uint256` | **`$1,500.00 TROB`** | `$1,500.00`| Fixed constant ($300 \times 5$) |
| **48h Urgency Clock**| `EquoraDAO.retopupTimeRemaining()` | `uint256` | **`172,400s (47h 53m)`**| `0s` | Digital flip clock `HH:MM:SS` |
| **1-Click Claim Total**| `poolClaimable + fallbackClaimable` | `uint256` | **`$420.50 TROB`** | `$0.00` | Emerald header ticker |

---

### Screen 2: Locked Matrix Vault & 21-Day Countdown Screen (`/matrix`)
*The view presented when users navigate to the Matrix during Phase 1. It emphasizes that retail slots are locked and will open on Day 22.*

#### Layout Wireframe
```
+-----------------------------------------------------------------------------------+
|  [NAVBAR: Equora.Fi]                   [PHASE 1 ACTIVE]         [CONNECT WALLET]  |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|           🔒 PHASE 2 COMMUNITY MATRIX IS CURRENTLY LOCKED 🔒                      |
|                                                                                   |
|     +-----------------------------------------------------------------------+     |
|     |  PHASE 2 PUBLIC LAUNCH COUNTDOWN:                                     |     |
|     |                                                                       |     |
|     |        [ 18 DAYS ]   :   [ 14 HOURS ]   :   [ 22 MINS ]   :   [ 10 SEC ]  |     |
|     |                                                                       |     |
|     |  ✦ ON DAY 22, NORMAL $30 ID MATRIX SEATS START FILLING GLOBALLY ✦    |     |
|     +-----------------------------------------------------------------------+     |
|                                                                                   |
|  [ BLURRED 14-NODE MATRIX PREVIEW WITH GOLDEN PADLOCK OVERLAY ]                  |
|                                                                                   |
|  HOW PHASE 2 WILL BENEFIT PHASE 1 DAO MEMBERS:                                    |
|  • Normal users will register with $30 Slot 1 IDs starting on Day 22.             |
|  • 35% of all global matrix volume (Nodes 4, 5, 14) will route automatically     |
|    into the Genesis DAO Treasury to pay passive dividends to the 100 seats!       |
|  • Phase 1 is your ONLY window to secure 1 of the 100 sovereign founding seats.   |
|                                                                                   |
|           [ 👑 CLAIM A GENESIS DAO SEAT NOW (14 SEATS REMAINING) ]                |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

#### Component Data ("Sata") Schema
| UI Field | Source of Truth | Type | Live Production Value | Display Rule |
|:---|:---|:---:|:---|:---|
| **Lock Status Badge** | Protocol Launch State | `enum` | **`LOCKED (PHASE 1 IN PROGRESS)`** | Crimson locked pill |
| **Countdown Clock** | `GENESIS_WINDOW_END - block.timestamp` | `timestamp` | **`18d : 14h : 22m : 10s`** | Large digital flip clock |
| **Unlock Milestone** | Static Milestone Copy | `string` | **`Day 22: $30 ID Matrix Seats Fill`** | Gold highlight banner |
| **Slot 1 Entry Price**| `BTitanMatrix.slotPrice(1)` | `uint256` | **`$30.00 TROB`** | Teaser badge |
| **DAO Royalty Share** | `EquoraVault.DAO_POOL_BPS()` | `percentage`| **`35.0% of all matrix volume`** | Sovereign benefit callout |
| **Primary CTA** | Router Link | `button` | `[ Claim Genesis DAO Seat (300 TROB) ]` | Routes to `/dao` |

---

### Screen 3: Founder Executive Dashboard (`/dashboard`)
*Command center for connected users during Phase 1.*

- **Founder Identity Card:**
  - Connected Address + 1-Click Copy.
  - Council Status: `👑 Genesis Council Founder (Seat #12)` in Gold OR `Visitor (Non-Member)` in Slate.
  - 1 Seat = 1 Vote (1.0% Governance Power).
  - Soulbound NFT Token ID (`#0012`).
- **Phase 1 Financial KPIs (4 Cards):**
  1. **Total DAO Payouts Earned:** `$1,280.40 TROB` (from 300/N engine).
  2. **5X Cap Health:** `$840.00 / $1,500.00 TROB` (`56% Safe`).
  3. **Claimable Balance:** `$420.50 TROB` ready for instant cashout.
  4. **Day 22 Matrix Inflow Forecast:** Estimated passive royalties once normal users fill seats.
- **Quick Actions:**
  - `[ Open 100-Seat Council Grid ]`
  - `[ 1-Click Withdraw to TrobSafe ]`
  - `[ View Day 22 Matrix Launch Countdown ]`

---

### Screen 4: Treasury Wallet & 1-Click Cashout (`/wallet`)
*Non-custodial balance and withdrawal ledger.*

- **Balance Cards:**
  - *Internal Ledger Balance:* Real-time earnings ready to cash out (`420.50 TROB`).
  - *External Web3 Wallet Balance:* Live balance of TROB in user's external wallet on Polygon/Trobium.
- **1-Click Instant Withdrawal Widget:**
  - Input field for TROB amount (`25%`, `50%`, `75%`, `MAX`).
  - Estimated gas fee pill (`< $0.005 USD`).
  - Action Button: **[Confirm Instant Withdrawal]**.
- **Historical Payout Ledger:**
  - Filterable by: *All*, *300/N Queue Cashback*, *48h Re-Topup Payouts*, *Withdrawals*.
  - Columns: Event, Amount (TROB), Sender / Incoming Seat, Date, Status (Confirmed), Explorer Link.

---

### Screen 5: 48-Hour Urgency Re-Topup Modal & Edge Cases
*Activates when cumulative earnings hit $1,500 TROB.*

1. **Urgent Trigger:** When `totalEarned >= 1500 TROB` (`isCapped == true`).
2. **Visual State:** Flashing crimson border, ambient dark red vignette, digital flip clock `47:58:22`.
3. **Primary Action Button:** `[ RE-TOPUP 300 TROB NOW ]`.
4. **Outcome:** Calls `EquoraDAO.retopup()`, resets earnings cap to $0, unlocks another $1,500 in earnings, and protects Seat #12 from forfeiture.
5. **Defaulted Vacant Seat Sniping:** If 48 hours lapse, seat #12 turns **Crimson Dashed** on the 10x10 grid; any outside user can click it, pay 300 TROB, burn the old occupant's seat, and mint a fresh Soulbound NFT.

---

## 5. Visual Design System Tokens (VIP Private Banking Aesthetic)

| Token Name | Hex Code / Value | Semantic Usage in Phase 1 |
|:---|:---:|:---|
| **Base Obsidian** | `#06080F` | Deep space canvas base |
| **Slate Surface** | `#0B111E` (`backdrop-filter: blur(16px)`) | Elevated card panels with glassmorphic depth |
| **Card Border** | `rgba(245, 158, 11, 0.20)` | Subtle gold hairline border |
| **Sovereign Gold Accent** | `#F59E0B` / `#FBBF24` | Council headers, VIP badges, crowns, and primary CTA buttons |
| **Radiant Emerald** | `#00E599` | Instant cashback values, positive yield tickers, Safe Zone |
| **Urgency Crimson** | `#EF4444` | 48h countdown digital clock, default warnings, locked matrix padlock |
| **Cyber Cyan** | `#06B6D4` | Next available seat indicator, interactive simulation sliders |
| **Headline Font** | `Cinzel` / `Cabinet Grotesk` | Institutional titles, council badges, VIP prestige headers |
| **Monospace Font** | `JetBrains Mono` / `DM Mono` | Tabular numbers, TROB amounts, countdown timers, addresses |

---

## 6. Phase 1 UI/UX Designer Deliverables Checklist

The UI/UX designer is requested to deliver the following Figma/Sketch frames:
- [ ] **Frame 1 (Desktop 1440px & Mobile 390px):** Genesis DAO Council Portal (`/dao`) with 100-Seat Grid and 300/N Calculator.
- [ ] **Frame 2 (Desktop 1440px & Mobile 390px):** Locked Matrix Vault Screen (`/matrix`) with **21-Day Countdown Clock** and locked padlock overlay.
- [ ] **Frame 3 (Desktop 1440px & Mobile 390px):** Founder Executive Dashboard (`/dashboard`).
- [ ] **Frame 4 (Desktop 1440px & Mobile 390px):** Treasury Wallet & 1-Click Cashout (`/wallet`).
- [ ] **Frame 5 (Modal Component):** 48-Hour Urgency Re-Topup Modal with digital flip clock.
- [ ] **Frame 6 (Modal Component):** Defaulted Vacant Seat Sniping & Takeover Flow.
- [ ] **Frame 7 (Design System):** Color styles, typography scale, countdown timer components, and seat grid state styles.
