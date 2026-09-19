# EQUORA_Fi (B-TITAN) — Complete Production Deployment Guide & Infrastructure Needs

> **Document Classification:** Official Infrastructure & Deployment Runbook  
> **Audience:** DevOps Engineers, Smart Contract Engineers, Infrastructure Architects, Full-Stack Developers  
> **Target Environments:** BSC Mainnet (Chain ID 56), BSC Testnet (Chain ID 97), Local / Private EVM (31337)  
> **Protocol Components:** 10 Smart Contracts, PostgreSQL Database, Redis Cache, Real-time Blockchain Indexer, REST API Service, Next.js 15 Web Application

---

## 1. Executive Architecture Overview

EQUORA_Fi (B-Titan) is an autonomous Web3 protocol structured as an integrated npm/TypeScript monorepo. It operates across 5 decoupled tiers:

```
                            ┌─────────────────────────────────────────┐
                            │           Web & Mobile Clients          │
                            │   (Next.js 15 + RainbowKit + Wagmi)     │
                            └────────────────────┬────────────────────┘
                                                 │
                                                 │ HTTPS / WSS
                                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Reverse Proxy (Nginx)                            │
├───────────────────────────────┬─────────────────────────────────────────────┤
│   Proxy /                     │ Proxy /api                                  │
│   Port 3000 (Next.js SSR)     │ Port 4000 (Express REST API)                │
└───────────────┬───────────────┴──────────────────────┬──────────────────────┘
                │                                      │
                │ Web3 RPC                             │ Database / Cache Queries
                ▼                                      ▼
┌───────────────────────────────┐     ┌───────────────────────────────────────┐
│     EVM Blockchain Node       │     │     PostgreSQL 16 + Redis 7 Cache     │
│   (BSC Mainnet / Testnet)     │     │     (Prisma ORM Indexed Schema)       │
└───────────────┬───────────────┘     └──────────────────▲────────────────────┘
                │                                        │
                │ On-Chain Contract Events               │ Database Writes
                └───────────────────────┬────────────────┘
                                        ▼
                      ┌───────────────────────────────────┐
                      │    Blockchain Event Indexer       │
                      │       (@btitan/indexer)           │
                      └───────────────────────────────────┘
```

