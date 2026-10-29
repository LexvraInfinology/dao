const fs = require('fs');
const path = require('path');

// Load environment variables from .env and apps/web-dao/.env.local
let dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  const envFiles = [
    path.join(__dirname, '..', '.env'),
    path.join(__dirname, '..', 'apps', 'web-dao', '.env.local')
  ];
  for (const envFile of envFiles) {
    if (fs.existsSync(envFile)) {
      const content = fs.readFileSync(envFile, 'utf8');
      const match = content.match(/^DATABASE_URL\s*=\s*["']?([^"'\r\n]+)["']?/m);
      if (match && match[1]) {
        dbUrl = match[1];
        break;
      }
    }
  }
}

if (!dbUrl) {
  console.error("DATABASE_URL not found!");
  process.exit(1);
}

function getNeonSqlEndpoint(url) {
  const match = url.match(/@([^/:]+)/);
  if (match && match[1]) {
    const host = match[1].replace('-pooler.', '.');
    return `https://${host}/sql`;
  }
  return '';
}

async function run() {
  const endpoint = getNeonSqlEndpoint(dbUrl);
  console.log("Connecting to Neon endpoint:", endpoint);

  const sql = `ALTER TABLE "DaoMember" ADD COLUMN IF NOT EXISTS "cappedAt" TIMESTAMP WITH TIME ZONE;`;
  console.log("Executing:", sql);

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Neon-Connection-String': dbUrl,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql, params: [] }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Neon SQL error:", errText);
    process.exit(1);
  }

  const json = await res.json();
  console.log("Successfully executed! Result:", json);

  // Verify column existence
  const verifySql = `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'DaoMember';`;
  const checkRes = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Neon-Connection-String': dbUrl,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: verifySql, params: [] }),
  });

  if (checkRes.ok) {
    const checkJson = await checkRes.json();
    console.log("DaoMember columns:", checkJson.rows?.map(r => r.column_name));
  }
}

run().catch(console.error);
