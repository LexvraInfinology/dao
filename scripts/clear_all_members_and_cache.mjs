import fs from 'fs';
import path from 'path';

const DB_URL = "postgresql://neondb_owner:npg_VzZWl5Td8gxf@ep-super-heart-ax2fet8a.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require";

function getNeonSqlEndpoint(url) {
  const match = url.match(/@([^/:]+)/);
  return match && match[1] ? `https://${match[1]}/sql` : '';
}

async function queryNeon(sql, params = []) {
  const endpoint = getNeonSqlEndpoint(DB_URL);
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Neon-Connection-String': DB_URL,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql, params }),
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return await res.json();
}

async function main() {
  console.log('===============================================================');
  console.log('EQUORA DAO: CLEARING ALL 100 MEMBERS & ALL CACHES');
  console.log('===============================================================\n');

  // 1. Clear DaoMember
  console.log('1. Clearing "DaoMember"...');
  const resMembers = await queryNeon(`DELETE FROM "DaoMember"`);
  console.log(`   Deleted ${resMembers.rowCount ?? 0} members.`);

  // 2. Clear DaoEvent
  console.log('2. Clearing "DaoEvent"...');
  const resEvents = await queryNeon(`DELETE FROM "DaoEvent"`);
  console.log(`   Deleted ${resEvents.rowCount ?? 0} event transactions.`);

  // 3. Clear PullFallbackClaim
  console.log('3. Clearing "PullFallbackClaim"...');
  const resFallback = await queryNeon(`DELETE FROM "PullFallbackClaim"`);
  console.log(`   Deleted ${resFallback.rowCount ?? 0} claims.`);

  // 4. Clear whatsapp_verifications
  console.log('4. Clearing "whatsapp_verifications"...');
  const resWa = await queryNeon(`DELETE FROM whatsapp_verifications`);
  console.log(`   Deleted ${resWa.rowCount ?? 0} WhatsApp verification records.`);

  // 5. Clear DaoProposal & DaoVote if any
  try {
    console.log('5. Clearing proposals and votes...');
    await queryNeon(`DELETE FROM "DaoVote"`);
    await queryNeon(`DELETE FROM "DaoProposal"`);
  } catch (e) {
    console.log('   Note:', e.message);
  }

  // 6. Reset DaoInstance
  console.log('6. Resetting "DaoInstance"...');
  try {
    await queryNeon(`
      UPDATE "DaoInstance"
      SET "totalDistributedBtt" = 0,
          "isClosed" = false,
          "closedAt" = null,
          "updatedAt" = NOW()
    `);
  } catch (e) {
    console.log('   DaoInstance note:', e.message);
  }

  // 7. Verify zero members left in DB
  const checkMembers = await queryNeon(`SELECT count(*) as count FROM "DaoMember"`);
  const checkActive = await queryNeon(`SELECT count(*) as count FROM "DaoMember" WHERE LOWER(status) IN ('active', 'capped')`);
  console.log(`\nVerified DB: ${checkMembers.rows[0].count} total DaoMembers, ${checkActive.rows[0].count} active members.`);

  // 8. Clear Next.js disk cache
  console.log('\n7. Clearing Next.js caches (.next/cache)...');
  const nextCacheDirs = [
    path.resolve(process.cwd(), 'apps', 'web-dao', '.next', 'cache'),
  ];

  for (const cacheDir of nextCacheDirs) {
    if (fs.existsSync(cacheDir)) {
      try {
        fs.rmSync(cacheDir, { recursive: true, force: true });
        console.log(`   Cleaned cache directory: ${cacheDir}`);
      } catch (err) {
        console.log(`   Could not clean ${cacheDir} (might be locked by running process): ${err.message}`);
      }
    }
  }

  // 9. Remove generated subwallets artifact if present
  const subwalletsPath = path.resolve(process.cwd(), 'scripts', 'dao_100_subwallets.json');
  if (fs.existsSync(subwalletsPath)) {
    fs.unlinkSync(subwalletsPath);
    console.log('8. Removed scripts/dao_100_subwallets.json cache.');
  }

  console.log('\n===============================================================');
  console.log('>>> ALL 100 MEMBERS AND CACHES CLEARED SUCCESSFULLY!');
  console.log('===============================================================');
}

main().catch(console.error);
