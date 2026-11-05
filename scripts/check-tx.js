async function check() {
  const txID = "2ef3fdc6806f51b7c2e787296fe221b758f0fe7403492ce47e8ab162c1e1ed5b";
  const res = await fetch("https://fullnode-one-testnet.trobchain.com/wallet/gettransactioninfobyid", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value: txID })
  });
  const d = await res.json();
  console.log("Tx 1 info:", JSON.stringify(d, null, 2));
}
check();

