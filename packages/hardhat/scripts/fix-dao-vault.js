const { ethers } = require("ethers");
const bs58 = require("bs58");
require("dotenv").config({ path: require("path").resolve(__dirname, "..", ".env") });

const FULLNODE_URL = "https://fullnode-one-testnet.trobchain.com";

function hexToBase58(hexStr) {
  const clean = hexStr.replace(/^0x/, "");
  const bytes = Buffer.from(clean, "hex");
  const h1 = ethers.sha256(bytes);
  const h2 = ethers.sha256(h1);
  const checksum = Buffer.from(h2.slice(2), "hex").slice(0, 4);
  const total = Buffer.concat([bytes, checksum]);
  return bs58.encode(total);
}

function privateKeyToAddress(privKeyHex) {
  const clean = privKeyHex.startsWith("0x") ? privKeyHex : "0x" + privKeyHex;
  const wallet = new ethers.Wallet(clean);
  const evmAddress = wallet.address.toLowerCase();
  const tronHex = "41" + evmAddress.slice(2);
  const tronBase58 = hexToBase58(tronHex);
  return { evmAddress, tronHex, tronBase58, signingKey: new ethers.SigningKey(clean) };
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options = {}, retries = 5) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 35000);
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);
      return res;
    } catch (err) {
      console.warn(`   ⚠️ [fetch] Attempt ${attempt}/${retries} failed: ${err.message}`);
      if (attempt === retries) throw err;
      await sleep(2500 * attempt);
    }
  }
}

async function broadcastTransaction(signer, createData) {
  const txID = createData.txID;
  const sig = signer.signingKey.sign("0x" + txID);
  const vHex = sig.v.toString(16).padStart(2, "0");
  const signatureHex = sig.r.slice(2) + sig.s.slice(2) + vHex;

  const res = await fetchWithRetry(`${FULLNODE_URL}/wallet/broadcasttransaction`, {
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

async function triggerContractMethod(deployer, contractHex, functionSelector, parameterHex, description) {
  console.log(`\n⚡ Calling: ${description}...`);
  const triggerRes = await fetchWithRetry(`${FULLNODE_URL}/wallet/triggersmartcontract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner_address: deployer.tronHex,
      contract_address: contractHex,
      function_selector: functionSelector,
      parameter: parameterHex ? parameterHex.replace(/^0x/, "") : "",
      fee_limit: 100000000,
      call_value: 0,
    }),
  });
  const triggerData = await triggerRes.json();
  if (!triggerData.result || !triggerData.transaction) {
    const msg = triggerData.Error || JSON.stringify(triggerData);
    throw new Error(`triggersmartcontract failed: ${msg}`);
  }

  await broadcastTransaction(deployer, triggerData.transaction);
  console.log(`   Tx broadcast: 0x${triggerData.transaction.txID}. Waiting 8s...`);
  await sleep(8000);
  console.log(`   ✅ Confirmed!`);
  return triggerData.transaction.txID;
}

async function main() {
  const privKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privKey) throw new Error("DEPLOYER_PRIVATE_KEY is missing");
  const deployer = privateKeyToAddress(privKey);

  console.log(`Admin Deployer: ${deployer.tronBase58} (${deployer.tronHex})`);

  const daoHex = "4111729d17228f4d2d8bc5855e737755dc12cb566a"; // TBZTnp...
  const vaultEvm = "0x3c0a371f44151807fb3519f67db8e39ede0c661c"; // TFSfn...

  const coder = new ethers.AbiCoder();
  const param = coder.encode(["address"], [vaultEvm]);

  await triggerContractMethod(
    deployer,
    daoHex,
    "setVaultContract(address)",
    param,
    `EquoraDAOv2.setVaultContract(${vaultEvm})`
  );

  // Verify
  const res = await fetch(`${FULLNODE_URL}/wallet/triggersmartcontract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner_address: daoHex,
      contract_address: daoHex,
      function_selector: "vaultContract()",
      parameter: "",
      visible: false,
    }),
  });
  const data = await res.json();
  const v = coder.decode(["address"], "0x" + data.constant_result[0])[0];
  console.log(`🎉 New vaultContract on EquoraDAOv2 is: ${v}`);
}

main().catch(console.error);
