const BACKEND_URL = process.env.BACKEND_API_URL || 'http://127.0.0.1:4000';

/**
 * Attempts to proxy request to the backend Express server on port 4000.
 * If backend is unreachable or returns an error, returns null to trigger fallback data.
 */
export async function fetchFromBackend<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);

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
      const json = await res.json();
      return json;
    }
    console.warn('[proxy res not ok]', res.status, `${BACKEND_URL}${endpoint}`);
    return null;
  } catch (err) {
    console.error('[proxy fetch failed]', `${BACKEND_URL}${endpoint}`, err);
    clearTimeout(timer);
    return null;
  }
}
