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
| **EquoraDAO** | `THMrTHkAfcM1ZmhNzNRrMJiyCimgoGjF9V` | `4151114b92df6041f5a0e7ebc13e6ed68298fd28b0` | 100-Seat Council DAO, Queue & 300/N Dividend Engine |
| **EquoraRegistry** | `TUxT2CjgiSUaiTfwaA3nZ8ZnBcugnspZRB` | `41d045ad50706313f76b4acbaa370258f6a0da1697` | 5-Digit Referral Codes & Member Qualification |
| **EquoraNFT** | `TSANycxN3mgwxAXLNj7XdhvMvWaXT3WxL9` | `41b19eea3d6882c5f078b6b4ea54c8286dcd8a1a8d` | Soulbound TRB-721 Proof-of-Seat Passports |
| **EquoraVault** | `THoeHcGMEzNDsE8xPZuorTYgV9hje1RkGw` | `4155f1f42bc35374f5eefda01a4cfa083c21f34f12` | Multi-Tier Yield Routing (35% DAO / 40% Salary / 15% Rewards / 10% Box) |
| **EquoraMatrix** | `TNjaJr6pHV2uBkBG9sDGtuxo4AAzqHBCJi` | `418c05990021d332e01a68c42ce6a7e783a1752d06` | 12-Slot, 14-Node Single-Leg Spillover Matrix |
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

DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-ancient-smoke-b4y6grfd-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require"

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
