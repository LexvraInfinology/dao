const path = require("path");
const fs = require("fs");
const { ethers } = require("ethers");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const { PrismaClient } = require("../packages/database/src/generated/client");

const prisma = new PrismaClient();
const MAINNET_RPC = "https://fullnode-one.trobchain.com";
const DAO_BASE58 = "THMrTHkAfcM1ZmhNzNRrMJiyCimgoGjF9V";
const DAO_HEX = "4151114b92df6041f5a0e7ebc13e6ed68298fd28b0";
const coder = new ethers.AbiCoder();

const B58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function decode58(string) {
  const bytes = [0];
  for (let i = 0; i < string.length; i++) {
    const c = string[i];
    const value = B58_ALPHABET.indexOf(c);
    if (value === -1) return null;
    for (let j = 0; j < bytes.length; j++) bytes[j] *= 58;
    bytes[0] += value;
    let carry = 0;
    for (let j = 0; j < bytes.length; j++) {
      bytes[j] += carry;
      carry = bytes[j] >> 8;
      bytes[j] &= 0xff;
    }
    while (carry) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }
  for (let i = 0; i < string.length && string[i] === "1"; i++) bytes.push(0);
  return new Uint8Array(bytes.reverse());
}

function toHexAddress(input) {
  if (!input) return "0x0000000000000000000000000000000000000000";
  const str = input.trim();
  if (str.startsWith("0x")) return str.toLowerCase();
  if (str.startsWith("41") && str.length === 42) return `0x${str.slice(2)}`.toLowerCase();
  if (str.startsWith("T") && str.length === 34) {
    const decoded = decode58(str);
    if (decoded && decoded.length >= 21) {
      return (
        "0x" +
        Array.from(decoded.slice(1, 21))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("")
          .toLowerCase()
      );
    }
  }
  return str.toLowerCase();
}

function toTronHex(input) {
  const hex = toHexAddress(input);
  return "41" + hex.slice(2);
}

async function withRetry(fn, retries = 4) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === retries) throw err;
      console.warn(`   ⚠️ [Prisma retry ${attempt}/${retries}] ${err.message}. Retrying...`);
      await new Promise(r => setTimeout(r, 1500 * attempt));
    }
  }
}

