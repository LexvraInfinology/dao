const { execSync } = require("child_process");
const path = require("path");

async function main() {
  require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("ERROR: DATABASE_URL environment variable is required.");
    process.exit(1);
  }

  // Use direct endpoint for HTTPS SQL execution
  const directUrl = dbUrl.replace("-pooler.", ".");
  const hostMatch = directUrl.match(/@([^/:]+)/);
  if (!hostMatch) {
    console.error("ERROR: Invalid DATABASE_URL format.");
    process.exit(1);
  }
  const host = hostMatch[1];
  const endpoint = `https://${host}/sql`;

  console.log(`Connecting to Neon HTTPS SQL API: ${endpoint}...`);

  // Generate full DDL script directly from Prisma schema
  const schemaPath = path.resolve(__dirname, "../packages/database/prisma/schema.prisma");
  console.log("Generating SQL migration script from Prisma schema...");
  const sql = execSync(
    `node node_modules/prisma/build/index.js migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script`,
    {
      cwd: path.resolve(__dirname, "../packages/database"),
      encoding: "utf-8",
    }
  );

  // Strip comments and split by semicolon
  const cleanSql = sql.replace(/--.*$/gm, "").trim();
  const statements = cleanSql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  console.log(`Executing ${statements.length} DDL statements on testnet Neon database...`);

  let succeeded = 0;
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Neon-Connection-String": directUrl,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: stmt }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.warn(`Statement ${i + 1} notice:`, err.slice(0, 150));
      } else {
        succeeded++;
      }
    } catch (e) {
      console.error(`Statement ${i + 1} network error:`, e.message);
    }
  }

  console.log(`\n🎉 Database schema migration completed! ${succeeded}/${statements.length} statements executed.`);

  // Verify by querying tables list
  const verifyRes = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Neon-Connection-String": directUrl,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;`,
    }),
  });

  const verifyData = await verifyRes.json();
  const tables = (verifyData.rows || []).map((r) => r.table_name);
  console.log("\nCreated public tables in equorafitestnet database:", tables);
}

main().catch(console.error);
