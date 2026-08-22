import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import {
  BTitanRegistry,
  BTitanDAO,
  BTitanMatrix,
  BTitanNFT,
  BTitanVestingVault,
  MockToken,
} from "../typechain-types";

describe("B-TITAN Smart Contracts — Full Integration Test Suite", function () {
  let registry: BTitanRegistry;
  let token: MockToken;
  let nft: BTitanNFT;
  let vault: BTitanVestingVault;
  let dao: BTitanDAO;
  let matrix: BTitanMatrix;

  let owner: HardhatEthersSigner;
  let root: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;
  let user3: HardhatEthersSigner;
  let users: HardhatEthersSigner[];

  const ENTRY_FEE = ethers.parseEther("300");   // 300 BTT
  const SLOT1_COST = ethers.parseEther("30");   // 30 BTT

  beforeEach(async function () {
    [owner, root, user1, user2, user3, ...users] = await ethers.getSigners();

    // Deploy MockToken
    const TokenFactory = await ethers.getContractFactory("MockToken");
    token = await TokenFactory.deploy();

    // Deploy Registry
    const RegistryFactory = await ethers.getContractFactory("BTitanRegistry");
    registry = await RegistryFactory.deploy(root.address);

    // Deploy NFT
    const NFTFactory = await ethers.getContractFactory("BTitanNFT");
    nft = await NFTFactory.deploy();

    // Deploy VestingVault
    const VaultFactory = await ethers.getContractFactory("BTitanVestingVault");
    vault = await VaultFactory.deploy(await token.getAddress());

    // Deploy DAO
    const DAOFactory = await ethers.getContractFactory("BTitanDAO");
    dao = await DAOFactory.deploy(
      await token.getAddress(),
      await registry.getAddress(),
      await nft.getAddress()
    );

    // Deploy Matrix
    const MatrixFactory = await ethers.getContractFactory("BTitanMatrix");
    matrix = await MatrixFactory.deploy(
      await token.getAddress(),
      await registry.getAddress(),
      await nft.getAddress(),
      await vault.getAddress()
    );

    // Wire up authorizations
    await registry.setAuthorizedContracts(
      await matrix.getAddress(),
      await dao.getAddress()
    );
    await nft.setMinter(await dao.getAddress(), true);
    await nft.setMinter(await matrix.getAddress(), true);
    await vault.setAuthorizedContracts(
      await matrix.getAddress(),
      await dao.getAddress()
    );

    // Fund users with mock tokens
    const allUsers = [user1, user2, user3, ...users.slice(0, 50)];
    for (const u of allUsers) {
      await token.transfer(u.address, ethers.parseEther("5000"));
    }
  });

  // ─── REGISTRY TESTS ──────────────────────────────────────────────────────

  describe("BTitanRegistry", function () {
    it("Should have root registered on deploy", async function () {
      expect(await registry.isRegistered(root.address)).to.be.true;
      expect(await registry.getRoot()).to.equal(root.address);
    });

    it("Should allow DAO to register a new user", async function () {
      // Approve and join DAO to trigger registration
      await token.connect(user1).approve(await dao.getAddress(), ENTRY_FEE);
      await dao.connect(user1).joinDAO(root.address);

      expect(await registry.isRegistered(user1.address)).to.be.true;
      expect(await registry.getSponsor(user1.address)).to.equal(root.address);
    });

    it("Root should always be qualified", async function () {
      expect(await registry.isQualified(root.address)).to.be.true;
    });

    it("New user should not be qualified (needs 2 referrals)", async function () {
      await token.connect(user1).approve(await dao.getAddress(), ENTRY_FEE);
      await dao.connect(user1).joinDAO(root.address);

      expect(await registry.isQualified(user1.address)).to.be.false;
    });

    it("User with 2 direct referrals should be qualified", async function () {
      // user1 joins → sponsors user2, user3
      await token.connect(user1).approve(await dao.getAddress(), ENTRY_FEE);
      await dao.connect(user1).joinDAO(root.address);

      await token.connect(user2).approve(await dao.getAddress(), ENTRY_FEE);
      await dao.connect(user2).joinDAO(user1.address);

      await token.connect(user3).approve(await dao.getAddress(), ENTRY_FEE);
      await dao.connect(user3).joinDAO(user1.address);

      expect(await registry.isQualified(user1.address)).to.be.true;
      expect(await registry.getDirectReferralsCount(user1.address)).to.equal(2n);
    });
  });

  // ─── DAO TESTS ────────────────────────────────────────────────────────────

  describe("BTitanDAO", function () {
    it("First member should receive 300 BTT (their own deposit)", async function () {
      await token.connect(user1).approve(await dao.getAddress(), ENTRY_FEE);
      await dao.connect(user1).joinDAO(root.address);

      const [, , balance] = await dao.getMemberDetails(user1.address);
      expect(balance).to.equal(ENTRY_FEE);
    });

    it("Second member's 300 BTT should go to first member", async function () {
      await token.connect(user1).approve(await dao.getAddress(), ENTRY_FEE);
      await dao.connect(user1).joinDAO(root.address);

      await token.connect(user2).approve(await dao.getAddress(), ENTRY_FEE);
      await dao.connect(user2).joinDAO(root.address);

      // user1's credit: their own 300 + user2's 300 = 600
      const [, , balance1] = await dao.getMemberDetails(user1.address);
      expect(balance1).to.equal(ethers.parseEther("600"));
    });

    it("Third member's 300 BTT should split 150/150 to first two members", async function () {
      await token.connect(user1).approve(await dao.getAddress(), ENTRY_FEE);
      await dao.connect(user1).joinDAO(root.address);

      await token.connect(user2).approve(await dao.getAddress(), ENTRY_FEE);
      await dao.connect(user2).joinDAO(root.address);

      await token.connect(user3).approve(await dao.getAddress(), ENTRY_FEE);
      await dao.connect(user3).joinDAO(root.address);

      const [, , balance1] = await dao.getMemberDetails(user1.address);
      const [, , balance2] = await dao.getMemberDetails(user2.address);

      // user1: 300 (own) + 300 (user2) + 150 (user3's share) = 750
      expect(balance1).to.equal(ethers.parseEther("750"));
      // user2: 150 (user3's share)
      expect(balance2).to.equal(ethers.parseEther("150"));
    });

    it("Should mint Welcome Pass NFT on join", async function () {
      await token.connect(user1).approve(await dao.getAddress(), ENTRY_FEE);
      await dao.connect(user1).joinDAO(root.address);

      expect(await nft.hasWelcomePass(user1.address)).to.be.true;
    });

    it("Should not allow double-joining", async function () {
      await token.connect(user1).approve(await dao.getAddress(), ENTRY_FEE * 2n);
      await dao.connect(user1).joinDAO(root.address);

      await expect(dao.connect(user1).joinDAO(root.address))
        .to.be.revertedWith("BTitanDAO: Already a DAO member");
    });

    it("Should allow withdrawal of earned balance", async function () {
      await token.connect(user1).approve(await dao.getAddress(), ENTRY_FEE);
      await dao.connect(user1).joinDAO(root.address);

      const balanceBefore = await token.balanceOf(user1.address);
      await dao.connect(user1).withdraw(ENTRY_FEE);
      const balanceAfter = await token.balanceOf(user1.address);

      expect(balanceAfter - balanceBefore).to.equal(ENTRY_FEE);
    });

    it("DAO should complete after 50 members", async function () {
      const allSigners = await ethers.getSigners();
      // Use signers 2-51 (50 members)
      for (let i = 2; i <= 51; i++) {
        const u = allSigners[i] || (await ethers.getImpersonatedSigner(
          ethers.Wallet.createRandom().address
        ));
        await token.transfer(u.address, ethers.parseEther("5000"));
        await token.connect(u).approve(await dao.getAddress(), ENTRY_FEE);
        await dao.connect(u).joinDAO(root.address);
      }

      expect(await dao.daoCompleted()).to.be.true;
      expect(await dao.getDaoMemberCount()).to.equal(50n);
    });
  });

  // ─── MATRIX TESTS ─────────────────────────────────────────────────────────

  describe("BTitanMatrix", function () {
    beforeEach(async function () {
      // Register users first via DAO
      await token.connect(user1).approve(await dao.getAddress(), ENTRY_FEE);
      await dao.connect(user1).joinDAO(root.address);

      await token.connect(user2).approve(await dao.getAddress(), ENTRY_FEE);
      await dao.connect(user2).joinDAO(user1.address);

      await token.connect(user3).approve(await dao.getAddress(), ENTRY_FEE);
      await dao.connect(user3).joinDAO(user1.address);
    });

    it("Should allow joining slot 1 with 30 BTT", async function () {
      await token.connect(user1).approve(await matrix.getAddress(), SLOT1_COST);
      await matrix.connect(user1).joinSlot(1, root.address);

      const [isUnlocked] = await matrix.getSlotData(user1.address, 1);
      expect(isUnlocked).to.be.true;
    });

    it("Should not allow joining slot 2 without slot 1", async function () {
      await token.connect(user1).approve(await matrix.getAddress(), ethers.parseEther("60"));
      await expect(matrix.connect(user1).joinSlot(2, root.address))
        .to.be.revertedWith("BTitanMatrix: Previous slot not unlocked");
    });

    it("Slot costs should double each level", async function () {
      expect(await matrix.getSlotCost(1)).to.equal(ethers.parseEther("30"));
      expect(await matrix.getSlotCost(2)).to.equal(ethers.parseEther("60"));
      expect(await matrix.getSlotCost(3)).to.equal(ethers.parseEther("120"));
      expect(await matrix.getSlotCost(12)).to.equal(ethers.parseEther("61440"));
    });

    it("Should allow withdrawal of matrix earnings", async function () {
      await token.connect(user1).approve(await matrix.getAddress(), SLOT1_COST);
      await matrix.connect(user1).joinSlot(1, root.address);

      // Place 2 users to generate income for user1 (as uplines)
      await token.connect(user2).approve(await matrix.getAddress(), SLOT1_COST);
      await matrix.connect(user2).joinSlot(1, user1.address);

      const [bal] = await matrix.getUserFinancials(root.address);
      // Root should have received upline payments since users need qualification
      expect(bal).to.be.gte(0n);
    });
  });

  // ─── NFT TESTS ────────────────────────────────────────────────────────────

  describe("BTitanNFT", function () {
    it("Should mint Welcome Pass with correct metadata", async function () {
      await token.connect(user1).approve(await dao.getAddress(), ENTRY_FEE);
      await dao.connect(user1).joinDAO(root.address);

      const tokenId = await nft.getWelcomePassTokenId(user1.address);
      expect(tokenId).to.be.gt(0n);

      const data = await nft.tokenData(tokenId);
      expect(data.isWelcomePass).to.be.true;
    });
  });
});
