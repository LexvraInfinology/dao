/**
 * wire-matrix.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Wire the already-deployed fresh EquoraMatrix with existing ecosystem.
 * Run after deploy-matrix-only.js when the contract is already on-chain.
 */

const fs   = require("fs");
const path = require("path");
const crypto = require("crypto");
const dns  = require("dns");
const { ethers } = require("ethers");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
require("dotenv").config();

dns.setDefaultResultOrder("ipv4first");

const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function encode58(buffer) {
  const digits = [0];
  for (let i = 0; i < buffer.length; i++) {
    for (let j = 0; j < digits.length; j++) digits[j] <<= 8;
    digits[0] += buffer[i];
    let carry = 0;
    for (let j = 0; j < digits.length; j++) { digits[j] += carry; carry = (digits[j] / 58)|0; digits[j] %= 58; }
    while (carry) { digits.push(carry % 58); carry = (carry / 58)|0; }
  }
  for (let i = 0; i < buffer.length && buffer[i] === 0; i++) digits.push(0);
  return digits.reverse().map(d => ALPHABET[d]).join("");
}
function hexToBase58(h) {
  const buf = Buffer.from(h, "hex");
  const h1 = crypto.createHash("sha256").update(buf).digest();
  const h2 = crypto.createHash("sha256").update(h1).digest();
  return encode58(Buffer.concat([buf, h2.subarray(0, 4)]));
}
function privateKeyToAddress(pk) {
  const clean = pk.startsWith("0x") ? pk : "0x" + pk;
  const w = new ethers.Wallet(clean);
  const ev = w.address.toLowerCase();
  const th = "41" + ev.slice(2);
  return { evmAddress: ev, tronHex: th, tronBase58: hexToBase58(th), signingKey: new ethers.SigningKey(clean) };
}

const FULLNODE = "https://fullnode-one-testnet.trobchain.com";
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fw(url, opts = {}, retries = 5) {
  for (let i = 1; i <= retries; i++) {
    try {
      const c = new AbortController(); const t = setTimeout(() => c.abort(), 35000);
      const r = await fetch(url, { ...opts, signal: c.signal }); clearTimeout(t); return r;
    } catch(e) { if (i === retries) throw e; await sleep(2000 * i); }
  }
}

async function broadcast(deployer, tx) {
  const sig = deployer.signingKey.sign("0x" + tx.txID);
  const sh = sig.r.slice(2) + sig.s.slice(2) + sig.v.toString(16).padStart(2,"0");
  const r = await fw(`${FULLNODE}/wallet/broadcasttransaction`, {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ ...tx, signature: [sh] })
  });
  const d = await r.json();
  if (!d.result) throw new Error("Broadcast failed: " + (d.message ? Buffer.from(d.message,"hex").toString("utf8") : JSON.stringify(d)));
  return d;
}

async function trigger(deployer, contractHex, selector, paramHex, label) {
  console.log(`   🔧 ${label}...`);
  // normalize to 41-prefix
  let addr = contractHex;
  if (addr.startsWith("0x")) addr = "41" + addr.slice(2);
  const r = await fw(`${FULLNODE}/wallet/triggersmartcontract`, {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ owner_address: deployer.tronHex, contract_address: addr,
      function_selector: selector, parameter: paramHex, fee_limit: 200000000, call_value: 0 })
  });
  const d = await r.json();
  if (!d.result?.result) throw new Error(`${label} failed: ${JSON.stringify(d)}`);
  await broadcast(deployer, d.transaction);
  await sleep(4000);
  console.log(`      ✅ done`);
}

async function callConstant(contractHex, selector, paramHex = "") {
  let addr = contractHex;
  if (addr.startsWith("0x")) addr = "41" + addr.slice(2);
  const r = await fw(`${FULLNODE}/wallet/triggerconstantcontract`, {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ owner_address: "41f3e68b5fb76382683baf1e8512c4c0ab39490717",
      contract_address: addr, function_selector: selector, parameter: paramHex })
  });
  const d = await r.json();
  return d.constant_result?.[0] || "";
}