### Monorepo Layout
- [`packages/hardhat/`](file:///packages/hardhat) — Solidity contracts (v0.8.25, Cancun EVM), deployment scripts, and verification tooling.
- [`packages/database/`](file:///packages/database) — Prisma schema, PostgreSQL client, migrations, and database models.
- [`apps/api/`](file:///apps/api) — Node.js/Express backend API providing SIWE authentication, user genealogy tree queries, and analytics.
- [`apps/indexer/`](file:///apps/indexer) — Real-time blockchain event indexer that synchronizes smart contract events into PostgreSQL.
- [`packages/nextjs/`](file:///packages/nextjs) — Next.js 15 client dashboard, RainbowKit v2 wallet connect, responsive UI (mobile DApp browser ready).

---

## 2. Infrastructure & Prerequisite Checklist

Ensure all items in this section are prepared before starting deployment.

### 2.1 Hardware & Server Specifications

| Parameter | Recommended Production Spec | Minimum Staging Spec |
| :--- | :--- | :--- |
| **Server Instance** | AWS c6i.xlarge / DigitalOcean 4 vCPU droplet | 2 vCPU VPS |
| **RAM** | 8 GB to 16 GB DDR4/DDR5 | 4 GB |
| **Storage** | 100 GB NVMe SSD (High IOPS) | 40 GB SSD |
| **Operating System** | Ubuntu 22.04 LTS or Debian 12 (x64) | Ubuntu 22.04 LTS |
| **Bandwidth** | 1 Gbps unmetered / 5 TB transfer | 100 Mbps |
| **Firewall Ports** | `80/tcp` (HTTP), `443/tcp` (HTTPS), `22/tcp` (SSH) | `80/tcp`, `443/tcp`, `22/tcp` |

### 2.2 Software Runtime Requirements

The following software versions must be installed on the deployment server:

```bash
# Verify software versions
node -v        # Must be >= v20.10.0 LTS (Node.js 20 or 22)
npm -v         # Must be >= 10.0.0
git --version  # Must be installed
docker -v      # Docker Engine >= 24.0
docker compose version # Docker Compose v2+
pm2 -v         # Process Manager (npm install -g pm2)
```

### 2.3 Required External Credentials & Accounts

Before deploying, collect and secure the following API keys and credentials:

1. **Deployer Wallet Private Key**:
   - An EVM private key (`0x...`) dedicated solely for contract deployment.
   - **Mainnet Gas Balance**: Minimum **0.25 to 0.50 BNB** to deploy 10 contracts and execute initialization transactions.
   - **Testnet Gas Balance**: Minimum **0.50 tBNB** (obtain free from the BSC Testnet Faucet).

2. **RPC Node URLs**:
   - **BSC Mainnet**: Dedicated private RPC endpoint recommended (QuickNode, Alchemy, Ankr, or Chainstack) + fallback to `https://bsc-dataseed.binance.org/`.
   - **BSC Testnet**: `https://data-seed-prebsc-1-s1.binance.org:8545/`.

3. **BscScan API Key**:
   - Needed for automated source code verification on BscScan. Register free at [bscscan.com/myapikey](https://bscscan.com/myapikey).

4. **Reown / WalletConnect Project ID**:
   - Required for RainbowKit, MetaMask Mobile, Trust Wallet, and TokenPocket deep linking.
   - Obtain free at [cloud.reown.com](https://cloud.reown.com) (takes 1 minute).

5. **PostgreSQL 16 Database**:
   - Managed Cloud: AWS RDS PostgreSQL, Neon Serverless Postgres (`neon.tech`), or Supabase.
   - Self-Hosted: Included in the repository's `docker-compose.yml`.

6. **Redis 7 Cache**:
   - Managed: AWS ElastiCache, Upstash, or Self-Hosted via `docker-compose.yml`.

7. **Production Domain & SSL**:
   - An A-record pointing your domain (e.g. `app.equora.fi` / `api.equora.fi`) to the server IP.
   - Let's Encrypt SSL via Certbot.

---

## 3. Step-by-Step Deployment Runbook

Follow these steps sequentially to deploy the entire stack from scratch.

### Step 1: Clone Repository & Install Dependencies

```bash
# 1. Clone repository
git clone https://github.com/your-org/b-titan.git /var/www/b-titan
cd /var/www/b-titan

# 2. Install monorepo dependencies
npm install

# 3. Verify workspace packages
npm run compile
```

---

### Step 2: Provision Database & Redis

If using self-hosted containers via Docker:

```bash
# Start PostgreSQL and Redis containers
docker compose up -d

# Verify container health
docker compose ps
```

If using a managed PostgreSQL instance (e.g., Neon or AWS RDS), ensure `DATABASE_URL` is set with `sslmode=require`.

#### Run Database Migrations:
```bash
cd packages/database

# Generate Prisma Client
npx prisma generate

# Apply migrations to the PostgreSQL database
npx prisma migrate deploy

# Verify schema
npx prisma db pull --print
cd ../..
```

---

### Step 3: Smart Contract Deployment (BSC Mainnet / Testnet)

The deployment script (`packages/hardhat/scripts/deploy.ts`) handles the full deployment lifecycle:
1. Deploys `BTitanToken` (or `MockToken` on local).
2. Deploys `EquoraRegistry` (User registration & sponsor tree).
3. Deploys `BTitanNFT` (Soulbound milestone rank badges).
4. Deploys `EquoraVault` (Central routing treasury).
5. Deploys `EquoraRewardPool` (Milestone bonus pool).
6. Deploys `EquoraSalaryPool` (Monthly recurring salary pool).
7. Deploys `EquoraMagicBox` (Quarterly reward pool).
8. Deploys `EquoraDAO` + `BTitanDAOMembership` (100-Seat Genesis Council).
9. Deploys `BTitanMatrix` (12-Slot, 14-Node auto-matrix engine).
10. **Wires all authorizations**: Vault pool initialization, Matrix permissions, Registry caller links, NFT minter assignment, and DAO volume routing.
11. **Synchronizes Frontend**: Automatically writes all addresses and ABIs to [`packages/nextjs/contracts/deployedContracts.ts`](file:///packages/nextjs/contracts/deployedContracts.ts).
12. **Null Key Lockdown**: On production networks, automatically renounces ownership on all contracts, locking the protocol as fully autonomous.

#### 3.1 Configure Hardhat Environment
Create `packages/hardhat/.env`:
```ini
DEPLOYER_PRIVATE_KEY="0xYOUR_DEPLOYER_PRIVATE_KEY"
BSCSCAN_API_KEY="YOUR_BSCSCAN_API_KEY"
```

#### 3.2 Execute Deployment

```bash
# For BSC Testnet:
npx hardhat run scripts/deploy.ts --network bscTestnet

# For BSC Mainnet:
npx hardhat run scripts/deploy.ts --network bsc
```

*Output summary will display:*
```text
╔══════════════════════════════════════════════════════════╗
║           EQUORA.FI DEPLOYMENT COMPLETE ✅               ║
╠══════════════════════════════════════════════════════════╣
║  Token:         0x...                                    ║
║  Registry:      0x...                                    ║
║  NFT:           0x...                                    ║
║  DAO:           0x...                                    ║
║  DAO NFT:       0x...                                    ║
║  Vault:         0x...                                    ║
║  Matrix:        0x...                                    ║
║  SalaryPool:    0x...                                    ║
║  MagicBox:      0x...                                    ║
║  RewardPool:    0x...                                    ║
╚══════════════════════════════════════════════════════════╝
```

#### 3.3 Verify Contracts on BscScan
```bash
# Verify BTitanMatrix (example)
npx hardhat verify --network bsc <MATRIX_ADDRESS> "<TOKEN_ADDRESS>" "<REGISTRY_ADDRESS>" "<NFT_ADDRESS>"

# Verify EquoraDAO
npx hardhat verify --network bsc <DAO_ADDRESS> "<TOKEN_ADDRESS>" "<REGISTRY_ADDRESS>"

# Verify EquoraRegistry
npx hardhat verify --network bsc <REGISTRY_ADDRESS> "<DEPLOYER_ADDRESS>"
```

---

### Step 4: Configure Environment Variables

Create the production environment files across the packages:

#### 4.1 Root `.env` (Used by Docker, Indexer & API)
```ini
NODE_ENV=production
PORT=4000

# Database Connection
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# Redis Cache
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_secure_redis_password
REDIS_URL="redis://:your_secure_redis_password@localhost:6379"

# Security & SIWE Auth
JWT_SECRET="generate_a_random_32_to_64_character_secret_key"
JWT_EXPIRES_IN="24h"
SIWE_NONCE_TTL_SECONDS=300
CORS_ORIGIN="https://app.equora.fi,https://equora.fi"

# Blockchain Configuration
CHAIN_ID=56
RPC_URL="https://bsc-dataseed.binance.org"

# Deployed Contract Addresses (from Step 3)
NEXT_PUBLIC_TOKEN_ADDRESS="0x..."
NEXT_PUBLIC_REGISTRY_ADDRESS="0x..."
NEXT_PUBLIC_NFT_ADDRESS="0x..."
NEXT_PUBLIC_DAO_ADDRESS="0x..."
NEXT_PUBLIC_MATRIX_ADDRESS="0x..."
NEXT_PUBLIC_VAULT_ADDRESS="0x..."

# Indexer Settings
INDEXER_POLL_INTERVAL_MS=3000
INDEXER_START_BLOCK=DEPLOYMENT_BLOCK_NUMBER
```

#### 4.2 Frontend `.env.local` ([`packages/nextjs/.env.local`](file:///packages/nextjs/.env.local))
```ini
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID="your_reown_project_id"
NEXT_PUBLIC_TARGET_NETWORK="bsc"
NEXT_PUBLIC_API_URL="https://api.equora.fi"
NEXT_PUBLIC_APP_URL="https://app.equora.fi"
```

---

### Step 5: Build & Launch Backend Services

We use **PM2** to manage long-running backend processes with automatic crash restarts.

#### 5.1 Build & Start API Server
```bash
cd /var/www/b-titan/apps/api
npm run build
pm2 start dist/index.js --name "btitan-api" --time
cd ../..
```

#### 5.2 Build & Start Blockchain Indexer
```bash
cd /var/www/b-titan/apps/indexer
npm run build
pm2 start dist/index.js --name "btitan-indexer" --time
cd ../..
```

#### 5.3 Verify Services:
```bash
pm2 status
curl http://localhost:4000/health
# Response: {"status":"healthy","service":"btitan-api",...}
```

---

### Step 6: Build & Launch Frontend Web App

```bash
cd /var/www/b-titan/packages/nextjs

# Production Next.js build
npm run build

# Start Next.js standalone server on port 3000
pm2 start "npm run start -- -p 3000" --name "btitan-frontend" --time
cd ../..

# Persist PM2 processes across server reboots
pm2 save
pm2 startup
```

---

## 4. Production Nginx & SSL Configuration

Create `/etc/nginx/sites-available/equora.conf`:

```nginx
# Rate limiting zone
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=30r/s;

# Upstreams
upstream nextjs_upstream {
    server 127.0.0.1:3000;
    keepalive 64;
}

upstream api_upstream {
    server 127.0.0.1:4000;
    keepalive 32;
}

server {
    listen 80;
    server_name app.equora.fi api.equora.fi;
    return 301 https://$host$request_uri;
}

# 1. Frontend Web App (app.equora.fi)
server {
    listen 443 ssl http2;
    server_name app.equora.fi;

    # SSL Certificates (managed by Certbot)
    ssl_certificate /etc/letsencrypt/live/app.equora.fi/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.equora.fi/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Next.js Static Asset Caching
    location /_next/static/ {
        proxy_pass http://nextjs_upstream;
        proxy_cache_bypass $http_upgrade;
        expires 365d;
        access_log off;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location / {
        proxy_pass http://nextjs_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# 2. REST API (api.equora.fi)
server {
    listen 443 ssl http2;
    server_name api.equora.fi;

    ssl_certificate /etc/letsencrypt/live/api.equora.fi/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.equora.fi/privkey.pem;

    location / {
        limit_req zone=api_limit burst=50 nodelay;
        proxy_pass http://api_upstream;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site and generate SSL certificates:
```bash
sudo ln -s /etc/nginx/sites-available/equora.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Generate Let's Encrypt SSL
sudo certbot --nginx -d app.equora.fi -d api.equora.fi
```

---

## 5. Post-Deployment Verification & Smoke Test Checklist

Execute these checks immediately following deployment to certify production readiness:

| Test Item | Command / Procedure | Expected Result |
| :--- | :--- | :--- |
| **API Health Check** | `curl https://api.equora.fi/health` | HTTP 200 `{"status":"healthy"}` |
| **Database Connectivity** | `cd packages/database && npx prisma db pull --print` | Successfully reads models without connection timeout |
| **Indexer Active Sync** | `pm2 logs btitan-indexer --lines 20` | Output shows `[Indexer] Polling block #... (0 events)` |
| **Frontend SSR Load** | `curl -I https://app.equora.fi` | HTTP 200 OK |
| **Wallet Connection** | Open `https://app.equora.fi` on desktop & mobile | RainbowKit modal opens; connects with MetaMask, TokenPocket, Trust Wallet |
| **DAO Contract Read** | Check `totalSeats()` on BscScan / Frontend | Returns `0` (or seats occupied, max `100`) |
| **Matrix Contract Read** | Check `SLOT_COUNT` on BscScan | Returns `12` |
| **Null Key Verification** | Query `owner()` on `BTitanMatrix` & `EquoraRegistry` | Returns `0x0000000000000000000000000000000000000000` |
| **Browser Console Clean** | Check DevTools Console on `/matrix` and `/dao` | **0 errors, 0 warnings** |

---

## 6. Disaster Recovery, Backups & Maintenance

### 6.1 Automated Daily Database Backup
Add a cron job on the server (`crontab -e`):
```bash
# Backup PostgreSQL daily at 02:00 AM UTC and delete backups older than 14 days
0 2 * * * pg_dump -U btitan_admin -d btitan_db | gzip > /var/backups/btitan_db_$(date +\%Y\%m\%d).sql.gz && find /var/backups -name "btitan_db_*.sql.gz" -mtime +14 -delete
```

### 6.2 Monitoring & Log Management
```bash
# Monitor all services in real time
pm2 monit

# Flush old PM2 logs
pm2 flush

# Restart any individual service safely with zero downtime
pm2 reload btitan-frontend
pm2 reload btitan-api
pm2 reload btitan-indexer
```

### 6.3 Emergency Protocol Checklist
1. **Blockchain RPC Outage**: Update `RPC_URL` in root `.env` and `packages/hardhat/hardhat.config.ts`, then run `pm2 restart btitan-indexer`.
2. **Database Failover**: Update `DATABASE_URL` in `.env` and `packages/database/.env`, then run `pm2 restart all`.
3. **Frontend Rollback**: Run `git checkout <PREVIOUS_TAG>`, `npm --prefix packages/nextjs run build`, and `pm2 reload btitan-frontend`.
