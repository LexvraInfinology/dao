const fs = require('fs');

const EXPLORER_API = 'https://backend.trobchain.com/v1';

async function fetchAllTxs(address, name) {
  console.log(`\nFetching transactions for ${name} (${address})...`);
  let page = 1;
  const limit = 50;
  const allTxs = [];

  while (true) {
    try {
      const url = `${EXPLORER_API}/accounts/${address}/transactions?page=${page}&limit=${limit}`;
      const res = await fetch(url);
      if (!res.ok) {
        console.log(`Page ${page} status: ${res.status}`);
        break;
      }
      const data = await res.json();
      const list = data.data || [];
      if (list.length === 0) break;
      allTxs.push(...list);
      console.log(`  Page ${page}: got ${list.length} txs (Total so far: ${allTxs.length})`);
      if (list.length < limit) break;
      page++;
      // safety break
      if (page > 30) break;
    } catch (e) {
      console.log(`Error on page ${page}:`, e.message);
      break;
    }
  }

  return allTxs;
}

async function main() {
  const contracts = [
    { name: 'EquoraDAO_v1', addr: 'TAuwP4TDvmGp6FT5wqcSz2VMZVbuusneto' },
    { name: 'EquoraDAO_v2_interim', addr: 'TP7e2uoSrazAewXUgYnE6EmrtHhhSHWxPT' },
    { name: 'EquoraDAO_v2_current', addr: 'THMrTHkAfcM1ZmhNzNRrMJiyCimgoGjF9V' },
  ];

  const results = {};
  for (const c of contracts) {
    const txs = await fetchAllTxs(c.addr, c.name);
    results[c.name] = {
      address: c.addr,
      totalTxs: txs.length,
      txs: txs
    };
  }

  fs.writeFileSync('scratch/all_dao_txs.json', JSON.stringify(results, null, 2));
  console.log('\nSaved all transactions to scratch/all_dao_txs.json');

  for (const k of Object.keys(results)) {
    console.log(`- ${k}: ${results[k].totalTxs} transactions`);
  }
}

main().catch(console.error);

