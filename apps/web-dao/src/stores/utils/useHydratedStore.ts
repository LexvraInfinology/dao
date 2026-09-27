'use client';

import { useState, useEffect } from 'react';

/**
 * Safely consumes a state slice from a persisted Zustand store in Next.js App Router.
 * Prevents SSR / client hydration mismatches by returning `undefined` or a fallback
 * until the client component has successfully mounted.
 *
 * @param store - The Zustand store hook
 * @param selector - Selector function picking state from store
 * @param fallback - Optional fallback value returned before hydration completes
 *
 * @example
 * const activeTab = useHydratedStore(useSettingsStore, (s) => s.activeTab, 'identity');
 */
export function useHydratedStore<T, F>(
  store: (callback: (state: T) => unknown) => unknown,
  selector: (state: T) => F,
  fallback?: F
): F | undefined {
  const result = store(selector) as F;
  const [data, setData] = useState<F | undefined>(fallback);

  useEffect(() => {
    setData(result);
  }, [result]);

  return data;
}

/**
 * Hook to check if the client has mounted and hydrated.
 * Useful for conditional rendering of components that depend on client-persisted state.
 *
 * @example
 * const isHydrated = useHydration();
 * if (!isHydrated) return <LoadingSkeleton />;
 */
export function useHydration(): boolean {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
}
