#!/usr/bin/env bash
# ==============================================================================
# EQUORA.FI PROTOCOL — MONOREPO SETUP SCRIPT (Linux / macOS / WSL)
# ==============================================================================

set -e

echo ""
echo "=========================================================="
echo "  🚀 Starting Equora.Fi Monorepo Automated Setup"
echo "=========================================================="
echo ""

# 1. Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (>= 18.0.0)."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be >= 18. Found: $(node -v)"
    exit 1
fi
echo "✅ Node.js found: $(node -v)"

# 2. Check or install pnpm
if ! command -v pnpm &> /dev/null; then
    echo "📦 pnpm not detected. Installing pnpm globally..."
    npm install -g pnpm
fi
echo "✅ pnpm found: $(pnpm -v)"

# 3. Environment configuration
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        echo "📝 Creating .env from .env.example..."
        cp .env.example .env
        echo "✅ Created root .env"
    else
        echo "⚠️ .env.example not found. Please ensure .env is created manually."
    fi
else
    echo "✅ Root .env already exists"
fi

# 4. Install all dependencies across workspace
echo ""
echo "📦 Installing workspace dependencies with pnpm..."
pnpm install

# 5. Generate Prisma Database Client
echo ""
echo "🗄️ Generating Prisma database client..."
pnpm --filter @equora/database db:generate

# 6. Compile Smart Contracts
echo ""
echo "🔨 Compiling Hardhat Solidity smart contracts..."
pnpm --filter @equora/hardhat compile

# 7. Apply RainbowKit QR patch
echo ""
echo "🩹 Applying QR code border patch..."
node scripts/patch-qr.js

echo ""
echo "=========================================================="
echo "  🎉 Equora.Fi Monorepo Setup Successfully Completed!"
echo "=========================================================="
echo ""
echo "Available commands to start working:"
echo "  • pnpm dev           -> Start all apps via Turborepo"
echo "  • pnpm dev:web       -> Start Next.js frontend (http://localhost:3000)"
echo "  • pnpm dev:api       -> Start Express REST API (http://localhost:5000)"
echo "  • pnpm dev:indexer   -> Start Blockchain Indexer"
echo "  • pnpm dev:queue     -> Start Background Worker & Queue"
echo "  • pnpm chain         -> Start local Hardhat EVM node"
echo "  • pnpm test          -> Run smart contract test suites"
echo ""
