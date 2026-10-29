# Equora.Fi — Master Roadmap, Architecture & Team Onboarding Guide

> **Confidential & Internal Document**  
> **Project:** Equora.Fi (Dual-Platform Web3 Ecosystem on TrobChain L1)  
> **Target Networks:** TrobChain Testnet $\longleftrightarrow$ TrobChain Mainnet  
> **Updated:** October 2026  

---

## 1. Executive Summary & Project Vision

**Equora.Fi** is a next-generation decentralized finance and viral matrix protocol built natively on **TrobChain (Layer 1 EVM/Tron-compatible blockchain)**. The platform consists of two interconnected web applications sharing a unified blockchain backbone:

1. **Equora DAO (`apps/web-dao` — Port 3000)**:  
   A 100-member capped Genesis Council where exclusive members lock 300 TROB into soulbound NFTs, govern treasury proposals, and permanently receive an instantaneous **0.35% royalty push** (35% total protocol cut) from every matrix transaction worldwide.
2. **Equora Matrix (`apps/web-matrix` — Port 3001)**:  
   An automated 12-Slot, 14-Node viral spillover engine with entry starting at **$30 USD in TROB**. Uses mathematical matrix placement, 2-direct referral qualification, automatic Slot 2 standby reserve, and an automated **40% Monthly Royalty Pool** distributed on the 11th of every month across 4 leadership ranks (Alpha, Prime, Elite, Crown).

Smart contracts act as the **sole, immutable source of truth**. A dedicated indexer (`apps/indexer`) processes blockchain events into PostgreSQL (Prisma), which feeds the REST API (`apps/api` on Port 4000) for sub-millisecond frontend queries.

---

## 2. Testnet vs. Mainnet: Complete Environment Matrix

Understanding when and how to use **Testnet** versus **Mainnet** is critical. Testnet is for risk-free integration, validation, and multi-account tree simulation; Mainnet is the live production financial protocol.

### 🌐 Network Parameters Comparison

| Parameter | 🧪 TrobChain Testnet (Development & QA) | 🚀 TrobChain Mainnet (Live Production) |
|---|---|---|
| **Purpose** | Safe simulation, multi-account tree tests, edge case verification | Live financial protocol, real TROB value, immutable governance |
| **Network Name** | `TrobChain Testnet` | `TrobChain Mainnet` |
| **Chain ID** | `1000` (or `1001` depending on custom testnet RPC) | `1000` |
| **Currency Symbol** | `TROB` (Testnet Mock Faucet Tokens) | `TROB` (Native Real Value L1 Asset) |
| **Cost to Test** | **$0.00** (Free testnet faucet funds) | Real capital required ($30 USD per Slot 1 entry) |
| **FullNode RPC URL** | `https://fullnode-one-testnet.trobchain.com` | `https://fullnode-one.trobchain.com` |
| **Block Explorer** | `https://testnet.trobchain.com` | `https://trobchain.com` |
| **Explorer REST API** | `https://testnet-backend.trobchain.com/v1` | `https://backend.trobchain.com/v1` |
| **Live Price Oracle** | `https://testnet-backend.trobchain.com/v1/market/price` | `https://backend.trobchain.com/v1/market/price` |
| **Super Representative** | Testnet Validator Pool | `TC7LCXJ5qhhw6ewLzK8SJuJiwtWmLExLYY` |
| **Target Network Flag** | `NEXT_PUBLIC_TARGET_NETWORK=testnet` | `NEXT_PUBLIC_TARGET_NETWORK=mainnet` |

> [!NOTE]
> **How to confirm your wallet's active Chain ID:**  
> In TrobSafe, check the network details. Alternatively, open your browser console (`F12`) on `http://localhost:3001` and type `window.trobSafe?.networkVersion` or `window.ethereum?.chainId`.
> - If your wallet reports `1000` (or `0x3e8`), set `NEXT_PUBLIC_CHAIN_ID=1000`.
> - If your testnet network profile is configured as `1001` (or `0x3e9`), set `NEXT_PUBLIC_CHAIN_ID=1001`.
> Always ensure `NEXT_PUBLIC_CHAIN_ID` in your `.env.local` matches the connected network in TrobSafe to prevent network mismatch warnings.

