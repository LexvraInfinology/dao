# EQUORA_Fi — Autonomous Web3 Protocol

A fully autonomous, peer-to-peer decentralized financial protocol.

## 🏗 Project Structure

```
equora-fi/
├── packages/
│   ├── hardhat/          # Smart contracts + deployment
│   └── nextjs/           # Next.js 15 frontend
└── package.json          # Workspace root
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Install all dependencies
```bash
npm install
```

### 2. Start local blockchain
```bash
cd packages/hardhat
npm run chain
```

### 3. Deploy contracts (in another terminal)
```bash
cd packages/hardhat
npm run deploy
```

This deploys all 6 contracts and writes `deployedContracts.ts` to the frontend.

### 4. Start the frontend
```bash
cd packages/nextjs
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📦 Smart Contracts

| Contract | Description |
|---|---|
| `BTitanToken` | ERC-20 BTT token |
| `BTitanRegistry` | User registry & sponsor tree |
| `BTitanDAO` | Genesis DAO — 50 member linear distribution |
| `BTitanMatrix` | 12-slot, 14-node matrix engine |
| `BTitanNFT` | ERC-721 rank badge NFTs |
| `BTitanVestingVault` | 3-year magic box vesting |

## 🌐 Networks

| Network | ChainID | Status |
|---|---|---|
| Hardhat (local) | 31337 | ✅ Default |
| BSC Testnet | 97 | ✅ Ready |
| BSC Mainnet | 56 | ✅ Ready |

## 🎮 Pages

| Page | Route | Description |
|---|---|---|
| Landing | `/` | Public hero page |
| Dashboard | `/dashboard` | Personal stats hub |
| DAO | `/dao` | Genesis DAO queue |
| Matrix | `/matrix` | 12-slot node tree |
| Referrals | `/referrals` | Network & links |
| Rewards | `/rewards` | NFTs & vesting |
| Wallet | `/wallet` | Withdrawals & history |
| Leaderboard | `/leaderboard` | Top earners |

## 📜 License

MIT
