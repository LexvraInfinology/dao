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
  console.log('=== User query for key addresses ===');
  const users = await query(`
    SELECT "id", "address", "sponsorAddress", "userId", "directReferralsCount", "isQualified", "createdAt"
    FROM "User"
    WHERE lower("address") IN (
      lower('0x7124b32b48786a13177f3bdc9620e7a48eb9c902'),
      lower('0xa488ee279447372225f2095dc7c5697d81993437'),
      lower('0xa17e4c0d50ab3f2ff2717c94002a45444c91b202'),
      lower('0x54ee27d54ec9c03b5ed2f69960b175f34facd696')
    );
  `);
  console.log("USERS:", JSON.stringify(users.rows, null, 2));

  console.log('=== MatrixProfile columns ===');
  const profCols = await query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'MatrixProfile';`);
  console.log("PROFILE COLS:", profCols.rows ? profCols.rows.map(r => r.column_name) : profCols);

  const profiles = await query(`
    SELECT *
    FROM "MatrixProfile"
    WHERE lower("address") IN (
      lower('0x7124b32b48786a13177f3bdc9620e7a48eb9c902'),
      lower('0xa488ee279447372225f2095dc7c5697d81993437'),
      lower('0xa17e4c0d50ab3f2ff2717c94002a45444c91b202'),
      lower('0x54ee27d54ec9c03b5ed2f69960b175f34facd696')
    );
  `);
  console.log("PROFILES:", JSON.stringify(profiles.rows, null, 2));
}

main().catch(console.error);