---

## 3. Verified Smart Contract Addresses

All contracts are deployed on TrobChain L1. Both **Base58** (Tron standard) and **Canonical Hex (0x / 41)** addresses are provided:

### 🧪 Testnet Contracts (Active Development & QA)

| Contract | Base58 Address | Canonical Hex Address (0x) | Role |
|---|---|---|---|
| **EquoraMatrix** | `TXdUXMtLawCBdkhDCAVCAaLEimzaiGkjz2` | `0xecf692026b2803b879aa9a1744c8f583e76faeb3` | 12-Slot, 14-Node Matrix Engine |
| **EquoraToken (TROB)** | `TDJNzzyMvJ9xbB7TXgR7TTXDY47aAiLHit` | `0x256e2c39d8df302956cf389fbff257019f635c02` | ERC20/TRC20 Platform Currency |
| **EquoraVault** | `TDMZ2y9xpqtuZRm4QbEDctuaWQR4KY4Gnq` | `0x250e261f251025a74e50259b39e31d454efb5ef6` | 4-Pool Automated Value Splitter |
| **EquoraDAO** | `TLXYmgeyBpUQJaSh5LuumrufaQs6GmrGqz` | `0x7623910543e34346067b5e40854497b095ce8ca0` | 100 Council Seats & Royalties |
| **EquoraRegistry** | `TCcHDFibnBsSwZhCRyvevXQfoAQ6NMyYWN` | `0x1f4b005186b72d2bebb6e7d825ae7b32c6ea9b54` | Identity, Genealogy & 2-Referral Tracking |
| **EquoraNFT** | `TQDJwbuFQEXDsSaeGVcU1iRF3WPjRfeLdi` | `0xa4be6e522f77e69c6fc965f7c32759e559381ea6` | Soulbound TRB-721 DAO Badges |

### 🚀 Mainnet Contracts (Production Deployment)

| Contract | Base58 Address | Canonical Hex Address (`0x` / `41`) | Role |
|---|---|---|---|
| **EquoraMatrix** | `TWrMSgbvPoaxmHCJcWVSJng1X9V7MGrteE` | `0xe50ec6ce93b6a7f91099ebc7d08c510c7dd3e0b7` | Mainnet 12-Slot Matrix Engine |
| **EquoraToken (TROB)** | `TPAGzWMuLbGiKMkvZZkWfg3mbcmGtsLgWn` | `0x90b18ab71b5b2b8df3a10c8e52fbdd3ea8f126b9` | Native Mainnet TRC-20 Payment Token |
| **EquoraVault** | `TV6NRDubL8w749VAhsx8H8GZs8CrEcSDZB` | `0xd1c52987ccd9528457cb81a8b9685d2f15889dbb` | Multi-Tier Yield Routing (35% DAO / 40% Salary / 15% Rewards / 10% Box) |
| **EquoraDAO** | `TAuwP4TDvmGp6FT5wqcSz2VMZVbuusneto` | `0x0a59d6a2dcd3b18687c1efe1625642ad85679377` | 100-Seat Council DAO & Dividend Engine |
| **EquoraRegistry** | `TWXbakETzfE9sBYdHTCp37HwygGKLY6AGy` | `0xe182ad0c2aaec48202cd7b897820e5b058c502dd` | 5-Digit Referral Codes & Member Qualification |
| **EquoraNFT** | `TRhqfaRNRPeNTNoewLdamZ9W9Rz5erdHjz` | `0xac99f67a5a8edad419a2613fe9ff7bbea118d20a` | Soulbound TRB-721 Proof-of-Seat Passports |

---

## 4. High-Level System Architecture & Data Flow

