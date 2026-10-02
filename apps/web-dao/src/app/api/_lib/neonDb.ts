/**
 * Direct Neon Serverless HTTP Database Client
 * Executes SQL queries over Neon's native HTTP API using standard fetch.
 * Zero npm dependencies, 100% compatible with Vercel Serverless & Edge.
 */

export function getNeonSqlEndpoint(dbUrl: string): string {
  try {
    const match = dbUrl.match(/@([^/:]+)/);
    if (match && match[1]) {
      return `https://${match[1]}/sql`;
    }
  } catch {}
  return '';
}

export async function queryNeon<T = any>(
  sql: string,
  params: any[] = []
): Promise<{ rows: T[]; rowCount: number }> {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL environment variable is not configured');
  }
  const endpoint = getNeonSqlEndpoint(dbUrl);
  if (!endpoint) {
    throw new Error('Unable to resolve Neon SQL endpoint from DATABASE_URL');
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Neon-Connection-String': dbUrl,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: sql,
      params,
    }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Neon SQL HTTP error (${res.status}): ${errText}`);
  }

  const json = await res.json();
  return {
    rows: (json.rows || []) as T[],
    rowCount: json.rowCount || (json.rows ? json.rows.length : 0),
  };
}
