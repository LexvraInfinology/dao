const RPC_URL = "https://fullnode-one-testnet.trobchain.com";

async function checkTx() {
  const txId = "789eb9612baacf3ae27c2b1fab42fca8d5b95543d562ffb1a7fb775b75a89fa6";
  const res = await fetch(`${RPC_URL}/wallet/gettransactioninfobyid`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value: txId })
  });
  const data = await res.json();
  console.log("Tx Info receipt:", data.receipt);
  console.log("Internal txs:", JSON.stringify(data.internal_transactions, null, 2));
  console.log("Logs count:", data.log ? data.log.length : 0);
  if (data.log) {
    for (let i = 0; i < data.log.length; i++) {
      console.log(`Log ${i}: address 0x${data.log[i].address}, topics:`, data.log[i].topics);
    }
  }
}

checkTx();