```mermaid
flowchart TD
    User([User / TrobSafe Wallet]) -->|Sign Tx Unlock Slot 1| MatrixContract[EquoraMatrix.sol]
    User -->|Sign Tx Join Council| DaoContract[EquoraDAO.sol]

    MatrixContract -->|Emit Placement/Payout Events| Blockchain[(TrobChain L1 Block)]
    DaoContract -->|Emit MemberJoined Events| Blockchain

    MatrixContract -->|P4, P5, P14 / Cold-Start Fallbacks| VaultContract[EquoraVault.sol]
    VaultContract -->|35% Direct Instant| DaoTreasury[EquoraDAO Seat Dividends]
    VaultContract -->|40% Monthly Accrual| RoyaltyPool[EquoraSalaryPool 11th of Month]
    VaultContract -->|15% Milestone Claim| RewardPool[EquoraRewardPool Level Milestones]
    VaultContract -->|10% On-Chain Mint| MagicBox[EquoraMagicBox Blind Box]

    Blockchain -->|Poll Blocks via Viem/Ethers| Indexer[apps/indexer Event Ingestion]
    Indexer -->|Upsert User, Slot, MatrixPlacement| Database[(Neon PostgreSQL / Prisma)]
    Database --> API[apps/api Express REST Port 4000]

    API -->|Real-Time Tree, Stats, Settings| WebMatrix[apps/web-matrix Port 3001]
    API -->|Council Seats, Proposals, Dividends| WebDao[apps/web-dao Port 3000]

    WebMatrix -.->|Direct Read Verification| MatrixContract
    WebDao -.->|Direct Read Verification| DaoContract
```

---

## 5. Monorepo Environment Setup: Exactly What Files to Create and Where

Because `.env.local` files are ignored by git for security reasons, **anyone cloning the repository must create these files locally**.

Here is the exact structure of environment files in the project:

```
equorafi/
├── .env                          <-- (1) Master Root Config (Backend API, Indexer, Prisma)
├── apps/
│   ├── web-matrix/
│   │   └── .env.local            <-- (2) Matrix Web Frontend Config (Port 3001)
│   └── web-dao/
│       └── .env.local            <-- (3) DAO Web Frontend Config (Port 3000)
└── packages/
    └── database/
        └── .env                  <-- (4) Prisma CLI Database URL
```

> [!TIP]
> **Automated Dual-Network Architecture:**  
> The codebase (`apps/web-matrix`, `apps/web-dao`, `apps/indexer`, and `packages/services`) includes built-in smart defaults. Simply setting `NEXT_PUBLIC_TARGET_NETWORK=testnet` or `NEXT_PUBLIC_TARGET_NETWORK=mainnet` automatically selects:
> 1. All 6 smart contract addresses (Matrix, Token, Vault, DAO, Registry, NFT)
> 2. FullNode RPC endpoints (`fullnode-one-testnet.trobchain.com` vs `fullnode-one.trobchain.com`)
> 3. Block Explorer URLs and REST APIs
> 4. In-app network labels, purchase modal badges, and status toasts
> Providing explicit contract addresses or custom RPCs in your `.env.local` will still take highest precedence.

---

### 📁 File 1: `apps/web-matrix/.env.local` (Matrix Frontend)

Create `apps/web-matrix/.env.local` and paste:

