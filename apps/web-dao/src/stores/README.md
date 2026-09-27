# Zustand State Management Architecture (`web-dao`)

This directory contains the standardized, scalable Zustand state management configuration for `web-dao`.

---

## 1. Overview & Architectural Goals

The state management in `web-dao` is configured to provide:
1. **Zero Prop-Drilling**: Global and cross-component state can be accessed directly anywhere in the component tree without passing props through intermediate components.
2. **Seamless Navigation State Persistence**: Next.js App Router performs client-side transitions via `<Link>` and `useRouter`. Zustand stores reside in client memory and retain their state across page navigation without needing page reloads.
3. **Atomic Selectors & Optimized Re-renders**: Powered by the `createSelectors` utility, components subscribe strictly to the slice of state they need, avoiding unnecessary re-renders.
4. **DevTools Integration**: All stores are wrapped with Zustand's `devtools` middleware, providing clear action tracing in the Redux DevTools browser extension during development.
5. **Next.js SSR Hydration Safety**: For stores utilizing `persist` (e.g. `localStorage`), utilities like `useHydratedStore` and `useHydration` prevent React 18 hydration mismatch errors.
6. **Clean Resetability**: Every store exposes a standardized `.reset()` method that restores `initialState` cleanly (useful for disconnects, logout, and test isolation).

---

## 2. Directory Structure

```
src/stores/
├── index.ts                      # Central export barrel for all stores, hooks, and types
├── types.ts                      # Common types and interfaces (e.g. AppNotification, StoreResetter)
├── useAppStore.ts                # Foundational application & global UI state store
├── utils/
│   ├── createSelectors.ts        # Auto-generates atomic selector hooks (.use.<property>())
│   └── useHydratedStore.ts       # SSR hydration-safe hooks for persisted stores
└── templates/
    └── createStoreTemplate.ts    # Standard copy-paste template for new domain stores
```

---

## 3. The Foundational App Store (`useAppStore`)

The `useAppStore` handles global shell and application-level state:
- `sidebarOpen`: Controls responsive mobile/tablet navigation drawer.
- `activeModal` & `modalData`: Manages global modal state (e.g., wallet modal, video modal, seat inspector).
- `notification`: Manages global banner/toast notification.

### Basic Usage

```tsx
'use client';

import { useAppStore } from '@/stores';

export const HeaderActions = () => {
  // Option A: Standard selector
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);

  // Option B: Auto-generated atomic selector (Cleanest & prevents unnecessary re-renders)
  const activeModal = useAppStore.use.activeModal();
  const openModal = useAppStore.use.openModal();

  return (
    <div>
      <button onClick={toggleSidebar}>Toggle Sidebar ({sidebarOpen ? 'Open' : 'Closed'})</button>
      <button onClick={() => openModal('wallet', { source: 'header' })}>Connect Wallet</button>
    </div>
  );
};
```

---

## 4. How to Add New Domain Stores

When adding a new feature or domain (for example, `useSeatsStore`, `useWalletStore`, `useTreasuryStore`, or `useProposalStore`), follow this standardized 6-step pattern:

### Step 1: Copy the Template
Copy `src/stores/templates/createStoreTemplate.ts` into a new file: `src/stores/use[Domain]Store.ts`.

### Step 2: Define State & Action Interfaces
Keep state normalized and distinct from actions:

```typescript
export interface SeatsState {
  selectedSeatId: number | null;
  filterStatus: 'all' | 'claimed' | 'available';
  searchQuery: string;
}

export interface SeatsActions {
  selectSeat: (seatId: number | null) => void;
  setFilterStatus: (status: 'all' | 'claimed' | 'available') => void;
  setSearchQuery: (query: string) => void;
  reset: () => void;
}

export type SeatsStore = SeatsState & SeatsActions;
```

### Step 3: Define Initial State
```typescript
const initialState: SeatsState = {
  selectedSeatId: null,
  filterStatus: 'all',
  searchQuery: '',
};
```

### Step 4: Create Store with DevTools (and Persist if needed)
```typescript
import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { createSelectors } from './utils/createSelectors';

const useSeatsStoreBase = create<SeatsStore>()(
  devtools(
    (set) => ({
      ...initialState,

      selectSeat: (selectedSeatId) =>
        set({ selectedSeatId }, false, 'seats/selectSeat'),

      setFilterStatus: (filterStatus) =>
        set({ filterStatus }, false, 'seats/setFilterStatus'),

      setSearchQuery: (searchQuery) =>
        set({ searchQuery }, false, 'seats/setSearchQuery'),

      reset: () =>
        set(initialState, false, 'seats/reset'),
    }),
    {
      name: 'web-dao:SeatsStore',
      enabled: process.env.NODE_ENV !== 'production',
    }
  )
);

export const useSeatsStore = createSelectors(useSeatsStoreBase);
```

### Step 5: Export from Barrel (`src/stores/index.ts`)
```typescript
export { useSeatsStore } from './useSeatsStore';
export type { SeatsState, SeatsActions, SeatsStore } from './useSeatsStore';
```

---

## 5. Next.js SSR & Persist Hydration Guide

If a store uses `persist` with `localStorage`, client-side stored values differ from server-rendered HTML. To avoid React hydration mismatch warnings:

```tsx
'use client';

import { useHydratedStore, useHydration } from '@/stores';
import { useSettingsStore } from '@/stores/useSettingsStore';

export const UserPreferences = () => {
  // Method 1: Using useHydratedStore with a fallback
  const activeTab = useHydratedStore(useSettingsStore, (s) => s.activeTab, 'identity');

  // Method 2: Using useHydration guard
  const isHydrated = useHydration();
  if (!isHydrated) return <div>Loading preferences...</div>;

  return <div>Active Tab: {activeTab}</div>;
};
```

---

## 6. Best Practices & Rules

1. **Use in Client Components**: Declare `'use client'` at the top of components consuming Zustand hooks.
2. **Always Use Selectors**: Never do `const store = useAppStore()` without selectors; that causes re-renders on any state change. Use `useAppStore.use.<field>()` or `useAppStore((s) => s.<field>)`.
3. **Keep Actions Inside the Store**: Mutate state through typed action methods with descriptive action names for DevTools (`'domain/actionName'`).
4. **Implement `reset` on Every Store**: Ensure state can be reset cleanly on user disconnects or session changes.
