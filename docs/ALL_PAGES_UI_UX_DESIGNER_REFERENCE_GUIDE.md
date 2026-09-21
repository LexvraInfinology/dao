# Equora.Fi — Complete All-Pages UI/UX Designer Reference & Data Catalog
**Document Version:** 3.0 (Master Unified Edition)  
**Target Audience:** Lead UI/UX Designer, Product Designers, Frontend Web3 Engineers  
**Scope:** Complete Page-by-Page Visual Reference, Data Schemas ("Sata"), Wireframes, and Layout Rules for ALL 8 Protocol Pages  
**Currency Standard:** TROB / USD (1 TROB = $1.00 USD)

---

## 1. Executive Protocol Overview & Strategic Segregation

Equora.Fi is an autonomous, decentralized Web3 protocol designed with a strict **dual-tier user ecosystem**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       EQUORA.FI ECOSYSTEM ARCHITECTURE                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
        ┌──────────────────────────────┴──────────────────────────────┐
        ▼                                                             ▼
┌──────────────────────────────────────┐    ┌─────────────────────────────────┐
│  TIER 1: GENESIS DAO COUNCIL (100)   │    │  TIER 2: EVERYDAY MATRIX USERS  │
│  ★ SOVEREIGN VIP CO-OWNERSHIP ★      │    │  ★ CYCLICAL NETWORK REVENUE ★   │
├──────────────────────────────────────┤    ├─────────────────────────────────┤
│ • Access: Flat 300 TROB ($300)       │    │ • Access: Tiered $30 to $61,440 │
│ • Referrals Required: ZERO (0)       │    │ • Referrals: 2 Directs Required │
│ • Governance: Soulbound ERC-721      │    │ • Governance: 5-Digit ID Code   │
│ • Payouts: Instant 300/N Cashback    │    │ • Payouts: 600% Direct Cash     │
│ • Royalties: 35% Global Matrix Pool  │    │ • Network: Team Tree & Spillovers│
│ • Cap: 5X ($1,500) with 48h Top-Up   │    │ • Pools: Salary & Magic Box     │
│ • UI Theme: Swiss Private Wealth     │    │ • UI Theme: Cyber Matrix Engine │
└──────────────────────────────────────┘    └─────────────────────────────────┘
```

---

## 2. Global Design System & Luxury Web3 Tokens

The UI/UX designer must utilize the following token library across all pages:

| Token Category | Token Name | Value / Hex Code | Semantic Role in Interface |
|:---|:---|:---:|:---|
| **Background** | `bg-obsidian-void` | `#06080F` | Deep space canvas base |
| **Surface** | `bg-card-slate` | `#0B111E` | Elevated glass card (`backdrop-filter: blur(16px)`) |
| **Hairline Stroke** | `border-subtle` | `rgba(255, 255, 255, 0.08)` | Standard card division |
| **Gold Accent** | `accent-gold` | `#F59E0B` / `#FBBF24` | Sovereign tier, DAO crown, buttons, highlighted badges |
| **Emerald Accent** | `accent-emerald` | `#00E599` / `#10B981` | Yields, instant cashback, safe zones, positive cashflow |
| **Cyan Accent** | `accent-cyan` | `#06B6D4` / `#38BDF8` | Available slots, interactive simulation sliders, next in line |
| **Crimson Accent** | `accent-crimson` | `#EF4444` | 48h countdown urgency, vacancy alerts, cap warnings |
| **Typography: Titles**| `font-display` | `Cinzel` / `Cabinet Grotesk` | High-impact institutional headers, VIP cards, podium ranks |
| **Typography: Body** | `font-sans` | `Inter` | Primary content, navigation, buttons, descriptions |
| **Typography: Numbers**| `font-mono` | `JetBrains Mono` | Tabular financial amounts, addresses, countdown clocks |

---

## 3. Complete Page-by-Page Visual & Data ("Sata") Reference

---

### Page 1: Genesis DAO Council Portal (`/dao`)
**Role:** Sovereign governance, 100-Seat Council co-ownership, 300/N instant redistribution, and passive 35% global matrix dividend claims.