#### 🧪 For Testnet:
```ini
PORT=3001
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:4000/api/matrix

NEXT_PUBLIC_MATRIX_DOMAIN=equorafi.com
NEXT_PUBLIC_DAO_DOMAIN=equorafidao.com
NEXT_PUBLIC_MATRIX_URL=https://equorafi.com
NEXT_PUBLIC_DAO_URL=https://equorafidao.com

# Target Network
NEXT_PUBLIC_TARGET_NETWORK=testnet
NEXT_PUBLIC_CHAIN_ID=1000
NEXT_PUBLIC_RPC_URL=https://fullnode-one-testnet.trobchain.com
NEXT_PUBLIC_EXPLORER_URL=https://testnet.trobchain.com
NEXT_PUBLIC_EXPLORER_API_URL=https://testnet-backend.trobchain.com/v1

# Verified Smart Contracts (Testnet)
NEXT_PUBLIC_MATRIX_ADDRESS=TXdUXMtLawCBdkhDCAVCAaLEimzaiGkjz2
NEXT_PUBLIC_TOKEN_ADDRESS=TDJNzzyMvJ9xbB7TXgR7TTXDY47aAiLHit
NEXT_PUBLIC_VAULT_ADDRESS=TDMZ2y9xpqtuZRm4QbEDctuaWQR4KY4Gnq
NEXT_PUBLIC_DAO_ADDRESS=TLXYmgeyBpUQJaSh5LuumrufaQs6GmrGqz
NEXT_PUBLIC_REGISTRY_ADDRESS=TCcHDFibnBsSwZhCRyvevXQfoAQ6NMyYWN
NEXT_PUBLIC_NFT_ADDRESS=TQDJwbuFQEXDsSaeGVcU1iRF3WPjRfeLdi

NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=7663d51173c43f7ad40158edb7e88859
```

#### 🚀 For Mainnet:
```ini
PORT=3001
NEXT_PUBLIC_APP_URL=https://matrix.equora.fi
NEXT_PUBLIC_API_URL=https://api.equora.fi/api/matrix

NEXT_PUBLIC_TARGET_NETWORK=mainnet
NEXT_PUBLIC_CHAIN_ID=1000
NEXT_PUBLIC_RPC_URL=https://fullnode-one.trobchain.com
NEXT_PUBLIC_EXPLORER_URL=https://trobchain.com
NEXT_PUBLIC_EXPLORER_API_URL=https://backend.trobchain.com/v1

# Verified Smart Contracts (Mainnet)
NEXT_PUBLIC_MATRIX_ADDRESS=TWrMSgbvPoaxmHCJcWVSJng1X9V7MGrteE
NEXT_PUBLIC_TOKEN_ADDRESS=TPAGzWMuLbGiKMkvZZkWfg3mbcmGtsLgWn
NEXT_PUBLIC_VAULT_ADDRESS=TV6NRDubL8w749VAhsx8H8GZs8CrEcSDZB
NEXT_PUBLIC_DAO_ADDRESS=TAuwP4TDvmGp6FT5wqcSz2VMZVbuusneto
NEXT_PUBLIC_REGISTRY_ADDRESS=TWXbakETzfE9sBYdHTCp37HwygGKLY6AGy
NEXT_PUBLIC_NFT_ADDRESS=TRhqfaRNRPeNTNoewLdamZ9W9Rz5erdHjz

NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=7663d51173c43f7ad40158edb7e88859
```

---

### 📁 File 2: `apps/web-dao/.env.local` (DAO Frontend)

Create `apps/web-dao/.env.local` and paste:

```ini
PORT=3000
WEB_PORT=3000
API_PORT=4000
NEXT_PUBLIC_API_URL=http://localhost:4000

# Target Network
NEXT_PUBLIC_TARGET_NETWORK=testnet
NEXT_PUBLIC_CHAIN_ID=1000
NEXT_PUBLIC_RPC_URL=https://fullnode-one-testnet.trobchain.com
FULLNODE_URL=https://fullnode-one-testnet.trobchain.com
NEXT_PUBLIC_EXPLORER_URL=https://testnet.trobchain.com
NEXT_PUBLIC_EXPLORER_API_URL=https://testnet-backend.trobchain.com/v1

# DAO Contracts (Testnet)
NEXT_PUBLIC_DAO_ADDRESS=TLXYmgeyBpUQJaSh5LuumrufaQs6GmrGqz
NEXT_PUBLIC_DAO_HEX=0x7623910543e34346067b5e40854497b095ce8ca0
NEXT_PUBLIC_TOKEN_ADDRESS=TDJNzzyMvJ9xbB7TXgR7TTXDY47aAiLHit
NEXT_PUBLIC_REGISTRY_ADDRESS=TCcHDFibnBsSwZhCRyvevXQfoAQ6NMyYWN
NEXT_PUBLIC_VAULT_ADDRESS=TDMZ2y9xpqtuZRm4QbEDctuaWQR4KY4Gnq
NEXT_PUBLIC_NFT_ADDRESS=TQDJwbuFQEXDsSaeGVcU1iRF3WPjRfeLdi
```

