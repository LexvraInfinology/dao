const BACKEND_URL = (process.env.BACKEND_API_URL || '').trim();

let isBackendDown = false;
let backendDownUntil = 0;

/**
 * Attempts to proxy request to the backend Express server if configured and online.
 * Uses a circuit breaker with 200ms timeout so offline local backend never blocks
 * serverless execution with 2-second timeouts.
 */
export async function fetchFromBackend<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T | null> {
  if (!BACKEND_URL || BACKEND_URL === '' || (isBackendDown && Date.now() < backendDownUntil)) {
    return null;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 200);

  try {
    const res = await fetch(`${BACKEND_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    clearTimeout(timer);

    if (res.ok) {
      isBackendDown = false;
      const json = await res.json();
      return json;
    }
    return null;
  } catch {
    clearTimeout(timer);
    isBackendDown = true;
    backendDownUntil = Date.now() + 60_000; // Skip proxy for 60s when backend is offline
    return null;
  }
}
