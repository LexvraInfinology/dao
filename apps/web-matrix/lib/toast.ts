import { toast as sonnerToast } from "sonner";

import { formatUserErrorMessage } from "./errors";

export { formatUserErrorMessage };

/**
 * Backward-compatible error formatter that wraps formatUserErrorMessage.
 */
export function formatErrorMessage(err: unknown, fallback = "An error occurred"): string {
  return formatUserErrorMessage(err, fallback);
}

export const toast = {
  success: (title: string, description?: string) => {
    return sonnerToast.success(title, {
      description,
      duration: 3500,
    });
  },

  error: (title: string, errorOrDesc?: unknown) => {
    const description = formatUserErrorMessage(
      errorOrDesc,
      "Please check your network connection and try again."
    );

    return sonnerToast.error(title, {
      description,
      duration: 8000,
    });
  },

  info: (title: string, description?: string) => {
    return sonnerToast.info(title, {
      description,
      duration: 3500,
    });
  },

  warning: (title: string, description?: string) => {
    return sonnerToast.warning(title, {
      description,
      duration: 4000,
    });
  },

  promise: sonnerToast.promise,

  dismiss: sonnerToast.dismiss,

  copy: (text: string, label = "Address") => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      const truncated =
        text.length > 14 ? `${text.slice(0, 6)}...${text.slice(-4)}` : text;
      sonnerToast.success("Copied to clipboard", {
        description: `${label} (${truncated}) copied successfully.`,
        duration: 2500,
      });
      return true;
    }
    return false;
  },
};
