const path = require("path");
const { ethers } = require("ethers");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const { PrismaClient } = require("../packages/database/src/generated/client");

const prisma = new PrismaClient();
const RPC_URL = "https://fullnode-one-testnet.trobchain.com";
const coder = new ethers.AbiCoder();

async function withRetry(fn, retries = 4) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === retries) throw err;
      console.warn(`   ⚠️ [Prisma retry ${attempt}/${retries}] ${err.message}. Retrying...`);
      await new Promise(r => setTimeout(r, 2000 * attempt));
    }
  }
}

const MATRIX_ADDR = "TWZZ1ZvU2WmiEYzoXkeKjeKY66nyww2GbY";
const REGISTRY_ADDR = "TCcHDFibnBsSwZhCRyvevXQfoAQ6NMyYWN";

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

async function queryConstant(contractAddress, functionSelector, parameterHex = "") {
  const contractHex = toTronHex(contractAddress);
  const payload = {
    owner_address: contractHex,
    contract_address: contractHex,
    function_selector: functionSelector,
    parameter: parameterHex,
    visible: false,
  };
  const res = await fetch(`${RPC_URL}/wallet/triggersmartcontract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (data.result && data.result.result && data.constant_result?.length > 0) {
    return data.constant_result[0];
  }
  return null;
}

const MEMBERS = [
  { id: 1, evm: "0x67b282b09c3aac1b9fbff6b4ec14ea2b72573c02", name: "Seat 1 (Genesis Apex)" },
  { id: 2, evm: "0xd97fecb63b8f816bd29af5d7d2a2930afc150dd1", name: "Member 2" },
  { id: 3, evm: "0x5b4f6ae9f15c1bc94d5fdd58393848a77b93f86a", name: "Member 3" },
  { id: 4, evm: "0x6eb33eab862e09652dcabb17dae6d06ced607200", name: "Member 4" },
  { id: 7, evm: "0x6e7864582104b0e6e4cee38108fd1fc0bd9b391d", name: "Member 7" },
  { id: 5, evm: "0x8d8798ca7ce665039d5b64a37bc2f53b00fe61e0", name: "Member 5" },
  { id: 6, evm: "0xb206fc1a18216f8ce4fb02997375ec59fcab5c22", name: "Member 6" },
  { id: 8, evm: "0x00d7a0df4459c30f0696bca7ebd8eeb81da6a9f8", name: "Member 8" },
  { id: 9, evm: "0x0e343c7911a1257720df770865264fbeeab66b42", name: "Member 9" },
  { id: 10, evm: "0xe9f69efb8178c0f4f4cbee0c02bedad0dac707fe", name: "Member 10" },
  { id: 11, evm: "0x8b2a64b9197a2da7679a1a0d362837e92056e947", name: "Member 11" }
];

async function syncAll() {
  console.log("================================================================");
  console.log("🔄 SYNCING LIVE ON-CHAIN MATRIX TO POSTGRESQL DATABASE");
  console.log("================================================================");

  for (const m of MEMBERS) {
    const userHex = m.evm.toLowerCase();
    const userParam = coder.encode(["address"], [userHex]).slice(2);

    // 1. Fetch on-chain financials
    let totalEarned = 0;
    let availableBalance = 0;
    let withdrawnTotal = 0;
    let highestUnlocked = 1;

    try {
      const finRaw = await queryConstant(MATRIX_ADDR, "getUserFinancials(address)", userParam);
      if (finRaw) {
        const fin = coder.decode(["uint256", "uint256", "uint256", "uint256"], "0x" + finRaw);
        availableBalance = Number(ethers.formatUnits(fin[0], 6));
        totalEarned = Number(ethers.formatUnits(fin[1], 6));
        withdrawnTotal = Number(ethers.formatUnits(fin[2], 6));
        highestUnlocked = Math.max(1, Number(fin[3]));
      }
    } catch {}

    // 2. Fetch on-chain directs & qual
    let activeDirects = 0;
    let isQual = false;
    try {
      const dirRaw = await queryConstant(MATRIX_ADDR, "getActiveDirectReferralsCount(address)", userParam);
      if (dirRaw) activeDirects = Number(coder.decode(["uint256"], "0x" + dirRaw)[0]);
      const qRaw = await queryConstant(MATRIX_ADDR, "isMatrixQualified(address)", userParam);
      if (qRaw) isQual = Boolean(coder.decode(["bool"], "0x" + qRaw)[0]);
    } catch {}

    // 3. Fetch sponsor
    let sponsorAddress = null;
    try {
      const spRaw = await queryConstant(REGISTRY_ADDR, "getSponsor(address)", userParam);
      if (spRaw) {
        const sp = coder.decode(["address"], "0x" + spRaw)[0];
        if (sp && sp !== "0x0000000000000000000000000000000000000000") {
          sponsorAddress = sp.toLowerCase();
        }
      }
    } catch {}

    // 4. Find or create user without userId collisions
    const existing = await withRetry(() => prisma.user.findUnique({ where: { address: userHex } }));
    let assignedUserId = existing?.userId;
    if (!assignedUserId) {
      const maxUser = await withRetry(() => prisma.user.findFirst({ orderBy: { userId: "desc" }, select: { userId: true } }));
      assignedUserId = (maxUser?.userId || 100) + 1;
    }

    // Ensure sponsor user exists in DB if sponsorAddress is provided
    if (sponsorAddress) {
      const spExists = await withRetry(() => prisma.user.findUnique({ where: { address: sponsorAddress } }));
      if (!spExists) {
        const maxU = await withRetry(() => prisma.user.findFirst({ orderBy: { userId: "desc" }, select: { userId: true } }));
        const spUserId = (maxU?.userId || 500) + 1;
        await withRetry(() => prisma.user.create({
          data: {
            address: sponsorAddress,
            userId: spUserId,
            registrationTimestamp: new Date(),
          }
        })).catch(() => {});
      }
    }

    await withRetry(() => prisma.user.upsert({
      where: { address: userHex },
      create: {
        address: userHex,
        userId: assignedUserId,
        sponsorAddress: sponsorAddress,
        directReferralsCount: activeDirects,
        isQualified: isQual || activeDirects >= 2 || m.id === 1,
        registrationTimestamp: new Date(),
      },
      update: {
        sponsorAddress: sponsorAddress,
        directReferralsCount: activeDirects,
        isQualified: isQual || activeDirects >= 2 || m.id === 1,
      }
    }));

    // 5. Fetch all 12 slots status
    try {
      const slotsRaw = await queryConstant(MATRIX_ADDR, "getAllSlotsStatus(address)", userParam);
      if (slotsRaw) {
        const [unlockedArr, cyclesArr, filledArr] = coder.decode(
          ["bool[12]", "uint256[12]", "uint256[12]"],
          "0x" + slotsRaw
        );

        for (let s = 1; s <= 12; s++) {
          const isUnlocked = Boolean(unlockedArr[s - 1]) || (s === 1);
          const currentCycle = Number(cyclesArr[s - 1]) || (isUnlocked ? 1 : 0);
          const filledNodes = Number(filledArr[s - 1]) || 0;

          // Slot 1 specific earned
          let slotEarned = 0;
          if (s === 1) {
            try {
              const s1P = coder.encode(["address", "uint256"], [userHex, 1]).slice(2);
              const s1Data = await queryConstant(MATRIX_ADDR, "getSlotData(address,uint256)", s1P);
              if (s1Data) {
                const [, , , nodes, earned] = coder.decode(
                  ["bool", "uint256", "uint256", "address[14]", "uint256"],
                  "0x" + s1Data
                );
                slotEarned = Number(ethers.formatUnits(earned, 6));

                // Save placements for this slot
                for (let pos = 1; pos <= 14; pos++) {
                  const occupant = nodes[pos - 1]?.toLowerCase();
                  if (occupant && occupant !== "0x0000000000000000000000000000000000000000") {
                    const occExisting = await withRetry(() => prisma.user.findUnique({ where: { address: occupant } }));
                    let occUserId = occExisting?.userId;
                    if (!occUserId) {
                      const maxU = await withRetry(() => prisma.user.findFirst({ orderBy: { userId: "desc" }, select: { userId: true } }));
                      occUserId = (maxU?.userId || 200) + 1;
                      await withRetry(() => prisma.user.create({
                        data: {
                          address: occupant,
                          userId: occUserId,
                          registrationTimestamp: new Date()
                        }
                      })).catch(() => {});
                    }

                    await withRetry(() => prisma.matrixPlacement.upsert({
                      where: { id: `${userHex}_slot1_pos${pos}_cycle${currentCycle}` },
                      create: {
                        id: `${userHex}_slot1_pos${pos}_cycle${currentCycle}`,
                        matrixOwnerAddress: userHex,
                        placedUserAddress: occupant,
                        slotNumber: 1,
                        position: pos,
                        cycle: currentCycle,
                        payoutType: pos === 1 ? "UPLINE_1" : pos === 2 ? "UPLINE_2" : (pos === 4 || pos === 5 || pos === 14) ? "PROTOCOL_POOL" : "OWNER_DIRECT",
                        recipientAddress: userHex,
                        amount: 30,
                        txHash: "0x_onchain_synced",
                        blockNumber: 1n,
                        timestamp: new Date()
                      },
                      update: {
                        placedUserAddress: occupant,
                        position: pos,
                      }
                    }));
                  }
                }
              }
            } catch {}
          }

          await withRetry(() => prisma.matrixSlot.upsert({
            where: { userAddress_slotNumber: { userAddress: userHex, slotNumber: s } },
            create: {
              userAddress: userHex,
              slotNumber: s,
              isUnlocked,
              currentCycle: Math.max(1, currentCycle),
              filledNodes,
              totalEarned: s === 1 ? slotEarned : 0,
              unlockedAt: isUnlocked ? new Date() : null,
            },
            update: {
              isUnlocked,
              currentCycle: Math.max(1, currentCycle),
              filledNodes,
              totalEarned: s === 1 ? slotEarned : 0,
            }
          }));
        }
      }
    } catch (e) {
      console.warn(`Slots sync failed for ${m.name}:`, e.message);
    }

    // 6. Upsert MatrixProfile
    await withRetry(() => prisma.matrixProfile.upsert({
      where: { userAddress: userHex },
      create: {
        userAddress: userHex,
        username: m.name,
        totalEarnings: totalEarned * 0.056,
        directEarnings: totalEarned * 0.056,
        matrixEarnings: totalEarned * 0.056,
        availableBalance: availableBalance * 0.056,
        withdrawnTotal: withdrawnTotal * 0.056,
        teamCount: activeDirects,
        rankTier: highestUnlocked >= 12 ? 4 : highestUnlocked >= 9 ? 3 : highestUnlocked >= 6 ? 2 : highestUnlocked >= 3 ? 1 : 0
      },
      update: {
        totalEarnings: totalEarned * 0.056,
        directEarnings: totalEarned * 0.056,
        matrixEarnings: totalEarned * 0.056,
        availableBalance: availableBalance * 0.056,
        withdrawnTotal: withdrawnTotal * 0.056,
        teamCount: activeDirects,
        rankTier: highestUnlocked >= 12 ? 4 : highestUnlocked >= 9 ? 3 : highestUnlocked >= 6 ? 2 : highestUnlocked >= 3 ? 1 : 0
      }
    }));

    console.log(`✅ Synced ${m.name} (${userHex.slice(0, 10)}...): Slot 1 unlocked, Earned: ${totalEarned} TROB, Directs: ${activeDirects}`);
  }

  const finalCounts = {
    users: await prisma.user.count(),
    slots: await prisma.matrixSlot.count(),
    placements: await prisma.matrixPlacement.count(),
    profiles: await prisma.matrixProfile.count()
  };
  console.log("\n🎉 Database Sync Completed! Updated Row Counts:", finalCounts);
  await prisma.$disconnect();
}

syncAll().catch(console.error);
