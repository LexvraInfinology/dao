/**
 * Central State Management Hub (Zustand) for web-dao
 *
 * Provides initialized, standardized Zustand stores and utilities
 * configured for Next.js App Router, SSR hydration safety, and atomic selectors.
 */

// Foundation store
export { useAppStore } from './useAppStore';
export type { AppState, AppActions, AppStore } from './useAppStore';

// Common store utilities
export { createSelectors } from './utils/createSelectors';
export { useHydratedStore, useHydration } from './utils/useHydratedStore';

// Types
export type { AppNotification, StoreResetter } from './types';
