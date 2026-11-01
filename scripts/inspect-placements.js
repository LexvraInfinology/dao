const dbUrl = 'postgresql://neondb_owner:npg_1fOkpFHAZx2e@ep-ancient-smoke-b4y6grfd-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require';
const host = dbUrl.match(/@([^/:]+)/)[1].replace('-pooler.', '.');
const endpoint = `https://${host}/sql`;

async function query(sql) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Neon-Connection-String': dbUrl, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql })
  });
  return await res.json();
}

async function main() {
  const u = await query(`
    SELECT *
    FROM "User"
    WHERE lower("address") = lower('tkrwswmksplb85v26mpewbwcwqxr9apznf');
  `);
  console.log("USER tkrw:", JSON.stringify(u.rows, null, 2));
}

main().catch(console.error);
