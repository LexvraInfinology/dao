const { ethers } = require("ethers");

const RPC = "https://fullnode-one.trobchain.com";
const DAO_HEX = "4151114b92df6041f5a0e7ebc13e6ed68298fd28b0"; // THMrTHkAfcM1ZmhNzNRrMJiyCimgoGjF9V
const DEPLOYER_HEX = "41a17e4c0d50ab3f2ff2717c94002a45444c91b202"; // TQh76DdPM5D13XbrhigNrbkjiSTvCBDLM8

async function callConstant(contractHex, selector) {
  const hash = ethers.keccak256(ethers.toUtf8Bytes(selector)).slice(0, 10);
  const res = await fetch(`${RPC}/wallet/triggerconstantcontract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner_address: DEPLOYER_HEX,
      contract_address: contractHex,
      function_selector: selector,
      parameter: ""
    })
  });
  const data = await res.json();
  return data.constant_result?.[0] || "";
}

async function main() {
  const adminHex = await callConstant(DAO_HEX, "admin()");
  const finHex = await callConstant(DAO_HEX, "migrationFinalized()");
  const vaultHex = await callConstant(DAO_HEX, "vaultContract()");
  const membersCountHex = await callConstant(DAO_HEX, "totalCollected()");
  
  console.log("admin():", adminHex ? "0x" + adminHex.slice(-40) : "empty");
  console.log("migrationFinalized():", finHex ? parseInt(finHex, 16) : "empty");
  console.log("vaultContract():", vaultHex ? "0x" + vaultHex.slice(-40) : "empty");
}

main();
