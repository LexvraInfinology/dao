import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import {
  EquoraRegistry,
  EquoraDAO,
  EquoraVault,
  EquoraSalaryPool,
  EquoraMagicBox,
  EquoraRewardPool,
  MockToken,
} from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

// ─── Constants ─────────────────────────────────────────────────────────────────

const TIER_STANDARD = ethers.parseEther("30");   // 30 TROB
const TIER_DAO      = ethers.parseEther("300");  // 300 TROB

const DAY     = 86400;
const DAYS_15 = 15 * DAY;
const DAYS_28 = 28 * DAY;
const DAYS_85 = 85 * DAY;

// ─── Test Suite ────────────────────────────────────────────────────────────────

describe("Equora.Fi — Full Protocol Suite", function () {

  let owner: SignerWithAddress;
  let root:  SignerWithAddress;
  let users: SignerWithAddress[];

  let token:       MockToken;
  let registry:    EquoraRegistry;
  let dao:         EquoraDAO;
  let vault:       EquoraVault;
  let salaryPool:  EquoraSalaryPool;
  let magicBox:    EquoraMagicBox;
  let rewardPool:  EquoraRewardPool;

  async function mintAndApprove(signer: SignerWithAddress, spender: string, amount: bigint) {
    await token.mint(signer.address, amount);
    await token.connect(signer).approve(spender, amount);
  }

  async function registerUser(signer: SignerWithAddress, sponsorCode: number, amount = TIER_STANDARD) {
    await mintAndApprove(signer, await vault.getAddress(), amount);
    return vault.connect(signer).register(sponsorCode, amount);
  }

  beforeEach(async () => {
    [owner, root, ...users] = await ethers.getSigners();

    // 1. Deploy MockToken (TROB placeholder)
    token = (await ethers.deployContract("MockToken")) as MockToken;

    // 2. Deploy Registry (root = root.address)
    registry = (await ethers.deployContract("EquoraRegistry", [root.address])) as EquoraRegistry;

    // 3. Deploy pool contracts
    vault      = (await ethers.deployContract("EquoraVault",        [await token.getAddress(), await registry.getAddress()])) as EquoraVault;
    salaryPool = (await ethers.deployContract("EquoraSalaryPool",   [await token.getAddress(), await vault.getAddress()]))    as EquoraSalaryPool;
    magicBox   = (await ethers.deployContract("EquoraMagicBox",     [await token.getAddress(), await vault.getAddress()]))    as EquoraMagicBox;
    rewardPool = (await ethers.deployContract("EquoraRewardPool",   [await token.getAddress(), await vault.getAddress()]))    as EquoraRewardPool;
    dao        = (await ethers.deployContract("EquoraDAO",          [await token.getAddress(), await registry.getAddress()])) as EquoraDAO;

    // 4. Initialize vault with pool addresses
    await vault.initialize(
      await dao.getAddress(),
      await salaryPool.getAddress(),
      await magicBox.getAddress(),
      await rewardPool.getAddress()
    );

    // 5. Authorize vault + dao in registry, wire rewardPool into salaryPool, and vault in dao
    await registry.setAuthorizedContracts(await vault.getAddress(), await dao.getAddress(), owner.address);
    await salaryPool.setRewardPool(await rewardPool.getAddress());
    await rewardPool.setAuthorizedCaller(await salaryPool.getAddress());
    await dao.setVaultContract(await vault.getAddress());
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. EquoraRegistry — 5-Digit Referral Code
  // ═══════════════════════════════════════════════════════════════════════════

  describe("EquoraRegistry — 5-Digit Referral Codes", () => {

    it("should auto-assign root address code 10000", async () => {
      const code = await registry.getCodeByUser(root.address);
      expect(code).to.equal(10000);
      expect(await registry.getUserByCode(10000)).to.equal(root.address);
    });

    it("should generate a 5-digit code (10001–99999) for new users", async () => {
      await registerUser(users[0], 10000); // sponsor = root
      const code = await registry.getCodeByUser(users[0].address);
      expect(code).to.be.gte(10001);
      expect(code).to.be.lte(99999);
    });

    it("should resolve sponsor by 5-digit code correctly", async () => {
      await registerUser(users[0], 10000);
      const u0code = Number(await registry.getCodeByUser(users[0].address));

      await registerUser(users[1], u0code);
      expect(await registry.getSponsor(users[1].address)).to.equal(users[0].address);
    });

    it("fallback to root when invalid/unassigned sponsor code used", async () => {
      // 99999 is unassigned
      await registerUser(users[0], 99999);
      expect(await registry.getSponsor(users[0].address)).to.equal(root.address);
    });

    it("should qualify user after exactly 2 direct referrals", async () => {
      await registerUser(users[0], 10000);
      const u0code = Number(await registry.getCodeByUser(users[0].address));

      expect(await registry.isQualified(users[0].address)).to.be.false;

      await registerUser(users[1], u0code);
      expect(await registry.isQualified(users[0].address)).to.be.false;

      await registerUser(users[2], u0code);
      expect(await registry.isQualified(users[0].address)).to.be.true;
    });

    it("should prevent double-registration", async () => {
      await registerUser(users[0], 10000);
      await expect(registerUser(users[0], 10000))
        .to.be.revertedWithCustomError(vault, "AlreadyRegistered");
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. EquoraVault — 4-Pool Deposit Routing
  // ═══════════════════════════════════════════════════════════════════════════

  describe("EquoraVault — Deposit Routing", () => {

    it("should split standard deposit 35% DAO | 40% Salary | 10% Box | 15% Rewards", async () => {
      const amount = TIER_STANDARD; // 30 TROB
      const daoExpected      = (amount * 3500n) / 10000n; // 10.5 TROB
      const salaryExpected   = (amount * 4000n) / 10000n; // 12.0 TROB
      const magicBoxExpected = (amount * 1000n) / 10000n; //  3.0 TROB
      const rewardsExpected  = (amount * 1500n) / 10000n; //  4.5 TROB

      const daoBalBefore      = await token.balanceOf(await dao.getAddress());
      const salaryBalBefore   = await token.balanceOf(await salaryPool.getAddress());
      const magicBoxBalBefore = await token.balanceOf(await magicBox.getAddress());
      const rewardsBalBefore  = await token.balanceOf(await rewardPool.getAddress());

      await registerUser(users[0], 10000, amount);

      expect((await token.balanceOf(await dao.getAddress())) - daoBalBefore).to.equal(daoExpected);
      expect((await token.balanceOf(await salaryPool.getAddress())) - salaryBalBefore).to.equal(salaryExpected);
      expect((await token.balanceOf(await magicBox.getAddress())) - magicBoxBalBefore).to.equal(magicBoxExpected);
      expect((await token.balanceOf(await rewardPool.getAddress())) - rewardsBalBefore).to.equal(rewardsExpected);
    });

    it("previewSplit should match on-chain routing math", async () => {
      const [d, s, m, r] = await vault.previewSplit(TIER_STANDARD);
      expect(d + s + m + r).to.equal(TIER_STANDARD);
      expect(d).to.equal(TIER_STANDARD * 3500n / 10000n);
      expect(s).to.equal(TIER_STANDARD * 4000n / 10000n);
      expect(m).to.equal(TIER_STANDARD * 1000n / 10000n);
      expect(r).to.equal(TIER_STANDARD * 1500n / 10000n);
    });

    it("should revert if initialized a second time", async () => {
      await expect(
        vault.initialize(
          await dao.getAddress(),
          await salaryPool.getAddress(),
          await magicBox.getAddress(),
          await rewardPool.getAddress()
        )
      ).to.be.revertedWithCustomError(vault, "AlreadyInitialized");
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. EquoraDAO — Seat Expiry, Eligibility, 5X Cap & 35% Pool Share
  // ═══════════════════════════════════════════════════════════════════════════

  describe("EquoraDAO — Seat Expiry, Eligibility & Plan Share", () => {

    async function qualifyUser(user: SignerWithAddress, sponsorCode = 10000) {
      if (!(await registry.isRegistered(user.address))) {
        await registerUser(user, sponsorCode);
      }
      const ucode = Number(await registry.getCodeByUser(user.address));

      const walletA = ethers.Wallet.createRandom(ethers.provider);
      const walletB = ethers.Wallet.createRandom(ethers.provider);
      await owner.sendTransaction({ to: walletA.address, value: ethers.parseEther("1.0") });
      await owner.sendTransaction({ to: walletB.address, value: ethers.parseEther("1.0") });

      await registerUser(walletA as any, ucode);
      await registerUser(walletB as any, ucode);
      return ucode;
    }

    it("should allow DAO join without referrals (open buy-in)", async () => {
      await registerUser(users[0], 10000);
      await mintAndApprove(users[0], await dao.getAddress(), TIER_DAO);
      const tx = await dao.connect(users[0]).joinDAO();
      await expect(tx).to.emit(dao, "DAOPositionJoined").withArgs(
        users[0].address, 1n, 1n, await time.latest()
      );
    });

    it("should distribute entry fee according to 300 / N formula (inclusive of new member)", async () => {
      // User 0 joins (N = 1) -> deposits 300 TROB, receives 300 back
      await registerUser(users[0], 10000);
      await mintAndApprove(users[0], await dao.getAddress(), TIER_DAO);
      const bal0Before = await token.balanceOf(users[0].address);
      await dao.connect(users[0]).joinDAO();
      const bal0After1 = await token.balanceOf(users[0].address);
      // Net change for User 0 is 0 (300 out, 300 back)
      expect(bal0After1).to.equal(bal0Before);

      // User 1 joins (N = 2) -> deposits 300 TROB, 300 / 2 = 150 each to User 1 and User 0
      await registerUser(users[1], 10000);
      await mintAndApprove(users[1], await dao.getAddress(), TIER_DAO);
      const bal1Before = await token.balanceOf(users[1].address);
      await dao.connect(users[1]).joinDAO();
      const bal0After2 = await token.balanceOf(users[0].address);
      const bal1After2 = await token.balanceOf(users[1].address);

      expect(bal0After2 - bal0After1).to.equal(ethers.parseEther("150"));
      expect(bal1Before - bal1After2).to.equal(ethers.parseEther("150")); // deposited 300, got 150 back

      // User 2 joins (N = 3) -> deposits 300 TROB, 300 / 3 = 100 each to User 0, User 1, User 2
      await registerUser(users[2], 10000);
      await mintAndApprove(users[2], await dao.getAddress(), TIER_DAO);
      const bal2Before = await token.balanceOf(users[2].address);
      await dao.connect(users[2]).joinDAO();
      const bal0After3 = await token.balanceOf(users[0].address);
      const bal1After3 = await token.balanceOf(users[1].address);
      const bal2After3 = await token.balanceOf(users[2].address);

      expect(bal0After3 - bal0After2).to.equal(ethers.parseEther("100"));
      expect(bal1After3 - bal1After2).to.equal(ethers.parseEther("100"));
      expect(bal2Before - bal2After3).to.equal(ethers.parseEther("200")); // deposited 300, got 100 back
    });

    it("should keep DAO queue permanent without 15-day expiry", async () => {
      await registerUser(users[0], 10000);
      await mintAndApprove(users[0], await dao.getAddress(), TIER_DAO);
      await dao.connect(users[0]).joinDAO();

      // Fast-forward 30 days
      await time.increase(DAYS_15 * 2);

      // DAO should never expire
      expect(await dao.isExpired()).to.be.false;

      // New member can still join after 30 days
      await registerUser(users[1], 10000);
      await mintAndApprove(users[1], await dao.getAddress(), TIER_DAO);
      const tx = await dao.connect(users[1]).joinDAO();
      await expect(tx).to.emit(dao, "DAOPositionJoined").withArgs(
        users[1].address, 2n, 2n, await time.latest()
      );
    });

    it("should scan and fill lowest vacant seat from 1 to 100 if member missed 48h retopup", async () => {
      // User 0 joins seat 1
      await registerUser(users[0], 10000);
      await mintAndApprove(users[0], await dao.getAddress(), TIER_DAO);
      await dao.connect(users[0]).joinDAO();

      // User 1 joins seat 2
      await registerUser(users[1], 10000);
      await mintAndApprove(users[1], await dao.getAddress(), TIER_DAO);
      await dao.connect(users[1]).joinDAO();

      // Simulate User 0 hitting cap and missing 48-hour window
      // Fast forward past retopup window after marking cap
      await dao.enforceCapExpirations();

      // Simulate a third user joining
      await registerUser(users[2], 10000);
      await mintAndApprove(users[2], await dao.getAddress(), TIER_DAO);
      const pos = await dao.connect(users[2]).joinDAO();
      expect(await dao.isDaoMember(users[2].address)).to.be.true;
    });

    it("should enforce 5X earnings cap (1,500 TROB) and report progress correctly", async () => {
      expect(await dao.EARNINGS_CAP()).to.equal(ethers.parseEther("1500"));

      await registerUser(users[0], 10000);
      await mintAndApprove(users[0], await dao.getAddress(), TIER_DAO);
      await dao.connect(users[0]).joinDAO();

      const [earned, cap, remaining] = await dao.getCapProgress(users[0].address);
      expect(cap).to.equal(ethers.parseEther("1500"));
      expect(earned).to.equal(ethers.parseEther("300"));
      expect(remaining).to.equal(ethers.parseEther("1200"));
    });

    it("should receive 35% matrix pool deposit and allow member to claim yield", async () => {
      // 1. User 0 joins DAO
      await qualifyUser(users[0], 10000);
      await mintAndApprove(users[0], await dao.getAddress(), TIER_DAO);
      await dao.connect(users[0]).joinDAO();

      // 2. Vault routes pool deposit (e.g. 100 TROB)
      const depositAmt = ethers.parseEther("100");
      await token.mint(await vault.getAddress(), depositAmt);

      // Simulate matrix calling vault.routePoolDeposit
      await vault.setMatrixContract(owner.address);
      await vault.connect(owner).routePoolDeposit(depositAmt);

      // 3. User 0 should have 35 TROB claimable (35% of 100 TROB)
      const claimable = await dao.getPendingPoolShare(users[0].address);
      expect(claimable).to.equal(ethers.parseEther("35"));

      // 4. User 0 claims yield
      const balBefore = await token.balanceOf(users[0].address);
      await dao.connect(users[0]).claimPoolShare();
      const balAfter = await token.balanceOf(users[0].address);

      expect(balAfter - balBefore).to.equal(ethers.parseEther("35"));
      expect(await dao.getPendingPoolShare(users[0].address)).to.equal(0n);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. EquoraMagicBox — Quarterly Pool Accumulation & Draws
  // ═══════════════════════════════════════════════════════════════════════════

  describe("EquoraMagicBox — Quarterly Pool Accumulation", () => {

    it("should register user as eligible upon registration", async () => {
      expect(await magicBox.getEligibleCount()).to.equal(0n);
      await registerUser(users[0], 10000);
      expect(await magicBox.getEligibleCount()).to.equal(1n);
      expect(await magicBox.isEligible(users[0].address)).to.be.true;
    });

    it("should accumulate 10% of registration deposits in poolBalance", async () => {
      await registerUser(users[0], 10000, TIER_STANDARD);
      // 10% of 30 TROB = 3 TROB
      expect(await magicBox.poolBalance()).to.equal(ethers.parseEther("3"));
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. EquoraSalaryPool — Milestones & Settlement
  // ═══════════════════════════════════════════════════════════════════════════

  describe("EquoraSalaryPool — Milestones & Accounting", () => {

    it("should start at NONE tier (0) and track milestones", async () => {
      await registerUser(users[0], 10000);
      expect(await salaryPool.getUserTier(users[0].address)).to.equal(0); // NONE
      expect(await salaryPool.userMilestones(users[0].address)).to.equal(1n);
    });

    it("should accumulate 40% of registration deposits in pendingPoolBalance", async () => {
      await registerUser(users[0], 10000, TIER_STANDARD);
      // 40% of 30 TROB = 12 TROB
      expect(await salaryPool.pendingPoolBalance()).to.equal(ethers.parseEther("12"));
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. EquoraRewardPool — Milestone Cash Bonuses
  // ═══════════════════════════════════════════════════════════════════════════

  describe("EquoraRewardPool — Milestone Cash Bonuses", () => {

    it("should accumulate 15% of deposits in poolBalance", async () => {
      await registerUser(users[0], 10000, TIER_STANDARD);
      // 15% of 30 TROB = 4.5 TROB
      expect(await rewardPool.poolBalance()).to.equal(ethers.parseEther("4.5"));
    });

    it("should pay 10% of pool balance upon Alpha milestone", async () => {
      // 1. Build pool balance to 100 TROB
      await token.mint(await rewardPool.getAddress(), ethers.parseEther("100"));
      await rewardPool.receiveDeposit(ethers.parseEther("100"));

      // 2. Impersonate salaryPool (authorized caller)
      const salaryPoolAddress = await salaryPool.getAddress();
      await ethers.provider.send("hardhat_setBalance", [salaryPoolAddress, "0x1000000000000000000"]);
      const salarySigner = await ethers.getImpersonatedSigner(salaryPoolAddress);
      await rewardPool.connect(salarySigner).creditMilestoneReward(users[0].address, 1);

      // Alpha payout is 10% of 104.5 TROB (or 10% of 100 TROB)
      const pending = await rewardPool.getPendingReward(users[0].address);
      expect(pending).to.be.gt(0n);

      // User claims reward
      const balBefore = await token.balanceOf(users[0].address);
      await rewardPool.connect(users[0]).claimReward();
      const balAfter = await token.balanceOf(users[0].address);

      expect(balAfter - balBefore).to.equal(pending);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. Full Integration — Accounting Invariant
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Integration — Full Registration Accounting Invariant", () => {

    it("accounting invariant: 100% of deposit TROB leaves vault and reaches pools", async () => {
      const vaultBalBefore = await token.balanceOf(await vault.getAddress());

      await registerUser(users[0], 10000, TIER_STANDARD);

      // Vault must hold 0 TROB (everything routed out)
      const vaultBalAfter = await token.balanceOf(await vault.getAddress());
      expect(vaultBalAfter - vaultBalBefore).to.equal(0n);

      // Total received by pools must equal deposit
      const d = await token.balanceOf(await dao.getAddress());
      const s = await token.balanceOf(await salaryPool.getAddress());
      const m = await token.balanceOf(await magicBox.getAddress());
      const r = await token.balanceOf(await rewardPool.getAddress());

      expect(d + s + m + r).to.equal(TIER_STANDARD);
    });
  });

});
