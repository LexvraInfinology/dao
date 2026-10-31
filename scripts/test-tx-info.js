async function testTxInfo() {
  const txHash = "9688a498fa55ec2e9fe5c8c5a17ec3fcfb887bfea9038d585144e33d9755069d";
  const res = await fetch("https://fullnode-one-testnet.trobchain.com/wallet/gettransactioninfobyid", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value: txHash })
  });
  const data = await res.json();
  console.log("Transaction Info Log count:", data.log ? data.log.length : 0);
  if (data.log) {
    console.log("First log:", JSON.stringify(data.log[0]));
  }
}

testTxInfo();
