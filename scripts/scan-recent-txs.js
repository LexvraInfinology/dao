const { ethers } = require("ethers");
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const FULLNODE_URL = "https://fullnode-one-testnet.trobchain.com";
const MATRIX_HEX = "4107206fbf8b863f8a22b79ba3c771dcef0fe1ddc8";
const REGISTRY_HEX = "41607aa22a411c8bfc736637b30fdae63c84e47feb";

async function main() {
  console.log("=== Querying Blockchain Transactions for Matrix ===");

  // Let's get the latest block number
  const blkRes = await fetch(`${FULLNODE_URL}/wallet/getnowblock`);
  const nowBlock = await blkRes.json();
  const currentBlock = nowBlock.block_header.raw_data.number;
  console.log(`Current Block: ${currentBlock}`);

  // Scan recent blocks (last 1000 blocks)
  const startBlock = currentBlock - 1000;
  console.log(`Scanning blocks ${startBlock} to ${currentBlock}...`);

  const foundTxs = [];

  for (let b = currentBlock; b >= startBlock; b -= 20) {
    const fromB = Math.max(startBlock, b - 19);
    const toB = b;
    try {
      const res = await fetch(`${FULLNODE_URL}/wallet/getblockbylimitnext`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startNum: fromB, endNum: toB + 1 }),
      });
      const data = await res.json();
      if (data.block) {
        for (const blk of data.block) {
          const txs = blk.transactions || [];
          for (const tx of txs) {
            const contractCall = tx.raw_data?.contract?.[0];
            const toContract = contractCall?.parameter?.value?.contract_address;
            if (toContract && (toContract.toLowerCase() === MATRIX_HEX.toLowerCase() || toContract.toLowerCase() === REGISTRY_HEX.toLowerCase())) {
              foundTxs.push({
                txID: tx.txID,
                block: blk.block_header.raw_data.number,
                timestamp: blk.block_header.raw_data.timestamp,
                type: contractCall.type,
                owner: contractCall.parameter?.value?.owner_address,
                toContract,
                call_value: contractCall.parameter?.value?.call_value,
                data: contractCall.parameter?.value?.data,
              });
            }
          }
        }
      }
    } catch (e) {
      // skip
    }
    if (foundTxs.length >= 10) break;
  }

  console.log(`Found ${foundTxs.length} matching transactions:`);
  for (const t of foundTxs) {
    console.log(`----------------------------------------------------`);
    console.log(`TxID: ${t.txID}`);
    console.log(`Block: ${t.block} | Time: ${new Date(t.timestamp).toISOString()}`);
    console.log(`From: ${t.owner}`);
    console.log(`To: ${t.toContract}`);
    console.log(`Call Value: ${t.call_value ? t.call_value / 1e6 : 0} TROB`);
  }
}

main().catch(console.error);

