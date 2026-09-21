# EQUORA_Fi (B-TITAN) — DevOps Engineering & Deployment Handoff

> **Target Audience:** DevOps Engineers, SysAdmins, Infrastructure Specialists  
> **Repository Architecture:** npm Workspaces Monorepo (`apps/*`, `packages/*`)  
> **Process Management:** Docker Compose (DB/Cache) + PM2 (Node.js Services) + Nginx (Reverse Proxy)

---

## 1. System Services & Port Topology

The platform comprises **5 core services** running on the host server:

| Service | Technology | Port / Type | Working Directory | Process Name |
| :--- | :--- | :--- | :--- | :--- |
| **Database** | PostgreSQL 16 Alpine | `5432/tcp` | Root (`docker-compose.yml`) | Container: `btitan_postgres` |
| **Cache** | Redis 7 Alpine | `6379/tcp` | Root (`docker-compose.yml`) | Container: `btitan_redis` |
| **Backend REST API** | Express / Node.js 20+ | `4000/tcp` (Internal) | `apps/api` | PM2: `btitan-api` |
| **Blockchain Indexer** | Viem / Node.js 20+ | Daemon (No open port) | `apps/indexer` | PM2: `btitan-indexer` |
| **Queue & Worker** | BullMQ / Node.js 20+ | Daemon (No open port) | `apps/queue` | PM2: `btitan-queue` |
| **Frontend Web App** | Next.js 15 (Webpack SSR) | `3000/tcp` (Internal) | `apps/web` | PM2: `btitan-frontend` |
| **Reverse Proxy** | Nginx + Certbot SSL | `80`, `443/tcp` (Public) | `/etc/nginx/sites-available/` | `systemd: nginx` |

---

## 2. Infrastructure Requirements (Server Sizing)

* **Operating System:** Ubuntu 22.04 LTS (recommended) or Debian 12 (x86_64).
* **Instance Size:** Minimum **2 vCPUs, 4–8 GB RAM, 40+ GB NVMe SSD** (e.g., DigitalOcean Basic Droplet or AWS t3.large).
* **Software Runtimes:**
  * Node.js **v20.x or v22.x LTS** (Install via NodeSource)
  * npm **v10+** (Monorepo workspace support)
  * Docker Engine **24.0+** & Docker Compose **v2+**
  * PM2 (`npm install -g pm2`)
  * Nginx (`apt install nginx certbot python3-certbot-nginx`)

---

## 3. Quick-Start Deployment (5 Steps)

### Step 1: Clone Repository & Install Root Workspaces
```bash
git clone <REPO_URL> /var/www/b-titan
cd /var/www/b-titan

# Install dependencies across all packages and apps
npm install
```

### Step 2: Start PostgreSQL & Redis
```bash
# Start Docker containers in detached mode
docker compose up -d

# Run Prisma schema migrations
cd packages/database
npx prisma generate
npx prisma migrate deploy
cd ../..
```

### Step 3: Configure Environment Variables

#### Root `.env` (Used by Backend API & Indexer)
Create `/var/www/b-titan/.env`:
```ini
NODE_ENV=production
PORT=4000

# Database Connection (Default matching docker-compose.yml)
DATABASE_URL="postgresql://btitan_admin:btitan_secret_password@localhost:5432/btitan_db"

# Redis Cache
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=btitan_redis_secret
REDIS_URL="redis://:btitan_redis_secret@localhost:6379"

# Security & SIWE Auth
JWT_SECRET="generate_a_random_32_to_64_character_secret_key"
JWT_EXPIRES_IN=24h
SIWE_NONCE_TTL_SECONDS=300
CORS_ORIGIN="https://yourdomain.com,http://localhost:3000"

# Target Blockchain
CHAIN_ID=56
RPC_URL="https://bsc-dataseed.binance.org"

# Indexer Polling
INDEXER_POLL_INTERVAL_MS=3000
INDEXER_START_BLOCK=0
```

#### Frontend `.env.local`
Create `/var/www/b-titan/apps/web/.env.local`:
```ini
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID="YOUR_REOWN_PROJECT_ID"
NEXT_PUBLIC_TARGET_NETWORK="bsc"
NEXT_PUBLIC_API_URL="https://yourdomain.com"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

### Step 4: Build & Launch Services via PM2
```bash
# 1. Build all services from monorepo root
cd /var/www/b-titan
pnpm install
pnpm build

# 2. Launch Backend API (Port 4000)
cd apps/api
pm2 start dist/index.js --name "btitan-api" --time

# 3. Launch Blockchain Event Indexer
cd ../indexer
pm2 start dist/index.js --name "btitan-indexer" --time

# 4. Launch Queue Worker
cd ../queue
pm2 start dist/index.js --name "btitan-queue" --time

# 5. Launch Frontend Web App (Port 3000)
cd ../web
pm2 start "pnpm start -- -p 3000" --name "btitan-frontend" --time

# Save PM2 state across reboots
pm2 save
pm2 startup
cd ../..
```

### Step 5: Configure Nginx & SSL
Create `/etc/nginx/sites-available/btitan.conf`:
```nginx
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

    # Next.js static asset caching
    location /_next/static/ {
        proxy_pass http://nextjs_upstream;
        expires 365d;
        access_log off;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # REST API routing
    location /api/ {
        proxy_pass http://api_upstream;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend SSR routing
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
sudo certbot --nginx -d yourdomain.com
```

---

## 4. Operational Monitoring & Maintenance

### Check Process Status & Logs
```bash
# View live status of all Node.js processes
pm2 status

# Real-time combined log stream
pm2 logs

# View specific service logs
pm2 logs btitan-api --lines 50
pm2 logs btitan-indexer --lines 50
pm2 logs btitan-frontend --lines 50

# Live memory & CPU monitoring dashboard
pm2 monit
```

### Zero-Downtime Reloads
```bash
# Reload services after code update
git pull
pnpm install
pnpm build
pm2 reload btitan-frontend
pm2 reload btitan-api
pm2 reload btitan-indexer
pm2 reload btitan-queue
```

### Health Check Verification
```bash
# Test API Health (Must return HTTP 200)
curl http://localhost:4000/health
# Output: {"status":"healthy","service":"btitan-api",...}

# Test Next.js SSR
curl -I http://localhost:3000/
# Output: HTTP/1.1 200 OK
```

---

## 5. Automated Database Backups

Add this daily backup cronjob (`crontab -e`):
```bash
# Daily PostgreSQL backup at 02:00 AM UTC (Retains last 14 days)
0 2 * * * docker exec btitan_postgres pg_dump -U btitan_admin btitan_db | gzip > /var/backups/btitan_db_$(date +\%Y\%m\%d).sql.gz && find /var/backups -name "btitan_db_*.sql.gz" -mtime +14 -delete
```
