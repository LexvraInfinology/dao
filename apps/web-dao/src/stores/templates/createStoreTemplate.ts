'use client';

/**
 * Standard Store Template for web-dao
 *
 * Use this template whenever you create a new domain store (e.g., useSeatsStore, useWalletStore, useProposalStore).
 *
 * Guidelines:
 * 1. Define separate interfaces for State and Actions.
 * 2. Keep state normalized and minimal.
 * 3. Provide an initialState constant so the store can be cleanly reset.
 * 4. Wrap with `devtools` for development debugging.
 * 5. Wrap with `persist` only if the state must survive full browser reloads (e.g. user preferences).
 * 6. Export with `createSelectors` for clean atomic consumption without re-render overhead.
 */

import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { createSelectors } from '../utils/createSelectors';

// 1. Define State Type
export interface ExampleDomainState {
  data: string[];
  filter: string;
  isLoading: boolean;
  error: string | null;
}

// 2. Define Actions Type
export interface ExampleDomainActions {
  setData: (data: string[]) => void;
  setFilter: (filter: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export type ExampleDomainStore = ExampleDomainState & ExampleDomainActions;

// 3. Define Initial State
const initialState: ExampleDomainState = {
  data: [],
  filter: 'all',
  isLoading: false,
  error: null,
};

// 4. Create Store with Devtools (and optional Persist)
const useExampleDomainStoreBase = create<ExampleDomainStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setData: (data) =>
          set({ data, error: null }, false, 'example/setData'),

        setFilter: (filter) =>
          set({ filter }, false, 'example/setFilter'),

        setLoading: (isLoading) =>
          set({ isLoading }, false, 'example/setLoading'),

        setError: (error) =>
          set({ error, isLoading: false }, false, 'example/setError'),

        reset: () =>
          set(initialState, false, 'example/reset'),
      }),
      {
        name: 'web-dao:example-domain-store', // Unique key in localStorage
        storage: createJSONStorage(() => localStorage),
        // Only persist specific keys if needed; omit to persist entire state
        partialize: (state) => ({ filter: state.filter }),
      }
    ),
    {
      name: 'web-dao:ExampleDomainStore',
      enabled: process.env.NODE_ENV !== 'production',
    }
  )
);

// 5. Export with auto-generated atomic selector hooks
export const useExampleDomainStore = createSelectors(useExampleDomainStoreBase);
