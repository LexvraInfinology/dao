const fs = require('fs');

const data = JSON.parse(fs.readFileSync('scratch/all_dao_txs.json', 'utf8'));

console.log('=== EQUORA DAO V2 CURRENT TRANSACTIONS ===');
const v2Curr = data['EquoraDAO_v2_current'].txs;
v2Curr.forEach((t, i) => {
  console.log(`${i + 1}. hash: ${t.hash || t.txID}`);
  console.log(`   from: ${t.from || t.owner_address}, timestamp: ${t.timestamp || t.block_timestamp}`);
  console.log(`   value: ${t.value || t.call_value || 0}, contract_result: ${t.contract_result || t.status}`);
});

console.log('\n=== EQUORA DAO V2 INTERIM TRANSACTIONS ===');
const v2Int = data['EquoraDAO_v2_interim'].txs;
v2Int.forEach((t, i) => {
  console.log(`${i + 1}. hash: ${t.hash || t.txID}`);
  console.log(`   from: ${t.from || t.owner_address}, timestamp: ${t.timestamp || t.block_timestamp}`);
  console.log(`   value: ${t.value || t.call_value || 0}, contract_result: ${t.contract_result || t.status}`);
});

