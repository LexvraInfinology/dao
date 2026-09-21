# Equora.Fi — Standalone DAO Domain UI/UX Design Specification
**Document Version:** 4.0 (Dedicated Standalone DAO Domain Edition)  
**Target Domain:** `dao.equora.fi` (Completely separate from the retail matrix domain `matrix.equora.fi`)  
**Target Audience:** Lead UI/UX Designer, Product Design Team, Frontend Engineers  
**Scope:** Standalone Web Application for Genesis DAO Council Members Only  
**Currency Standard:** TROB / USD (1 TROB = $1.00 USD)

---

## 1. Domain Separation Strategy: DAO Domain vs. Matrix Domain

To ensure complete clarity and prestige, Equora.Fi runs on **two completely separate domains with completely different user interfaces**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       TWO INDEPENDENT DOMAINS & WEB APPS                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
        ┌──────────────────────────────┴──────────────────────────────┐
        ▼                                                             ▼
┌──────────────────────────────────────┐    ┌─────────────────────────────────┐
│     DOMAIN A: dao.equora.fi          │    │     DOMAIN B: matrix.equora.fi  │
│    ★ GENESIS DAO COUNCIL PORTAL ★    │    │     ★ RETAIL MATRIX WEB APP ★   │
├──────────────────────────────────────┤    ├─────────────────────────────────┤
│ • AUDIENCE: 100 Sovereign Co-Owners  │    │ • AUDIENCE: Global Retail Users │
│ • STATUS: 100% ACTIVE NOW (PHASE 1)  │    │ • STATUS: LOCKED (21-DAY TIMER) │
│ • ENTRY: Flat 300 TROB ($300)        │    │ • ENTRY: $30 Slot 1 Normal ID   │
│ • REFERRALS: ZERO (0) — No MLM       │    │ • REFERRALS: 2 Directs Required │
│ • PAYOUTS: Instant 300/N Cashback    │    │ • PAYOUTS: 600% Direct Cash     │
│ • REVENUE: 35% cut of Domain B       │    │ • LAUNCH: Starts filling on     │
│ • UI THEME: Swiss Private Banking /  │    │   Day 22 when timer hits zero!  │
│   Sovereign Wealth Web3 Terminal     │    │ • UI THEME: Cyber Matrix Engine │
└──────────────────────────────────────┘    └─────────────────────────────────┘
```

> [!IMPORTANT]
> **Key Architectural Relationship Between the Two Domains:**  
> - **Domain A (`dao.equora.fi`) is live right now.** Only 100 seats will ever exist.  
> - **Domain B (`matrix.equora.fi`) is currently locked behind a 21-day countdown.** On **Day 22**, Domain B unlocks, and thousands of normal users start filling the $30 normal ID matrix.  
> - Every time a matrix node (Nodes 4, 5, 14) fills on Domain B, **35% of the transaction is routed on-chain directly into the Treasury of Domain A**, paying passive dividends to the 100 DAO Council members!

---

## 2. Reference Images for UI/UX Designer

The designer should use the following high-resolution assets and screenshots as primary design references:

### Reference Image 1: Main DAO Desktop Command Center (1440 × 900)
*Shows the sovereign dark obsidian aesthetic, ambient gold accents, 100-seat holographic matrix, 300/N dynamic slider, and 5X cap health monitor:*
- **File Link:** [dao_desktop.png](file:///c:/Users/Dell/Documents/codes/b-titan/docs/assets/screenshots/dao_desktop.png)
![DAO Desktop Viewport](file:///c:/Users/Dell/Documents/codes/b-titan/docs/assets/screenshots/dao_desktop.png)

---

### Reference Image 2: DAO Mobile DApp Viewport (390 × 844)
*Shows mobile responsiveness for Web3 in-app browsers (TrobSafe, MetaMask, Trust Wallet) with touch-friendly 10x10 seat tiles and sticky bottom action drawers:*
- **File Link:** [dao_mobile.png](file:///c:/Users/Dell/Documents/codes/b-titan/docs/assets/screenshots/dao_mobile.png)
![DAO Mobile DApp Viewport](file:///c:/Users/Dell/Documents/codes/b-titan/docs/assets/screenshots/dao_mobile.png)

---

### Reference Image 3: Soulbound VIP Governance Pass 3D Artwork
*The metallic gold 3D card minted as a non-transferable ERC-721 token to each council member (`#01` to `#100`):*
- **File Link:** [dao_card.jpg](file:///c:/Users/Dell/Documents/codes/b-titan/docs/assets/dao_card.jpg)
![Soulbound NFT Pass Artwork](file:///c:/Users/Dell/Documents/codes/b-titan/docs/assets/dao_card.jpg)

---

### Reference Image 4: Day 22 Retail Matrix Bridge Teaser
*Shows the locked retail matrix that will launch on Domain B on Day 22 and feed 35% royalties to DAO members:*
- **File Link:** [matrix_desktop.png](file:///c:/Users/Dell/Documents/codes/b-titan/docs/assets/screenshots/matrix_desktop.png)
![Day 22 Retail Matrix Teaser](file:///c:/Users/Dell/Documents/codes/b-titan/docs/assets/screenshots/matrix_desktop.png)

---

## 3. Complete List of Pages to Design for the Standalone DAO Domain (`dao.equora.fi`)

The standalone DAO Web Application requires **5 Dedicated Pages & 2 Core Modals**:

1. **Page 1: Sovereign DAO Gateway & Public Onboarding (`/`)**
2. **Page 2: The 100-Seat Council Matrix Grid & Seat Inspector (`/seats`)**
3. **Page 3: Council Member Command Center & Lounge (`/lounge`)**
4. **Page 4: Day 22 Retail Matrix Bridge & Royalty Forecast (`/matrix-bridge`)**
5. **Page 5: Treasury Wallet & Financial Cashout Ledger (`/treasury`)**
6. **Modal 1: 48-Hour Urgency Re-Topup Modal (Digital Countdown Clock)**
7. **Modal 2: Defaulted Vacant Seat Sniping & Takeover Flow**

---

### Page 1: Sovereign DAO Gateway & Public Onboarding (`/`)
**Target Audience:** Prospective council members, institutional investors, Web3 leaders.  
**Objective:** Present absolute scarcity (100 seats), explain the $300/N instant cashback incentive, and drive seat claims before the 21-day window closes.

#### Content & Layout Wireframe
```
+-----------------------------------------------------------------------------------+
|  [LOGO] Equora DAO Council      [Phase 1 Window: 18d : 14h : 22m] [CONNECT WALLET]|
+-----------------------------------------------------------------------------------+
|                                                                                   |
|     ✦ THE GENESIS FOUNDING COUNCIL ✦                                              |
|     Exactly 100 Sovereign Seats Worldwide. Zero Recruitment Required.             |
|     Instant 300/N Cashback + Permanent 35% Royalties on Day 22 Matrix Launch       |
|                                                                                   |
|     +-----------------------------------+  +------------------------------------+ |
|     |  SEATS REMAINING                  |  |  NEXT SEAT POSITION                | |
|     |  14 / 100 AVAILABLE               |  |  SEAT #87                          | |
|     |  [==== 86% Claimed ====== ]       |  |  Instant Cashback: $3.45 TROB      | |
|     +-----------------------------------+  +------------------------------------+ |
|                                                                                   |
|     [ 👑 CLAIM SEAT #87 (300 TROB) ]         [ LAUNCH 300/N SIMULATOR ]           |
|                                                                                   |
+-----------------------------------------------------------------------------------+
|  SECTION 2: 300/N INSTANT REDISTRIBUTION CALCULATOR                               |
|  Interactive Slider: [=======================O======] Position #35                |
|  - Gross Entry Deposit:        $300.00 TROB                                       |
|  - Instant Cashback to You:    $8.57 TROB (300 / 35 returned to wallet instantly) |
|  - Distributed to 34 Members:  $8.57 TROB each ($291.43 Total)                    |
|  - Net Out-of-Pocket Cost:     $291.43 TROB                                       |
|                                                                                   |
|  ★ Genesis Alpha Guarantee: Member #1 pays $300 -> gets $300 back = $0.00 FREE!   |
+-----------------------------------------------------------------------------------+
|  SECTION 3: WHY JOIN BEFORE DAY 22?                                               |
|  - On Day 22, the separate retail domain (matrix.equora.fi) launches.             |
|  - 35% of all global matrix volume will automatically stream into this DAO.      |
|  - Only Phase 1 DAO members will share this permanent 35% royalty pool!           |
+-----------------------------------------------------------------------------------+
```

#### Exact Content to Show:
- **Hero Title:** `EQUORA.FI GENESIS DAO COUNCIL`
- **Scarcity Counter:** `14 / 100 Seats Available` (Pulsing gold badge).
- **Phase 1 Genesis Timer:** `18 Days : 14 Hours : 22 Mins : 10 Sec` (Digital countdown).
- **Next Seat in Line Preview:** Seat Number (`#87`), Gross Cost (`300 TROB`), Instant Cashback (`$3.45`), Net Out-of-Pocket (`$296.55`).
- **Primary CTA Button:** `[ CLAIM SEAT #87 FOR 300 TROB ]`.
- **Zero-Referral Guarantee Pill:** `"100% Passive Co-Ownership — Zero Direct Referrals Required"`.

---

### Page 2: The 100-Seat Council Matrix Grid & Seat Inspector (`/seats`)
**Target Audience:** Both visitors and active members.  
**Objective:** Full interactive transparency into all 100 seats, occupant identities, lifetime yields, and vacant seats.

#### Content & Layout Wireframe
```
+-----------------------------------------------------------------------------------+
|  ✦ 100-SEAT COUNCIL HOLOGRAPHIC GRID ✦                 [14 SEATS VACANT / 100]    |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|   [ 01 ] [ 02 ] [ 03 ] [ 04 ] [ 05 ] [ 06 ] [ 07 ] [ 08 ] [ 09 ] [ 10 ]           |
|   [ 11 ] [★12★] [ 13 ] [ 14 ] [ 15 ] [ 16 ] [ 17 ] [ 18 ] [ 19 ] [ 20 ]           |
|   [ 21 ] [ 22 ] [ 23 ] [ 24 ] [ 25 ] [ 26 ] [ 27 ] [ 28 ] [ 29 ] [ 30 ]           |
|   ...                                                                             |
|   [ 81 ] [ 82 ] [ 83 ] [ 84 ] [ 85 ] [ 86 ] [⚡87] [   ] [   ] [   ]           |
|                                                                                   |
|  LEGEND & STATE CODES:                                                            |
|  🟡 Gold Tile: Active Claimed Seat (#01–#86)                                      |
|  🟢 Emerald Crown Tile: Your Personal Seat (#12)                                  |
|  🔵 Cyan Pulsing Tile: Next Available in Line (#87)                               |
|  🔴 Crimson Dashed Tile: Defaulted Vacant Seat (Missed 48h Top-Up — Claimable!)   |
|  ⚫ Dark Slate Tile: Locked Future Seats (#88–#100)                                |
|                                                                                   |
+-----------------------------------------------------------------------------------+
|  HOVER TOOLTIP INSPECTOR (FLYOUT ON TILE HOVER):                                  |
|  • Seat Index:         Council Seat #12                                           |
|  • Occupant Address:   0x4B71...89F2 (Click to view Explorer)                     |
|  • Soulbound Token ID: #0012                                                      |
|  • Lifetime Earnings:  $1,280.40 TROB                                             |
|  • 5X Cap Health:      85.3% ($1,280.40 / $1,500.00)                              |
|  • Voting Power:       1.0% (1 Seat = 1 Vote)                                     |
+-----------------------------------------------------------------------------------+
```

#### Exact Content to Show:
- **Interactive 10x10 Grid:** 100 tiles dynamically colored by state.
- **Dynamic Legend:** Visual swatches explaining all 5 states.
- **Tooltip Card on Hover / Touch:** Complete on-chain metrics for the selected seat.
- **Click Action:** If tile is Next in Line or Defaulted Vacant, opens the Claim Modal.

---

### Page 3: Council Member Command Center & Lounge (`/lounge`)
**Target Audience:** Active Council Members who hold a Genesis Soulbound NFT.  
**Objective:** Track individual yields, monitor 5X cap safety, and execute 1-click dividend withdrawals.

#### Content & Layout Wireframe
```
+-----------------------------------------------------------------------------------+
|  ✦ SOVEREIGN COUNCIL MEMBER LOUNGE ✦       [Seat #12]  [Wallet: 0x4B7...89F2]     |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  +-----------------------------+  +-------------------------------+ +-----------+ |
|  | SOULBOUND PASS #12          |  | 5X EARNINGS CAP HEALTH        | | LIFETIME  | |
|  | Tier: Genesis Founding Owner|  | $840.00 / $1,500.00 TROB      | | DIVIDENDS | |
|  | Voting Sovereignty: 1.0%    |  | [====== 56% Safe ======     ] | | $1,280.40 | |
|  | Status: ACTIVE & QUALIFIED  |  | Safe Zone ($660 Remaining)   | | +$42.50 24h| |
|  +-----------------------------+  +-------------------------------+ +-----------+ |
|                                                                                   |
|  +------------------------------------------------------------------------------+ |
|  | 💰 CLAIMABLE INTERNAL DIVIDENDS: $420.50 TROB                                | |
|  |    [ ⚡ 1-CLICK WITHDRAW TO TROBSAFE WALLET ]    [ 🔄 RE-INVEST IN PROTOCOL ] | |
|  +------------------------------------------------------------------------------+ |
|                                                                                   |
|  +-------------------------------------+  +------------------------------------+  |
|  | 300/N QUEUE REDISTRIBUTION INFLOW   |  | DAY 22 RETAIL MATRIX ROYALTIES     |  |
|  | Received from Seats #13 to #86       |  | 35% Global cut from Domain B       |  |
|  | Total Earned: $512.40 TROB          |  | Status: UNLOCKS IN 18 DAYS         |  |
|  | Avg Per Joiner: $6.92 TROB          |  | Forecasted Inflow: $2,500+/mo      |  |
|  +-------------------------------------+  +------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

#### Exact Content to Show:
- **Holographic Soulbound NFT Pass Card:** 3D rendered card with Token ID `#0012`, owner address, and 1.0% voting weight.
- **5X Cap Health Progress Bar:** Real-time earnings out of $1,500 TROB. Shows `Safe Zone` (<$1,200), `Amber Warning` ($1,200–$1,499), or `Crimson 48h Clock` ($\ge$ $1,500).
- **1-Click Cashout Bar:** Displays `$420.50 TROB` with instant withdrawal button (gas $< \$0.005$).
- **Inflow Channel Breakdown:** Card A (Entry Queue distributions) and Card B (Day 22 matrix royalties).

---

### Page 4: Day 22 Retail Matrix Bridge & Royalty Forecast (`/matrix-bridge`)
**Target Audience:** All DAO members and visitors.  
**Objective:** Showcase the connection between the DAO domain (`dao.equora.fi`) and the upcoming retail matrix domain (`matrix.equora.fi`).

#### Content & Layout Wireframe
```
+-----------------------------------------------------------------------------------+
|  ✦ DAY 22 RETAIL MATRIX BRIDGE & ROYALTY ENGINE ✦                                 |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|     +-----------------------------------------------------------------------+     |
|     |  COUNTDOWN TO RETAIL MATRIX LAUNCH (ON matrix.equora.fi):             |     |
|     |                                                                       |     |
|     |        [ 18 DAYS ]   :   [ 14 HOURS ]   :   [ 22 MINS ]   :   [ 10 SEC ]  |     |
|     |                                                                       |     |
|     |  ✦ ON DAY 22, NORMAL $30 ID MATRIX SEATS START FILLING GLOBALLY ✦    |     |
|     +-----------------------------------------------------------------------+     |
|                                                                                   |
|  HOW THE TWO DOMAINS CONNECT ON-CHAIN:                                            |
|                                                                                   |
|   ┌───────────────────────────┐                ┌──────────────────────────────┐   |
|   │  DOMAIN B: matrix.equora  │                │  DOMAIN A: dao.equora.fi     │   |
|   │  (Everyday Matrix Users)  │                │  (100 Genesis DAO Council)   │   |
|   ├───────────────────────────┤                ├──────────────────────────────┤   |
|   │ • Normal $30 ID Users     │                │ • 100 Sovereign Seats        │   |
|   │ • Progress Slots 1 to 12  │    ON-CHAIN    │ • 0 Recruitment Required     │   |
|   │ • Nodes 4, 5, 14 Trigger  │ ─────────────> │ • Captures 35% of ALL        │   |
|   │   Protocol Royalty Splits │   35% FLOW     │   Retail Matrix Transactions │   |
|   └───────────────────────────┘                └──────────────────────────────┘   |
|                                                                                   |
|  PROJECTED MATRIX DIVIDEND YIELD FOR EACH DAO SEAT:                               |
|  - At 1,000 Matrix Cyclers:   $350 TROB / month per DAO seat                      |
|  - At 5,000 Matrix Cyclers:   $1,750 TROB / month per DAO seat                    |
|  - At 20,000 Matrix Cyclers:  $7,000 TROB / month per DAO seat                    |
+-----------------------------------------------------------------------------------+
```

#### Exact Content to Show:
- **Digital Flip Clock:** Counting down to Day 22 launch of `matrix.equora.fi`.
- **Domain Interconnect Infographic:** Visual diagram illustrating how the 35% fee stream flows from Domain B to Domain A.
- **Passive Dividend Yield Forecaster:** Table showing projected monthly earnings per DAO seat at various retail matrix adoption volumes.

---

### Page 5: Treasury Wallet & Financial Ledger (`/treasury`)
**Target Audience:** Council members managing their earnings.  
**Objective:** Internal non-custodial balance accounting, instant blockchain withdrawal, and full audit ledger.

#### Content & Layout Wireframe
```
+-----------------------------------------------------------------------------------+
|  ✦ DAO TREASURY WALLET & FINANCIAL AUDIT LEDGER ✦                                 |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  +-----------------------------------+  +---------------------------------------+ |
|  | INTERNAL LEDGER BALANCE           |  | CONNECTED WEB3 WALLET (TROBSAFE)      | |
|  | $420.50 TROB                      |  | $1,420.00 TROB                        | |
|  | Ready for Instant 1-Click Cashout |  | Network: Polygon / Trobium Network    | |
|  +-----------------------------------+  +---------------------------------------+ |
|                                                                                   |
|  1-CLICK WITHDRAWAL WIDGET:                                                       |
|  Amount (TROB): [ 420.50          ]  [25%] [50%] [75%] [MAX]                      |
|  Estimated Gas Fee: < $0.005 USD     Destination: 0x4B71...89F2                   |
|  [ ⚡ CONFIRM BLOCKCHAIN WITHDRAWAL ]                                              |
|                                                                                   |
|  TRANSACTION AUDIT LEDGER:                                                        |
|  [All]  [300/N Queue Cashback]  [48h Top-Up Payouts]  [Matrix Yield]  [Withdraw]  |
|  -------------------------------------------------------------------------------  |
|  Date        | Type             | Amount     | Source / Seat | Tx Hash            |
|  19 Sep 2026 | 300/N Push       | +$3.45     | Seat #87 Join | 0x8f2a...110b [↗]  |
|  19 Sep 2026 | Matrix Dividend  | +$42.50    | Pool Share    | 0x3c4d...9921 [↗]  |
|  18 Sep 2026 | Withdrawal       | -$200.00   | To Wallet     | 0x1a2b...7742 [↗]  |
+-----------------------------------------------------------------------------------+
```

#### Exact Content to Show:
- **Internal Ledger Card:** Real-time earnings accumulated in the smart contract.
- **External Wallet Card:** TROB coins held in the connected Web3 wallet.
- **1-Click Cashout Form:** Input amount, percentage quick chips, gas fee preview, confirm button.
- **Filterable Audit Ledger:** Real-time chronological transaction history with block explorer links.

---

## 4. Master Modals for the DAO Domain

### Modal 1: 48-Hour Urgency Re-Topup Modal
- **Trigger:** When member cumulative earnings reach $\ge \$1,500$ TROB (`isCapped == true`).
- **Visuals:** Flashing crimson border, dark red ambient vignette, digital flip clock (`47:58:22`).
- **Explanation:** *"Your DAO Seat #12 has reached the 5X Earnings Cap ($1,500). Deposit 300 TROB within 48 hours to reset your cap to 0% and safeguard your seat from forfeiture."*
- **Primary CTA:** `[ RE-TOPUP 300 TROB NOW ]`.

### Modal 2: Defaulted Vacant Seat Sniping Modal
- **Trigger:** When an external user clicks a crimson dashed tile on the 10x10 grid.
- **Visuals:** Alert banner: *"Council Seat #44 Vacancy Available!"*
- **Explanation:** *"The prior owner missed their 48-hour re-topup deadline. Pay 300 TROB to claim Seat #44, take over Council co-ownership, and mint a fresh Soulbound NFT."*
- **Primary CTA:** `[ CLAIM DEFAULTED SEAT & MINT NFT (300 TROB) ]`.

---

## 5. Visual Design Tokens (VIP Sovereign Theme)

| Token Name | Hex Code | Semantic Role in `dao.equora.fi` |
|:---|:---:|:---|
| **Obsidian Void** | `#06080F` | Main application background |
| **Slate Surface** | `#0B111E` | Glass card surfaces (`backdrop-filter: blur(16px)`) |
| **Sovereign Gold**| `#F59E0B` / `#FBBF24` | Primary brand accent, VIP badges, council crowns, CTA buttons |
| **Radiant Emerald**| `#00E599` | Instant cashback values, positive yields, safe zone |
| **Urgency Crimson**| `#EF4444` | 48h countdown clock, default warnings, vacancy alerts |
| **Cyber Cyan** | `#06B6D4` | Next available seat indicator, simulation sliders |
| **Title Font** | `Cinzel` / `Cabinet Grotesk` | Institutional headers, VIP council cards |
| **Data Font** | `JetBrains Mono` | Tabular numbers, TROB amounts, countdown clocks |

---

## 6. Figma Deliverables Summary for UI/UX Designer

The UI/UX designer should deliver the following Figma frames for `dao.equora.fi`:
- [ ] **Frame 1:** Sovereign DAO Gateway (`/`) — Desktop 1440px & Mobile 390px.
- [ ] **Frame 2:** 100-Seat Council Matrix Grid (`/seats`) with all 5 tile state variations & Hover Flyout.
- [ ] **Frame 3:** Member Command Center Lounge (`/lounge`) with 3D Soulbound Pass & 5X Cap Health.
- [ ] **Frame 4:** Day 22 Retail Matrix Bridge (`/matrix-bridge`) with 21-Day Countdown Clock & Domain Interconnect diagram.
- [ ] **Frame 5:** Treasury Wallet & Audit Ledger (`/treasury`) with 1-Click Withdrawal.
- [ ] **Frame 6 (Modals):** 48-Hour Urgency Re-Topup Modal & Defaulted Seat Sniping Flow.