---

### 📁 File 3: Master Root `.env` (`c:\Users\Dell\Documents\codes\equorafi\.env`)

This file powers the backend services, the indexer, and the database.

```ini
NODE_ENV=development
PORT=4000
WEB_PORT=3000
API_PORT=4000

DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-ancient-smoke-b4y6grfd-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require"

# 2. Redis Cache
REDIS_URL="redis://localhost:6379"

# 3. Auth & JWT
JWT_SECRET=846f07019be6c3eee6945b98c58f28a6f590127f44a514894c709c58014faec5
JWT_EXPIRES_IN=24h
SIWE_NONCE_TTL_SECONDS=300
CORS_ORIGIN="http://localhost:3000,http://localhost:3001,http://localhost:4000"

# 4. Blockchain & Contracts
CHAIN_ID=1000
NEXT_PUBLIC_CHAIN_ID=1000
RPC_URL=https://fullnode-one-testnet.trobchain.com
FULLNODE_URL=https://fullnode-one-testnet.trobchain.com

NEXT_PUBLIC_MATRIX_ADDRESS="TXdUXMtLawCBdkhDCAVCAaLEimzaiGkjz2"
NEXT_PUBLIC_TOKEN_ADDRESS="TDJNzzyMvJ9xbB7TXgR7TTXDY47aAiLHit"
NEXT_PUBLIC_REGISTRY_ADDRESS="TCcHDFibnBsSwZhCRyvevXQfoAQ6NMyYWN"
NEXT_PUBLIC_VAULT_ADDRESS="TDMZ2y9xpqtuZRm4QbEDctuaWQR4KY4Gnq"
NEXT_PUBLIC_DAO_ADDRESS="TLXYmgeyBpUQJaSh5LuumrufaQs6GmrGqz"
NEXT_PUBLIC_NFT_ADDRESS="TQDJwbuFQEXDsSaeGVcU1iRF3WPjRfeLdi"

# 5. Indexer Configuration
INDEXER_POLL_INTERVAL_MS=2000
INDEXER_START_BLOCK=0
```

---

## 6. On-Chain Business Logic: The Matrix Payout Rules

Every Slot board consists of **14 Node Placements** across 3 binary levels ($2 + 4 + 8 = 14$):

```
                     [Matrix Board Owner]
                           /      \
                      [P1]          [P2]         <-- Level 1 (2 nodes)
                     /    \        /    \
                  [P3]    [P4]  [P5]    [P6]     <-- Level 2 (4 nodes)
                  /  \    /  \  /  \    /  \
                P7  P8  P9 P10 P11 P12 P13 P14   <-- Level 3 (8 nodes)
```

### Position Payout Matrix Table

