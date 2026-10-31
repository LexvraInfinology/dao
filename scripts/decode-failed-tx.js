const { ethers } = require("ethers");

async function checkTx() {
  const res = await fetch("https://fullnode-one.trobchain.com/wallet/gettransactionbyid", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value: "4b8a0cf421a8ebc282ceda2076e0b9ac4d2d56e1bf9110ad40c3c7ce519258e9" })
  });
  const tx = await res.json();
  console.log("fee_limit:", tx.raw_data?.fee_limit);
  console.log("energy_usage:", tx.energy_usage);
  console.log("energy_fee:", tx.energy_fee);
  console.log("ret:", JSON.stringify(tx.ret));
  
  const callData = "0x" + tx.raw_data?.contract[0]?.parameter?.value?.data;
  const iface = new ethers.Interface([
    "function migrateGenuineMembers(address[] users, uint256[] positions, uint256[] lifetimeEarnings)"
  ]);
  const decoded = iface.parseTransaction({ data: callData });
  console.log("Users count in this batch:", decoded.args[0].length);
  console.log("Positions in this batch:", decoded.args[1].map(p => p.toString()));
}

checkTx();
