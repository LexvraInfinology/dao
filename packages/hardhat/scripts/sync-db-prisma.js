const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.resolve(__dirname, "../../../.env") });
const { prisma } = require("../../../packages/database");

async function syncToPrisma() {
  console.log(`================================================================`);
  console.log(`🗄 EQUORA MATRIX — PRISMA POSTGRESQL STATE SYNCHRONIZATION`);
  console.log(`================================================================\n`);

  const memberHistoryPath = path.resolve(__dirname, "../joined-members.json");
  if (!fs.existsSync(memberHistoryPath)) {
    console.error("No joined-members.json found.");
    return;
  }

  const members = JSON.parse(fs.readFileSync(memberHistoryPath, "utf8"));
  console.log(`Loaded ${members.length} member placements from joined-members.json.`);

  const deployedSummaryPath = path.resolve(__dirname, "../deployed-trobchain.json");
  const deployed = JSON.parse(fs.readFileSync(deployedSummaryPath, "utf8"));
  const vaultEvm = "0x" + deployed.contracts.EquoraVault.addressHex.slice(2).toLowerCase();
  const seat1Evm = "0x67b282b09c3aac1b9fbff6b4ec14ea2b72573c02".toLowerCase();

  const payoutTypeMap = {
    1: "UPLINE_1",
    2: "UPLINE_2",
    3: "OWNER_DIRECT",
    4: "PROTOCOL_POOL",
    5: "PROTOCOL_POOL",
    6: "OWNER_DIRECT",
    7: "SPILLOVER_DOWNLINE1",
    8: "OWNER_DIRECT",
    9: "OWNER_DIRECT",
    10: "SPILLOVER_DOWNLINE2",
    11: "OWNER_DIRECT",
    12: "OWNER_DIRECT",
    13: "SPILLOVER_DOWNLINE1",
    14: "PROTOCOL_POOL",
  };
  try {
    let currentMaxUserId = 100;
    try {
      const maxRecord = await prisma.user.findFirst({ orderBy: { userId: "desc" } });
      if (maxRecord && maxRecord.userId) currentMaxUserId = maxRecord.userId;
    } catch {}

    async function safeUpsertUser(address, desiredUserId, sponsorAddress = null, isQualified = false, txHash = null) {
      const existing = await prisma.user.findUnique({ where: { address } });
      if (existing) {
        return await prisma.user.update({
          where: { address },
          data: {
            sponsorAddress: sponsorAddress || existing.sponsorAddress,
            isQualified: isQualified !== undefined ? isQualified : existing.isQualified,
            txHash: txHash || existing.txHash,
          },
        });
      }

      let userIdToUse = desiredUserId;
      const taken = await prisma.user.findUnique({ where: { userId: userIdToUse } });
      if (taken) {
        currentMaxUserId += 1;
        userIdToUse = currentMaxUserId;
      } else {
        if (userIdToUse > currentMaxUserId) currentMaxUserId = userIdToUse;
      }

      return await prisma.user.create({
        data: {
          address,
          userId: userIdToUse,
          sponsorAddress,
          registrationTimestamp: new Date(),
          isQualified,
          txHash,
        },
      });
    }

    // 1. Upsert Protocol Vault User
    await safeUpsertUser(vaultEvm, 0, null, true);

    // 2. Upsert Seat 1 (Founder)
    await safeUpsertUser(seat1Evm, 1, vaultEvm, true, members[0]?.txHash || null);

    // Ensure Seat 1 MatrixSlots exist for 1, 2, 3
    for (let s = 1; s <= 3; s++) {
      const slotPlacements = members.filter((m) => m.slot === s && m.memberNumber > 1);
      await prisma.matrixSlot.upsert({
        where: {
          userAddress_slotNumber: {
            userAddress: seat1Evm,
            slotNumber: s,
          },
        },
        update: {
          isUnlocked: true,
          filledNodes: slotPlacements.length > 14 ? 14 : slotPlacements.length,
          currentCycle: slotPlacements.length >= 14 ? 2 : 1,
          recyclesCount: slotPlacements.length >= 14 ? 1 : 0,
        },
        create: {
          userAddress: seat1Evm,
          slotNumber: s,
          isUnlocked: true,
          currentCycle: slotPlacements.length >= 14 ? 2 : 1,
          recyclesCount: slotPlacements.length >= 14 ? 1 : 0,
          filledNodes: slotPlacements.length > 14 ? 14 : slotPlacements.length,
          unlockedAt: new Date(),
        },
      });
    }

    // 3. Process each member
    let syncedCount = 0;
    for (const m of members) {
      if (m.memberNumber === 1) continue; // Seat 1 already handled

      const mAddr = m.evm.toLowerCase();
      const sAddr = (m.sponsor || seat1Evm).toLowerCase();

      // Upsert User
      await safeUpsertUser(mAddr, m.memberNumber, sAddr, m.memberNumber === 2 || m.memberNumber === 3, m.txHash);

      // Upsert MatrixSlot for user
      await prisma.matrixSlot.upsert({
        where: {
          userAddress_slotNumber: {
            userAddress: mAddr,
            slotNumber: m.slot || 1,
          },
        },
        update: {
          isUnlocked: true,
          txHash: m.txHash,
        },
        create: {
          userAddress: mAddr,
          slotNumber: m.slot || 1,
          isUnlocked: true,
          unlockedAt: new Date(m.timestamp || Date.now()),
          txHash: m.txHash,
        },
      });

      // Calculate position within slot board (1 to 14)
      const slotMembers = members.filter((x) => x.slot === m.slot && x.memberNumber > 1);
      const position = ((slotMembers.findIndex((x) => x.memberNumber === m.memberNumber)) % 14) + 1;
      const payoutType = payoutTypeMap[position] || "OWNER_DIRECT";

      let recipientAddress = seat1Evm;
      if (position === 1 || position === 2) {
        recipientAddress = vaultEvm; // Uplines above Seat 1 route to Vault
      } else if (position === 4 || position === 5 || position === 14) {
        recipientAddress = vaultEvm; // Protocol Pools
      } else if (position === 7) {
        recipientAddress = members.find((x) => x.memberNumber === 2)?.evm.toLowerCase() || seat1Evm;
      } else if (position === 10) {
        recipientAddress = members.find((x) => x.memberNumber === 3)?.evm.toLowerCase() || seat1Evm;
      } else if (position === 13) {
        recipientAddress = members.find((x) => x.memberNumber === 4)?.evm.toLowerCase() || seat1Evm;
      }

      // Record MatrixPlacement
      const placementId = `placement-${m.slot}-${position}-${m.memberNumber}`;
      await prisma.matrixPlacement.upsert({
        where: { id: placementId },
        update: {},
        create: {
          id: placementId,
          matrixOwnerAddress: seat1Evm,
          placedUserAddress: mAddr,
          slotNumber: m.slot || 1,
          position,
          cycle: 1,
          payoutType,
          recipientAddress,
          amount: 945.179584,
          txHash: m.txHash || `0xmocktx_${m.memberNumber}`,
          blockNumber: BigInt(1000 + m.memberNumber),
          timestamp: new Date(m.timestamp || Date.now()),
        },
      });

      // Activity Feed entry
      try {
        await prisma.matrixActivity.create({
          data: {
            userAddress: mAddr,
            action: "MEMBER_JOINED",
            title: `Member Joined Slot ${m.slot || 1}`,
            description: `Position ${position} filled by ${m.label || "Member " + m.memberNumber} (${payoutType})`,
            slotNumber: m.slot || 1,
            amount: 945.179584,
            txHash: m.txHash || "",
            timestamp: new Date(m.timestamp || Date.now()),
          },
        });
      } catch {}

      syncedCount++;
      process.stdout.write(`.` + (syncedCount % 10 === 0 ? ` (${syncedCount}/${members.length - 1})\n` : ""));
    }

    console.log(`\n\n✅ PRISMA DATABASE SYNC COMPLETE!`);
    console.log(`   - Synced ${syncedCount} Members, Slots & Placements into PostgreSQL.`);
  } catch (err) {
    console.error("❌ Prisma sync failed:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

syncToPrisma();
