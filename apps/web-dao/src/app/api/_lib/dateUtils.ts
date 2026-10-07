/**
 * Ensures timestamp strings from Postgres (which often lack 'Z' or timezone markers)
 * are strictly parsed as UTC timestamps and serialized into standard ISO-8601 UTC strings.
 */
export function toUtcIso(ts: any): string | null {
  if (!ts) return null;
  if (ts instanceof Date) return ts.toISOString();
  const s = String(ts).trim();
  if (!s) return null;
  if (s.endsWith('Z') || s.includes('+') || (s.lastIndexOf('-') > 10)) {
    return new Date(s).toISOString();
  }
  return new Date(s.replace(' ', 'T') + 'Z').toISOString();
}

/**
 * Calculates remaining seconds until target UTC deadline.
 */
export function getRemainingSeconds(deadlineIsoOrDate: any): number {
  const utcIso = toUtcIso(deadlineIsoOrDate);
  if (!utcIso) return 0;
  const diffMs = new Date(utcIso).getTime() - Date.now();
  return Math.max(0, Math.floor(diffMs / 1000));
}
