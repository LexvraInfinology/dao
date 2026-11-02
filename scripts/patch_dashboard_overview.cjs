const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '../packages/services/src/matrix/index.ts');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '      const slots = await prisma.matrixSlot.findMany({',
  '      const userProfile = await this.getUserProfile(canonicalAddress);\n      const slots = await prisma.matrixSlot.findMany({'
);

content = content.replace(/user\.totalEarnings/g, 'userProfile.totalEarnings');
content = content.replace(/user\.availableBalance/g, 'userProfile.availableBalance');
content = content.replace(/user\.recyclesCount/g, 'userProfile.recyclesCount');
content = content.replace(/user\.isQualified/g, 'userProfile.isQualified');
content = content.replace(/user\.activeDirectsCount/g, 'userProfile.activeDirectsCount');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed userProfile in getDashboardOverview');

