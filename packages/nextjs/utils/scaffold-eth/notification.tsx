import toast from "react-hot-toast";

export type NotificationType = "success" | "error" | "loading" | "warning" | "info";

interface NotificationOptions {
  duration?: number;
  icon?: string;
}

/**
 * notification.tsx
 * Unified notification/toast system for B-TITAN.
 * Wraps react-hot-toast with B-TITAN styling.
 */

export const notification = {
  success: (message: string, options?: NotificationOptions) => {
    toast.success(message, {
      duration: options?.duration ?? 4000,
      style: {
        background: "#0a0f1a",
        color: "#22c55e",
        border: "1px solid rgba(34, 197, 94, 0.3)",
        borderRadius: "12px",
        fontSize: "14px",
      },
      iconTheme: { primary: "#22c55e", secondary: "#0a0f1a" },
    });
  },

  error: (message: string, options?: NotificationOptions) => {
    toast.error(message, {
      duration: options?.duration ?? 6000,
      style: {
        background: "#0a0f1a",
        color: "#ef4444",
        border: "1px solid rgba(239, 68, 68, 0.3)",
        borderRadius: "12px",
        fontSize: "14px",
      },
      iconTheme: { primary: "#ef4444", secondary: "#0a0f1a" },
    });
  },

  loading: (message: string) => {
    return toast.loading(message, {
      style: {
        background: "#0a0f1a",
        color: "#f59e0b",
        border: "1px solid rgba(245, 158, 11, 0.3)",
        borderRadius: "12px",
        fontSize: "14px",
      },
    });
  },

  info: (message: string, options?: NotificationOptions) => {
    toast(message, {
      duration: options?.duration ?? 4000,
      icon: options?.icon ?? "ℹ️",
      style: {
        background: "#0a0f1a",
        color: "#60a5fa",
        border: "1px solid rgba(96, 165, 250, 0.3)",
        borderRadius: "12px",
        fontSize: "14px",
      },
    });
  },

  txSent: (txHash: string) => {
    const short = `${txHash.slice(0, 10)}...`;
    toast.success(`Transaction sent: ${short}`, {
      duration: 5000,
      style: {
        background: "#0a0f1a",
        color: "#a78bfa",
        border: "1px solid rgba(167, 139, 250, 0.3)",
        borderRadius: "12px",
        fontSize: "14px",
      },
      icon: "📤",
    });
  },

  txSuccess: (txHash: string) => {
    const short = `${txHash.slice(0, 10)}...`;
    toast.success(`Confirmed! ${short}`, {
      duration: 6000,
      style: {
        background: "#0a0f1a",
        color: "#22c55e",
        border: "1px solid rgba(34, 197, 94, 0.5)",
        borderRadius: "12px",
        fontSize: "14px",
      },
      icon: "✅",
    });
  },

  dismiss: (toastId: string) => {
    toast.dismiss(toastId);
  },
};
