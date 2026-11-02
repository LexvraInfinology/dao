const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '../packages/services/src/matrix/index.ts');
let content = fs.readFileSync(file, 'utf8');

// Remove duplicate in getUserSlots
content = content.replace(
  '      const userProfile = await this.getUserProfile(canonicalAddress);\n      const userProfile = await this.getUserProfile(canonicalAddress);\n      const slots = await prisma.matrixSlot.findMany({',
  '      const slots = await prisma.matrixSlot.findMany({'
);

// Insert in getDashboardOverview
content = content.replace(
  '      const slots = await prisma.matrixSlot.findMany({\n        where: { userAddress: canonicalAddress, isUnlocked: true },',
  '      const userProfile = await this.getUserProfile(canonicalAddress);\n      const slots = await prisma.matrixSlot.findMany({\n        where: { userAddress: canonicalAddress, isUnlocked: true },'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed lines in packages/services/src/matrix/index.ts');