| Position | Node | Payout Rule | Cold-Start / Genesis Fallback (When no upline or unqualified) |
|---|---|---|---|
| **P1** | Level 1 - Node 1 | 100% ($30) $\rightarrow$ Upline 1 | If `upline1 == address(0)` or unqualified $\rightarrow$ Routes 100% to **Protocol Pools (`EquoraVault.sol`)** |
| **P2** | Level 1 - Node 2 | 100% ($30) $\rightarrow$ Upline 2 | If `upline2 == address(0)` or unqualified $\rightarrow$ Routes 100% to **Protocol Pools (`EquoraVault.sol`)** |
| **P3** | Level 2 - Node 1 | **100% ($30) $\rightarrow$ Board Owner** | **Requires 2 Direct Referrals**. If unqualified $\rightarrow$ Routes to Protocol Pools |
| **P4** | Level 2 - Node 2 | 100% ($30) $\rightarrow$ **Protocol Pools** | Vault splits 35% DAO / 40% Royalty / 15% Rewards / 10% Magic Box |
| **P5** | Level 2 - Node 3 | 100% ($30) $\rightarrow$ **Protocol Pools** | Vault splits. **Auto-Unlocks Slot 2 in Standby Reserve ($0 out-of-pocket)** |
| **P6** | Level 2 - Node 4 | **100% ($30) $\rightarrow$ Board Owner** | **Requires 2 Direct Referrals**. If unqualified $\rightarrow$ Routes to Protocol Pools |
| **P7** | Level 3 - Node 1 | 100% ($30) $\rightarrow$ Spillover Downline 1 | Rewards placement downline sponsor tree |
| **P8** | Level 3 - Node 2 | **100% ($30) $\rightarrow$ Board Owner** | **Requires 2 Direct Referrals**. If unqualified $\rightarrow$ Routes to Protocol Pools |
| **P9** | Level 3 - Node 3 | **100% ($30) $\rightarrow$ Board Owner** | **Requires 2 Direct Referrals**. If unqualified $\rightarrow$ Routes to Protocol Pools |
| **P10** | Level 3 - Node 4 | 100% ($30) $\rightarrow$ Spillover Downline 2 | Rewards placement downline sponsor tree |
| **P11** | Level 3 - Node 5 | **100% ($30) $\rightarrow$ Board Owner** | **Requires 2 Direct Referrals**. If unqualified $\rightarrow$ Routes to Protocol Pools |
| **P12** | Level 3 - Node 6 | **100% ($30) $\rightarrow$ Board Owner** | **Requires 2 Direct Referrals**. If unqualified $\rightarrow$ Routes to Protocol Pools |
| **P13** | Level 3 - Node 7 | 100% ($30) $\rightarrow$ **Auto-Cycle Reserve** | Held on contract for $0 out-of-pocket cycle board restart |
| **P14** | Level 3 - Node 8 | 100% ($30) $\rightarrow$ **Protocol Pools** | Vault splits. Cycle closes; board restarts on next cycle! |

---

## 7. What to Use & What to Do in Testnet

### 🎯 Purpose of Testnet
Testnet is the **sandbox proving ground**. Before any mainnet launch, every edge case, referral depth, cycle reset, and frontend-indexer sync must be 100% verified with zero financial risk.

### 🛠️ What to Use in Testnet
1. **Wallet:** TrobSafe Extension or App set to `TrobChain Testnet`.
   - RPC: `https://fullnode-one-testnet.trobchain.com`
   - Chain ID: `1000` (or `1001` if your network profile specifies)
2. **Tokens:** Testnet TROB obtained via testnet faucet or transferred from the deployer account.
3. **Explorer:** `https://testnet.trobchain.com` to look up test transaction hashes and event logs.
4. **Local Apps:** `http://localhost:3000` (DAO), `http://localhost:3001` (Matrix), `http://localhost:4000` (API).

---

## 8. What to Use & What to Do in Mainnet (Production Launch Playbook)

### ⚠️ Mainnet Warning & Principles
Mainnet involves **real financial assets**. Contracts are **immutable** and cannot be modified after deployment. No mock data, no temporary private keys, and no debug scripts are allowed on the live mainnet environment.

### 🛠️ What to Use in Mainnet
1. **Wallet:** TrobSafe configured with `TrobChain Mainnet`.
   - RPC: `https://fullnode-one.trobchain.com`
   - Chain ID: `1000`
2. **Tokens:** Real L1 TROB acquired on official TrobChain markets.
3. **Explorer:** `https://trobchain.com` (REST API: `https://backend.trobchain.com/v1`).
4. **Production Domain:** Official hosted domain (e.g. `https://equora.fi` / `https://matrix.equora.fi`).

