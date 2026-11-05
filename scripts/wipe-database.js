const { PrismaClient } = require("../packages/database/src/generated/client");
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Wiping entire database (testnet schema)...");
  try {
    const tables = await prisma.$queryRawUnsafe(`
      SELECT tablename FROM pg_tables WHERE schemaname = 'testnet';
    `);
    console.log(`Found ${tables.length} tables in testnet schema:`, tables.map((t) => t.tablename));

    if (tables.length > 0) {
      // Exclude _prisma_migrations so migrations history is preserved if present
      const targetTables = tables
        .filter((t) => t.tablename !== "_prisma_migrations")
        .map((t) => `"testnet"."${t.tablename}"`)
        .join(", ");

      if (targetTables.length > 0) {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${targetTables} RESTART IDENTITY CASCADE;`);
        console.log("✅ Successfully truncated all tables in testnet schema!");
      }
    }

    const userCount = await prisma.user.count();
    const daoCount = await prisma.daoMember.count();
    const matrixSlotsCount = await prisma.matrixSlot.count();
    const cursorCount = await prisma.indexerCursor.count();

    console.log("📊 Verification:");
    console.log(`   Users:        ${userCount}`);
    console.log(`   DaoMembers:   ${daoCount}`);
    console.log(`   MatrixSlots:  ${matrixSlotsCount}`);
    console.log(`   Cursors:      ${cursorCount}`);
  } catch (err) {
    console.error("❌ Failed to wipe database:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
