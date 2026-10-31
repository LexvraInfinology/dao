const fs = require('fs');
const data = JSON.parse(fs.readFileSync('scratch/dao_contract_members_comparison.json', 'utf8'));

console.log('=== SEATS WITH ADDRESS MISMATCHES OR DIFFERENCES ===');
data.filter(s => !s.isAddressMatch).forEach(s => {
  console.log(`Seat #${s.seat}:`);
  console.log(`   v1 address:         ${s.v1_base58}`);
  console.log(`   v2_current address: ${s.v2_current_base58}`);
  console.log(`   v1 details:`, s.v1Details);
  console.log(`   v2 details:`, s.v2Details);
  console.log(`   underfunded:`, s.underfundedInfo);
  console.log('');
});

console.log('\n=== ALL SEATS WITH UNDERFUNDED OR LOW ENTRY (< 100 TROB) IN V1 ===');
data.filter(s => (s.v1Details?.entryFeeTrob || 0) < 100).forEach(s => {
  console.log(`Seat #${s.seat}: v1_entry = ${s.v1Details?.entryFeeTrob} TROB, addr = ${s.v1_base58}, v2_curr = ${s.v2_current_base58}`);
});

