const { ethers } = require("ethers");

const RPC = "https://fullnode-one.trobchain.com";
const DAO_HEX = "4151114b92df6041f5a0e7ebc13e6ed68298fd28b0";
const DEPLOYER_HEX = "41a17e4c0d50ab3f2ff2717c94002a45444c91b202";

async function main() {
  const coder = ethers.AbiCoder.defaultAbiCoder();
  const res = await fetch(`${RPC}/wallet/triggerconstantcontract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner_address: DEPLOYER_HEX,
      contract_address: DAO_HEX,
      function_selector: "getMembers()",
      parameter: ""
    })
  });
  const data = await res.json();
  const hex = data.constant_result?.[0];
  if (hex) {
    const decoded = coder.decode(["address[]"], "0x" + hex)[0];
    console.log("Total members currently on-chain in EquoraDAOv2:", decoded.length);
  } else {
    console.log("Could not get members:", data);
  }
}

main();
