# EQUORA.FI (B-TITAN) — Autonomous Decentralized Protocol

An enterprise-grade, non-custodial decentralized financial protocol built on EVM smart contracts, featuring a 100-Seat Genesis DAO, 12-Slot Matrix Engine, and automated multi-tier yield pools.

---

## 🏗 Enterprise Monorepo Architecture

Orchestrated with **pnpm workspaces** and **Turborepo** (`turbo.json`):

```
b-titan/
├── apps/
│   ├── web/                    # Next.js 15 Web3 DApp (@equora/web)
│   ├── api/                    # Express REST API with SIWE Auth (@btitan/api)
│   ├── indexer/                # Viem blockchain event listener (@btitan/indexer)
│   └── queue/                  # BullMQ / Redis background worker & cron (@btitan/queue)
│
├── packages/
│   ├── hardhat/                # Solidity 0.8.24 contracts, tests, deploy scripts (@btitan/hardhat)
│   ├── database/               # Prisma ORM schemas & client singleton (@btitan/database)
│   ├── types/                  # Shared TypeScript types & DTOs (@btitan/types)
│   ├── logger/                 # Standardized colorized & structured logger (@btitan/logger)
│   └── tsconfig/               # Shared base, node, and Next.js tsconfigs (@btitan/tsconfig)
│
├── scripts/                    # Utility scripts (patch-qr, whitepaper generators)
├── setup.sh                    # Linux / macOS / WSL automated setup script
├── setup.bat                   # Windows native automated setup script
├── docker-compose.yml          # PostgreSQL & Redis infrastructure
└── turbo.json                  # Turborepo task pipeline & caching
```

---

## 🚀 Quick Start (1-Click Automated Setup)

### Prerequisites
- **Node.js**: `>= 18.0.0` (v20+ recommended)
- **pnpm**: `>= 9.0.0` (`npm install -g pnpm`)

### Automatic Setup
Run the automated bootstrap script for your operating system:

**Windows**:
```cmd
setup.bat
```

**Linux / macOS / WSL / Docker**:
```bash
chmod +x setup.sh && ./setup.sh
```

The script will automatically:
1. Verify Node.js and pnpm
2. Initialize `.env` from `.env.example`
3. Install dependencies across all workspaces
4. Generate Prisma database client
5. Compile all 38 Solidity smart contracts
6. Apply RainbowKit QR border compatibility patches

---

## 💻 Available CLI Commands

All commands can be executed from the monorepo root:

### Development Servers
```bash
pnpm dev              # Start all applications concurrently via Turborepo
pnpm dev:web          # Start Next.js frontend DApp (http://localhost:3000)
pnpm dev:api          # Start Express REST backend (http://localhost:5000)
pnpm dev:indexer      # Start Blockchain Event Indexer
pnpm dev:queue        # Start Background Queue & Cron Worker
```

### Smart Contracts (Hardhat)
```bash
pnpm chain            # Launch local Hardhat EVM test node (chainId: 31337)
pnpm compile          # Compile Solidity contracts & generate TypeChain types
pnpm test             # Run entire smart contract test suite (34/34 tests)
pnpm deploy           # Deploy contracts to local node and export addresses to web app
pnpm deploy:testnet   # Deploy contracts to BSC Testnet
```

### Database & Prisma ORM
```bash
pnpm db:generate      # Re-generate Prisma client bindings
pnpm db:push          # Push schema changes to Postgres database
pnpm db:migrate       # Run Prisma database migrations
pnpm db:studio        # Open Prisma Studio Web GUI
```

### Monorepo Build & Quality
```bash
pnpm build            # Build all packages and applications via Turbo cache
pnpm clean            # Clean all build artifacts across workspaces
```

---

## 📦 Smart Contract Architecture

| Contract | Standard | Role |
|---|---|---|
| `BTitanToken` | ERC-20 | Protocol payment token (TROB) |
| `EquoraRegistry` | Custom | On-chain registration, 5-digit referral codes, qualification logic |
| `BTitanNFT` | ERC-721 | Soulbound rank badges (Alpha, Prime, Elite, Crown) |
| `EquoraDAO` | Custom | 100-member Genesis DAO (300 TROB entry, 5X cap, 48h retopup) |
| `BTitanDAOMembership` | ERC-721 | Soulbound NFT proof-of-seat for DAO members |
| `EquoraVault` | Custom | Central deposit router (35% DAO, 40% Salary, 10% Box, 15% Rewards) |
| `BTitanMatrix` | Custom | 12-slot, 14-node single-leg matrix engine (Positions 4, 5, 14 route to Vault) |
| `EquoraSalaryPool` | Custom | Monthly salary pool distributed on the 11th of each month |
| `EquoraMagicBox` | Custom | Quarterly shared lottery pool ($0.50, $0.80, $1.20, $5.00 tiers) |
| `EquoraRewardPool` | Custom | Instant milestone bonus pool for rank achievers |

---

## 🌐 Target Networks

| Network | Chain ID | RPC URL | Purpose |
|---|---|---|---|
| **Hardhat Local** | `31337` | `http://127.0.0.1:8545` | Local rapid simulation |
| **BSC Testnet** | `97` | `https://data-seed-prebsc-1-s1.binance.org:8545/` | Public testing & staging |
| **BSC Mainnet** | `56` | `https://bsc-dataseed.binance.org/` | Production deployment |

---

## 📄 Documentation

- [DevOps Deployment Instructions](file:///c:/Users/Dell/Documents/codes/b-titan/DEVOPS_DEPLOYMENT_INSTRUCTIONS.md)
- [Infrastructure & Deployment Guide](file:///c:/Users/Dell/Documents/codes/b-titan/docs/DEPLOYMENT_GUIDE_AND_INFRASTRUCTURE_NEEDS.md)
- [DevOps Handoff Guide](file:///c:/Users/Dell/Documents/codes/b-titan/docs/DEVOPS_HANDOFF_README.md)

---

## 📜 License

MIT License. Developed for Equora.Fi / B-Titan Protocol.
