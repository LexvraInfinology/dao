const { ethers } = require('ethers');

const RPC = 'https://fullnode-one.trobchain.com';
const EXPLORER_API = 'https://backend.trobchain.com/v1';

async function testExplorerApi() {
  const contracts = [
    { name: 'v1', addr: 'TAuwP4TDvmGp6FT5wqcSz2VMZVbuusneto' },
    { name: 'v2_interim', addr: 'TP7e2uoSrazAewXUgYnE6EmrtHhhSHWxPT' },
    { name: 'v2_current', addr: 'THMrTHkAfcM1ZmhNzNRrMJiyCimgoGjF9V' }
  ];

  for (const c of contracts) {
    console.log(`\n--- Fetching explorer API for ${c.name} (${c.addr}) ---`);
    try {
      const res = await fetch(`${EXPLORER_API}/account/contract?address=${c.addr}`);
      const data = await res.json();
      console.log('Contract detail:', data?.data?.name || data?.name || data);
    } catch (e) {
      console.log('Contract detail err:', e.message);
    }

    try {
      const txRes = await fetch(`${EXPLORER_API}/transaction/list?address=${c.addr}&limit=10`);
      const txData = await txRes.json();
      console.log('Total txs count:', txData?.data?.total || txData?.total || 'N/A');
    } catch (e) {
      console.log('Tx list err:', e.message);
    }
  }
}

testExplorerApi().catch(console.error);