async function main() {
  const pk = process.env.DEPLOYER_PRIVATE_KEY;
  if (!pk) throw new Error("DEPLOYER_PRIVATE_KEY not set");
  const dep = privateKeyToAddress(pk);
  const coder = new ethers.AbiCoder();

  // ── ADDRESSES ──────────────────────────────────────────────────────────────
  const matrixHex  = "41bb16ec48859ae2696dbd04368e3fe73bcd0ef393"; // newly deployed
  const vaultHex   = "415a1e20075ad6574d540b5a04f3bdb3cbc47b73b2";
  const registryHex= "419f559d68ea7019f34bf1401e658fbb724d123845";
  const daoHex     = "41a84cb945ad0431057656f3c5def53ab4f209ed3f";
  const nftHex     = "4146d47f289988f31644eb5c7de1867c731e30b04b";
  const matrixBase58 = hexToBase58(matrixHex);

  console.log(`\n🔗 Wiring EquoraMatrix: ${matrixBase58} (${matrixHex})`);

  // A. Matrix → Vault
  await trigger(dep, matrixHex, "setVaultContract(address)",
    coder.encode(["address"], ["0x" + vaultHex.slice(2)]).slice(2),
    "EquoraMatrix.setVaultContract");

  // B. Matrix → DAO
  await trigger(dep, matrixHex, "setDaoContract(address)",
    coder.encode(["address"], ["0x" + daoHex.slice(2)]).slice(2),
    "EquoraMatrix.setDaoContract");

  // C. NFT → allow Matrix as minter
  await trigger(dep, nftHex, "setMinter(address,bool)",
    coder.encode(["address","bool"], ["0x" + matrixHex.slice(2), true]).slice(2),
    "EquoraNFT.setMinter(Matrix, true)");

  // D. Vault → new Matrix
  await trigger(dep, vaultHex, "setMatrixContract(address)",
    coder.encode(["address"], ["0x" + matrixHex.slice(2)]).slice(2),
    "EquoraVault.setMatrixContract");

  // E. Registry → authorize new Matrix
  await trigger(dep, registryHex, "setAuthorizedContracts(address,address,address)",
    coder.encode(["address","address","address"],
      ["0x"+vaultHex.slice(2), "0x"+daoHex.slice(2), "0x"+matrixHex.slice(2)]).slice(2),
    "EquoraRegistry.setAuthorizedContracts");

  // F. Set TROB price on Matrix (~$0.03174/TROB → 31740 micro-USD per TROB)
  await trigger(dep, matrixHex, "setTrobPrice(uint256)",
    coder.encode(["uint256"], [31740]).slice(2),
    "EquoraMatrix.setTrobPrice(31740)");

  // ── VERIFY ─────────────────────────────────────────────────────────────────
  console.log("\n🔍 On-chain verification...");
  const vMat  = await callConstant(vaultHex,  "matrixContract()");
  const mVlt  = await callConstant(matrixHex, "vaultContract()");
  const mDao  = await callConstant(matrixHex, "daoContract()");
  const mCost = await callConstant(matrixHex, "baseSlotCost()");

  console.log(`   Vault.matrixContract  = ${vMat.slice(-40)} (want: ${matrixHex.slice(2).toLowerCase()})`);
  console.log(`   Matrix.vaultContract  = ${mVlt.slice(-40)} (want: ${vaultHex.slice(2).toLowerCase()})`);
  console.log(`   Matrix.daoContract    = ${mDao.slice(-40)} (want: ${daoHex.slice(2).toLowerCase()})`);
  const cost = mCost ? Number(coder.decode(["uint256"],"0x"+mCost)[0]) : 0;
  console.log(`   Matrix.baseSlotCost   = ${cost/1e6} TROB (${cost} SUN)`);

  const ok = vMat.includes(matrixHex.slice(2).toLowerCase()) && mVlt.includes(vaultHex.slice(2).toLowerCase());
  if (!ok) throw new Error("Wiring verification FAILED — mismatch detected!");

  // ── UPDATE ALL ENV / CONFIG FILES ──────────────────────────────────────────
  const root = path.resolve(__dirname, "../../..");

  // deployed-trobchain.json
  const depPath = path.resolve(__dirname, "..", "deployed-trobchain.json");
  if (fs.existsSync(depPath)) {
    const d = JSON.parse(fs.readFileSync(depPath, "utf8"));
    d.contracts.EquoraMatrix = { name:"EquoraMatrix", addressBase58: matrixBase58, addressHex: matrixHex };
    d.updatedAt = new Date().toISOString();
    fs.writeFileSync(depPath, JSON.stringify(d, null, 2));
    console.log("   💾 Updated deployed-trobchain.json");
  }

  function updateEnv(file) {
    if (!fs.existsSync(file)) return;
    let c = fs.readFileSync(file, "utf8");
    c = c.replace(/NEXT_PUBLIC_MATRIX_ADDRESS=["\']?[^\r\n"\']+["\']?/g, `NEXT_PUBLIC_MATRIX_ADDRESS="${matrixBase58}"`);
    c = c.replace(/NEXT_PUBLIC_MATRIX_HEX=["\']?[^\r\n"\']+["\']?/g,    `NEXT_PUBLIC_MATRIX_HEX="${matrixHex}"`);
    fs.writeFileSync(file, c, "utf8");
    console.log(`   💾 Updated ${path.relative(root, file)}`);
  }
  updateEnv(path.join(root, ".env"));
  updateEnv(path.join(root, "apps/web-matrix/.env.local"));
  updateEnv(path.join(root, "apps/web-dao/.env.local"));

  // contracts.ts fallback
  const ctsPath = path.join(root, "apps/web-matrix/lib/contracts.ts");
  if (fs.existsSync(ctsPath)) {
    let ct = fs.readFileSync(ctsPath, "utf8");
    // Replace any MATRIX_ADDRESS / MATRIX_HEX default fallback strings
    ct = ct.replace(/(MATRIX_ADDRESS\s*[=:]\s*(?:process\.env\.NEXT_PUBLIC_MATRIX_ADDRESS\s*\|\|?\s*)?)["\']T[^"\']+["\']/g,
      `$1"${matrixBase58}"`);
    ct = ct.replace(/(MATRIX_HEX\s*[=:]\s*(?:process\.env\.NEXT_PUBLIC_MATRIX_HEX\s*\|\|?\s*)?)["\']41[^"\']+["\']/g,
      `$1"${matrixHex}"`);
    fs.writeFileSync(ctsPath, ct, "utf8");
    console.log(`   💾 Updated lib/contracts.ts`);
  }

  // api/matrix route — update any hardcoded address
  const routePath = path.join(root, "apps/web-matrix/app/api/matrix/[...path]/route.ts");
  if (fs.existsSync(routePath)) {
    let rt = fs.readFileSync(routePath, "utf8");
    // Replace old matrix address constants in the route
    rt = rt.replace(/TFLRav2LR1qsJeudgPjvuBHDRwD7F87rTF/g, matrixBase58);
    rt = rt.replace(/413adbde54bc997af78be877a56aa674588d1f9ec3/g, matrixHex);
    // Also the hex without 41 prefix
    rt = rt.replace(/3adbde54bc997af78be877a56aa674588d1f9ec3/g, matrixHex.slice(2));
    fs.writeFileSync(routePath, rt, "utf8");
    console.log(`   💾 Updated app/api/matrix/[...path]/route.ts`);
  }

  console.log(`\n🎉 EquoraMatrix fully wired and configured!`);
  console.log(`   Address: ${matrixBase58}`);
  console.log(`   Hex:     ${matrixHex}`);
}

main().catch(e => { console.error("❌", e.message); process.exit(1); });

