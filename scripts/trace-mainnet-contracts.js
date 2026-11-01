// ==============================================================================
// TRACE TROBCHAIN MAINNET TRANSACTIONS DIRECTLY FROM ON-CHAIN & EXPLORER API
// Uses exact contract addresses from apps/web-matrix/.env.local
// ==============================================================================

const CONTRACTS = {
  matrix: {
    name: "EquoraMatrix",
    address: "TQuf5qo6EdRYDdEihbfbj51yo6rtzQCkCV",
    hex: "41a3ddfed64133e12c172fc97b4f6894a25af2ce50"
  },
  vault: {
    name: "EquoraVault",
    address: "TUZjyaLc1TghdoccJWTKhoBcEU12AG327J",
    hex: "41cbfa4351180513f0ee0682d2d1e0ab9b515be1c7"
  },
  dao: {
    name: "EquoraDAOv2 (93 Seats)",
    address: "TJRYjqygAEUcrcB2WkgizGFPYeBmyhDqM2",
    hex: "415cbc4c27409afcbc897099b6a18e09d4de0cbc2f"
  },
  registry: {
    name: "EquoraRegistry",
    address: "TNxk5Uguc16mxReUjXHDctKj12Y3MUSQZj",
    hex: "418e83290b2f0d7914eec432ff765604c0ccfcbcb1"
  },
  nft: {
    name: "EquoraNFT",
    address: "TP8MDQFdoTMtZZjpRThExdniz2VQ1pTSPC",
    hex: "4190543c0b77f8857ab5f2537787aca08aab33f4da"
  },
  salaryPool: {
    name: "EquoraSalaryPool",
    address: "TQMDkXunFuXDiTqL1HCRgdx47i3AsincjS",
    hex: "419dbb89afb46826dda5823821eed3a71506b05d4b"
  },
  rewardPool: {
    name: "EquoraRewardPool",
    address: "TDq8iJSeomNxEJyUAVxvf4iGH2q5f67kJq",
    hex: "412a599860f2fd6ea68f4456909f85b650c15515c2"
  },
  magicBoxPool: {
    name: "EquoraMagicBox",
    address: "TCDL237GcsDQ3eP4phaG1iXzc2SMPcXaPG",
    hex: "41189beeb2d803e98258b6b9b001f2845b125339c1"
  }
};

const EXPLORER_API = "https://backend.trobchain.com/v1";
const RPC_URL = "https://fullnode-one.trobchain.com";

async function fetchJson(url) {
  const r = await fetch(url);
  if (!r.ok) return null;
  return await r.json();
}

