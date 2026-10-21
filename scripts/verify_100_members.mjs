import fs from 'fs';
import path from 'path';

function loadEnv() {
  if (process.env.DATABASE_URL || process.env.NEON_DATABASE_URL) return;
  try {
    if (typeof process.loadEnvFile === 'function') {
      const rootEnv = path.resolve(process.cwd(), '.env');
      if (fs.existsSync(rootEnv)) {
        process.loadEnvFile(rootEnv);
      }
    }
  } catch (e) {}

  if (!process.env.DATABASE_URL && !process.env.NEON_DATABASE_URL) {
    try {
      const rootEnv = path.resolve(process.cwd(), '.env');
      if (fs.existsSync(rootEnv)) {
        const content = fs.readFileSync(rootEnv, 'utf8');
        for (const line of content.split('\n')) {
          const match = line.trim().match(/^([^=]+)=(.*)$/);
          if (match) {
            const key = match[1].trim();
            const val = match[2].trim().replace(/^["']|["']$/g, '');
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      }
    } catch (e) {}
  }
}

loadEnv();

const dbUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
if (!dbUrl) {
  console.error('Error: DATABASE_URL or NEON_DATABASE_URL environment variable is required.');
  process.exit(1);
}

function getNeonSqlEndpoint(url) {
  const match = url.match(/@([^/:]+)/);
  return match && match[1] ? `https://${match[1]}/sql` : '';
}

async function queryNeon(sql) {
  const endpoint = getNeonSqlEndpoint(dbUrl);
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Neon-Connection-String': dbUrl, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql }),
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return await res.json();
}

async function main() {
  const statsRes = await queryNeon(`
    SELECT 
      COUNT(*) FILTER (WHERE LOWER(status) IN ('active', 'capped')) as active_count,
      COALESCE(SUM("entryAmountBtt"), 0) as total_collected,
      COALESCE(SUM("pushedAmountBtt"), 0) as total_distributed
     FROM "DaoMember"
  `);
  console.log('Stats Query Result:', statsRes.rows[0]);

  const countRes = await queryNeon(`SELECT count(*) as count FROM "DaoMember" WHERE LOWER(status) IN ('active', 'capped')`);
  console.log('Active Member Count:', countRes.rows[0].count);

  const missingPos = await queryNeon(`
    SELECT generate_series(1, 100) AS expected_pos
    EXCEPT
    SELECT position FROM "DaoMember"
  `);
  console.log('Missing Positions (should be empty array):', missingPos.rows);

  const duplicatePos = await queryNeon(`
    SELECT position, count(*) FROM "DaoMember" GROUP BY position HAVING count(*) > 1
  `);
  console.log('Duplicate Positions (should be empty array):', duplicatePos.rows);

  const duplicateAddr = await queryNeon(`
    SELECT address, count(*) FROM "DaoMember" GROUP BY address HAVING count(*) > 1
  `);
  console.log('Duplicate Addresses (should be empty array):', duplicateAddr.rows);
}

main().catch(console.error);
