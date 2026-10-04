# EQUORA.FI — Autonomous Decentralized Protocol

An enterprise-grade, non-custodial decentralized financial protocol deployed on **TrobChain Mainnet (Chain ID: 1000)**, featuring a 100-Seat Genesis Council DAO, 12-Slot Single-Leg Matrix Engine, and automated multi-tier dividend pools.

---

## 🏗 Enterprise Monorepo Architecture

Orchestrated with **pnpm workspaces** and **Turborepo** (`turbo.json`):

```
equora/
├── apps/
│   ├── web-dao/                # Next.js 14 Web3 DAO DApp (@equora/web-dao, Port 3000)
│   ├── api/                    # Express REST API with SIWE Auth (@equora/api, Port 4000)
│   ├── indexer/                # Viem blockchain event listener (@equora/indexer)
│   └── queue/                  # BullMQ / Redis background worker & cron (@equora/queue)
│
├── packages/
│   ├── hardhat/                # Solidity 0.8.24 contracts, tests, deploy scripts (@equora/hardhat)
│   ├── database/               # Prisma ORM schemas & Neon PostgreSQL client (@equora/database)
│   ├── services/               # Shared business logic & price feeds (@equora/services)
│   ├── types/                  # Shared TypeScript types & DTOs (@equora/types)
│   ├── logger/                 # Standardized colorized & structured logger (@equora/logger)
│   └── tsconfig/               # Shared base, node, and Next.js tsconfigs (@equora/tsconfig)
│
├── scripts/                    # Documentation, specification & whitepaper generators
├── setup.sh                    # Linux / macOS / WSL automated setup script
├── setup.bat                   # Windows native automated setup script
├── docker-compose.yml          # PostgreSQL & Redis local infrastructure
└── turbo.json                  # Turborepo task pipeline & caching
```

---

## 🌐 Target Network & Live Deployed Contracts

The protocol is officially deployed on **TrobChain Mainnet**:

| Parameter | Value |
|---|---|
| **Network** | TrobChain Mainnet |
| **Chain ID** | `1000` |
| **RPC FullNode** | `https://fullnode-one.trobchain.com` |
| **Block Explorer** | `https://trobchain.com` |
| **Explorer REST API** | `https://backend.trobchain.com/v1` |
| **Market Price Oracle** | `https://backend.trobchain.com/v1/market/price` |
| **Official Super Representative** | `TC7LCXJ5qhhw6ewLzK8SJuJiwtWmLExLYY` |

### Official Smart Contracts

| Contract | Base58 Address | Hex Address (`0x` / `41`) | Role |
|---|---|---|---|
| **EquoraDAO** | `TAuwP4TDvmGp6FT5wqcSz2VMZVbuusneto` | `410a59d6a2dcd3b18687c1efe1625642ad85679377` | 100-Seat Council DAO, Queue & 300/N Dividend Engine |
| **EquoraRegistry** | `TWXbakETzfE9sBYdHTCp37HwygGKLY6AGy` | `41e182ad0c2aaec48202cd7b897820e5b058c502dd` | 5-Digit Referral Codes & Member Qualification |
| **EquoraNFT** | `TRhqfaRNRPeNTNoewLdamZ9W9Rz5erdHjz` | `41ac99f67a5a8edad419a2613fe9ff7bbea118d20a` | Soulbound TRB-721 Proof-of-Seat Passports |
| **EquoraVault** | `TV6NRDubL8w749VAhsx8H8GZs8CrEcSDZB` | `41d1c52987ccd9528457cb81a8b9685d2f15889dbb` | Multi-Tier Yield Routing (35% DAO / 40% Salary / 15% Rewards / 10% Box) |
| **EquoraMatrix** | `TWrMSgbvPoaxmHCJcWVSJng1X9V7MGrteE` | `41e50ec6ce93b6a7f91099ebc7d08c510c7dd3e0b7` | 12-Slot, 14-Node Single-Leg Spillover Matrix |
| **EquoraToken** | `TPAGzWMuLbGiKMkvZZkWfg3mbcmGtsLgWn` | `4190b18ab71b5b2b8df3a10c8e52fbdd3ea8f126b9` | Protocol Native TRC-20 Payment Token (TROB) |

---

## 🚀 Quick Start & Development

### Prerequisites
- **Node.js**: `>= 20.0.0`
- **pnpm**: `>= 9.0.0` (`npm install -g pnpm`)

### 1. Installation
```bash
# Install dependencies across all packages and apps
pnpm install

# Generate Prisma client bindings
pnpm --filter @equora/database db:generate

# Build shared packages
pnpm build
```

### 2. Running Locally
```bash
# Start Next.js Web3 DAO DApp (http://localhost:3000)
pnpm dev:web

# Or run specific applications:
pnpm --filter @equora/api dev        # Express REST API (http://localhost:4000)
pnpm --filter @equora/indexer dev    # Viem Blockchain Indexer
```

---

## ⚙️ Environment Variables Reference

Copy `.env.example` to `.env` in the project root and `apps/web-dao/.env.local` for local development.

### Core Variables

```env
# Network & RPC
CHAIN_ID=1000
NEXT_PUBLIC_CHAIN_ID=1000
NEXT_PUBLIC_TARGET_NETWORK=mainnet
RPC_URL=https://fullnode-one.trobchain.com
FULLNODE_URL=https://fullnode-one.trobchain.com
NEXT_PUBLIC_RPC_URL=https://fullnode-one.trobchain.com

# Explorer & Pricing
NEXT_PUBLIC_EXPLORER_URL=https://trobchain.com
NEXT_PUBLIC_EXPLORER_API_URL=https://backend.trobchain.com/v1
TROB_BACKEND_EXPLORER_API_URL=https://backend.trobchain.com/v1
TROB_PRICE_API_URL=https://backend.trobchain.com/v1/market/price
NEXT_PUBLIC_TROB_PRICE_API_URL=https://backend.trobchain.com/v1/market/price

# Database (Neon Serverless PostgreSQL)
DATABASE_URL="postgresql://neondb_owner:npg_VzZWl5Td8gxf@ep-super-heart-ax2fet8a.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Domains & Security
CORS_ORIGIN="https://equorafidao.com,https://www.equorafidao.com,https://equorafi.com,https://www.equorafi.com,http://localhost:3000"
NEXT_PUBLIC_APP_URL="https://equorafidao.com"
NEXT_PUBLIC_MATRIX_URL="https://equorafi.com"
NEXT_PUBLIC_DAO_URL="https://equorafidao.com"
```

---

## 🔒 Safe Execution & Quality Standards

1. **Strict Git Branch Policy**:
   - Push code **ONLY to `origin/developer` (`developer` branch)**.
   - **NEVER push directly to `main`**.
2. **Preventing Rogue Script Executions**:
   - Never run raw scripts in `scratch/` against the live mainnet without read-only checks.
   - All state-modifying endpoints strictly require verified on-chain 64-character transaction receipts validated via `verifyOnChainTransaction()`.
3. **Production Builds**:
   - Validate before committing: `pnpm --filter equora-app build`.

---

## 📜 License

MIT License. Developed for Equora.Fi Protocol.
