import { StoreApi, UseBoundStore } from 'zustand';

type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never;

/**
 * Automatically generates atomic selector hooks for a Zustand store.
 * Using auto-generated selectors ensures components re-render ONLY when their
 * specific slice of state changes, preventing unnecessary renders and prop-drilling.
 *
 * @example
 * const useAppStore = createSelectors(useAppStoreBase);
 * // Usage in component:
 * const sidebarOpen = useAppStore.use.sidebarOpen();
 */
export const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(
  _store: S
) => {
  const store = _store as WithSelectors<typeof _store>;
  store.use = {} as WithSelectors<typeof _store>['use'];

  for (const k of Object.keys(store.getState())) {
    (store.use as Record<string, () => unknown>)[k] = () =>
      store((s) => s[k as keyof typeof s]);
  }

  return store;
};
