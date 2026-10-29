'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { AppNotification } from './types';
import { createSelectors } from './utils/createSelectors';

/**
 * State interface defining all data stored in the app store.
 */
export interface AppState {
  /** Flag controlling the mobile / responsive navigation drawer */
  sidebarOpen: boolean;
  /** Active global modal ID (e.g., 'wallet', 'video', 'seat-inspector') */
  activeModal: string | null;
  /** Optional metadata/payload associated with the active modal */
  modalData: Record<string, unknown> | null;
  /** Global notification / toast state */
  notification: AppNotification | null;
}

/**
 * Actions interface defining all state mutators.
 */
export interface AppActions {
  setSidebarOpen: (isOpen: boolean) => void;
  toggleSidebar: () => void;
  openModal: (modalId: string, modalData?: Record<string, unknown>) => void;
  closeModal: () => void;
  setNotification: (notification: AppNotification | null) => void;
  clearNotification: () => void;
  reset: () => void;
}

export type AppStore = AppState & AppActions;

/**
 * Default initial state for easy store resetting.
 */
const initialState: AppState = {
  sidebarOpen: false,
  activeModal: null,
  modalData: null,
  notification: null,
};

/**
 * Base app store initialized with devtools middleware.
 */
const useAppStoreBase = create<AppStore>()(
  devtools(
    (set) => ({
      ...initialState,

      setSidebarOpen: (isOpen: boolean) =>
        set({ sidebarOpen: isOpen }, false, 'app/setSidebarOpen'),

      toggleSidebar: () =>
        set(
          (state) => ({ sidebarOpen: !state.sidebarOpen }),
          false,
          'app/toggleSidebar'
        ),

      openModal: (modalId: string, modalData: Record<string, unknown> | null = null) =>
        set(
          { activeModal: modalId, modalData },
          false,
          'app/openModal'
        ),

      closeModal: () =>
        set(
          { activeModal: null, modalData: null },
          false,
          'app/closeModal'
        ),

      setNotification: (notification: AppNotification | null) =>
        set({ notification }, false, 'app/setNotification'),

      clearNotification: () =>
        set({ notification: null }, false, 'app/clearNotification'),

      reset: () => set(initialState, false, 'app/reset'),
    }),
    {
      name: 'web-dao:AppStore',
      enabled: process.env.NODE_ENV !== 'production',
    }
  )
);

/**
 * Scalable App Store with auto-generated atomic selector hooks.
 *
 * @example
 * // Option 1: Standard selector
 * const sidebarOpen = useAppStore((state) => state.sidebarOpen);
 *
 * // Option 2: Auto-generated atomic selector (prevents unnecessary re-renders)
 * const sidebarOpen = useAppStore.use.sidebarOpen();
 * const openModal = useAppStore.use.openModal();
 */
export const useAppStore = createSelectors(useAppStoreBase);
