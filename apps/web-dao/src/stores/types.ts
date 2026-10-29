/**
 * Shared types for Zustand stores in web-dao.
 */

export interface AppNotification {
  id?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  duration?: number;
}

export type StoreResetter = () => void;
