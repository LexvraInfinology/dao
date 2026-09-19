# Equora.Fi — Phase 1 (Genesis DAO Exclusive) UI/UX Design Specification

> **Document Version:** 1.0.0 (Phase 1 Dedicated Launch)  
> **Target Audience:** UI/UX Designers, Frontend Developers, Product Managers  
> **Strategic Objective:** Launch Equora with **Phase 1 strictly dedicated to the Genesis DAO Council (100 Seats)**, keeping retail matrix features gated for Phase 2.

---

## 1. Phase 1 Strategic Product Architecture

The client has specified that **Phase 1 is strictly the DAO Council**. 

### 1.1 Why Phase 1 is DAO-Only:
1. **Founding Leadership Genesis:** The first 100 seats are reserved for sovereign leaders who fund the protocol's initial liquidity foundation.
2. **Zero Retail Confusion:** Users are not distracted by 12 matrix slots or downline trees; 100% of attention is on securing 1 of the 100 Soulbound seats.
3. **Mathematical Engine Active:** The **`300 / N` Instant Redistribution Engine** and **5X Earnings Cap ($1,500 TROB)** are fully live.
4. **Phase 2 Pipeline:** Phase 2 (12-Slot Community Matrix, 4 Value Pools, Salary Club) is prominently displayed as "Phase 2 Unlocks Soon", teasing that 35% of all Phase 2 matrix volume will stream permanently into the Genesis DAO Treasury.

---

## 2. Phase 1 Sitemap & Navigation

For Phase 1, the app navigation is streamlined into **Active DAO Pages** and **Phase 2 Teasers**:

```
+-----------------------------------------------------------------------------------+
| EQUORA.FI (Phase 1: Genesis DAO Council Live)                                     |
| [Genesis DAO (★ LIVE)]  [Dashboard]  [Treasury Wallet]  [Matrix (Phase 2 Locked)] |
+-----------------------------------------------------------------------------------+
```

### Active Phase 1 Routes:
1. **`/` (Phase 1 Landing Page):** Focused 100% on the Genesis DAO Council, live 100-seat ticker, `300 / N` calculator, and wallet connect.
2. **`/dao` (Genesis DAO Portal — Primary Screen):** The core product screen. Interactive 100-Seat Grid, Seat Claim modal, `300 / N` simulator, 5X Cap monitor, 48h re-topup countdown, and Soulbound NFT card.
3. **`/dashboard` (Founder Executive Overview):** Personal Seat status, lifetime yield, cap progress, governance vote weight (1.0%).
4. **`/wallet` (Treasury & Cashout):** TROB balance, instant payouts ledger, 1-click non-custodial withdrawal.

### Gated Phase 2 Routes (Locked Teaser Mode):
5. **`/matrix` (Phase 2 Teaser):** 14-Node preview showing how Nodes 4, 5, and 14 will route 35% into the DAO. Countdown timer to Phase 2 launch.
6. **`/rewards` (Phase 2 Teaser):** Preview of the 4 Value Pools, Monthly Salary Tiers, and Magic Blind Box.

---

## 3. Screen-by-Screen Content Breakdown for Phase 1

---

### SCREEN 1: Phase 1 Landing Page (`/`)
*The public entry point designed to create extreme FOMO and scarcity around the 100 seats.*

- **Top Navigation Bar:**
  - Equora 3D Logo + Wordmark (`EQUORA.FI`)
  - Status Pill: `🟢 Phase 1 Live: Genesis DAO Council`
  - Links: Genesis Council, 300/N Math, Governance, Phase 2 Roadmap
  - [Connect Wallet] button (TrobSafe / MetaMask / Rainbow)
- **Hero Section:**
  - Sovereign Badge: `👑 Only 100 Sovereign Founder Seats Available Worldwide`
  - Headline: *"Decentralized Governance Meets Instant Peer-to-Peer Redistribution"*
  - Subheadline: *"Deposit 300 TROB to claim an immutable Soulbound seat. Receive instant cashback via the 300/N formula and earn lifetime 35% royalties on all future matrix volume."*
  - Primary CTA: **[Claim Your Genesis DAO Seat (300 TROB)]**
  - **Live Scarcity Meter:**
    - Visual bar: `42 / 100 Seats Claimed` (58 Seats Remaining)
    - 21-Day Genesis Window Countdown Timer (Days : Hours : Mins : Secs)
