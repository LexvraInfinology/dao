const { ethers } = require('ethers');

function toTronHex(addr) {
  if (addr.startsWith('T')) {
    const bs58 = require('bs58');
    const dec = bs58.decode(addr);
    return Buffer.from(dec.subarray(0, 21)).toString('hex');
  }
  return '41' + addr.replace(/^0x/, '');
}

async function queryTrob(contractAddr, selector, param) {
  const url = "https://fullnode-one-testnet.trobchain.com/wallet/triggersmartcontract";
  const cHex = toTronHex(contractAddr);
  const payload = {
    owner_address: cHex,
    contract_address: cHex,
    function_selector: selector,
    parameter: param || "",
    visible: false,
  };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (json.constant_result && json.constant_result[0]) {
    return json.constant_result[0];
  }
  return null;
}

async function main() {
  const matrixContract = "TNU8aUC8H8osyfhr2TnNzNNEMZPtGV4D8o";
  const coder = new ethers.AbiCoder();
  
  const d1 = "0x97234D3Dd4040c073Cd6F411380C8F9BE73c0f1b";
  const d2 = "0xED854E4A402958f90f9dD9A15Ac90618b37F9051";

  for (const d of [d1, d2]) {
    const p = coder.encode(["address"], [d]).slice(2);
    const raw = await queryTrob(matrixContract, "getActiveDirectReferrals(address)", p);
    if (raw) {
      const decoded = coder.decode(["address[]"], "0x" + raw);
      console.log(`Directs of ${d}:`, decoded[0]);
    } else {
      console.log(`Directs of ${d} is null`);
    }
  }
}

main().catch(console.error);