#### Visual Screenshots
- **Desktop Viewport (1440 × 900):** ![DAO Desktop](file:///c:/Users/Dell/Documents/codes/equora/docs/assets/screenshots/dao_desktop.png)
- **Mobile DApp Browser (390 × 844):** ![DAO Mobile](file:///c:/Users/Dell/Documents/codes/equora/docs/assets/screenshots/dao_mobile.png)

#### Complete Component Data ("Sata") Schema
| Component / UI Field | Smart Contract Function | Type | Live Production Value | Empty State | UI Display Rule |
|:---|:---|:---:|:---|:---|:---|
| **Seats Claimed** | `EquoraDAO.getDAOStats().memberCount` | `uint256` | **`86`** | `0` | Padded integer: `86 / 100` |
| **Seats Remaining** | `EquoraDAO.getRemainingPositions()` | `uint256` | **`14`** | `100` | Highlight gold if $< 20$ |
| **Genesis Deadline** | `EquoraDAO.GENESIS_WINDOW_END()` | `timestamp` | **`1,791,240,000`** | Active | Countdown clock: `DD:HH:MM:SS` |
| **Soulbound Token ID**| `EquoraDAOMembership.tokenOfOwnerByIndex(addr, 0)`| `uint256` | **`#0012`** | `N/A` | 4-digit zero-padded |
| **Voting Power** | Constant: `1 / 100` | `percent` | **`1.0%`** | `0.0%` | Badge: `1 Seat = 1 Vote` |
| **5X Cap Earned** | `EquoraDAO.getMemberDetails(addr)[4]` | `uint256` | **`$840.00 TROB`** | `$0.00` | Formatted ether, 2 decimals |
| **5X Cap Limit** | `EquoraDAO.getCapProgress(addr)[1]` | `uint256` | **`$1,500.00 TROB`** | `$1,500.00` | Fixed constant ($300 \times 5$) |
| **48h Re-Topup Clock**| `EquoraDAO.retopupTimeRemaining(addr)` | `uint256` | **`172,400s (47h 53m)`**| `0s` | Digital flip clock `HH:MM:SS` |
| **Matrix Pool Claimable**| `EquoraDAO.getMemberDetails(addr)[8]` | `uint256` | **`$300.00 TROB`** | `$0.00` | 1-Click Claim Action |
| **Queue Fallback Claim**| `EquoraDAO.getMemberDetails(addr)[3]` | `uint256` | **`$120.50 TROB`** | `$0.00` | Auto-swept during claim |
| **100-Seat Array Grid**| `EquoraDAO.getAllMembers()` | `Member[100]`| 100 Seat Records | 100 Locked | 10x10 tile map with 5 color states |

---

### Page 2: Executive Portfolio Dashboard (`/dashboard`)
**Role:** Command center upon connecting wallet. Displays decentralized identity, VIP badges, 5-digit referral code, and protocol earnings.

#### Visual Screenshots
- **Desktop Viewport (1440 × 900):** ![Dashboard Desktop](file:///c:/Users/Dell/Documents/codes/equora/docs/assets/screenshots/dashboard_desktop.png)
- **Mobile DApp Browser (390 × 844):** ![Dashboard Mobile](file:///c:/Users/Dell/Documents/codes/equora/docs/assets/screenshots/dashboard_mobile.png)

#### Complete Component Data ("Sata") Schema
| Component / UI Field | Smart Contract Function | Type | Live Production Value | Empty State | UI Display Rule |
|:---|:---|:---:|:---|:---|:---|
| **Connected Wallet** | Wagmi / Web3 Provider | `address` | **`0x4B71a...89F2`** | Not Connected | Shortened `0x...` with 1-click copy |
| **5-Digit Referral Code**| `EquoraRegistry.userCode(addr)` | `uint24` | **`#10042`** | `#10000` | Monospace gold badge |
| **Sponsor ID** | `EquoraRegistry.sponsorOf(addr)` | `uint24` | **`#10000 (Root)`** | N/A | Subtitle under referral code |
| **Qualification Badge**| `EquoraRegistry.isQualified(addr)` | `bool` | **`QUALIFIED (2+ Directs)`**| Unqualified | Green badge if qualified, Amber if not |
| **KPI 1: Protocol Yield**| Aggregated yield sum | `uint256` | **`$2,480.50 TROB`** | `$0.00` | Large header metric |
| **KPI 2: Matrix Cashflow**| `EquoraMatrix.totalEarned(addr)` | `uint256` | **`$1,200.00 TROB`** | `$0.00` | 600% Direct cashflow metric |
| **KPI 3: DAO Dividends**| `EquoraDAO.totalEarned(addr)` | `uint256` | **`$860.00 TROB`** | `$0.00` | DAO royalty revenue metric |
| **KPI 4: Withdrawable** | `internalLedgerBalance(addr)` | `uint256` | **`$420.50 TROB`** | `$0.00` | Emerald ticker with Withdraw button |
| **Activity Feed** | WebSocket / Contract Events | `Event[]` | Real-time push events | Empty feed | Chronological list of network actions |

---

### Page 3: 12-Slot Matrix Engine (`/matrix`)
**Role:** Cyclical 14-position single-leg matrix board. Visualizes slot progression (Slots 1–12), node payout routing, auto-upgrades, and board recycles.

#### Visual Screenshots
- **Desktop Viewport (1440 × 900):** ![Matrix Desktop](file:///c:/Users/Dell/Documents/codes/equora/docs/assets/screenshots/matrix_desktop.png)
- **Mobile DApp Browser (390 × 844):** ![Matrix Mobile](file:///c:/Users/Dell/Documents/codes/equora/docs/assets/screenshots/matrix_mobile.png)

#### Complete Component Data ("Sata") Schema
| Component / UI Field | Smart Contract Function | Type | Live Production Value | Empty State | UI Display Rule |
|:---|:---|:---:|:---|:---|:---|
| **Active Slot Index** | User selection state | `uint8` | **`Slot 1 ($30)`** | Slot 1 | Pill selector (Slots 1 to 12) |
| **Slot Unlock Status** | `EquoraMatrix.userSlotActive(addr, slot)`| `bool` | **`ACTIVE`** | `LOCKED` | Gold badge if active, Buy button if locked |
| **Current Board Cycle**| `EquoraMatrix.currentCycle(addr, slot)` | `uint32` | **`Cycle #3`** | `Cycle #1` | Monospace cycle counter |
| **Occupied Nodes Count**| `EquoraMatrix.getFilledNodesCount(addr, slot)`| `uint8` | **`8 / 14 Nodes`** | `0 / 14` | Radial progress / visual counter |
| **14-Node State Array** | `EquoraMatrix.getNodeDetails(addr, slot)`| `Node[14]` | 14 Occupant Records | 14 Empty | Visual single-leg tree hierarchy |
| **P1, P2 Node Flow** | Contract routing math | `address` | Routed to Uplines | Empty | Tag: `Upline Commission` |
| **P3, P6, P8, P9, P11, P12**| Direct Cash Nodes | `uint256` | **`600% ROI ($180)`** | `$0` | Tag: `Direct Cash to Owner` |
| **P4 Node Flow** | Protocol Value Pools | `uint256` | **`$30 split to 4 Pools`**| `$0` | Tag: `35% DAO, 40% Sal, 10% Box, 15% Rew` |
| **P5, P10 Node Flow** | Auto-Upgrade Reserve | `uint256` | **`$60 reserved for Slot 2`**| `$0` | Tag: `Auto-Slot Upgrade` |
| **P14 Node Flow** | Board Recycler | `trigger` | Completes Cycle & Resets | Open | Tag: `Re-Cycle to Cycle #N+1` |

---

### Page 4: Partners & Team Genealogy (`/referrals`)
**Role:** Network builder hub with 1-click referral link generation, QR codes, direct downlines, and interactive organizational tree.

#### Visual Screenshots
- **Desktop Viewport (1440 × 900):** ![Referrals Desktop](file:///c:/Users/Dell/Documents/codes/equora/docs/assets/screenshots/referrals_desktop.png)
- **Mobile DApp Browser (390 × 844):** ![Referrals Mobile](file:///c:/Users/Dell/Documents/codes/equora/docs/assets/screenshots/referrals_mobile.png)

#### Complete Component Data ("Sata") Schema
| Component / UI Field | Smart Contract Function | Type | Live Production Value | Empty State | UI Display Rule |
|:---|:---|:---:|:---|:---|:---|
| **Referral Link** | Formatted: `domain.com/?ref=10042` | `string` | **`equora.fi/?ref=10042`** | Base URL | 1-Click copy button with toast |
| **QR Code Modal** | Generated SVG QR | `image` | Rendered QR Data | Hidden | Tap to expand for event scanning |
| **Qualification Tracker**| `EquoraRegistry.directCount(addr)` | `uint8` | **`5 / 2 Directs`** | `0 / 2` | Green if $\ge 2$, Warning if $< 2$ |
| **Direct Partners Count**| `EquoraRegistry.getDirects(addr).length`| `uint256` | **`5 Members`** | `0` | Metric card |
| **Total Team Size** | Indexer / Graph query | `uint256` | **`142 Members (L1-L10)`** | `0` | Multi-tier team size |
| **Referral Earnings** | Indexer aggregated volume | `uint256` | **`$3,420.00 TROB`** | `$0.00` | Metric card |
| **Genealogy Tree Node**| `EquoraRegistry.getDownlineTree(addr)` | `TreeData` | Collapsible Hierarchy | Single Node | Expandable node with ID, slot, volume |

---

### Page 5: Rewards & 4 Value Pools (`/rewards`)
**Role:** Transparency portal for the 4 autonomous protocol pools fed by Nodes 4, 5, and 14 across the entire matrix network.

#### Visual Screenshots
- **Desktop Viewport (1440 × 900):** ![Rewards Desktop](file:///c:/Users/Dell/Documents/codes/equora/docs/assets/screenshots/rewards_desktop.png)
- **Mobile DApp Browser (390 × 844):** ![Rewards Mobile](file:///c:/Users/Dell/Documents/codes/equora/docs/assets/screenshots/rewards_mobile.png)

#### Complete Component Data ("Sata") Schema
| Component / UI Field | Smart Contract Function | Type | Live Production Value | Empty State | UI Display Rule |
|:---|:---|:---:|:---|:---|:---|
| **Pool 1: DAO Treasury (35%)**| `EquoraVault.daoPoolBalance()` | `uint256` | **`$42,800.00 TROB`** | `$0.00` | Card with claim button |
| **Pool 2: Monthly Salary (40%)**| `EquoraSalaryPool.pendingPoolBalance()`| `uint256` | **`$48,914.00 TROB`** | `$0.00` | Card with monthly settlement timer |
| **Salary Settlement Clock**| Monthly recurring on the 11th | `timestamp` | **`14d : 08h : 12m`** | Active | Countdown to payout |
| **Personal Salary Rank**| `EquoraSalaryPool.userTier(addr)` | `enum` | **`BETA LEADER (Tier 2)`** | `NONE (0)` | Badge: Alpha, Beta, Gamma, Crown |
| **Next Rank Criteria** | Milestones requirement check | `struct` | 15 Directs, $5k Volume | 5 Directs | Step progress tracker |
| **Pool 3: Magic Box (10%)**| `EquoraMagicBox.poolBalance()` | `uint256` | **`$12,228.00 TROB`** | `$0.00` | 3D Mystery Box interactive card |
| **Box Unlock Countdown**| Quarterly unlock schedule | `timestamp` | **`42d : 11h : 05m`** | Active | Rarity loot box drop countdown |
| **Pool 4: Lucky Drops (15%)**| `EquoraRewardPool.poolBalance()` | `uint256` | **`$18,342.00 TROB`** | `$0.00` | Card with weekly random winners list |

---

### Page 6: Treasury Wallet & Financial Ledger (`/wallet`)
**Role:** Non-custodial internal balance management, 1-click blockchain withdrawals, gas estimation, and financial audit ledger.

#### Visual Screenshots
- **Desktop Viewport (1440 × 900):** ![Wallet Desktop](file:///c:/Users/Dell/Documents/codes/equora/docs/assets/screenshots/wallet_desktop.png)
- **Mobile DApp Browser (390 × 844):** ![Wallet Mobile](file:///c:/Users/Dell/Documents/codes/equora/docs/assets/screenshots/wallet_mobile.png)

#### Complete Component Data ("Sata") Schema
| Component / UI Field | Smart Contract Function | Type | Live Production Value | Empty State | UI Display Rule |
|:---|:---|:---:|:---|:---|:---|
| **Internal Ledger Balance**| `EquoraMatrix.withdrawable(addr)` | `uint256` | **`$420.50 TROB`** | `$0.00` | Large header balance card |
| **External Wallet Balance**| ERC-20 `balanceOf(addr)` | `uint256` | **`$1,420.00 TROB`** | `$0.00` | Monospace balance in wallet |
| **Withdraw Amount Input**| User input state | `number` | `250.00` | `0.00` | Quick buttons: 25%, 50%, 75%, MAX |
| **Gas Fee Estimation** | Web3 provider estimate | `string` | **`< $0.005 USD`** | `~ $0.005` | Footnote text |
| **Transaction History Table**| Indexer ledger query | `Tx[]` | Chronological records | Empty table | Filters: All, Matrix, DAO, Salary, Withdraw |
| **Tx Columns** | On-chain event metadata | `row` | Type, Amount, Source, Date, Tx Hash | N/A | Monospace tx hash with explorer link |

---

### Page 7: Public Landing Page (`/`)
**Role:** Public-facing gateway to educate prospective participants, explain the autonomous game theory, and drive Genesis DAO Council claims.

#### Visual Screenshots
- **Desktop Viewport (1440 × 900):** ![Landing Desktop](file:///c:/Users/Dell/Documents/codes/equora/docs/assets/screenshots/landing_desktop.png)
- **Mobile DApp Browser (390 × 844):** ![Landing Mobile](file:///c:/Users/Dell/Documents/codes/equora/docs/assets/screenshots/landing_mobile.png)

#### Complete Component Data ("Sata") Schema
| Component / UI Field | Data Source | Type | Live Production Value | Empty State | UI Display Rule |
|:---|:---|:---:|:---|:---|:---|
| **Live Volume Ticker** | Indexer aggregated volume | `uint256` | **`$1,420,850 TROB`** | `$0` | Ticker pill in hero |
| **Genesis Seats Scarcity**| `EquoraDAO.getRemainingPositions()`| `uint256` | **`14 / 100 Available`** | `100` | Pulsing scarcity meter in hero |
| **Completed Cycles** | `EquoraMatrix.totalCyclesCompleted()`| `uint256` | **`12,480 Cycles`** | `0` | Metric card |
| **Old vs Equora Matrix**| Static comparison matrix | `table` | 6 Key Differentiators | Static | High-contrast comparison table |
| **Interactive Yield Simulator**| Client simulation logic | `slider` | Draggable Slot 1 to 12 | Slot 1 ($30)| Real-time 600% ROI calculator |
| **Audits & Contracts** | Verified addresses list | `address[]`| 4 Contract addresses | Static | 1-Click copy address + Explorer link |
| **FAQ Accordion** | Documentation database | `QA[]` | 8 Expandable questions | Static | Searchable accordion |

---

### Page 8: Global Protocol Leaderboard (`/leaderboard`)
**Role:** Gamified global ranking board highlighting top volume producers, fastest matrix cyclers, and Crown Sovereign leaders.

#### Visual Screenshots
- **Desktop Viewport (1440 × 900):** ![Leaderboard Desktop](file:///c:/Users/Dell/Documents/codes/equora/docs/assets/screenshots/leaderboard_desktop.png)
- **Mobile DApp Browser (390 × 844):** ![Leaderboard Mobile](file:///c:/Users/Dell/Documents/codes/equora/docs/assets/screenshots/leaderboard_mobile.png)

#### Complete Component Data ("Sata") Schema
| Component / UI Field | Data Source | Type | Live Production Value | Empty State | UI Display Rule |
|:---|:---|:---:|:---|:---|:---|
| **Podium Rank #1** | Top volume indexer record | `Leader` | ID `#10001`, $240k Vol | Pending | Gold trophy avatar spotlight |
| **Podium Rank #2** | Second volume indexer record | `Leader` | ID `#10024`, $185k Vol | Pending | Silver trophy avatar spotlight |
| **Podium Rank #3** | Third volume indexer record | `Leader` | ID `#10008`, $142k Vol | Pending | Bronze trophy avatar spotlight |
| **Global Ranking Table**| Indexer query (Top 100) | `Leader[]` | Top 100 Leader records | Empty | Columns: Rank, Member ID, Cycles, Team, Volume |
| **Personal Rank Pill** | Current user indexer rank | `struct` | **`Your Rank: #14 (Top 1%)`**| `Unranked` | Floating bottom bar with gap to next rank |

---

## 4. Master Modals & Interaction Flow References

### 4.1 48-Hour Urgency Re-Topup Modal
- **Trigger Condition:** User's DAO cumulative earnings reach $\ge \$1,500$ TROB (`isCapped == true`).
- **Visual State:** Flashing crimson border, ambient dark red vignette.
- **Clock Element:** Digital flip clock `47:58:22` counting down to zero.
- **Action:** `[ RE-TOPUP 300 TROB NOW ]` executes `EquoraDAO.retopup()`, resetting cap to $0 and preserving seat number.

### 4.2 Defaulted Seat Sniping & Takeover Modal
- **Trigger Condition:** User clicks a crimson dashed tile on the 10x10 Council Grid.
- **Data Shown:** Defaulted member address, forfeiture timestamp, takeover fee (300 TROB).
- **Action:** `[ CLAIM & MINT FRESH SOULBOUND NFT ]` transfers seat ownership and mints new Soulbound NFT.

### 4.3 1-Click Gas-Optimized Withdrawal Modal
- **Trigger Condition:** User clicks `[ CLAIM TO WALLET ]` from DAO or Wallet screen.
- **Data Shown:** Net withdrawable amount, destination wallet address, estimated gas fee ($< \$0.005).
- **Action:** Single transaction executes multi-pool batch claim.

---

## 5. UI/UX Designer Deliverables Checklist

The UI/UX designer is requested to provide the following Figma/Sketch frames:
- [ ] **Frame 1 (Desktop 1440px & Mobile 390px):** Genesis DAO Council Portal (`/dao`) with 100-seat interactive grid.
- [ ] **Frame 2 (Desktop 1440px & Mobile 390px):** Executive Portfolio Dashboard (`/dashboard`).
- [ ] **Frame 3 (Desktop 1440px & Mobile 390px):** 12-Slot Matrix Board (`/matrix`) with 14-Node visual flow.
- [ ] **Frame 4 (Desktop 1440px & Mobile 390px):** Partners & Team Genealogy (`/referrals`) with tree view.
- [ ] **Frame 5 (Desktop 1440px & Mobile 390px):** Protocol Value Pools & Salary Tiers (`/rewards`).
- [ ] **Frame 6 (Desktop 1440px & Mobile 390px):** Treasury Wallet & Transaction Ledger (`/wallet`).
- [ ] **Frame 7 (Desktop 1440px & Mobile 390px):** Public Conversion Landing Page (`/`).
- [ ] **Frame 8 (Desktop 1440px & Mobile 390px):** Global Protocol Leaderboard (`/leaderboard`).
- [ ] **Frame 9 (Modal Components):** 48h Urgency Clock, Defaulted Seat Takeover, 1-Click Claim Drawer.
- [ ] **Frame 10 (Design System):** Color styles, typography hierarchy, button states, and badge components.
