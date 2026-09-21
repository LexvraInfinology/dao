@echo off
REM ==============================================================================
REM EQUORA.FI / B-TITAN PROTOCOL — MONOREPO SETUP SCRIPT (Windows Native)
REM ==============================================================================

echo.
echo ==========================================================
echo   [!] Starting Equora.Fi Monorepo Automated Setup
echo ==========================================================
echo.

REM 1. Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Please install Node.js ^(>= 18.0.0^) from https://nodejs.org/
    exit /b 1
)
for /f "tokens=*" %%v in ('node -v') do set NODE_VERSION=%%v
echo [OK] Node.js found: %NODE_VERSION%

REM 2. Check pnpm
where pnpm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [!] pnpm not detected. Installing pnpm globally...
    npm install -g pnpm
)
for /f "tokens=*" %%v in ('pnpm -v') do set PNPM_VERSION=%%v
echo [OK] pnpm found: %PNPM_VERSION%

REM 3. Environment configuration
if not exist .env (
    if exist .env.example (
        echo [INFO] Copying .env.example to .env...
        copy .env.example .env >nul
        echo [OK] Created root .env
    )
) else (
    echo [OK] Root .env already exists
)

REM 4. Install all dependencies across workspace
echo.
echo [*] Installing workspace dependencies with pnpm...
call pnpm install
if %ERRORLEVEL% neq 0 (
    echo [ERROR] pnpm install failed.
    exit /b %ERRORLEVEL%
)

REM 5. Generate Prisma Database Client
echo.
echo [*] Generating Prisma database client...
call pnpm --filter @btitan/database db:generate

REM 6. Compile Smart Contracts
echo.
echo [*] Compiling Hardhat Solidity smart contracts...
call pnpm --filter @btitan/hardhat compile

REM 7. Apply RainbowKit QR patch
echo.
echo [*] Applying QR code border patch...
node scripts/patch-qr.js

echo.
echo ==========================================================
echo   [DONE] Equora.Fi Monorepo Setup Successfully Completed!
echo ==========================================================
echo.
echo Available commands to start working:
echo   - pnpm dev           ^: Start all apps via Turborepo
echo   - pnpm dev:web       ^: Start Next.js frontend (http://localhost:3000)
echo   - pnpm dev:api       ^: Start Express REST API (http://localhost:5000)
echo   - pnpm dev:indexer   ^: Start Blockchain Indexer
echo   - pnpm dev:queue     ^: Start Background Worker & Queue
echo   - pnpm chain         ^: Start local Hardhat EVM node
echo   - pnpm test          ^: Run smart contract test suites
echo.
