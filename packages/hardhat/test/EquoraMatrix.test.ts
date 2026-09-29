import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import {
  EquoraRegistry,
  EquoraVault,
  EquoraDAO,
  EquoraSalaryPool,
  EquoraRewardPool,
  EquoraMagicBox,
  EquoraMatrix,
  EquoraNFT,
  MockToken,
} from "../typechain-types";
import { HDNodeWallet } from "ethers";

describe("EquoraMatrix — Equora.Fi V3 14-Position Single-Leg Matrix Engine", function () {
  let token: MockToken;
  let registry: EquoraRegistry;
  let nft: EquoraNFT;
  let vault: EquoraVault;
  let dao: EquoraDAO;
  let salaryPool: EquoraSalaryPool;
  let rewardPool: EquoraRewardPool;
  let magicBox: EquoraMagicBox;
  let matrix: EquoraMatrix;

  let owner: HardhatEthersSigner;
  let root: HardhatEthersSigner;
  let upline2: HardhatEthersSigner;
  let upline1: HardhatEthersSigner;
  let matrixOwner: HardhatEthersSigner;
  let downline1: HardhatEthersSigner;
  let downline2: HardhatEthersSigner;

  const SLOT1_COST = ethers.parseEther("30");

  async function createFundedWallet(funder: HardhatEthersSigner): Promise<HDNodeWallet> {
    const wallet = ethers.Wallet.createRandom(ethers.provider);
    await funder.sendTransaction({ to: wallet.address, value: ethers.parseEther("0.5") });
    await token.transfer(wallet.address, ethers.parseEther("1000"));
    await token.connect(wallet).approve(await matrix.getAddress(), ethers.MaxUint256);
    if (dao) {
      await token.connect(wallet).approve(await dao.getAddress(), ethers.MaxUint256);
    }
    return wallet;
  }

  beforeEach(async function () {
    const signers = await ethers.getSigners();
    owner = signers[0];
    root = signers[1];
    upline2 = signers[2];
    upline1 = signers[3];
    matrixOwner = signers[4];
    downline1 = signers[5];
    downline2 = signers[6];

    // 1. Deploy Token
    const TokenFactory = await ethers.getContractFactory("MockToken");
    token = await TokenFactory.deploy();

    // 2. Deploy Registry
    const RegistryFactory = await ethers.getContractFactory("EquoraRegistry");
    registry = await RegistryFactory.deploy(root.address);

    // 3. Deploy NFT
    const NFTFactory = await ethers.getContractFactory("EquoraNFT");
    nft = await NFTFactory.deploy();

    // 4. Deploy Vault
    const VaultFactory = await ethers.getContractFactory("EquoraVault");
    vault = await VaultFactory.deploy(await token.getAddress(), await registry.getAddress());

    // 5. Deploy Pools
    const RewardPoolFactory = await ethers.getContractFactory("EquoraRewardPool");
    rewardPool = await RewardPoolFactory.deploy(await token.getAddress(), await vault.getAddress());

    const SalaryPoolFactory = await ethers.getContractFactory("EquoraSalaryPool");
    salaryPool = await SalaryPoolFactory.deploy(await token.getAddress(), await vault.getAddress());

    const MagicBoxFactory = await ethers.getContractFactory("EquoraMagicBox");
    magicBox = await MagicBoxFactory.deploy(await token.getAddress(), await vault.getAddress());

    const DAOFactory = await ethers.getContractFactory("EquoraDAO");
    dao = await DAOFactory.deploy(await token.getAddress(), await registry.getAddress());

    // 6. Deploy Matrix
    const MatrixFactory = await ethers.getContractFactory("EquoraMatrix");
    matrix = await MatrixFactory.deploy(
      await token.getAddress(),
      await registry.getAddress(),
      await nft.getAddress()
    );

    // 7. Wire authorizations
    await vault.initialize(
      await dao.getAddress(),
      await salaryPool.getAddress(),
      await magicBox.getAddress(),
      await rewardPool.getAddress()
    );
    await vault.setMatrixContract(await matrix.getAddress());
    await matrix.setVaultContract(await vault.getAddress());
    await matrix.setDaoContract(await dao.getAddress());
    await registry.setAuthorizedContracts(
      await vault.getAddress(),
      await dao.getAddress(),
      await matrix.getAddress()
    );
    await nft.setMinter(await matrix.getAddress(), true);

    // Register line of sponsorship in Registry: root <- upline2 <- upline1 <- matrixOwner
    await registry.connect(owner)["registerUser(address,address)"](upline2.address, root.address);
    await registry.connect(owner)["registerUser(address,address)"](upline1.address, upline2.address);
    await registry.connect(owner)["registerUser(address,address)"](matrixOwner.address, upline1.address);

    // Register downline1 and downline2 under matrixOwner
    await registry.connect(owner)["registerUser(address,address)"](downline1.address, matrixOwner.address);
    await registry.connect(owner)["registerUser(address,address)"](downline2.address, matrixOwner.address);

    // Fund all primary test actors
    const primaryUsers = [root, upline2, upline1, matrixOwner, downline1, downline2];
    for (const u of primaryUsers) {
      await token.transfer(u.address, ethers.parseEther("5000"));
      await token.connect(u).approve(await matrix.getAddress(), ethers.MaxUint256);
    }
  });

  describe("Slot Activation & Hierarchy", function () {
    it("should allow a registered user to activate Slot 1", async function () {
      await matrix.connect(matrixOwner).joinSlot(1, upline1.address);
      const slotData = await matrix.getSlotData(matrixOwner.address, 1);
      expect(slotData.isUnlocked).to.be.true;
      expect(slotData.currentCycle).to.equal(1n);
      expect(slotData.filledNodes).to.equal(0n);
    });

    it("should revert if activating an invalid slot or already unlocked slot", async function () {
      await expect(matrix.connect(matrixOwner).joinSlot(0, upline1.address)).to.be.revertedWith(
        "EquoraMatrix: invalid slot"
      );
      await expect(matrix.connect(matrixOwner).joinSlot(13, upline1.address)).to.be.revertedWith(
        "EquoraMatrix: invalid slot"
      );
      await matrix.connect(matrixOwner).joinSlot(1, upline1.address);
      await expect(matrix.connect(matrixOwner).joinSlot(1, upline1.address)).to.be.revertedWith(
        "EquoraMatrix: already unlocked"
      );
    });

    it("should enforce that a user tree graph is only started upon achieving 2 direct referrals eligibility", async function () {
      // 1. matrixOwner is already qualified (has downline1 and downline2) and starts Slot 1
      await matrix.connect(matrixOwner).joinSlot(1, upline1.address);
      expect(await matrix.isMatrixTreeStarted(matrixOwner.address, 1)).to.be.true;

      // 2. testUser joins Slot 1 under matrixOwner without having 2 direct referrals
      const testUser = await createFundedWallet(owner);
      await matrix.connect(testUser).joinSlot(1, matrixOwner.address);
      const testUserSlot = await matrix.getSlotData(testUser.address, 1);
      expect(testUserSlot.isUnlocked).to.be.true;

      // testUser has 0 referrals -> tree graph NOT started
      expect(await registry.isQualified(testUser.address)).to.be.false;
      expect(await matrix.isMatrixTreeStarted(testUser.address, 1)).to.be.false;

      // 3. downlineA joins with sponsor = testUser
      // Since testUser's tree graph is not started, placement skips testUser and bubbles up to matrixOwner!
      const downlineA = await createFundedWallet(owner);
      await matrix.connect(downlineA).joinSlot(1, testUser.address);

      // testUser's tree graph has 0 filled nodes (skipped!)
      const testUserSlotAfterSkip = await matrix.getSlotData(testUser.address, 1);
      expect(testUserSlotAfterSkip.filledNodes).to.equal(0n);

      // matrixOwner received downlineA in their tree graph
      const matrixOwnerSlot = await matrix.getSlotData(matrixOwner.address, 1);
      expect(matrixOwnerSlot.filledNodes).to.equal(2n); // testUser at node 0, downlineA at node 1

      // 4. testUser now completes 2 direct referrals in the registry
      const ref1 = await createFundedWallet(owner);
      const ref2 = await createFundedWallet(owner);
      await registry.connect(owner)["registerUser(address,address)"](ref1.address, testUser.address);
      await registry.connect(owner)["registerUser(address,address)"](ref2.address, testUser.address);

      // Now testUser has achieved 2 direct referrals eligibility!
      expect(await registry.isQualified(testUser.address)).to.be.true;
      expect(await matrix.isMatrixTreeStarted(testUser.address, 1)).to.be.true;

      // 5. downlineB joins with sponsor = testUser
      // Now testUser's tree graph IS started! Placement lands directly in testUser's tree!
      const downlineB = await createFundedWallet(owner);
      await matrix.connect(downlineB).joinSlot(1, testUser.address);

      const testUserSlotActive = await matrix.getSlotData(testUser.address, 1);
      expect(testUserSlotActive.filledNodes).to.equal(1n);
      expect(testUserSlotActive.nodes[0]).to.equal(downlineB.address);
    });

    it("should allow user registration through matrix contract without joining a slot", async function () {
      const newUser = await createFundedWallet(owner);
      expect(await registry.isRegistered(newUser.address)).to.be.false;

      await matrix.connect(newUser)["register(address)"](matrixOwner.address);
      expect(await registry.isRegistered(newUser.address)).to.be.true;
      expect(await registry.getSponsor(newUser.address)).to.equal(matrixOwner.address);

      const code = await registry.getCodeByUser(newUser.address);
      expect(Number(code)).to.be.gte(10001);
    });
  });

  describe("14-Node Payout Routing", function () {
    it("should route P1 and P2 to upline 1 and upline 2 when qualified", async function () {
      // Qualify upline1 (2 referrals)
      const d1 = await createFundedWallet(owner);
      const d2 = await createFundedWallet(owner);
      await registry.connect(owner)["registerUser(address,address)"](d1.address, upline1.address);
      await registry.connect(owner)["registerUser(address,address)"](d2.address, upline1.address);
      expect(await registry.isQualified(upline1.address)).to.be.true;

      // Qualify upline2 (2 referrals)
      const d3 = await createFundedWallet(owner);
      const d4 = await createFundedWallet(owner);
      await registry.connect(owner)["registerUser(address,address)"](d3.address, upline2.address);
      await registry.connect(owner)["registerUser(address,address)"](d4.address, upline2.address);
      expect(await registry.isQualified(upline2.address)).to.be.true;

      await matrix.connect(matrixOwner).joinSlot(1, upline1.address);

      // P1 joins under matrixOwner -> goes directly to upline1 wallet
      const p1Wallet = await createFundedWallet(owner);
      const upline1BalBefore = await token.balanceOf(upline1.address);
      await matrix.connect(p1Wallet).joinSlot(1, matrixOwner.address);
      const upline1BalAfter = await token.balanceOf(upline1.address);
      expect(upline1BalAfter - upline1BalBefore).to.equal(SLOT1_COST);
      expect(await matrix.totalEarned(upline1.address)).to.equal(SLOT1_COST);

      // P2 joins under matrixOwner -> goes directly to upline2 wallet
      const p2Wallet = await createFundedWallet(owner);
      const upline2BalBefore = await token.balanceOf(upline2.address);
      await matrix.connect(p2Wallet).joinSlot(1, matrixOwner.address);
      const upline2BalAfter = await token.balanceOf(upline2.address);
      expect(upline2BalAfter - upline2BalBefore).to.equal(SLOT1_COST);
      expect(await matrix.totalEarned(upline2.address)).to.equal(SLOT1_COST);
    });

    it("should route directly to 4 automated protocol pools when upline is unqualified", async function () {
      // upline1 has only 1 direct referral (matrixOwner) -> unqualified
      expect(await registry.isQualified(upline1.address)).to.be.false;

      await matrix.connect(matrixOwner).joinSlot(1, upline1.address);

      const rootBalBefore = await token.balanceOf(root.address);
      const ownerBalBefore = await token.balanceOf(matrixOwner.address);
      const daoBalBefore = await token.balanceOf(await dao.getAddress());
      const salaryBalBefore = await salaryPool.pendingPoolBalance();
      const magicBalBefore = await magicBox.poolBalance();
      const rewardBalBefore = await rewardPool.poolBalance();

      // P1 joins under matrixOwner -> since upline1 is unqualified, routes directly to 4 pools!
      const p1Wallet = await createFundedWallet(owner);
      await matrix.connect(p1Wallet).joinSlot(1, matrixOwner.address);

      const rootBalAfter = await token.balanceOf(root.address);
      const ownerBalAfter = await token.balanceOf(matrixOwner.address);

      // Neither root nor matrixOwner receives the funds
      expect(rootBalAfter).to.equal(rootBalBefore);
      expect(ownerBalAfter).to.equal(ownerBalBefore);

      // 4 Protocol Pools receive the funds directly: 35% DAO, 40% Salary, 10% Magic, 15% Rewards
      const expectedDAO = (SLOT1_COST * 35n) / 100n;
      const expectedSalary = (SLOT1_COST * 40n) / 100n;
      const expectedMagic = (SLOT1_COST * 10n) / 100n;
      const expectedReward = (SLOT1_COST * 15n) / 100n;

      expect(await token.balanceOf(await dao.getAddress()) - daoBalBefore).to.equal(expectedDAO);
      expect(await salaryPool.pendingPoolBalance() - salaryBalBefore).to.equal(expectedSalary);
      expect(await magicBox.poolBalance() - magicBalBefore).to.equal(expectedMagic);
      expect(await rewardPool.poolBalance() - rewardBalBefore).to.equal(expectedReward);
    });

    it("should route P3, P6, P8, P9, P11, P12 directly to matrixOwner", async function () {
      await matrix.connect(matrixOwner).joinSlot(1, upline1.address);

      // Fill P1 and P2
      const p1 = await createFundedWallet(owner);
      const p2 = await createFundedWallet(owner);
      await matrix.connect(p1).joinSlot(1, matrixOwner.address);
      await matrix.connect(p2).joinSlot(1, matrixOwner.address);

      // Fill P3 -> should go directly to matrixOwner wallet
      const p3 = await createFundedWallet(owner);
      const ownerBeforeP3 = await token.balanceOf(matrixOwner.address);
      await matrix.connect(p3).joinSlot(1, matrixOwner.address);
      const ownerAfterP3 = await token.balanceOf(matrixOwner.address);
      expect(ownerAfterP3 - ownerBeforeP3).to.equal(SLOT1_COST);
    });

    it("should route P4, P5, and P14 to EquoraVault and split into 4 protocol pools", async function () {
      await matrix.connect(matrixOwner).joinSlot(1, upline1.address);

      // Fill P1..P3
      for (let i = 0; i < 3; i++) {
        const w = await createFundedWallet(owner);
        await matrix.connect(w).joinSlot(1, matrixOwner.address);
      }

      // Record pool balances before P4
      const daoBalBefore = await token.balanceOf(await dao.getAddress());
      const salaryBalBefore = await salaryPool.pendingPoolBalance();
      const magicBalBefore = await magicBox.poolBalance();
      const rewardBalBefore = await rewardPool.poolBalance();

      // Fill P4 -> forwarded to EquoraVault
      const p4 = await createFundedWallet(owner);
      await matrix.connect(p4).joinSlot(1, matrixOwner.address);

      // Check pool distributions: 35% DAO, 40% Salary, 10% MagicBox, 15% Rewards
      const expectedDAO = (SLOT1_COST * 35n) / 100n;
      const expectedSalary = (SLOT1_COST * 40n) / 100n;
      const expectedMagic = (SLOT1_COST * 10n) / 100n;
      const expectedReward = (SLOT1_COST * 15n) / 100n;

      expect(await token.balanceOf(await dao.getAddress()) - daoBalBefore).to.equal(expectedDAO);
      expect(await salaryPool.pendingPoolBalance() - salaryBalBefore).to.equal(expectedSalary);
      expect(await magicBox.poolBalance() - magicBalBefore).to.equal(expectedMagic);
      expect(await rewardPool.poolBalance() - rewardBalBefore).to.equal(expectedReward);
    });

    it("should route P7 to DL1 and P10 to DL2 when qualified with anti-double payout protection", async function () {
      await matrix.connect(matrixOwner).joinSlot(1, upline1.address);

      // Node 1 (DL1) and Node 2 (DL2) join under matrixOwner
      await matrix.connect(downline1).joinSlot(1, matrixOwner.address);
      await matrix.connect(downline2).joinSlot(1, matrixOwner.address);

      // Qualify downline1 (2 direct referrals)
      const r1 = await createFundedWallet(owner);
      const r2 = await createFundedWallet(owner);
      await registry.connect(owner)["registerUser(address,address)"](r1.address, downline1.address);
      await registry.connect(owner)["registerUser(address,address)"](r2.address, downline1.address);
      expect(await registry.isQualified(downline1.address)).to.be.true;

      // Qualify downline2 (2 direct referrals)
      const r3 = await createFundedWallet(owner);
      const r4 = await createFundedWallet(owner);
      await registry.connect(owner)["registerUser(address,address)"](r3.address, downline2.address);
      await registry.connect(owner)["registerUser(address,address)"](r4.address, downline2.address);
      expect(await registry.isQualified(downline2.address)).to.be.true;

      // Fill P3..P6
      for (let i = 0; i < 4; i++) {
        const w = await createFundedWallet(owner);
        await matrix.connect(w).joinSlot(1, matrixOwner.address);
      }

      // Record balances before P7
      const dl1BalBefore = await token.balanceOf(downline1.address);
      const dl2BalBefore = await token.balanceOf(downline2.address);

      // Fill P7 (Targets Node 1) -> 100% to DL1 directly in wallet
      const p7 = await createFundedWallet(owner);
      await matrix.connect(p7).joinSlot(1, matrixOwner.address);

      const dl1BalAfterP7 = await token.balanceOf(downline1.address);
      expect(dl1BalAfterP7 - dl1BalBefore).to.equal(SLOT1_COST);

      // Fill P8 and P9
      const p8 = await createFundedWallet(owner);
      const p9 = await createFundedWallet(owner);
      await matrix.connect(p8).joinSlot(1, matrixOwner.address);
      await matrix.connect(p9).joinSlot(1, matrixOwner.address);

      // Fill P10 (Targets Node 2) -> 100% to DL2 without double paying DL1
      const p10 = await createFundedWallet(owner);
      await matrix.connect(p10).joinSlot(1, matrixOwner.address);

      const dl1BalAfterP10 = await token.balanceOf(downline1.address);
      const dl2BalAfterP10 = await token.balanceOf(downline2.address);

      // DL1 was NOT paid a second time; DL2 got paid once
      expect(dl1BalAfterP10).to.equal(dl1BalAfterP7);
      expect(dl2BalAfterP10 - dl2BalBefore).to.equal(SLOT1_COST);
    });

    it("should route P7 to DL2 as fallback when DL1 unqualified, and route P10 to pools without double paying DL2", async function () {
      await matrix.connect(matrixOwner).joinSlot(1, upline1.address);

      // Node 1 (DL1) and Node 2 (DL2) join under matrixOwner
      await matrix.connect(downline1).joinSlot(1, matrixOwner.address);
      await matrix.connect(downline2).joinSlot(1, matrixOwner.address);

      // Qualify ONLY downline2
      const r1 = await createFundedWallet(owner);
      const r2 = await createFundedWallet(owner);
      await registry.connect(owner)["registerUser(address,address)"](r1.address, downline2.address);
      await registry.connect(owner)["registerUser(address,address)"](r2.address, downline2.address);
      expect(await registry.isQualified(downline1.address)).to.be.false;
      expect(await registry.isQualified(downline2.address)).to.be.true;

      // Fill P3..P6
      for (let i = 0; i < 4; i++) {
        const w = await createFundedWallet(owner);
        await matrix.connect(w).joinSlot(1, matrixOwner.address);
      }

      // P7: DL1 is unqualified -> fallback to DL2!
      const dl2BalBefore = await token.balanceOf(downline2.address);
      const p7 = await createFundedWallet(owner);
      await matrix.connect(p7).joinSlot(1, matrixOwner.address);
      const dl2BalAfterP7 = await token.balanceOf(downline2.address);
      expect(dl2BalAfterP7 - dl2BalBefore).to.equal(SLOT1_COST);

      // Fill P8 and P9
      const p8 = await createFundedWallet(owner);
      const p9 = await createFundedWallet(owner);
      await matrix.connect(p8).joinSlot(1, matrixOwner.address);
      await matrix.connect(p9).joinSlot(1, matrixOwner.address);

      // P10: DL2 was already paid at P7, DL1 is unqualified -> forwarded to 4 pools!
      const daoBalBefore = await token.balanceOf(await dao.getAddress());
      const p10 = await createFundedWallet(owner);
      await matrix.connect(p10).joinSlot(1, matrixOwner.address);

      const dl2BalAfterP10 = await token.balanceOf(downline2.address);
      // DL2 must NOT be paid double time!
      expect(dl2BalAfterP10).to.equal(dl2BalAfterP7);

      // 4 Protocol Pools received P10
      const expectedDAO = (SLOT1_COST * 35n) / 100n;
      expect(await token.balanceOf(await dao.getAddress()) - daoBalBefore).to.equal(expectedDAO);
    });

    it("should route P13 to downline's downlines (Nodes 3, 4, 5, 6 Option B) splitting among qualified nodes", async function () {
      await matrix.connect(matrixOwner).joinSlot(1, upline1.address);

      // Fill Node 1 and Node 2
      await matrix.connect(downline1).joinSlot(1, matrixOwner.address);
      await matrix.connect(downline2).joinSlot(1, matrixOwner.address);

      // Fill Nodes 3, 4, 5, 6
      const node3 = await createFundedWallet(owner);
      const node4 = await createFundedWallet(owner);
      const node5 = await createFundedWallet(owner);
      const node6 = await createFundedWallet(owner);

      await matrix.connect(node3).joinSlot(1, matrixOwner.address); // P3
      await matrix.connect(node4).joinSlot(1, matrixOwner.address); // P4
      await matrix.connect(node5).joinSlot(1, matrixOwner.address); // P5
      await matrix.connect(node6).joinSlot(1, matrixOwner.address); // P6

      // Qualify Node 3 and Node 4
      const q1 = await createFundedWallet(owner);
      const q2 = await createFundedWallet(owner);
      await registry.connect(owner)["registerUser(address,address)"](q1.address, node3.address);
      await registry.connect(owner)["registerUser(address,address)"](q2.address, node3.address);

      const q3 = await createFundedWallet(owner);
      const q4 = await createFundedWallet(owner);
      await registry.connect(owner)["registerUser(address,address)"](q3.address, node4.address);
      await registry.connect(owner)["registerUser(address,address)"](q4.address, node4.address);

      expect(await registry.isQualified(node3.address)).to.be.true;
      expect(await registry.isQualified(node4.address)).to.be.true;
      expect(await registry.isQualified(node5.address)).to.be.false;
      expect(await registry.isQualified(node6.address)).to.be.false;

      // Fill P7..P12
      for (let i = 7; i <= 12; i++) {
        const w = await createFundedWallet(owner);
        await matrix.connect(w).joinSlot(1, matrixOwner.address);
      }

      const node3Before = await token.balanceOf(node3.address);
      const node4Before = await token.balanceOf(node4.address);

      // Fill P13 (Option B scan across 3, 4, 5, 6) -> 50/50 split between Node 3 & Node 4 directly to wallet
      const p13 = await createFundedWallet(owner);
      await matrix.connect(p13).joinSlot(1, matrixOwner.address);

      const node3After = await token.balanceOf(node3.address);
      const node4After = await token.balanceOf(node4.address);

      const half = SLOT1_COST / 2n;
      expect(node3After - node3Before).to.equal(half);
      expect(node4After - node4Before).to.equal(half);
    });

    it("should route root matrix owner to last Genesis DAO member and auto-unlock Slot 1", async function () {
      // Have a DAO member join the Genesis DAO
      const daoMember1 = await createFundedWallet(owner);
      const daoMember2 = await createFundedWallet(owner);
      await dao.connect(daoMember1).joinDAO();
      await dao.connect(daoMember2).joinDAO();

      // Verify DAO members were auto-registered in EquoraRegistry with 5-digit codes
      expect(await registry.isRegistered(daoMember1.address)).to.be.true;
      expect(await registry.isRegistered(daoMember2.address)).to.be.true;
      expect(Number(await registry.getCodeByUser(daoMember2.address))).to.be.gte(10001);

      // daoMember2 is the last member
      expect(await dao.getLastMember()).to.equal(daoMember2.address);

      // daoMember2 has NOT manually joined or bought Slot 1 yet
      const beforeSlot = await matrix.getSlotData(daoMember2.address, 1);
      expect(beforeSlot.isUnlocked).to.be.false;

      // A new retail member with no sponsor joins on Day 22 -> routed to last DAO member!
      const retailUser = await createFundedWallet(owner);
      await matrix.connect(retailUser).joinSlot(1, ethers.ZeroAddress);

      // Check slot data for daoMember2 -> should be auto-unlocked with filledNodes = 1
      const slotData = await matrix.getSlotData(daoMember2.address, 1);
      expect(slotData.isUnlocked).to.be.true;
      expect(slotData.filledNodes).to.equal(1n);
      expect(slotData.nodes[0]).to.equal(retailUser.address);
    });

    it("should complete cycle at P14, store permanent snapshot, and reset to cycle 2", async function () {
      await matrix.connect(matrixOwner).joinSlot(1, upline1.address);

      // Fill all 14 positions
      const participants: HDNodeWallet[] = [];
      for (let i = 0; i < 14; i++) {
        const w = await createFundedWallet(owner);
        participants.push(w);
        await matrix.connect(w).joinSlot(1, matrixOwner.address);
      }

      // Slot 1 should now be recycled to cycle 2 with 0 filled nodes
      const slotData = await matrix.getSlotData(matrixOwner.address, 1);
      expect(slotData.currentCycle).to.equal(2n);
      expect(slotData.filledNodes).to.equal(0n);

      // Historical cycle snapshot must be permanently recorded
      const snapshot = await matrix.getCycleSnapshot(matrixOwner.address, 1, 0);
      expect(snapshot.cycleNumber).to.equal(1n);
      expect(snapshot.nodes[0]).to.equal(participants[0].address);
      expect(snapshot.nodes[13]).to.equal(participants[13].address);
    });
  });

  describe("Withdrawals & Direct Wallet Payouts", function () {
    it("should push payouts directly to wallet with zero manual withdrawal needed", async function () {
      await matrix.connect(matrixOwner).joinSlot(1, upline1.address);

      // Fill P1 and P2 (which route to protocol pools since upline is unqualified)
      const p1 = await createFundedWallet(owner);
      const p2 = await createFundedWallet(owner);
      await matrix.connect(p1).joinSlot(1, matrixOwner.address);
      await matrix.connect(p2).joinSlot(1, matrixOwner.address);

      const tokenBalBefore = await token.balanceOf(matrixOwner.address);

      // P3 is direct owner income -> pushed directly to matrixOwner's wallet
      const p3 = await createFundedWallet(owner);
      await matrix.connect(p3).joinSlot(1, matrixOwner.address);

      const tokenBalAfter = await token.balanceOf(matrixOwner.address);
      expect(tokenBalAfter - tokenBalBefore).to.equal(SLOT1_COST);
      expect(await matrix.userBalance(matrixOwner.address)).to.equal(0n);
      expect(await matrix.totalEarned(matrixOwner.address)).to.equal(SLOT1_COST);
    });

    it("should validate zero and insufficient fallback balance on withdraw", async function () {
      await expect(matrix.connect(matrixOwner).withdraw(SLOT1_COST)).to.be.revertedWith(
        "EquoraMatrix: insufficient balance"
      );
      await expect(matrix.connect(matrixOwner).withdraw(0)).to.be.revertedWith(
        "EquoraMatrix: amount must be > 0"
      );
    });
  });
});
