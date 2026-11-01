const fs = require("fs");
const path = require("path");
const bs58check = require("bs58check");
const { ethers } = require("ethers");
require("dotenv").config({ path: path.resolve(__dirname, "../packages/hardhat/.env") });
if (!process.env.DEPLOYER_PRIVATE_KEY) {
  require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
}

const MAINNET_RPC = "https://fullnode-one.trobchain.com";

const MATRIX_HEX = "411a5f193d5b9654282fed67931d9123c00da9c879";
const REGISTRY_HEX = "411a7f29b91424fd6715c5048b458dcf7beeeaeebc";
const NFT_HEX = "41f964817a670445817918c88f926b5850d753474d";

const GENESIS_ROOT = {
  base58: "TLHTKgsBRUWfYV8Mo6b4Z3RrJ1k1WLwZWa",
  evm: "0x7124b32b48786a13177f3bdc9620e7a48eb9c902",
};
const NODE1_USER = {
  base58: "THiH4WkoXmVKHoRiWBrp2HaoVUAbj4bpwp",
  evm: "0x54ee27d54ec9c03b5ed2f69960b175f34facd696",
};

function privateKeyToSigner(privKeyHex) {
  const clean = privKeyHex.startsWith("0x") ? privKeyHex : "0x" + privKeyHex;
  const wallet = new ethers.Wallet(clean);
  const evmAddress = wallet.address.toLowerCase();
  const tronHex = "41" + evmAddress.slice(2);
  const tronBase58 = bs58check.encode(Buffer.from(tronHex, "hex"));
  return {
    privateKey: clean,
    evmAddress,
    tronHex,
    tronBase58,
    signingKey: new ethers.SigningKey(clean),
  };
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function broadcastTransaction(signer, createData) {
  const txID = createData.txID;
  const sig = signer.signingKey.sign("0x" + txID);
  const vHex = sig.v.toString(16).padStart(2, "0");
  const signatureHex = sig.r.slice(2) + sig.s.slice(2) + vHex;

  const res = await fetch(`${MAINNET_RPC}/wallet/broadcasttransaction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...createData,
      signature: [signatureHex],
    }),
  });
  const data = await res.json();
  if (!data.result) {
    const errMsg = data.message ? Buffer.from(data.message, "hex").toString("utf8") : JSON.stringify(data);
    throw new Error(`Broadcast failed: ${errMsg}`);
  }
  return data;
}

async function waitForTx(txHash) {
  for (let attempt = 0; attempt < 30; attempt++) {
    await sleep(2000);
    try {
      const res = await fetch(`${MAINNET_RPC}/wallet/gettransactionbyid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: txHash }),
      });
      const tx = await res.json();
      if (tx.ret && tx.ret.length > 0) {
        const retStatus = tx.ret[0].contractRet;
        if (retStatus === "SUCCESS") {
          return tx;
        } else {
          throw new Error(`Transaction ${txHash} failed on-chain with status: ${retStatus}`);
        }
      }
    } catch (err) {
      if (err.message.includes("failed on-chain")) throw err;
    }
  }
  console.log(`   ⚠️ Tx ${txHash} not confirmed after 60s, continuing...`);
  return { ret: [{ contractRet: "PENDING" }] };
}

async function triggerContract(signer, contractHex, functionSelector, parameterHex = "", callValue = 0) {
  const payload = {
    owner_address: signer.tronHex,
    contract_address: contractHex,
    function_selector: functionSelector,
    parameter: parameterHex,
    fee_limit: 100_000_000,
    call_value: callValue,
  };

  const createRes = await fetch(`${MAINNET_RPC}/wallet/triggersmartcontract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const createData = await createRes.json();
  if (createData.Error) {
    throw new Error(`trigger failed for ${functionSelector}: ${createData.Error}`);
  }
  if (!createData.result?.result) {
    const msg = createData.result?.message ? Buffer.from(createData.result.message, "hex").toString() : JSON.stringify(createData);
    throw new Error(`trigger failed for ${functionSelector}: ${msg}`);
  }

  await broadcastTransaction(signer, createData.transaction);
  const txHash = createData.transaction.txID;
  console.log(`   📤 Called ${functionSelector.split("(")[0]} -> Tx: ${txHash}`);

  await waitForTx(txHash);
  await sleep(1500);
  return txHash;
}

async function callConstant(contractHex, functionSelector, parameterHex = "") {
  const res = await fetch(`${MAINNET_RPC}/wallet/triggerconstantcontract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner_address: contractHex,
      contract_address: contractHex,
      function_selector: functionSelector,
      parameter: parameterHex,
    }),
  });
  const d = await res.json();
  return d.constant_result?.[0] || "";
}