### 🚀 What to Do in Mainnet (Launch Sequence)

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Protocol Deployer
    participant SC as TrobChain Mainnet Contracts
    participant DB as Neon PostgreSQL (Production)
    participant IX as Blockchain Indexer
    participant UI as Production DApps

    Admin->>SC: 1. Deploy & Verify Immutable Contracts (deploy-and-verify-mainnet.js)
    Admin->>SC: 2. Renounce Admin / Ownership (Sovereign Zero-Admin Mode)
    Admin->>DB: 3. Clean DB Reset (seed_matrix_clean.ts - 0 mock records)
    Admin->>SC: 4. Genesis Bootstrap (Activate Council Seat #1 + Matrix Slot 1 Root)
    Admin->>IX: 5. Start Indexer from Genesis Block Height
    IX->>DB: 6. Real-time Event Ingestion into Postgres
    Admin->>UI: 7. Deploy Web Apps with NEXT_PUBLIC_TARGET_NETWORK=mainnet
    UI->>Admin: 8. Smoke Test Real Tx with TrobSafe (Slot 1 Unlock)
```

---

## 9. Handover Checklist for Your Friend: Exactly What Tasks to Do

> **Share this section directly with your friend.**  
> Follow these steps in order. Each step tells you what to do, what buttons to click, and what to verify.

### 🟢 Phase 1: Local Setup (Est. 15 minutes)
- [ ] **Step 1:** Clone the repository to your computer.
- [ ] **Step 2:** Ensure you have Node.js (v20+) and `pnpm` (v9+) installed.
- [ ] **Step 3:** Create the `.env` and `.env.local` files using the exact templates in **Section 5** above:
  - Create `apps/web-matrix/.env.local`
  - Create `apps/web-dao/.env.local`
  - Create root `.env`
- [ ] **Step 4:** Open your terminal and run `pnpm install`.
- [ ] **Step 5:** Run `pnpm run dev`.
- [ ] **Step 6:** Open your browser and check all three services:
  - `http://localhost:3000` (DAO Portal)
  - `http://localhost:3001` (Matrix Portal)
  - `http://localhost:4000/api/matrix/leaderboard` (API response should show JSON)

---

### 🟡 Phase 2: TrobSafe Wallet & Testnet Setup (Est. 15 minutes)
- [ ] **Step 1:** Install the **TrobSafe Chrome Extension** from the Chrome Web Store.
- [ ] **Step 2:** Click the Network Selector at the top of TrobSafe and select **TrobChain Testnet** (RPC: `https://fullnode-one-testnet.trobchain.com`, Chain ID: `1000`).
- [ ] **Step 3:** Create **3 test accounts** inside TrobSafe:
  - **Account A** (Name it `Genesis Leader`)
  - **Account B** (Name it `Referral 1`)
  - **Account C** (Name it `Referral 2`)
- [ ] **Step 4:** Get testnet TROB for each account from the testnet faucet or ask the lead developer to transfer some testnet TROB to your addresses.

---

### 🟠 Phase 3: Matrix On-Chain Testing (Est. 30 minutes)

#### 1. Genesis Registration (Account A)
- [ ] Switch TrobSafe to **Account A**.
- [ ] Navigate to `http://localhost:3001`.
- [ ] Click **"Connect Wallet"** and approve the TrobSafe connection.
- [ ] On the Matrix Access Gate:
  - Confirm the dynamic TROB price is displayed (e.g. calculated from oracle).
  - Click **"Approve TROB"** and sign the transaction in TrobSafe.
  - Click **"Unlock Slot 1 ($30)"** and confirm the transaction.
- [ ] **Verification:**
  - Copy the transaction hash and check it on `https://testnet.trobchain.com`.
  - Confirm the page automatically unlocks and redirects to `http://localhost:3001/dashboard`.
  - Confirm your dashboard shows: Member ID assigned, `Slot 1: 1/12 Unlocked`, and `Direct Referrals: 0`.

#### 2. Referral Qualification Test (Accounts B & C)
- [ ] Copy Account A's referral link from the dashboard header (`http://localhost:3001/?ref=0xAccountA...`).
- [ ] Switch TrobSafe to **Account B** and paste the referral link in a new browser tab.
- [ ] Connect Account B $\rightarrow$ Unlock Slot 1 ($30).
- [ ] Switch TrobSafe to **Account C** using the same referral link $\rightarrow$ Unlock Slot 1 ($30).
- [ ] Switch back to **Account A** and refresh `http://localhost:3001/dashboard`.
- [ ] **Verification:**
  - Direct Referrals count should now display **2**.
  - Account A status badge should update to **Matrix Qualified**.

#### 3. Matrix Board Visualizer Check
- [ ] Go to `http://localhost:3001/matrix`.
- [ ] Verify that Node 1 ($P_1$) shows Account B's address.
- [ ] Verify that Node 2 ($P_2$) shows Account C's address.
- [ ] Switch between **Level View**, **Board View**, and **Tree View** — confirm all render smoothly without broken lines or mock addresses.

---

### 🔵 Phase 4: UI/UX & Quality Audit (Est. 15 minutes)
- [ ] Navigate to `http://localhost:3001/settings`.
- [ ] Check the **Account Section**:
  - Member ID should display the real ID (no `#Pending`).
  - Connected Wallet should show your real address with copy icon.
  - Matrix Status should display a green badge `● Active Node`.
- [ ] Press `F12` to open DevTools Console:
  - Confirm there are **zero red React Hydration Mismatch errors**.
- [ ] Check royalty pool mentions across the app:
  - Verify that the label says **"Royalty Pool (Monthly on the 11th)"** instead of daily.

---

### 🟣 Phase 5: Reporting to Lead Developer
After completing your tests, send this summary to the lead:
1. Account A, B, and C addresses.
2. Transaction hashes for the Slot 1 unlocks.
3. Confirmation that Direct Referrals updated to 2 on Account A.
4. Any visual bugs, lag, or console warnings encountered.

---

## 10. Developer Cheat Sheet (CLI Commands)

```bash
# 1. Install all dependencies across the entire monorepo
pnpm install

# 2. Run all apps simultaneously (DAO + Matrix + API + Indexer)
pnpm run dev

# 3. Run individual apps if working on a single package:
pnpm --filter @equora/web-matrix dev   # Matrix Portal (http://localhost:3001)
pnpm --filter equora-app dev           # DAO Portal (http://localhost:3000)
pnpm --filter @equora/api dev          # REST API (http://localhost:4000)
pnpm --filter @equora/indexer dev      # Blockchain Indexer

# 4. Compile smart contracts & generate TypeScript typings:
pnpm --filter hardhat compile

# 5. Compile backend services:
pnpm --filter @equora/services build

# 6. Verify production build passes with 0 errors:
pnpm --filter @equora/web-matrix build
```

---

## 11. Common Gotchas & Troubleshooting

| Problem | Cause | Solution |
|---|---|---|
| `Wrong Network` warning in DApp | `NEXT_PUBLIC_CHAIN_ID` in `.env.local` does not match the active network in TrobSafe. | Check wallet network: if on testnet with ID 1000, set `NEXT_PUBLIC_CHAIN_ID=1000`. If ID is 1001, update `.env.local` to `1001` and restart `pnpm run dev`. |
| `listen EADDRINUSE :::3001` | Another dev server is already running on port 3001. | Run `netstat -ano \| findstr :3001` and terminate the PID with `Stop-Process -Id <PID> -Force`. |
| `Foreign key constraint violated: MatrixSettings_userAddress_fkey` | A newly connected wallet doesn't have a `User` database record yet. | Solved in `@equora/services`: `getUserSettings` safely checks if `user` exists and falls back to in-memory state. |
| Hydration Mismatch in Next.js (`Server doesn't match Client`) | Dynamic client-only data was rendered during SSR. | Solved via `const [mounted, setMounted] = useState(false)` guard. |
| TrobSafe popup does not appear | Browser extension is locked or inactive. | Click the TrobSafe extension icon in Chrome toolbar, unlock with password, then refresh the page. |
| Transaction fails: Out of Energy/Bandwidth | TrobChain requires Energy and Bandwidth for execution. | Freeze small amounts of TROB for Energy in TrobSafe or ensure test account has sufficient TROB buffer. |

---

*Document compiled and verified for internal Equora.Fi engineering team collaboration.*
