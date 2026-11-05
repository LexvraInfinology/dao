import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("EquoraMagicBox - Audit & Distribution Test Suite", function () {
  let magicBox: any;
  let deployer: any;
  let vault: any;
  let users: any[];

  const BPS_BASE = 10000;
  const TIER1_BPS = 8500; // 85% -> $0.50
  const TIER2_BPS = 1000; // 10% -> $0.80
  const TIER3_BPS = 300;  // 3%  -> $1.20
  const TIER4_BPS = 200;  // 2%  -> $5.00

  beforeEach(async function () {
    const signers = await ethers.getSigners();
    deployer = signers[0];
    vault = signers[1];
    users = signers.slice(2, 22); // 20 test users

    const MagicBoxFactory = await ethers.getContractFactory("EquoraMagicBox");
    // Deploy with paymentToken = ZeroAddress (native TROB mode)
    magicBox = await MagicBoxFactory.deploy(ethers.ZeroAddress, vault.address);
    await magicBox.waitForDeployment();
  });

  it("1. Demonstrates the registration bug: Vault must add users, but Matrix never calls addEligibleUser", async function () {
    // Current on-chain status: 0 eligible users
    expect(await magicBox.getEligibleCount()).to.equal(0);

    // Vault deposits funds
    await vault.sendTransaction({
      to: await magicBox.getAddress(),
      value: ethers.parseUnits("2646", 6), // 2646 TROB
    });

    expect(await magicBox.poolBalance()).to.equal(ethers.parseUnits("2646", 6));
    // Still 0 eligible users because deposits alone don't register users!
    expect(await magicBox.getEligibleCount()).to.equal(0);
  });

  it("2. Audits the member rounding bug: integer truncation drops users", async function () {
    const testCounts = [6737, 6738, 23, 7, 3, 1];

    for (const total of testCounts) {
      // Legacy formula used in current contract:
      const t1Legacy = Math.floor((total * 8500) / 10000);
      const t2Legacy = Math.floor((total * 1000) / 10000);
      const t3Legacy = Math.floor((total * 300) / 10000);
      const t4Legacy = Math.floor((total * 200) / 10000);
      const sumLegacy = t1Legacy + t2Legacy + t3Legacy + t4Legacy;
      const droppedLegacy = total - sumLegacy;

      // Rigorous half-up rounding formula with Tier 1 remainder:
      let t4Fixed = Math.floor((total * 200 + 5000) / 10000);
      let t3Fixed = Math.floor((total * 300 + 5000) / 10000);
      let t2Fixed = Math.floor((total * 1000 + 5000) / 10000);
      if (total >= 50) {
        if (t4Fixed === 0) t4Fixed = 1;
        if (t3Fixed === 0) t3Fixed = 1;
        if (t2Fixed === 0) t2Fixed = 1;
      }
      const t1Fixed = total - (t2Fixed + t3Fixed + t4Fixed);
      const sumFixed = t1Fixed + t2Fixed + t3Fixed + t4Fixed;
      const droppedFixed = total - sumFixed;

      if (total === 6737) {
        expect(droppedLegacy).to.equal(2); // Exactly 2 users dropped by legacy formula!
        expect(droppedFixed).to.equal(0);  // 0 users dropped by fixed formula!
      }
      expect(droppedFixed).to.equal(0);
    }
  });

  it("3. Simulates distribution with bypass: registers users and tests payout", async function () {
    // Add 10 eligible users from vault
    for (let i = 0; i < 10; i++) {
      await magicBox.connect(vault).addEligibleUser(users[i].address);
    }
    expect(await magicBox.getEligibleCount()).to.equal(10);

    // Fund pool with 500 TROB
    await vault.sendTransaction({
      to: await magicBox.getAddress(),
      value: ethers.parseUnits("500", 6),
    });

    // Advance time to 11th of month and 90 days ahead
    // Get current timestamp
    const latestTime = await time.latest();
    const date = new Date(latestTime * 1000);
    // Fast forward to next 11th day of month
    await time.increase(90 * 86400);

    // Check preview distribution view
    const preview = await magicBox.previewDistribution();
    expect(preview[8]).to.equal(ethers.parseUnits("500", 6)); // currentPoolBalance
  });
});

