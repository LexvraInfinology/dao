const { ethers } = require('ethers');

function toTronHex(addr) {
  // Simple Tron Hex for test
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
  console.log("Error or empty for", selector, json);
  return null;
}

async function main() {
  const matrixContract = "TNU8aUC8H8osyfhr2TnNzNNEMZPtGV4D8o";
  const registryContract = "TDeTkVTHDv8i9aHi1eZBMUPSvuReypxAw1";
  const userHex = "0xc6e5dd575b8f424dfbec616a9c81214d66aab08f";
  const coder = new ethers.AbiCoder();
  const param = coder.encode(["address"], [userHex]).slice(2);

  console.log("Querying for user:", userHex);

  const finRaw = await queryTrob(matrixContract, "getUserFinancials(address)", param);
  if (finRaw) {
    const fin = coder.decode(["uint256", "uint256", "uint256", "uint256"], "0x" + finRaw);
    console.log("getUserFinancials:", {
      availableBalance: fin[0].toString(),
      totalEarned: fin[1].toString(),
      withdrawnTotal: fin[2].toString(),
      highestUnlockedSlot: fin[3].toString(),
    });
  }

  const directsRaw = await queryTrob(matrixContract, "getActiveDirectReferralsCount(address)", param);
  if (directsRaw) {
    const d = coder.decode(["uint256"], "0x" + directsRaw);
    console.log("getActiveDirectReferralsCount:", d[0].toString());
  }

  const qualRaw = await queryTrob(matrixContract, "isMatrixQualified(address)", param);
  if (qualRaw) {
    const q = coder.decode(["bool"], "0x" + qualRaw);
    console.log("isMatrixQualified:", q[0]);
  }

  const slot1Param = coder.encode(["address", "uint256"], [userHex, 1]).slice(2);
  const slot1Raw = await queryTrob(matrixContract, "getSlotData(address,uint256)", slot1Param);
  if (slot1Raw) {
    const s1 = coder.decode(["bool", "uint256", "uint256", "address[14]", "uint256"], "0x" + slot1Raw);
    console.log("getSlotData Slot 1:", {
      isUnlocked: s1[0],
      currentCycle: s1[1].toString(),
      upgradeReserve: s1[2].toString(),
      nodes: s1[3].map((a, i) => `${i + 1}: ${a}`),
      totalEarned: s1[4].toString(),
    });
  }

  const spRaw = await queryTrob(registryContract, "getSponsor(address)", param);
  if (spRaw) {
    const sp = coder.decode(["address"], "0x" + spRaw);
    console.log("getSponsor:", sp[0]);
  }
}

main().catch(console.error);
