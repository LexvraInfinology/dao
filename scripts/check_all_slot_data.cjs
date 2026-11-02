const ethers = require('ethers');
const coder = new ethers.AbiCoder();
const matrixTron = '418919e11e219e81d9f510947f9d4f9e9ac04f4cc6';

async function check(label, evm) {
  const p = coder.encode(['address', 'uint256'], [evm, 1]).slice(2);
  const res = await fetch('https://fullnode-one-testnet.trobchain.com/wallet/triggerconstantcontract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      owner_address: '415fd6266a07fa4ba10dd34e9a315edd47904b8823',
      contract_address: matrixTron,
      function_selector: 'getSlotData(address,uint256)',
      parameter: p,
      visible: false
    })
  }).then(r => r.json());
  if (res?.constant_result?.[0]) {
    const dec = coder.decode(['bool', 'uint256', 'uint256', 'address[14]', 'uint256'], '0x' + res.constant_result[0]);
    console.log(`\n=== ${label} (${evm}) ===`);
    console.log('isUnlocked:', dec[0], 'currentCycle:', dec[1].toString(), 'filledNodes:', dec[2].toString(), 'earned:', ethers.formatUnits(dec[4], 6));
    const filled = dec[3].map((a, i) => a !== '0x0000000000000000000000000000000000000000' ? `P${i+1}: ${a}` : null).filter(Boolean);
    console.log('Nodes:', filled);
  } else {
    console.log('Error for', label, res);
  }
}

async function main() {
  await check('Root (TJhwjg...)', '0x5fd6266A07FA4bA10Dd34E9A315EDD47904B8823');
  await check('P1 Under Root (0x67B282...)', '0x67B282b09C3aaC1b9fbff6b4eC14EA2b72573c02');
  await check('Sponsor of TXd6q (0xc6E5...)', '0xc6E5dd575b8F424dFBEc616A9C81214d66aAb08f');
  await check('Wallet 2 (TXd6q... 0xed85...)', '0xed854e4a402958f90f9dd9a15ac90618b37f9051');
}
main();