- **Section 2: `300 / N` Instant Redistribution Interactive Widget:**
  - Embedded simulator allowing visitors to slide $N$ from 1 to 100:
    - *Seat 1:* Deposits 300 TROB $\rightarrow$ Gets **300 TROB back instantly** ($0 Net Cost).
    - *Seat 2:* Deposits 300 TROB $\rightarrow$ Gets **150 TROB back instantly**; 150 TROB to Seat 1.
    - *Seat 3:* Deposits 300 TROB $\rightarrow$ Gets **100 TROB back instantly**; 100 TROB to Seat 1, 100 TROB to Seat 2.
    - Highlights that Member 1 earns **1,556.21 TROB (5.19X ROI)** on a net $0 out-of-pocket entry!
- **Section 3: The 5X Earnings Cap & Perpetual Re-Topup Flywheel:**
  - Explains how each 300 TROB deposit earns up to **1,500 TROB (5X Cap)**.
  - Leaders pocket **1,200 TROB clean profit** and deposit 300 TROB within 48 hours to reload.
  - Zero dead seats: If someone misses 48 hours, the lowest vacant seat is opened for new buyers!
- **Section 4: Soulbound NFT Pass Showcase:**
  - 3D render of the **Genesis Council Soulbound NFT Pass** (`dao_card.jpg`).
  - Bullet points: 1 Seat = 1 Vote (1.0%), Non-transferable, On-chain proof of seniority.
- **Section 5: Phase 2 Matrix Preview Banner:**
  - "Coming in Phase 2: The 12-Slot Community Matrix. 35% of all global matrix cycles will automatically stream into Genesis DAO members' wallets."

---

### SCREEN 2: Genesis DAO Portal (`/dao`) — *THE MAIN APPLICATION SCREEN*
*The most important screen in Phase 1. Users inspect seats, claim passes, monitor payouts, and manage re-topups.*

#### Layout Structure:
```
+----------------------------------------------------------------------------------------------------+
|  HEADER: Genesis DAO Council (100 Sovereign Seats) | Phase 1 Window: 14d 06h 22m | Seats: 42/100   |
+----------------------------------------------------------------------------------------------------+
|  LEFT (65% Width): THE 100-SEAT INTERACTIVE GRID                                                   |
|  [ 10 x 10 Grid of Seats 1 to 100 ]                                                                |
|  • Seat 1 to 42: Gold (Claimed) with NFT Badges                                                    |
|  • Seat 43: Pulsing Emerald Border (Next Available to Join!)                                       |
|  • Seat 14: Glowing Crown (Your Seat!)                                                             |
|  • Seat 7: Red Dashed Border (Vacant due to missed 48h re-topup — Claimable!)                      |
+----------------------------------------------------------------------------------------------------+
|  RIGHT (35% Width): COUNCIL PASS & ACTION PANEL                                                    |
|  • If Not a Member:                                                                                |
|    - 3D Soulbound NFT Pass Graphic (dao_card.jpg)                                                  |
|    - "Claim Seat #43 for 300 TROB"                                                                 |
|    - Instant Cashback Preview: "You will immediately receive 300 / 43 = 6.97 TROB back"            |
|    - [Approve & Claim Seat] Button                                                                 |
|  • If Already a Member:                                                                            |
|    - Your Seat ID: #14 • Soulbound Token #14                                                       |
|    - Governance Weight: 1.00% (1 Vote)                                                             |
|    - 5X Earnings Cap Progress: 450 / 1,500 TROB (30%) [==========>             ]                    |
|    - Cap Status: [ ACTIVE & SAFE ] (or URGENT 48-HOUR TIMER)                                       |
+----------------------------------------------------------------------------------------------------+
|  BOTTOM SECTION: 300/N REDISTRIBUTION SIMULATOR + 48-HOUR RE-TOPUP RULES                          |
|  • Dynamic Seat Slider (1 to 100) with Live Inflow & Payout Breakdown                              |
|  • 48-Hour Re-topup Urgency rules explanation & Vacancy Scan details                               |
+----------------------------------------------------------------------------------------------------+
```

#### Component Details:
1. **100-Seat Visual Grid (10 columns x 10 rows):**
   - Each cell is a 48x48px interactive tile.
   - Hovering triggers a rich tooltip (`DAOSlotTooltip`): Seat #, Owner short address, Soulbound NFT ID, Total yield pushed, Cap status.
