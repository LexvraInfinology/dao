const path = require('path');
const { PrismaClient } = require(path.resolve(__dirname, '../packages/database/src/generated/client'));

async function test() {
  const p = new PrismaClient();
  try {
    const users = await p.user.findMany({ 
      select: { id: true, address: true, userId: true, createdAt: true },
      orderBy: { userId: 'desc' },
      take: 5 
    });
    console.log('Latest users in DB:', JSON.stringify(users, null, 2));
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await p.$disconnect();
  }
}
test();
