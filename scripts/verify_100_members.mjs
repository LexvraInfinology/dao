const dbUrl = "postgresql://neondb_owner:npg_VzZWl5Td8gxf@ep-super-heart-ax2fet8a.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require";

async function queryNeon(sql) {
  const res = await fetch("https://ep-super-heart-ax2fet8a.c-4.us-east-2.aws.neon.tech/sql", {
    method: 'POST',
    headers: { 'Neon-Connection-String': dbUrl, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql }),
  });
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