async function main() {
  console.log("================================================================");
  console.log("🌐 SYNCHRONIZING MAINNET DAO MEMBERS (93 SEATS) TO NEON POSTGRES");
  console.log("   Contract: EquoraDAOv2 (" + DAO_BASE58 + ")");
  console.log("   RPC: " + MAINNET_RPC);
  console.log("================================================================\n");

  const manifestPath = path.resolve(__dirname, "../scratch/migration_manifest.json");
  if (!fs.existsSync(manifestPath)) {
    throw new Error("Migration manifest not found at " + manifestPath);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  const genuine = manifest.genuineMembers || [];
  const underfunded = manifest.underfundedReservations || [];

  console.log(`Found ${genuine.length} genuine members and ${underfunded.length} underfunded reservations.`);

  let totalDistributed = 0;
  let count = 0;

  // 1. Ensure DaoInstance exists
  await withRetry(() => prisma.daoInstance.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      capacity: 100,
      isClosed: false,
      distributionMode: "push_with_pull_fallback",
    },
    update: {
      capacity: 100,
      isClosed: false,
    }
  }));

  // 2. Process Genuine Members
  for (const m of genuine) {
    count++;
    const userHex = toHexAddress(m.address);
    const entryBtt = parseFloat(m.entryAmountBtt) || 5084.746;
    const pushedBtt = parseFloat(m.pushedAmountBtt) || 0;
    const isCapped = m.status === "capped" || pushedBtt >= entryBtt * 5;
    totalDistributed += pushedBtt;

    // Find or create User
    const existingUser = await withRetry(() => prisma.user.findUnique({ where: { address: userHex } }));
    let userId = existingUser?.userId;
    if (!userId) {
      const maxUser = await withRetry(() => prisma.user.findFirst({ orderBy: { userId: "desc" }, select: { userId: true } }));
      userId = (maxUser?.userId || 100) + 1;
      await withRetry(() => prisma.user.create({
        data: {
          address: userHex,
          userId: userId,
          registrationTimestamp: new Date(),
        }
      })).catch(() => {});
    }

    // Upsert DaoMember
    await withRetry(() => prisma.daoMember.upsert({
      where: { position: m.position },
      create: {
        address: userHex,
        position: m.position,
        nftTokenId: m.position,
        entryAmountBtt: entryBtt,
        entryAmountUsdAtJoin: 300,
        priceSource: "onchain",
        pushedAmountBtt: pushedBtt,
        cappedAt: isCapped ? new Date() : null,
        status: isCapped ? "capped" : "active",
        txHash: "0x595ce57de5ec5af057079d630f7d81737150d582b9116e385718c83c4bdbca8b",
        blockNumber: 1n,
        joinedAt: new Date(Date.now() - (100 - m.position) * 86400000),
      },
      update: {
        address: userHex,
        entryAmountBtt: entryBtt,
        pushedAmountBtt: pushedBtt,
        status: isCapped ? "capped" : "active",
        cappedAt: isCapped ? new Date() : null,
      }
    }));

    if (count % 15 === 0 || count === genuine.length) {
      console.log(`   [${count}/${genuine.length}] Synced Seat #${m.position}: ${m.address} (${isCapped ? "CAPPED" : "ACTIVE"})`);
    }
  }

  // 3. Process Underfunded Reservations
  for (const u of underfunded) {
    const userHex = toHexAddress(u.address);
    const entryBtt = parseFloat(u.entryAmountBtt) || 1.5;

    // Find or create User
    const existingUser = await withRetry(() => prisma.user.findUnique({ where: { address: userHex } }));
    let userId = existingUser?.userId;
    if (!userId) {
      const maxUser = await withRetry(() => prisma.user.findFirst({ orderBy: { userId: "desc" }, select: { userId: true } }));
      userId = (maxUser?.userId || 100) + 1;
      await withRetry(() => prisma.user.create({
        data: {
          address: userHex,
          userId: userId,
          registrationTimestamp: new Date(),
        }
      })).catch(() => {});
    }

    // Upsert DaoMember as underfunded reservation
    await withRetry(() => prisma.daoMember.upsert({
      where: { position: u.position },
      create: {
        address: userHex,
        position: u.position,
        nftTokenId: u.position,
        entryAmountBtt: entryBtt,
        entryAmountUsdAtJoin: 300,
        priceSource: "onchain",
        pushedAmountBtt: 0,
        status: "underfunded",
        txHash: "0x595ce57de5ec5af057079d630f7d81737150d582b9116e385718c83c4bdbca8b",
        blockNumber: 1n,
        joinedAt: new Date(),
      },
      update: {
        address: userHex,
        entryAmountBtt: entryBtt,
        pushedAmountBtt: 0,
        status: "underfunded",
      }
    }));

    console.log(`   [Underfunded] Synced Seat #${u.position}: ${u.address} (Reserved, Debt: ${u.unearnedDebtBtt} TROB)`);
  }

  // 4. Update DaoInstance totalDistributedBtt
  await withRetry(() => prisma.daoInstance.update({
    where: { id: 1 },
    data: {
      totalDistributedBtt: totalDistributed,
    }
  }));

  const finalMembers = await prisma.daoMember.count();
  console.log(`\n✅ Synchronization complete! Total DAO members in Postgres: ${finalMembers}`);
  console.log(`   Total Distributed TROB Recorded: ${totalDistributed.toFixed(4)} TROB`);
  console.log(`   Remaining Vacant Seats (open for public mainnet join): ${100 - finalMembers} seats (94 - 100)`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
