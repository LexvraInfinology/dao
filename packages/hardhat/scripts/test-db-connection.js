const { Client } = require("pg");
require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });

async function testDb() {
  const url = process.env.DATABASE_URL;
  console.log("Testing DB URL:", url ? url.replace(/:[^:@]+@/, ":***@") : "NONE");

  // Try pooled
  try {
    const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
    await client.connect();
    const res = await client.query("SELECT NOW()");
    console.log("✅ Neon DB Connected! Server time:", res.rows[0].now);
    await client.end();
    return;
  } catch (err) {
    console.warn("⚠️ Pooler connection failed:", err.message);
  }

  // Try direct endpoint (remove -pooler)
  if (url && url.includes("-pooler")) {
    const directUrl = url.replace("-pooler", "");
    console.log("Trying direct URL:", directUrl.replace(/:[^:@]+@/, ":***@"));
    try {
      const client2 = new Client({ connectionString: directUrl, ssl: { rejectUnauthorized: false } });
      await client2.connect();
      const res2 = await client2.query("SELECT NOW()");
      console.log("✅ Direct Neon DB Connected! Server time:", res2.rows[0].now);
      await client2.end();
      return;
    } catch (err2) {
      console.warn("⚠️ Direct connection failed:", err2.message);
    }
  }
}

testDb();
