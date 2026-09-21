# EQUORA_Fi (B-TITAN) — Complete Master Deployment Guide for DevOps

> **Document Type:** Comprehensive Full-Stack Production Deployment Runbook  
> **Target Audience:** DevOps Engineers, SysAdmins, Smart Contract Deployment Engineers  
> **Scope:** Complete Platform (Smart Contracts + PostgreSQL + Redis + Indexer Daemon + Express API + Next.js 15 Frontend + Nginx + SSL)  
> **Supported Networks:** BNB Smart Chain (BSC Mainnet: Chain ID 56, BSC Testnet: Chain ID 97)

---

## Table of Contents
1. [System Architecture & Port Topology](#1-system-architecture--port-topology)
2. [Server Provisioning & Hardware Requirements](#2-server-provisioning--hardware-requirements)
3. [Required Credentials & API Keys Checklist](#3-required-credentials--api-keys-checklist)
4. [Step 1: Base Server & Dependency Installation](#step-1-base-server--dependency-installation)
5. [Step 2: Smart Contract Deployment (BSC Mainnet / Testnet)](#step-2-smart-contract-deployment-bsc-mainnet--testnet)
6. [Step 3: Database & Cache Initialization (PostgreSQL + Redis)](#step-3-database--cache-initialization-postgresql--redis)
7. [Step 4: Real-Time Blockchain Event Indexer](#step-4-real-time-blockchain-event-indexer)
8. [Step 5: Backend REST API Service](#step-5-backend-rest-api-service)
9. [Step 6: Frontend Web Application (Next.js 15)](#step-6-frontend-web-application-nextjs-15)
10. [Step 7: Production Nginx Reverse Proxy & SSL](#step-7-production-nginx-reverse-proxy--ssl)
11. [Step 8: Firewall (UFW) & Security Hardening](#step-8-firewall-ufw--security-hardening)
12. [Automated Daily Database Backups (Cron)](#12-automated-daily-database-backups-cron)
13. [Zero-Downtime Updates & Operational Commands](#13-zero-downtime-updates--operational-commands)
14. [DevOps Troubleshooting & Verification Matrix](#14-devops-troubleshooting--verification-matrix)

---

## 1. System Architecture & Port Topology

The platform operates as a cohesive, 5-tier architecture:

```
                            ┌─────────────────────────────────────────┐
                            │           Web & Mobile Clients          │
                            │ (TokenPocket / MetaMask / Trust Wallet) │
                            └────────────────────┬────────────────────┘
                                                 │
                                                 │ HTTPS / WSS (Ports 80 / 443)
                                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Nginx Reverse Proxy                              │
├───────────────────────────────┬─────────────────────────────────────────────┤
│   Proxy /                     │ Proxy /api/                                 │
│   Port 3000 (Next.js 15 SSR)  │ Port 4000 (Express REST API)                │
└───────────────┬───────────────┴──────────────────────┬──────────────────────┘
                │                                      │
                │ Web3 RPC Provider                    │ PostgreSQL & Redis Queries
                ▼                                      ▼
┌───────────────────────────────┐     ┌───────────────────────────────────────┐
│     BSC Blockchain Node       │     │     PostgreSQL 16 + Redis 7 Cache     │
│  (Mainnet: 56 / Testnet: 97)  │     │  (Port 5432 / Port 6379 via Docker)   │
└───────────────┬───────────────┘     └──────────────────▲────────────────────┘
                │                                        │
                │ Real-time Smart Contract Events        │ Synchronized DB State
                └───────────────────────┬────────────────┘
                                        ▼
                      ┌───────────────────────────────────┐
                      │    Blockchain Event Indexer       │
                      │   (Node.js / Viem Background)     │
                      └───────────────────────────────────┘
```

### Port Mapping & Process Summary

| Component | Stack | Port | Public? | Process Manager | Working Dir |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Nginx** | Reverse Proxy | `80`, `443` | **Yes** | `systemd: nginx` | `/etc/nginx/` |
| **Frontend Web App** | Next.js 15 | `3000` | No (Internal) | `pm2: btitan-frontend` | `apps/web` |
| **Backend REST API** | Express / Node.js 20 | `4000` | No (Internal) | `pm2: btitan-api` | `apps/api` |
| **Blockchain Indexer** | Viem Daemon | None | No | `pm2: btitan-indexer` | `apps/indexer` |
| **Queue & Worker** | BullMQ / Node.js 20 | None | No | `pm2: btitan-queue` | `apps/queue` |
| **PostgreSQL Database**| Postgres 16 Alpine | `5432` | No (Localhost) | Docker Container | `docker-compose.yml` |
| **Redis Cache** | Redis 7 Alpine | `6379` | No (Localhost) | Docker Container | `docker-compose.yml` |

---

## 2. Server Provisioning & Hardware Requirements

| Specification | Recommended Production | Minimum Staging |
| :--- | :--- | :--- |
| **Cloud Provider** | AWS, DigitalOcean, Hetzner, Vultr | Any VPS |
| **CPU** | **4 vCPUs** (Compute Optimized) | 2 vCPUs |
| **RAM** | **8 GB to 16 GB DDR4/DDR5** | 4 GB |
| **Storage** | **80+ GB NVMe SSD** | 40 GB SSD |
| **Operating System** | **Ubuntu 22.04 LTS (x86_64)** | Ubuntu 22.04 LTS |
| **Network Bandwidth** | 1 Gbps port / 2+ TB monthly transfer | 100 Mbps |

---

## 3. Required Credentials & API Keys Checklist

Before running commands, verify you have the following ready:

1. **Deployer Wallet Private Key:**
   - An EVM private key (`0x...`).
   - Funded with **0.25 to 0.40 BNB** on BSC Mainnet (or free tBNB on BSC Testnet).
2. **BSC RPC Endpoint:**
   - Free fallback: `https://bsc-dataseed.binance.org/`
   - Dedicated private RPC recommended for production: QuickNode, Alchemy, or Ankr.
3. **BscScan API Key:**
   - Free key from [bscscan.com/myapikey](https://bscscan.com/myapikey) (for source code verification).
4. **Reown / WalletConnect Project ID:**
   - Free key from [cloud.reown.com](https://cloud.reown.com) (enables wallet connections).
5. **Domain Name:**
   - Point your domain's A-Record (e.g. `yourdomain.com`) to the server public IP address.

---

## Step 1: Base Server & Dependency Installation

SSH into your fresh Ubuntu 22.04 LTS server:

```bash
# 1. Update package lists
sudo apt update && sudo apt upgrade -y

# 2. Install essential build tools & Git
sudo apt install -y curl git build-essential ufw nginx certbot python3-certbot-nginx

# 3. Install Node.js 20 LTS (NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 4. Install PM2 globally
sudo npm install -g pm2

# 5. Install Docker & Docker Compose
sudo apt install -y ca-certificates gnupg lsb-release
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 6. Verify installed versions
node -v                # v20.x
npm -v                 # 10.x
pm2 -v                 # 5.x
docker --version       # Docker 24+
docker compose version # Docker Compose v2+
```

---

## Step 2: Smart Contract Deployment (BSC Mainnet / Testnet)

> **Note:** If smart contracts are already deployed, skip to **Step 3** and paste your contract addresses into the environment files.

```bash
# 1. Clone the repository to /var/www/b-titan
sudo git clone <YOUR_REPO_URL> /var/www/b-titan
sudo chown -R $USER:$USER /var/www/b-titan
cd /var/www/b-titan

# 2. Install root monorepo dependencies
npm install

# 3. Configure Hardhat deployment environment
cat <<EOF > packages/hardhat/.env
DEPLOYER_PRIVATE_KEY="0xYOUR_DEPLOYER_PRIVATE_KEY_HERE"
BSCSCAN_API_KEY="YOUR_BSCSCAN_API_KEY_HERE"
EOF

# 4. Compile contracts
npm run compile

# 5. Deploy all 10 contracts to BSC
# For Testnet:
npx hardhat run scripts/deploy.ts --network bscTestnet

# For Mainnet:
npx hardhat run scripts/deploy.ts --network bsc
```

### What this single deploy script handles automatically:
1. Deploys `BTitanToken` (TROB token).
2. Deploys `EquoraRegistry` (User registration & sponsor tree).
3. Deploys `BTitanNFT` (Milestone rank badges).
4. Deploys `EquoraVault` (Central routing treasury).
5. Deploys `EquoraRewardPool`, `EquoraSalaryPool`, `EquoraMagicBox`.
6. Deploys `EquoraDAO` and mints `BTitanDAOMembership` Soulbound NFT.
7. Deploys `BTitanMatrix` (12-Slot, 14-Node auto-matrix engine).
8. Wires all cross-contract authorizations (Vault pools, Matrix links, Registry caller rules).
9. Automatically generates [`apps/web/contracts/deployedContracts.ts`](file:///apps/web/contracts/deployedContracts.ts) with all addresses and ABIs.
10. Renounces contract ownership (Null Key lockdown) on production networks.

---

## Step 3: Database & Cache Initialization (PostgreSQL + Redis)

```bash
cd /var/www/b-titan

# 1. Start PostgreSQL 16 and Redis 7 containers
docker compose up -d

# 2. Verify containers are running healthy
docker compose ps

# 3. Run Prisma database migrations to create all indexed tables
cd packages/database
npx prisma generate
npx prisma migrate deploy
cd ../..
```

---

## Step 4: Real-Time Blockchain Event Indexer

The indexer runs continuously in the background, listening to contract events (Registrations, Matrix Placements, DAO Buy-ins) and synchronizing them into PostgreSQL.

```bash
# 1. Create root .env for Indexer & API
cat <<EOF > /var/www/b-titan/.env
NODE_ENV=production
PORT=4000

# PostgreSQL Connection
DATABASE_URL="postgresql://btitan_admin:btitan_secret_password@localhost:5432/btitan_db"

# Redis Cache Connection
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=btitan_redis_secret
REDIS_URL="redis://:btitan_redis_secret@localhost:6379"

# SIWE Authentication & Security
JWT_SECRET="$(openssl rand -hex 32)"
JWT_EXPIRES_IN=24h
SIWE_NONCE_TTL_SECONDS=300
CORS_ORIGIN="https://yourdomain.com,http://localhost:3000"

# Blockchain RPC Connection
CHAIN_ID=56
RPC_URL="https://bsc-dataseed.binance.org"

# Indexer Settings
INDEXER_POLL_INTERVAL_MS=3000
INDEXER_START_BLOCK=0
EOF

# 2. Build and start Indexer daemon
cd /var/www/b-titan/apps/indexer
npm run build
pm2 start dist/index.js --name "btitan-indexer" --time
cd ../..
```

---

## Step 5: Backend REST API Service

```bash
# Build and start Express API on port 4000
cd /var/www/b-titan/apps/api
npm run build
pm2 start dist/index.js --name "btitan-api" --time
cd ../..

# Verify health endpoint returns HTTP 200:
curl http://localhost:4000/health
# Expected Output: {"status":"healthy","service":"btitan-api",...}
```

---

## Step 6: Frontend Web Application (Next.js 15)

```bash
# 1. Create Frontend environment file
cat <<EOF > /var/www/b-titan/apps/web/.env.local
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID="YOUR_REOWN_PROJECT_ID"
NEXT_PUBLIC_TARGET_NETWORK="bsc"
NEXT_PUBLIC_API_URL="https://yourdomain.com"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
EOF

# 2. Build Next.js production bundle
cd /var/www/b-titan/apps/web
pnpm build

# 3. Start Next.js SSR on port 3000 via PM2
pm2 start "pnpm start -- -p 3000" --name "btitan-frontend" --time

# 4. Save PM2 state so all 3 services auto-restart on server reboot
pm2 save
pm2 startup
cd ../..
```

---

## Step 7: Production Nginx Reverse Proxy & SSL

Create `/etc/nginx/sites-available/btitan.conf`:

```nginx
# Rate limiting zone for API protection
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=30r/s;

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
    server_name yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL Certificates managed by Certbot
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # 1. Next.js Static Asset Caching (Immutable, 1 Year)
    location /_next/static/ {
        proxy_pass http://nextjs_upstream;
        proxy_cache_bypass $http_upgrade;
        expires 365d;
        access_log off;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # 2. REST API Routing (Forward to port 4000)
    location /api/ {
        limit_req zone=api_limit burst=50 nodelay;
        proxy_pass http://api_upstream;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 3. Next.js Frontend SSR (Forward to port 3000)
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
```

Enable site and generate SSL:
```bash
sudo ln -s /etc/nginx/sites-available/btitan.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Issue Let's Encrypt SSL certificate
sudo certbot --nginx -d yourdomain.com
```

---

## Step 8: Firewall (UFW) & Security Hardening

Lock down all ports except SSH, HTTP, and HTTPS. Internal ports (3000, 4000, 5432, 6379) are strictly shielded from public access:

```bash
# Allow SSH, HTTP, and HTTPS only
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw --force enable
sudo ufw status
```

---

## 12. Automated Daily Database Backups (Cron)

Set up a daily automated database backup that keeps the last 14 days of backups:

```bash
# Create backup directory
sudo mkdir -p /var/backups/btitan

# Add daily backup cron job at 02:00 AM UTC
(crontab -l 2>/dev/null; echo "0 2 * * * docker exec btitan_postgres pg_dump -U btitan_admin btitan_db | gzip > /var/backups/btitan/btitan_db_\$(date +\\%Y\\%m\\%d).sql.gz && find /var/backups/btitan -name 'btitan_db_*.sql.gz' -mtime +14 -delete") | crontab -
```

---

## 13. Zero-Downtime Updates & Operational Commands

### Live Process Monitoring
```bash
pm2 status              # View status of all 3 services
pm2 logs                # Combined real-time logs
pm2 logs btitan-api     # API logs only
pm2 logs btitan-indexer # Indexer logs only
pm2 logs btitan-frontend# Frontend logs only
pm2 monit               # Interactive CPU/Memory dashboard
```

### Deploying Code Updates (Zero Downtime)
```bash
cd /var/www/b-titan
git pull

# 1. Update Monorepo & Rebuild all
pnpm install
pnpm build

# 2. Reload PM2 processes
pm2 reload btitan-frontend
pm2 reload btitan-api
pm2 reload btitan-indexer
pm2 reload btitan-queue
```

---

## 14. DevOps Troubleshooting & Verification Matrix

| Issue | Root Cause | Solution |
| :--- | :--- | :--- |
| **API returns 502 Bad Gateway** | `btitan-api` process is stopped | Run `pm2 restart btitan-api` and check `pm2 logs btitan-api`. |
| **Prisma migration error** | PostgreSQL container not ready | Verify container with `docker compose ps`. Test connection with `docker exec -it btitan_postgres pg_isready`. |
| **Indexer not polling events** | Invalid `RPC_URL` or rate limit | Check `pm2 logs btitan-indexer`. Switch `RPC_URL` in root `.env` to a dedicated QuickNode / Alchemy RPC. |
| **WalletConnect modal doesn't open** | Missing/invalid Project ID | Verify `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` in `apps/web/.env.local`. Rebuild frontend. |
| **Contract deployment reverts** | Insufficient deployer BNB gas | Fund deployer wallet with at least 0.25 BNB. |
| **Nginx 413 Payload Too Large** | Default Nginx client body size | Add `client_max_body_size 20M;` inside `http` block of `/etc/nginx/nginx.conf`. |
| **CORS error on API calls** | Missing domain in `CORS_ORIGIN` | Add your exact domain (e.g. `https://yourdomain.com`) to `CORS_ORIGIN` in root `.env` and run `pm2 restart btitan-api`. |

---

*This document contains the complete, authoritative runbook for deploying and operating the EQUORA_Fi (B-Titan) platform in production.*
