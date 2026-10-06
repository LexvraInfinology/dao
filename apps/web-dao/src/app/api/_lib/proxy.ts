const BACKEND_URL = (
  process.env.BACKEND_API_URL ||
  (process.env.NODE_ENV === 'production' ? 'https://api.equorafidao.com' : 'http://localhost:4000')
).trim();

let isBackendDown = false;
let backendDownUntil = 0;

/**
 * Attempts to proxy request to the backend Express server if configured and online.
 * Supports both HTTPS and HTTP backend endpoints with dynamic timeouts.
 */
export async function fetchFromBackend<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T | null> {
  if (!BACKEND_URL || BACKEND_URL === '' || (isBackendDown && Date.now() < backendDownUntil)) {
    return null;
  }
  const controller = new AbortController();
  const timeoutMs = BACKEND_URL.startsWith('https://') ? 3500 : 1500;
  const timer = setTimeout(() => controller.abort(), timeoutMs);

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
    backendDownUntil = Date.now() + 10_000; // Skip proxy for 10s when backend is offline
    return null;
  }
}
