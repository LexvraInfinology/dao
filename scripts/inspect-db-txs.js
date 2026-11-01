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

async function inspectTransactions() {
  console.log('=== MatrixTransaction Rows (All 20) ===');
  const txs = await query('SELECT * FROM "MatrixTransaction" ORDER BY "timestamp" DESC LIMIT 25;');
  console.log(JSON.stringify(txs.rows, null, 2));

  console.log('\n=== Recent MatrixSlot Rows ===');
  const slots = await query('SELECT "userAddress", "slotNumber", "isUnlocked", "currentCycle", "filledNodes", "totalEarned", "recyclesCount", "createdAt" FROM "MatrixSlot" ORDER BY "createdAt" DESC LIMIT 15;');
  console.log(JSON.stringify(slots.rows, null, 2));

  console.log('\n=== Recent MatrixPlacement Rows ===');
  const placements = await query('SELECT "matrixOwnerAddress", "placedUserAddress", "slotNumber", "position", "cycle", "paymentRoutedTo", "paymentType", "payoutAmount", "txHash", "timestamp" FROM "MatrixPlacement" ORDER BY "timestamp" DESC LIMIT 15;');
  console.log(JSON.stringify(placements.rows, null, 2));
}

inspectTransactions().catch(console.error);

