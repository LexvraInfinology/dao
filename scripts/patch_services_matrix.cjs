const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '../packages/services/src/matrix/index.ts');
let content = fs.readFileSync(file, 'utf8');

// 1. In getUserProfile, do not auto-create user on read queries if not found in DB
const targetGetProfile = `      if (!user) {
        return await this.getOrCreateUser(canonicalAddress, sponsorAddress);
      }`;

const replaceGetProfile = `      if (!user) {
        return getFallbackProfile(canonicalAddress);
      }`;

if (content.includes(targetGetProfile)) {
  content = content.replace(targetGetProfile, replaceGetProfile);
  console.log('Patched getUserProfile to not auto-create un-registered users');
} else {
  console.log('Note: targetGetProfile not found or already patched');
}

// 2. In getDashboardOverview, do not auto-create user on read queries if not found in DB
const targetDashboard = `      const user = await this.getOrCreateUser(canonicalAddress);`;
const replaceDashboard = `      let user = await prisma.user.findUnique({
        where: { address: canonicalAddress },
        include: { matrixProfile: true, matrixSettings: true, matrixSlots: true }
      });
      if (!user) {
        return {
          address: canonicalAddress,
          user: getFallbackProfile(canonicalAddress),
          activeSlot: {
            slotNumber: 1,
            filledNodes: 0,
            currentCycle: 1,
            upgradeReserve: 0,
          },
          highestUnlockedSlot: 0,
          level1Count: 0,
          level2Count: 0,
          level3Count: 0,
          nextCommissionTarget: {
            positionNumber: 1,
            title: "Position #1",
            description: "Direct matrix commission distribution",
            reward: "Direct Distribution",
          },
          retopupState: {
            hasCappedSlot: false,
            cappedSlotNumber: null,
            deadline: null,
            hoursRemaining: 0,
            isLocked: false,
          },
          recentActivities: [],
        } as any;
      }`;

if (content.includes(targetDashboard)) {
  content = content.replace(targetDashboard, replaceDashboard);
  console.log('Patched getDashboardOverview to handle unregistered users without writing to DB');
} else {
  console.log('Note: targetDashboard not found or already patched');
}

fs.writeFileSync(file, content, 'utf8');
console.log('Finished updating packages/services/src/matrix/index.ts');

