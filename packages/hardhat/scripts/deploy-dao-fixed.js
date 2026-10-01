const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { ethers } = require("ethers");
require("dotenv").config({ path: path.resolve(__dirname, "../../../.env") });
require("dotenv").config();

const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function encode58(buffer) {
  const digits = [0];
  for (let i = 0; i < buffer.length; i++) {
    for (let j = 0; j < digits.length; j++) digits[j] <<= 8;
    digits[0] += buffer[i];
    let carry = 0;
    for (let j = 0; j < digits.length; j++) {
      digits[j] += carry;
      carry = (digits[j] / 58) | 0;
      digits[j] %= 58;
    }
    while (carry) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  for (let i = 0; i < buffer.length && buffer[i] === 0; i++) digits.push(0);
  return digits.reverse().map((d) => ALPHABET[d]).join("");
}

function hexToBase58(hexStr) {
  const clean = hexStr.startsWith("0x") ? hexStr.slice(2) : hexStr;
  const buf = Buffer.from(clean, "hex");
  const hash1 = crypto.createHash("sha256").update(buf).digest();
  const hash2 = crypto.createHash("sha256").update(hash1).digest();
  const checksum = hash2.subarray(0, 4);
  return encode58(Buffer.concat([buf, checksum]));
}

function privateKeyToAddress(privKeyHex) {
  const clean = privKeyHex.startsWith("0x") ? privKeyHex : "0x" + privKeyHex;
  const wallet = new ethers.Wallet(clean);
  const evmAddress = wallet.address.toLowerCase();
  const tronHex = "41" + evmAddress.slice(2);
  const tronBase58 = hexToBase58(tronHex);
  return { evmAddress, tronHex, tronBase58 };
}

const FULLNODE_URL = "https://fullnode-one-testnet.trobchain.com";

async function main() {
  const privKey = process.env.DEPLOYER_PRIVATE_KEY || "11555126483d8f687eb1c721788730c65b3e986b302d68fe04eece7dc9382eca";
  const { tronBase58, tronHex, evmAddress } = privateKeyToAddress(privKey);
  console.log("Deployer:", tronBase58, `(${tronHex})`);

  const artifactPath = path.resolve(__dirname, "../artifacts/contracts/core/EquoraDAO.sol/EquoraDAO.json");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  const paymentTokenHex = "0x3c53a0ced96d38906e5d8f4e6cd8c8c04b31e7a4"; // NEXT_PUBLIC_TOKEN_HEX
  const registryHex     = "0xd6f20701da8518fadc9d31f6dd9f1dd26cdb0e70"; // NEXT_PUBLIC_REGISTRY_HEX

  const coder = new ethers.AbiCoder();
  const constructorParamsHex = coder.encode(["address", "address"], [paymentTokenHex, registryHex]);

  console.log("Preparing deployment of updated EquoraDAO with native TROB cashback fix...");

  const payload = {
    owner_address: tronHex,
    fee_limit: 1000000000, // 1000 TROB
    call_value: 0,
    consume_user_resource_percent: 100,
    origin_energy_limit: 10000000,
    abi: JSON.stringify(artifact.abi),
    bytecode: artifact.bytecode.replace(/^0x/, ""),
    parameter: constructorParamsHex.replace(/^0x/, ""),
    name: "EquoraDAO",
  };

  const createRes = await fetch(`${FULLNODE_URL}/wallet/deploycontract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const createData = await createRes.json();
  if (createData.Error) {
    throw new Error(`deploycontract failed: ${createData.Error}`);
  }

  const txID = createData.txID;
  const contractAddressHex = createData.contract_address;
  const contractAddressBase58 = hexToBase58(contractAddressHex);

  console.log("Contract Address Hex:", contractAddressHex);
  console.log("Contract Address Base58:", contractAddressBase58);

  const signingKey = new ethers.SigningKey(privKey.startsWith("0x") ? privKey : "0x" + privKey);
  const sig = signingKey.sign("0x" + txID);
  const vHex = sig.v.toString(16).padStart(2, "0");
  const signatureHex = sig.r.slice(2) + sig.s.slice(2) + vHex;

  const broadcastPayload = {
    txID: txID,
    raw_data: createData.raw_data,
    raw_data_hex: createData.raw_data_hex,
    signature: [signatureHex],
  };

  const broadcastRes = await fetch(`${FULLNODE_URL}/wallet/broadcasttransaction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(broadcastPayload),
  });

  const broadcastData = await broadcastRes.json();
  console.log("Broadcast Result:", broadcastData);

  if (!broadcastData.result) {
    throw new Error(`Broadcast failed: ${JSON.stringify(broadcastData)}`);
  }

  console.log("SUCCESS! Updated EquoraDAO is deployed at:", contractAddressBase58);
}

main().catch(console.error);
