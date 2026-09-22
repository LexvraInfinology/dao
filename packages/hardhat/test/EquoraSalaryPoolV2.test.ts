import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import {
  MockToken,
  EquoraRegistry,
  EquoraVault,
  EquoraSalaryPool,
  EquoraRewardPool,
} from "../typechain-types";

describe("EquoraSalaryPool — Restructured 10/15/25/50 Exclusive Tiers", () => {
  let owner: SignerWithAddress;
  let root: SignerWithAddress;
  let uAlpha: SignerWithAddress;
  let uPrime: SignerWithAddress;
  let uElite: SignerWithAddress;
  let uCrown: SignerWithAddress;

  let token: MockToken;
  let registry: EquoraRegistry;
  let vault: EquoraVault;
  let salaryPool: EquoraSalaryPool;
  let rewardPool: EquoraRewardPool;

  beforeEach(async () => {
    [owner, root, uAlpha, uPrime, uElite, uCrown] = await ethers.getSigners();

    token = (await ethers.deployContract("MockToken")) as MockToken;
    registry = (await ethers.deployContract("EquoraRegistry", [root.address])) as EquoraRegistry;
    vault = (await ethers.deployContract("EquoraVault", [await token.getAddress(), await registry.getAddress()])) as EquoraVault;
    salaryPool = (await ethers.deployContract("EquoraSalaryPool", [await token.getAddress(), await vault.getAddress()])) as EquoraSalaryPool;
    rewardPool = (await ethers.deployContract("EquoraRewardPool", [await token.getAddress(), await vault.getAddress()])) as EquoraRewardPool;

    await salaryPool.setRewardPool(await rewardPool.getAddress());
    await rewardPool.setAuthorizedCaller(await salaryPool.getAddress());

    // Mint tokens to salaryPool for payouts (max 10,000 per mint in MockToken)
    for (let i = 0; i < 5; i++) {
      await token.mint(await salaryPool.getAddress(), ethers.parseEther("10000"));
    }

    // Fund vault address with ETH for impersonated calls
    await ethers.provider.send("hardhat_setBalance", [await vault.getAddress(), "0x1000000000000000000"]);
  });

  async function impersonateVaultCredit(user: string, count: number, depositAmount = 0n) {
    const vaultAddr = await vault.getAddress();
    await ethers.provider.send("hardhat_setBalance", [vaultAddr, "0x1000000000000000000"]);
    const vaultSigner = await ethers.getImpersonatedSigner(vaultAddr);

    for (let i = 0; i < count; i++) {
      await salaryPool.connect(vaultSigner).creditUser(user, depositAmount);
    }
  }

  async function advanceToDay11() {
    // Fast forward to day 11 of month
    const block = await ethers.provider.getBlock("latest");
    const now = block!.timestamp;
    const SECONDS_PER_DAY = 86400;

    // Advance 30 days plus enough to ensure day 11 UTC
    await ethers.provider.send("evm_increaseTime", [30 * SECONDS_PER_DAY]);
    await ethers.provider.send("evm_mine", []);

    // Get current day of month
    const newBlock = await ethers.provider.getBlock("latest");
    const currentTimestamp = newBlock!.timestamp;
    
    // Proleptic Gregorian calculation to find offset to day 11
    const z = Math.floor(currentTimestamp / SECONDS_PER_DAY) + 719468;
    const era = Math.floor(z / 146097);
    const doe = z - era * 146097;
    const yoe = Math.floor((doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365);
    const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
    const mp = Math.floor((5 * doy + 2) / 153);
    const day = doy - Math.floor((153 * mp + 2) / 5) + 1;

    if (day < 11) {
      await ethers.provider.send("evm_increaseTime", [(11 - day) * SECONDS_PER_DAY]);
      await ethers.provider.send("evm_mine", []);
    }
  }

  describe("Exclusive Tier Promotions", () => {
    it("should place user in Alpha (42) and remove from lower tiers", async () => {
      await impersonateVaultCredit(uAlpha.address, 42);

      expect(await salaryPool.getUserTier(uAlpha.address)).to.equal(1); // ALPHA
      expect(await salaryPool.inAlpha(uAlpha.address)).to.be.true;

      const [alpha, prime, elite, crown] = await salaryPool.getPoolCounts();
      expect(alpha).to.equal(1n);
      expect(prime).to.equal(0n);
      expect(elite).to.equal(0n);
      expect(crown).to.equal(0n);
    });

    it("should promote user to Prime (84) and remove from Alpha array", async () => {
      await impersonateVaultCredit(uPrime.address, 84);

      expect(await salaryPool.getUserTier(uPrime.address)).to.equal(2); // PRIME
      expect(await salaryPool.inPrime(uPrime.address)).to.be.true;
      expect(await salaryPool.inAlpha(uPrime.address)).to.be.false;

      const [alpha, prime, elite, crown] = await salaryPool.getPoolCounts();
      expect(alpha).to.equal(0n); // Removed from Alpha!
      expect(prime).to.equal(1n);
      expect(elite).to.equal(0n);
      expect(crown).to.equal(0n);
    });

    it("should promote user through Elite (126) and Crown (168) exclusively", async () => {
      await impersonateVaultCredit(uCrown.address, 168);

      expect(await salaryPool.getUserTier(uCrown.address)).to.equal(4); // CROWN
      expect(await salaryPool.inCrown(uCrown.address)).to.be.true;
      expect(await salaryPool.inElite(uCrown.address)).to.be.false;
      expect(await salaryPool.inPrime(uCrown.address)).to.be.false;
      expect(await salaryPool.inAlpha(uCrown.address)).to.be.false;

      const [alpha, prime, elite, crown] = await salaryPool.getPoolCounts();
      expect(alpha).to.equal(0n);
      expect(prime).to.equal(0n);
      expect(elite).to.equal(0n);
      expect(crown).to.equal(1n);
    });
  });

  describe("Monthly Settlement with 10% / 15% / 25% / 50% Exclusive Payouts", () => {
    it("should distribute exact shares: 10% Alpha, 15% Prime, 25% Elite, 50% Crown", async () => {
      // 1. Setup 1 member per tier
      await impersonateVaultCredit(uAlpha.address, 42);
      await impersonateVaultCredit(uPrime.address, 84);
      await impersonateVaultCredit(uElite.address, 126);
      await impersonateVaultCredit(uCrown.address, 168);

      // 2. Deposit 10,000 TROB into salary pool via vault
      const vaultAddr = await vault.getAddress();
      const vaultSigner = await ethers.getImpersonatedSigner(vaultAddr);
      await salaryPool.connect(vaultSigner).receivePoolDeposit(ethers.parseEther("10000"));

      expect(await salaryPool.pendingPoolBalance()).to.equal(ethers.parseEther("10000"));

      // 3. Fast-forward to settlement day
      await advanceToDay11();

      // 4. Settle monthly
      await salaryPool.settleMonthly();

      // 5. Verify exact payouts:
      // Alpha: 10% of 10,000 = 1,000 TROB
      // Prime: 15% of 10,000 = 1,500 TROB
      // Elite: 25% of 10,000 = 2,500 TROB
      // Crown: 50% of 10,000 = 5,000 TROB
      expect(await salaryPool.getClaimable(uAlpha.address)).to.equal(ethers.parseEther("1000"));
      expect(await salaryPool.getClaimable(uPrime.address)).to.equal(ethers.parseEther("1500"));
      expect(await salaryPool.getClaimable(uElite.address)).to.equal(ethers.parseEther("2500"));
      expect(await salaryPool.getClaimable(uCrown.address)).to.equal(ethers.parseEther("5000"));

      // 6. User claims salary
      await salaryPool.connect(uCrown).claimSalary();
      expect(await salaryPool.getClaimable(uCrown.address)).to.equal(0n);
      expect(await salaryPool.totalSalaryClaimed(uCrown.address)).to.equal(ethers.parseEther("5000"));
    });
  });

  describe("Zero-Achiever Strategy & Waterfall Cascades", () => {
    it("should rollover 100% of funds when zero achievers exist platform-wide", async () => {
      const vaultAddr = await vault.getAddress();
      const vaultSigner = await ethers.getImpersonatedSigner(vaultAddr);
      await salaryPool.connect(vaultSigner).receivePoolDeposit(ethers.parseEther("5000"));

      // Zero users have reached milestone 42
      await advanceToDay11();

      // Settlement fires
      await expect(salaryPool.settleMonthly())
        .to.emit(salaryPool, "MonthlySettlementRollover")
        .withArgs(ethers.parseEther("5000"), (await ethers.provider.getBlock("latest"))!.timestamp + 1);

      // Pending balance is NOT wiped -> carried over!
      expect(await salaryPool.pendingPoolBalance()).to.equal(ethers.parseEther("5000"));
    });

    it("should cascade Crown (50%), Elite (25%), Prime (15%) down to Alpha when only Alpha exists", async () => {
      await impersonateVaultCredit(uAlpha.address, 42);

      const vaultAddr = await vault.getAddress();
      const vaultSigner = await ethers.getImpersonatedSigner(vaultAddr);
      await salaryPool.connect(vaultSigner).receivePoolDeposit(ethers.parseEther("10000"));

      await advanceToDay11();
      await salaryPool.settleMonthly();

      // Alpha receives 10% + 15% + 25% + 50% = 100% of 10,000 TROB
      expect(await salaryPool.getClaimable(uAlpha.address)).to.equal(ethers.parseEther("10000"));
    });

    it("should cascade Crown (50%) to Elite when Crown is empty", async () => {
      await impersonateVaultCredit(uAlpha.address, 42);
      await impersonateVaultCredit(uPrime.address, 84);
      await impersonateVaultCredit(uElite.address, 126);

      const vaultAddr = await vault.getAddress();
      const vaultSigner = await ethers.getImpersonatedSigner(vaultAddr);
      await salaryPool.connect(vaultSigner).receivePoolDeposit(ethers.parseEther("10000"));

      await advanceToDay11();
      await salaryPool.settleMonthly();

      // Alpha = 10% (1,000 TROB)
      // Prime = 15% (1,500 TROB)
      // Elite = 25% + 50% (Crown cascade) = 75% (7,500 TROB)
      expect(await salaryPool.getClaimable(uAlpha.address)).to.equal(ethers.parseEther("1000"));
      expect(await salaryPool.getClaimable(uPrime.address)).to.equal(ethers.parseEther("1500"));
      expect(await salaryPool.getClaimable(uElite.address)).to.equal(ethers.parseEther("7500"));
    });
  });
});