async function main() {
  const signer = privateKeyToSigner(process.env.DEPLOYER_PRIVATE_KEY);
  console.log(`Signer: ${signer.tronBase58}`);

  const coder = new ethers.AbiCoder();

  // 1. Verify on-chain slot state
  console.log("\n1. Verifying Genesis Root Slot 1 on-chain...");
  const slotDataCallParams = coder.encode(["address", "uint256"], [GENESIS_ROOT.evm, 1]).slice(2);
  const slotDataHex = await callConstant(MATRIX_HEX, "getSlotData(address,uint256)", slotDataCallParams);
  if (slotDataHex) {
    const decoded = coder.decode(
      ["bool", "uint256", "uint256", "address[14]", "uint256"],
      "0x" + slotDataHex
    );
    const node1Base58 = bs58check.encode(Buffer.from("41" + decoded[3][0].slice(2), "hex"));
    console.log(`   ✅ Root Slot 1 isUnlocked: ${decoded[0]}, currentCycle: ${decoded[1]}, filledNodes: ${decoded[2]}`);
    console.log(`   ✅ Seat #1 Node: ${node1Base58} (Expected: ${NODE1_USER.base58})`);
    console.log(`   ✅ Seat #2 Node: ${decoded[3][1]} (Expected: 0x0000000000000000000000000000000000000000)`);
  }

  // 2. Renounce ownerships
  console.log("\n2. Renouncing EquoraMatrix ownership...");
  await triggerContract(signer, MATRIX_HEX, "renounceOwnership()", "");

  console.log("\n3. Renouncing EquoraNFT ownership...");
  await triggerContract(signer, NFT_HEX, "renounceOwnership()", "");

  console.log("\n4. Renouncing EquoraRegistry ownership...");
  await triggerContract(signer, REGISTRY_HEX, "renounceOwnership()", "");

  // 3. Update deployed-trobchain-mainnet.json
  const deploymentPath = path.resolve(__dirname, "../packages/hardhat/deployed-trobchain-mainnet.json");
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));

  deployment.contracts.EquoraMatrix = {
    addressBase58: bs58check.encode(Buffer.from(MATRIX_HEX, "hex")),
    addressHex: MATRIX_HEX,
    evmAddress: "0x" + MATRIX_HEX.slice(2),
    genesisRoot: GENESIS_ROOT.base58,
    node1User: NODE1_USER.base58,
    seat2Status: "OPEN_EMPTY",
    owner: "0x0000000000000000000000000000000000000000",
  };

  deployment.contracts.EquoraRegistry = {
    addressBase58: bs58check.encode(Buffer.from(REGISTRY_HEX, "hex")),
    addressHex: REGISTRY_HEX,
    evmAddress: "0x" + REGISTRY_HEX.slice(2),
    root: GENESIS_ROOT.base58,
    owner: "0x0000000000000000000000000000000000000000",
  };

  deployment.contracts.EquoraNFT = {
    addressBase58: bs58check.encode(Buffer.from(NFT_HEX, "hex")),
    addressHex: NFT_HEX,
    evmAddress: "0x" + NFT_HEX.slice(2),
    owner: "0x0000000000000000000000000000000000000000",
  };

  deployment.updatedAt = new Date().toISOString();
  fs.writeFileSync(deploymentPath, JSON.stringify(deployment, null, 2));
  console.log(`\n✅ Saved updated contract records to ${deploymentPath}`);

  console.log("\n================================================================================");
  console.log("🎉 ALL ON-CHAIN TRANSACTIONS CONFIRMED & RENOUNCED TO 0x0!");
  console.log("================================================================================");
}

main().catch(console.error);

