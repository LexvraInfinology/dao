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

async function inspect() {
  console.log('=== Checking Tables in DB ===');
  const tables = await query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;");
  const allTables = tables.rows.map(r => r.table_name);
  console.log('All Tables:', allTables);

  const matrixTables = allTables.filter(t => 
    t.toLowerCase().includes('matrix') || 
    t.toLowerCase().includes('user') || 
    t.toLowerCase().includes('slot') ||
    t.toLowerCase().includes('transaction')
  );

  console.log('\n=== Matrix / User Table Row Counts ===');
  for (const t of matrixTables) {
    const countRes = await query(`SELECT count(*) FROM "${t}";`);
    console.log(`${t}: ${countRes.rows[0].count} rows`);
  }

  // Inspect User table
  console.log('\n=== Users in DB ===');
  const users = await query('SELECT * FROM "User" LIMIT 10;');
  console.log('Users sample:', JSON.stringify(users.rows, null, 2));

  // Inspect MatrixSlot
  if (allTables.includes('MatrixSlot')) {
    console.log('\n=== MatrixSlot in DB ===');
    const slots = await query('SELECT * FROM "MatrixSlot" LIMIT 10;');
    console.log('MatrixSlot sample:', JSON.stringify(slots.rows, null, 2));
  }

  // Inspect MatrixPlacement
  if (allTables.includes('MatrixPlacement')) {
    console.log('\n=== MatrixPlacement in DB ===');
    const placements = await query('SELECT * FROM "MatrixPlacement" LIMIT 10;');
    console.log('MatrixPlacement sample:', JSON.stringify(placements.rows, null, 2));
  }

  // Inspect MatrixTransaction
  if (allTables.includes('MatrixTransaction')) {
    console.log('\n=== MatrixTransaction in DB ===');
    const txs = await query('SELECT * FROM "MatrixTransaction" LIMIT 10;');
    console.log('MatrixTransaction sample:', JSON.stringify(txs.rows, null, 2));
  }

  // Inspect MatrixProfile
  if (allTables.includes('MatrixProfile')) {
    console.log('\n=== MatrixProfile in DB ===');
    const profiles = await query('SELECT * FROM "MatrixProfile" LIMIT 10;');
    console.log('MatrixProfile sample:', JSON.stringify(profiles.rows, null, 2));
  }
}

inspect().catch(console.error);