2. **5X Earnings Cap Monitor Widget:**
   - Visual progress bar: `Earned / 1,500 TROB`.
   - **Urgent State (When $\ge 1,500$ TROB):**
     - Amber/Red pulsing border with warning icon.
     - Digital countdown clock: `41:22:18 remaining`.
     - Primary Button: `[Re-Topup 300 TROB (Reset Cap to 0 / 1,500)]`.
3. **`300 / N` Interactive Simulator:**
   - Slider from 1 to 100 with 4 live metric tiles: Deposit (300 TROB), Instant Cashback ($300/N$), Distributed to Prior Members ($300 - 300/N$), Net Out-of-Pocket.

---

### SCREEN 3: Founder Dashboard (`/dashboard`)
*Personalized executive dashboard for connected users during Phase 1.*

- **Founder Profile Card:**
  - Connected Address + Copy button.
  - Council Status: `Genesis Founder (Seat #14)` in Gold OR `Public Participant` in Slate.
  - 1 Seat = 1 Vote (1.0% Governance Power).
  - Soulbound NFT Token ID.
- **Phase 1 Financial Metric Tiles (4 Cards):**
  1. **Total Queue Dividends Earned:** In TROB and USD (accumulated via 300/N).
  2. **5X Cap Progress:** `Earned / 1,500 TROB` + progress bar.
  3. **Available Internal Balance:** Ready for 1-click withdrawal.
  4. **Phase 2 Inflow Forecast:** Estimated monthly passive royalties once the matrix launches.
- **Quick Links:**
  - [Open 100-Seat Council Grid]
  - [Withdraw to TrobSafe Wallet]
  - [View Phase 2 Matrix Blueprint]

---

### SCREEN 4: Treasury Wallet & Cashout (`/wallet`)
*Internal non-custodial balance and withdrawal ledger.*

- **Balance Cards:**
  - *Internal Ledger Balance:* Real-time earnings ready to cash out (`450.00 TROB`).
  - *External Web3 Wallet Balance:* Connected wallet balance on Trobium / Polygon.
- **1-Click Instant Withdrawal Box:**
  - Input field for TROB amount (`25%`, `50%`, `75%`, `MAX`).
  - Estimated gas fee pill (`< $0.01`).
  - Action Button: **[Confirm Instant Withdrawal]**.
- **Historical Payout Ledger:**
  - Filterable by *DAO Queue Push*, *Re-topup Payouts*, and *Withdrawals*.
  - Columns: Event, Amount (TROB), Sender / Incoming Seat, Date, Status (Confirmed), Explorer Link.

---

### SCREEN 5: Phase 2 Teaser Pages (`/matrix` & `/rewards`)
*Maintains excitement and forward momentum while keeping Phase 1 focused on the DAO.*

- **Visual State:** Blurred interactive 14-node matrix board or 4 value pools with an elegant glass overlay.
- **Lock Badge:** `🔒 Phase 2 Community Matrix & Value Pools`
- **Countdown Banner:** "Phase 2 Public Matrix Launch Begins in [ 14 Days 06 Hours ]"
- **Value Proposition for DAO Members:**
  - *"Genesis DAO Council members will automatically earn 35% of all global matrix inflows once Phase 2 goes live. Secure your seat in Phase 1 to capture maximum lifetime royalties!"*
- **CTA:** [Claim a Phase 1 DAO Seat Now]

---

## 4. Phase 1 Designer Handoff Deliverables

Please have the UI/UX design team provide:

1. **Figma Desktop Screens (1440px):**
   - `01_Landing_Phase1_DAO`
   - `02_DAO_Portal_100Seat_Grid` (Normal State, Hover Tooltip, Claiming Modal)
   - `02_DAO_Portal_Urgent_48h_State` (When cap reaches 1,500 TROB with live countdown)
   - `03_Dashboard_Founder`
   - `04_Wallet_and_Cashout`
   - `05_Matrix_Phase2_Locked_Teaser`
2. **Figma Mobile Screens (390px):**
   - Full vertical mobile screens for all 5 screens above, optimized for mobile DApp browsers.
3. **Core Modals:**
   - Wallet Connect Modal (TrobSafe, MetaMask, WalletConnect)
   - 300 TROB DAO Approval & Deposit Stepper
   - 48-Hour Re-Topup Urgency Modal
