import { ethers } from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('================================================================');
  console.log('🚀 EQUORADAOV2 MIGRATION SCRIPT (GENUINE MEMBERS & RESERVATIONS)');
  console.log('================================================================\n');

  const contractAddress = process.env.EQUORA_DAO_V2_ADDRESS;
  if (!contractAddress) {
    console.error('❌ Please set EQUORA_DAO_V2_ADDRESS in your environment or command line.');
    process.exit(1);
  }

  const manifestPath = path.resolve(__dirname, '../../../scratch/migration_manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.error('❌ Migration manifest not found at:', manifestPath);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const genuineMembers = manifest.genuineMembers || [];
  const underfunded = manifest.underfundedReservations || [];

  console.log(`Loaded ${genuineMembers.length} genuine members and ${underfunded.length} underfunded reservations.`);

  const [deployer] = await ethers.getSigners();
  console.log(`Deployer / Admin: ${deployer.address}`);

  const daoV2 = await ethers.getContractAt('EquoraDAOv2', contractAddress, deployer);

  // 1. Migrate genuine members in batches of 25
  const BATCH_SIZE = 25;
  for (let i = 0; i < genuineMembers.length; i += BATCH_SIZE) {
    const chunk = genuineMembers.slice(i, i + BATCH_SIZE);
    const addrs = chunk.map((m: any) => m.address);
    const positions = chunk.map((m: any) => m.position);
    const earnings = chunk.map((m: any) => {
      const val = parseFloat(m.pushedAmountBtt || '0');
      return Math.round(val * 1e6); // 6 decimals for native TROB Sun
    });

    console.log(`Migrating batch ${Math.floor(i / BATCH_SIZE) + 1} (${chunk.length} members, seats #${positions[0]} to #${positions[positions.length - 1]})...`);
    const tx = await daoV2.migrateGenuineMembers(addrs, positions, earnings);
    console.log(`  Tx broadcast: ${tx.hash}. Waiting confirmation...`);
    await tx.wait(1);
    console.log(`  ✅ Batch confirmed!`);
  }

  // 2. Set underfunded reservations for the 8 wallets
  if (underfunded.length > 0) {
    console.log(`\nSetting ${underfunded.length} underfunded reservations with credits...`);
    const uAddrs = underfunded.map((u: any) => u.address);
    const uSeats = underfunded.map((u: any) => u.position);
    const uDeposits = underfunded.map((u: any) => {
      const btt = parseFloat(u.entryAmountBtt || '1.5');
      return Math.round(btt * 1e6); // 1.5 TROB = 1,500,000 Sun
    });

    const resTx = await daoV2.setUnderfundedReservations(uAddrs, uSeats, uDeposits);
    console.log(`  Tx broadcast: ${resTx.hash}. Waiting confirmation...`);
    await resTx.wait(1);
    console.log(`  ✅ All 8 reservations successfully configured on-chain!`);
  }

  // 3. Finalize migration
  console.log(`\nFinalizing migration...`);
  const finTx = await daoV2.finalizeMigration();
  await finTx.wait(1);
  console.log(`  ✅ Migration permanently finalized!`);

  console.log('\n================================================================');
  console.log('🎉 MIGRATION COMPLETE! ALL 84 GENUINE MEMBERS ACTIVATED.');
  console.log('================================================================');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
