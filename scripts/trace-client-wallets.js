// Trace 3 wallets requested by client on TrobChain Mainnet
const WALLETS = [
  { label: "1st ID (Root ID)", address: "TLHTKgsBRUWfYV8Mo6b4Z3RrJ1k1WLwZWa" },
  { label: "2nd ID", address: "THiH4WkoXmVKHoRiWBrp2HaoVUAbj4bpwp" },
  { label: "3rd ID", address: "TRWFd7QMMmXjSBuUm6VTomXpoRN3Wr5Nk9" }
];

const EXPLORER_API = "https://backend.trobchain.com/v1";
const RPC_URL = "https://fullnode-one.trobchain.com";

async function fetchJson(url) {
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    return await r.json();
  } catch (e) {
    return null;
  }
}

async function main() {
  console.log("==========================================================================");
  console.log("CLIENT WALLET AUDIT ON TROBCHAIN MAINNET");
  console.log("==========================================================================\n");

  for (const w of WALLETS) {
    console.log(`\n==========================================================================`);
    console.log(`WALLET: ${w.label} -> ${w.address}`);
    console.log(`Explorer: https://trobchain.com/blockchain/account/${w.address}`);
    console.log(`==========================================================================`);

    // 1. Account details & balance
    const acc = await fetchJson(`${EXPLORER_API}/accounts/${w.address}`);
    if (acc) {
      console.log(`Balance: ${(Number(acc.balance || 0) / 1e6).toFixed(4)} TROB`);
      console.log(`Staked Energy: ${(Number(acc.frozen_for_energy || 0) / 1e6).toFixed(4)} TROB`);
      console.log(`Staked Bandwidth: ${(Number(acc.frozen_for_bandwidth || 0) / 1e6).toFixed(4)} TROB`);
    }

    // 2. Outgoing & Incoming Transactions
    const txData = await fetchJson(`${EXPLORER_API}/accounts/${w.address}/transactions?limit=25`);
    const txs = txData?.data || [];
    console.log(`Total Transactions: ${txs.length}`);

    for (let i = 0; i < txs.length; i++) {
      const tx = txs[i];
      const callVal = tx.call_value ? `${(Number(tx.call_value) / 1e6).toFixed(4)} TROB` : (tx.amount ? `${(Number(tx.amount) / 1e6).toFixed(4)} TROB` : "0 TROB");
      console.log(`\n  --- [Tx #${i + 1}] ${tx.timestamp} ---`);
      console.log(`  Hash:        https://trobchain.com/blockchain/transaction/${tx.hash}`);
      console.log(`  Block:       #${tx.block_number}`);
      console.log(`  From:        ${tx.from_addr} ${tx.from_addr === w.address ? "(THIS WALLET)" : ""}`);
      console.log(`  To:          ${tx.to_addr}`);
      console.log(`  Type:        ${tx.contract_type} -> ${tx.method_signature || tx.method_name || "Transfer"}`);
      console.log(`  Value:       ${callVal}`);
      console.log(`  Result:      ${tx.result}`);

      // If TriggerSmartContract, get internal txs & receipts
      if (tx.contract_type === "TriggerSmartContract") {
        const info = await fetchJson(`${RPC_URL}/wallet/gettransactioninfobyid?value=${tx.hash}`);
        if (info) {
          console.log(`  Fee:         ${(info.fee || 0) / 1e6} TROB`);
          if (info.internal_transactions && info.internal_transactions.length > 0) {
            console.log(`  Internal Transfers Count: ${info.internal_transactions.length}`);
            info.internal_transactions.slice(0, 10).forEach((it, idx) => {
              const val = it.callValueInfo?.[0]?.callValue ? (it.callValueInfo[0].callValue / 1e6).toFixed(6) + " TROB" : "0";
              console.log(`    [Internal #${idx + 1}] ${it.caller_address} -> ${it.transferTo_address} | ${val}`);
            });
            if (info.internal_transactions.length > 10) {
              console.log(`    ... +${info.internal_transactions.length - 10} more internal transfers!`);
            }
          }
        }
      }
    }
  }
}

main().catch(console.error);

