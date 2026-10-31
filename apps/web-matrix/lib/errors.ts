/**
 * User-Friendly Error Handling System for Web Matrix
 *
 * Sanitizes technical API responses, status codes, JSON payloads, and database
 * exceptions into clear, simple, human-friendly messages for end users.
 */

export class MatrixApiError extends Error {
  public readonly status: number;
  public readonly rawResponse?: string;
  public readonly technicalDetails?: string;

  constructor(status: number, rawResponse: string, userMessage: string, technicalDetails?: string) {
    super(userMessage);
    this.name = "MatrixApiError";
    this.status = status;
    this.rawResponse = rawResponse;
    this.technicalDetails = technicalDetails;

    // Restore prototype chain for instanceof checks
    Object.setPrototypeOf(this, MatrixApiError.prototype);
  }
}

/**
 * Common human-friendly mappings for backend business logic errors.
 */
function humanizeBusinessError(raw: string): string {
  const trimmed = raw.trim();

  // Insufficient balance with available amount
  const balanceMatch = trimmed.match(/Insufficient available balance\.\s*Available:\s*([\d.]+)\s*TROB/i);
  if (balanceMatch) {
    return `Insufficient balance. Your available balance is ${balanceMatch[1]} TROB.`;
  }

  if (/Insufficient available balance/i.test(trimmed) || /Insufficient balance/i.test(trimmed)) {
    return "Insufficient balance for this transaction.";
  }

  // Required field errors
  if (/userAddress and amount are required/i.test(trimmed)) {
    return "Please enter an amount and ensure your wallet is connected.";
  }

  if (/userAddress and slotNumber are required/i.test(trimmed)) {
    return "Please select a slot and ensure your wallet is connected.";
  }

  if (/userAddress is required/i.test(trimmed) || /address is required/i.test(trimmed)) {
    return "Wallet connection required. Please connect your wallet.";
  }

  if (/No wallet connected/i.test(trimmed)) {
    return "Please connect your wallet to continue.";
  }

  // Slot purchase errors
  if (/slot.*already (unlocked|active|purchased|bought)/i.test(trimmed)) {
    return "This matrix slot is already active for your account.";
  }

  if (/must be unlocked first/i.test(trimmed) || /previous slot/i.test(trimmed)) {
    return "You must activate previous slots before unlocking this one.";
  }

  if (/Failed to buy slot/i.test(trimmed)) {
    return "Unable to activate this slot right now. Please try again.";
  }

  // Withdrawal errors
  if (/Amount must be greater than 0/i.test(trimmed) || /invalid amount/i.test(trimmed)) {
    return "Please enter an amount greater than 0.";
  }

  if (/Withdrawal failed/i.test(trimmed)) {
    return "Unable to process withdrawal. Please try again.";
  }

  // Profile / Settings errors
  if (/username.*(taken|exists|duplicate)/i.test(trimmed)) {
    return "This username is already taken. Please choose another one.";
  }

  // Database / Technical crash messages
  if (
    /PrismaClient/i.test(trimmed) ||
    /SQL/i.test(trimmed) ||
    /database/i.test(trimmed) ||
    /Internal Server Error/i.test(trimmed) ||
    /UnhandledPromise/i.test(trimmed)
  ) {
    return "Our servers encountered a temporary issue. Please try again in a moment.";
  }

  // Network / Connection errors
  if (
    /Failed to fetch/i.test(trimmed) ||
    /NetworkError/i.test(trimmed) ||
    /ECONNREFUSED/i.test(trimmed) ||
    /Load failed/i.test(trimmed)
  ) {
    return "Unable to reach the server. Please check your internet connection.";
  }

  // If already clean and user-friendly, return capitalized sentence
  let cleaned = trimmed.replace(/^API error\s*\(\d+\):\s*/i, "");
  cleaned = cleaned.replace(/^Error:\s*/i, "");

  if (cleaned.length > 0) {
    // Capitalize first letter
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    if (!/[.!?]$/.test(cleaned)) {
      cleaned += ".";
    }
    return cleaned;
  }

  return "Unable to complete request. Please try again.";
}

/**
 * Extracts and parses error message from an API response body and status code.
 */
export function parseApiErrorResponse(rawBody: string, status: number): string {
  // If empty or HTML error page (e.g. 502/504 Bad Gateway from proxy)
  if (!rawBody || rawBody.trim().startsWith("<!DOCTYPE") || rawBody.trim().startsWith("<html")) {
    switch (status) {
      case 400:
        return "The request was invalid. Please check your inputs.";
      case 401:
        return "Session expired. Please reconnect your wallet.";
      case 403:
        return "Access denied. You do not have permission for this action.";
      case 404:
        return "The requested information could not be found.";
      case 429:
        return "Too many requests. Please wait a moment and try again.";
      case 500:
      case 502:
      case 503:
      case 504:
        return "Our servers are temporarily unavailable. Please try again shortly.";
      default:
        return "An unexpected error occurred. Please try again.";
    }
  }

  // Attempt JSON parsing
  try {
    const parsed = JSON.parse(rawBody);
    if (typeof parsed === "object" && parsed !== null) {
      // Common JSON error response patterns:
      // { error: "..." }
      // { message: "..." }
      // { error: { message: "..." } }
      // { errors: [ "..." ] }
      const candidate =
        parsed.error?.message ||
        (typeof parsed.error === "string" ? parsed.error : null) ||
        (typeof parsed.message === "string" ? parsed.message : null) ||
        (Array.isArray(parsed.errors) ? parsed.errors[0] : null) ||
        parsed.detail;

      if (candidate && typeof candidate === "string") {
        return humanizeBusinessError(candidate);
      }
    }
  } catch {
    // Not valid JSON, process as plain text
  }

  return humanizeBusinessError(rawBody);
}

/**
 * Formats any error object, exception, or string into a clean, human-friendly message.
 * Strips technical noise like HTTP status codes, JSON brackets, stack traces, and URLs.
 */
export function formatUserErrorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (!err) return fallback;

  // Already a MatrixApiError
  if (err instanceof MatrixApiError) {
    return err.message;
  }

  // Extract raw string candidate
  let raw = "";
  if (typeof err === "string") {
    raw = err;
  } else if (err instanceof Error) {
    raw = err.message;
  } else if (typeof err === "object" && "message" in err && typeof (err as any).message === "string") {
    raw = (err as any).message;
  } else if (typeof err === "object" && "error" in err && typeof (err as any).error === "string") {
    raw = (err as any).error;
  } else {
    return fallback;
  }

  // Check if raw string contains embedded JSON (e.g., 'API error (400): {"success":false,"error":"..."}')
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      const innerMessage =
        parsed.error?.message ||
        (typeof parsed.error === "string" ? parsed.error : null) ||
        (typeof parsed.message === "string" ? parsed.message : null) ||
        (Array.isArray(parsed.errors) ? parsed.errors[0] : null);

      if (innerMessage) {
        return humanizeBusinessError(innerMessage);
      }
    } catch {
      // Continue to text humanization
    }
  }

  // Strip technical wrappers if present
  raw = raw.replace(/^API error\s*\(\d+\):\s*/i, "");
  raw = raw.replace(/^Error:\s*/i, "");

  return humanizeBusinessError(raw);
}
