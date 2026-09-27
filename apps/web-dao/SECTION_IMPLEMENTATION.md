# DAO Frontend — Transactions, Profile & Settings

> **Scope**: `apps/web-dao/src/app/dao/transactions`, `profile`, and `settings`
> **Author**: Developer B branch
> **Status**: Fully implemented

## Architecture & Data Flow

```
Browser
  SIWE sign-in → /api/auth/nonce → sign → /api/auth/verify → JWT stored in localStorage

Frontend Components (Next.js)
  useApi<T>(path, options)         [apps/web-dao/src/hooks/useApi.ts]
  useWallet()                      [apps/web-dao/src/context/WalletContext.tsx]
  useAuthContext()                  [apps/web-dao/src/context/AuthContext.tsx]

API (Express)                      [apps/api/src/app.ts]
  daoService / prisma / priceService

PostgreSQL (Prisma)                [packages/database/prisma/schema.prisma]
  Indexer writes events from blockchain
```

---

## Section 1: Transactions — ALREADY COMPLETE

### Data Flow
```
useTransactions(address, page, limit)
  GET /api/dao/transactions?address=&page=&limit=
  Aggregates: DaoEvent + MatrixPlacement + Withdrawal
  Returns: TransactionsData { transactions[], total, pages, bttPriceUsd }
```

---

## Section 2: Profile — ALREADY COMPLETE

### Data Flow
```
useDaoProfile(address)
  GET /api/dao/profile/:address
  Joins: DaoMember + MatrixSlot + NftBadge + PoolCard + Withdrawal
  Returns: ProfileData (extends MemberDetailsData)
```

---

## Section 3: Settings — FULLY IMPLEMENTED

### Tab: Security — What Changed

| Component | Before | After |
|---|---|---|
| WalletSecurityCard | Hardcoded address | Real useWallet() |
| ActiveSessionsCard | Hardcoded "Chrome/Windows" | Real auth state + Sign Out |
| SecurityActivityCard | Dummy static events | Real transactions (last 5) |
| SettingsDangerZone | alert() placeholder | Real signOut() + confirmation dialog |

#### WalletSecurityCard flow
```
useWallet() → { base58Address, hexAddress, isConnected }
Shows real address, working copy, real connected status, tronscan.io link
```

#### ActiveSessionsCard flow
```
useAuthContext() + useWallet()
Sign Out button → auth.signOut() + wallet.disconnect()
```

#### SecurityActivityCard flow
```
useTransactions(address, 1, 5)
  GET /api/dao/transactions?address=...&limit=5
  Displays as activity log with skeleton loading + empty state
  "View All" links to /dao/transactions
```

### Tab: Notifications — Fully Wired

Notifications now load from and save to the backend. Toggles persist across page refreshes.

```
useUserSettings(token)
  GET /api/user/settings (JWT required) → loads prefs

toggle changed → debounced 600ms →
  saveUserSettings({ notifGovernance: false }, token)
  PUT /api/user/settings → shows "Saved" badge for 2s
  Error → reverts toggle
```

### Tab: Privacy — Fully Wired

Same pattern as notifications.

```
useUserSettings(token)
  GET /api/user/settings → loads privDaoProfileVisible, privWalletVisible, etc.

toggle changed → debounced 600ms →
  PUT /api/user/settings → "Saved" badge on success
```

### Tab: Wallet — Already Working
ConnectedWalletCard was already connected to real wallet/auth context.

---

## New API Endpoints

### GET /api/user/settings
Auth required. Returns settings row (creates with defaults if first access).

### PUT /api/user/settings
Auth required. Body: any subset of notif* or priv* boolean fields. Upserts the settings row.

Allowed fields: notifDaoActivity, notifGovernance, notifCouncilSeat, notifMatrixBridge,
notifProtocolUpdates, notifSecurityAlerts, notifMarketingEvents, privDaoProfileVisible,
privWalletVisible, privSeatActivity, privGovernanceActivity, privEarningsVisible

---

## New Database Model

Added to packages/database/prisma/schema.prisma:

```
model UserSettings {
  id                      String   @id @default(uuid())
  userAddress             String   @unique
  notifDaoActivity        Boolean  @default(true)
  notifGovernance         Boolean  @default(true)
  notifCouncilSeat        Boolean  @default(true)
  notifMatrixBridge       Boolean  @default(true)
  notifProtocolUpdates    Boolean  @default(true)
  notifSecurityAlerts     Boolean  @default(true)
  notifMarketingEvents    Boolean  @default(true)
  privDaoProfileVisible   Boolean  @default(true)
  privWalletVisible       Boolean  @default(true)
  privSeatActivity        Boolean  @default(true)
  privGovernanceActivity  Boolean  @default(true)
  privEarningsVisible     Boolean  @default(false)
  updatedAt               DateTime @updatedAt
  createdAt               DateTime @default(now())
}
```

---

## New Frontend Exports (useApi.ts)

```typescript
export interface UserSettingsData { ... }
export function useUserSettings(token: string | null): UseApiResult<UserSettingsData>
export async function saveUserSettings(fields, token): Promise<UserSettingsData>
export async function apiPut<T>(path, body, token?): Promise<T>
```

---

## Modified Files

### Backend
- packages/database/prisma/schema.prisma — Added UserSettings model
- apps/api/src/app.ts — Added GET/PUT /api/user/settings

### Frontend  
- apps/web-dao/src/hooks/useApi.ts — Added UserSettingsData, useUserSettings, saveUserSettings, apiPut
- security/WalletSecurityCard.tsx — Connected to real useWallet()
- security/ActiveSessionsCard.tsx — Connected to real auth + Sign Out
- security/SecurityActivityCard.tsx — Real tx data + skeleton + empty state
- settings/SettingsDangerZone.tsx — Real signOut() + confirmation dialog
- notifications/NotificationSettingsCard.tsx — Wired to backend with debounced save
- privacy/ProfileVisibilityCard.tsx — Wired to backend with debounced save
- privacy/DaoActivityPrivacyCard.tsx — Wired to backend with debounced save

### UNTOUCHED
- All other sections: lounge, matrix, treasury, seats
- apps/web-dao/src/app/dao/transactions/page.tsx
- apps/web-dao/src/app/dao/profile/page.tsx
- apps/web-dao/src/app/dao/settings/page.tsx (layout/shell)

---

## Setup (DB Migration)

```bash
# Set DATABASE_URL in your .env
cp .env.example .env
# Edit with your DB credentials

# Push the new UserSettings model
cd packages/database
pnpm db:push

# Start dev server
pnpm dev
```

UserSettings rows are auto-created on first API access with schema defaults.
No manual seeding required.