async function queryConstant(contractAddressHex, selector, parameterHex = "") {
  try {
    const res = await fetch(`${RPC_URL}/wallet/triggersmartcontract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contract_address: contractAddressHex,
        function_selector: selector,
        parameter: parameterHex,
        owner_address: "410000000000000000000000000000000000000000",
        visible: false
      })
    });
    const json = await res.json();
    return json?.constant_result?.[0] || null;
  } catch {
    return null;
  }
}

async function main() {
  console.log("==========================================================================");
  console.log("TROBCHAIN MAINNET — SMART CONTRACT TRANSACTION TRACE");
  console.log("Network: TrobChain Mainnet (Chain ID 1000)");
  console.log("Explorer: https://trobchain.com | RPC: " + RPC_URL);
  console.log("==========================================================================\n");

  for (const [key, c] of Object.entries(CONTRACTS)) {
    console.log(`\n--------------------------------------------------------------------------`);
    console.log(`CONTRACT: ${c.name}`);
    console.log(`Address:  ${c.address} (${c.hex})`);
    console.log(`--------------------------------------------------------------------------`);

    const txData = await fetchJson(`${EXPLORER_API}/accounts/${c.address}/transactions?limit=25`);
    const txs = txData?.data || [];
    console.log(`Total On-Chain Transactions Found: ${txs.length}`);

    for (let i = 0; i < txs.length; i++) {
      const tx = txs[i];
      const callVal = tx.call_value ? `${(Number(tx.call_value) / 1e6).toFixed(4)} TROB` : "0 TROB";
      console.log(`  [Tx #${i + 1}] ${tx.timestamp}`);
      console.log(`    Hash:      https://trobchain.com/blockchain/transaction/${tx.hash}`);
      console.log(`    Block:     #${tx.block_number}`);
      console.log(`    From:      ${tx.from_addr}`);
      console.log(`    Type:      ${tx.contract_type} -> ${tx.method_signature || tx.method_name || "N/A"}`);
      console.log(`    Value:     ${callVal}`);
      console.log(`    Result:    ${tx.result}`);
      if (tx.token_transfers && tx.token_transfers.length > 0) {
        console.log(`    Transfers: ${JSON.stringify(tx.token_transfers)}`);
      }
    }
  }

  // Deep dive into registration transaction 2540fedb...
  console.log("\n==========================================================================");
  console.log("DETAILED AUDIT OF REGISTRATION TX: 2540fedb608897717e5db099f84a830016e7a7efc152b5fb39ec39d9bdf67e1d");
  console.log("==========================================================================");
  const txInfo = await fetchJson(`${RPC_URL}/wallet/gettransactioninfobyid?value=2540fedb608897717e5db099f84a830016e7a7efc152b5fb39ec39d9bdf67e1d`);
  if (txInfo) {
    console.log("Receipt Result:", txInfo.receipt?.result || "SUCCESS");
    console.log("Block Number:", txInfo.blockNumber);
    console.log("Fee Paid (Energy/Bandwidth):", (txInfo.fee || 0) / 1e6, "TROB");
    console.log("Internal Transactions Count:", txInfo.internal_transactions?.length || 0);

    if (txInfo.internal_transactions) {
      console.log("\nInternal Calls Triggered (Money Flow Trace):");
      txInfo.internal_transactions.slice(0, 15).forEach((it, idx) => {
        const caller = it.caller_address;
        const transferTo = it.transferTo_address;
        const val = it.callValueInfo?.[0]?.callValue ? (it.callValueInfo[0].callValue / 1e6).toFixed(6) + " TROB" : "0";
        console.log(`   ${idx + 1}. Caller: ${caller} -> TransferTo: ${transferTo} | Value: ${val}`);
      });
      if (txInfo.internal_transactions.length > 15) {
        console.log(`   ... and ${txInfo.internal_transactions.length - 15} more dividend payouts to DAO member wallets!`);
      }
    }
  }

  // Contract On-Chain Live States
  console.log("\n==========================================================================");
  console.log("LIVE CONTRACT ON-CHAIN CONSTANTS & ACCUMULATORS");
  console.log("==========================================================================");

  // Matrix: totalUsers & slot 1 cost
  const totalUsersHex = await queryConstant(CONTRACTS.matrix.hex, "totalUsers()");
  const totalUsers = totalUsersHex ? parseInt(totalUsersHex, 16) : "N/A";
  console.log(`EquoraMatrix totalUsers(): ${totalUsers}`);

  // Vault: totalRoutedFromMatrix()
  const routedHex = await queryConstant(CONTRACTS.vault.hex, "totalRoutedFromMatrix()");
  const routedSun = routedHex ? parseInt(routedHex, 16) : 0;
  console.log(`EquoraVault totalRoutedFromMatrix(): ${(routedSun / 1e6).toFixed(4)} TROB`);

  // DAO: totalMembers() & totalDistributed()
  const daoMembersHex = await queryConstant(CONTRACTS.dao.hex, "totalMembers()");
  const daoMembers = daoMembersHex ? parseInt(daoMembersHex, 16) : "N/A";
  console.log(`EquoraDAOv2 totalMembers(): ${daoMembers}`);

  const daoDistHex = await queryConstant(CONTRACTS.dao.hex, "totalDistributed()");
  const daoDistSun = daoDistHex ? parseInt(daoDistHex, 16) : 0;
  console.log(`EquoraDAOv2 totalDistributed(): ${(daoDistSun / 1e6).toFixed(4)} TROB`);

  // Registry: totalMembers()
  const regMembersHex = await queryConstant(CONTRACTS.registry.hex, "totalMembers()");
  const regMembers = regMembersHex ? parseInt(regMembersHex, 16) : "N/A";
  console.log(`EquoraRegistry totalMembers(): ${regMembers}`);
}

main().catch(console.error);

