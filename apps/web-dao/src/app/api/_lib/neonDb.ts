/**
 * Direct Neon Serverless HTTP Database Client
 * Executes SQL queries over Neon's native HTTP API using standard fetch.
 * Zero npm dependencies, 100% compatible with Vercel Serverless & Edge.
 */

const DEFAULT_DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_VzZWl5Td8gxf@ep-super-heart-ax2fet8a.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require';

function getNeonSqlEndpoint(dbUrl: string): string {
  try {
    const match = dbUrl.match(/@([^/:]+)/);
    if (match && match[1]) {
      return `https://${match[1]}/sql`;
    }
  } catch {}
  return 'https://ep-super-heart-ax2fet8a.c-4.us-east-2.aws.neon.tech/sql';
}

export async function queryNeon<T = any>(
  sql: string,
  params: any[] = []
): Promise<{ rows: T[]; rowCount: number }> {
  const dbUrl = process.env.DATABASE_URL || DEFAULT_DATABASE_URL;
  const endpoint = getNeonSqlEndpoint(dbUrl);

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
