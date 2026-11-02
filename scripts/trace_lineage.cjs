const ethers = require('ethers');
const coder = new ethers.AbiCoder();

async function trace(addr) {
  let cur = addr;
  for (let i = 0; i < 6; i++) {
    const p = coder.encode(['address'], [cur]).slice(2);
    const res = await fetch('https://fullnode-one-testnet.trobchain.com/wallet/triggerconstantcontract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        owner_address: '415fd6266a07fa4ba10dd34e9a315edd47904b8823',
        contract_address: '412854e95c847472bb7130baf5f3d9363dcee5fe18',
        function_selector: 'getSponsor(address)',
        parameter: p,
        visible: false
      })
    }).then(r => r.json());
    if (res?.constant_result?.[0]) {
      const sp = coder.decode(['address'], '0x' + res.constant_result[0])[0];
      console.log('Level ' + i + ': ' + cur + ' -> Sponsor: ' + sp);
      if (sp === '0x0000000000000000000000000000000000000000' || sp === cur) break;
      cur = sp;
    } else break;
  }
}

trace('0xed854e4a402958f90f9dd9a15ac90618b37f9051');

