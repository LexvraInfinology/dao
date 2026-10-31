const { ethers } = require('ethers');
const coder = new ethers.AbiCoder();
const RPC = 'https://fullnode-one.trobchain.com';

async function testJoinConstant() {
  const daoCurrentHex = '4151114b92df6041f5a0e7ebc13e6ed68298fd28b0';
  const testCallerHex = '41a54770155b721e7fcff50992cc869403d6d03f67'; // TQh76DdPM5D13XbrhigNrbkjiSTvCBDLM8 (deployer)
  const res = await fetch(`${RPC}/wallet/triggerconstantcontract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      owner_address: testCallerHex,
      contract_address: daoCurrentHex,
      function_selector: 'joinDAO()',
      parameter: ''
    })
  });
  const data = await res.json();
  console.log('joinDAO() simulation result:');
  console.log('result:', data.result);
  console.log('constant_result:', data.constant_result);
  if (data.result?.message) {
    try {
      console.log('message:', Buffer.from(data.result.message, 'hex').toString('utf8'));
    } catch(e) {}
  }
}
testJoinConstant().catch(console.error);
