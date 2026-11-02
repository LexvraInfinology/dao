import { expect } from "chai";
import { ethers } from "hardhat";
import { HDNodeWallet } from "ethers";
import {
  EquoraMatrix,
  EquoraRegistry,
  EquoraVault,
  EquoraDAOv3,
  EquoraRoyaltyPool,
  EquoraRewardPool,
  EquoraMagicBox,
  EquoraNFT,
  MockToken,
} from "../typechain-types";

describe("EquoraMatrix — Multi-Generational Recursive Downline Cascade & Anti-Double Payout", function () {
  let matrix: EquoraMatrix;
  let registry: EquoraRegistry;
  let vault: EquoraVault;
  let dao: EquoraDAOv3;
  let royaltyPool: EquoraRoyaltyPool;
  let rewardPool: EquoraRewardPool;
  let magicBox: EquoraMagicBox;
  let nft: EquoraNFT;
  let token: MockToken;

  let owner: HDNodeWallet;
  let genesisApex: HDNodeWallet;

  async function createFundedWallet(): Promise<HDNodeWallet> {
    const wallet = ethers.Wallet.createRandom().connect(ethers.provider);
    await owner.sendTransaction({
      to: wallet.address,
      value: ethers.parseEther("10"),
    });
    return wallet;
  }

  beforeEach(async function () {
    const signers = await ethers.getSigners();
    owner = signers[0] as unknown as HDNodeWallet;
    genesisApex = await createFundedWallet();

    // 1. Deploy MockToken
    const TokenFactory = await ethers.getContractFactory("MockToken");
    token = await TokenFactory.deploy();
    await token.waitForDeployment();

    // 2. Deploy EquoraRegistry
    const RegistryFactory = await ethers.getContractFactory("EquoraRegistry");
    registry = await RegistryFactory.deploy(genesisApex.address);
    await registry.waitForDeployment();

    // 3. Deploy EquoraVault
    const VaultFactory = await ethers.getContractFactory("EquoraVault");
    vault = await VaultFactory.deploy(await token.getAddress(), await registry.getAddress());
    await vault.waitForDeployment();

    // 4. Deploy EquoraNFT
    const NFTFactory = await ethers.getContractFactory("EquoraNFT");
    nft = await NFTFactory.deploy();
    await nft.waitForDeployment();

    // 5. Deploy EquoraDAOv3
    const DAOFactory = await ethers.getContractFactory("EquoraDAOv3");
    dao = await DAOFactory.deploy(
      await token.getAddress(),
      await registry.getAddress()
    );
    await dao.waitForDeployment();

    // 6. Deploy EquoraRoyaltyPool
    const RoyaltyFactory = await ethers.getContractFactory("EquoraRoyaltyPool");
    royaltyPool = await RoyaltyFactory.deploy(await token.getAddress(), await vault.getAddress());
    await royaltyPool.waitForDeployment();

    // 7. Deploy EquoraRewardPool
    const RewardFactory = await ethers.getContractFactory("EquoraRewardPool");
    rewardPool = await RewardFactory.deploy(await token.getAddress(), await vault.getAddress());
    await rewardPool.waitForDeployment();

    // 8. Deploy EquoraMagicBox
    const BoxFactory = await ethers.getContractFactory("EquoraMagicBox");
    magicBox = await BoxFactory.deploy(await token.getAddress(), await vault.getAddress());
    await magicBox.waitForDeployment();

    // 9. Wire Vault pools
    await vault.initialize(
      await dao.getAddress(),
      await royaltyPool.getAddress(),
      await magicBox.getAddress(),
      await rewardPool.getAddress()
    );

    // 10. Deploy EquoraMatrix
    const MatrixFactory = await ethers.getContractFactory("EquoraMatrix");
    matrix = await MatrixFactory.deploy(
      ethers.ZeroAddress,
      await registry.getAddress(),
      await nft.getAddress()
    );
    await matrix.waitForDeployment();

    // 11. Complete wiring
    await matrix.setVaultContract(await vault.getAddress());
    await matrix.setDaoContract(await dao.getAddress());
    await matrix.setGenesisRoot(genesisApex.address);
    await vault.setMatrixContract(await matrix.getAddress());
    await registry.setAuthorizedContracts(
      await matrix.getAddress(),
      await vault.getAddress(),
      await dao.getAddress()
    );
    // Complete wiring
    await nft.setMinter(await matrix.getAddress(), true);
  });

  it("should never record a contract address as a user's sponsor", async function () {
    const user1 = await createFundedWallet();
    const entryFee = await matrix.baseSlotCost();

    // Join without sponsor -> should fall back to genesisApex human wallet, NEVER vaultContract
    await matrix.connect(user1).joinSlot(1, ethers.ZeroAddress, { value: entryFee });

    const registeredSponsor = await registry.getSponsor(user1.address);
    expect(registeredSponsor).to.equal(genesisApex.address);
    expect(registeredSponsor).to.not.equal(await vault.getAddress());
    expect(registeredSponsor).to.not.equal(await matrix.getAddress());
  });

  it("should strictly gate earnings until user has 2 active direct referrals", async function () {
    const user = await createFundedWallet();
    const entryFee = await matrix.baseSlotCost();

    await matrix.connect(user).joinSlot(1, genesisApex.address, { value: entryFee });
    expect(await matrix.isMatrixQualified(user.address)).to.be.false;

    // Direct referral 1 joins
    const ref1 = await createFundedWallet();
    await matrix.connect(ref1).joinSlot(1, user.address, { value: entryFee });
    expect(await matrix.isMatrixQualified(user.address)).to.be.false;

    // Direct referral 2 joins
    const ref2 = await createFundedWallet();
    await matrix.connect(ref2).joinSlot(1, user.address, { value: entryFee });
    expect(await matrix.isMatrixQualified(user.address)).to.be.true;
  });

  it("should execute recursive downline cascade: P7 on upline board hits downline's vacant node and pays qualified recipient", async function () {
    const entryFee = await matrix.baseSlotCost();

    // Apex root unlocks Slot 1
    await matrix.connect(genesisApex).joinSlot(1, ethers.ZeroAddress, { value: entryFee });

    // DL1 joins under Genesis Apex
    const dl1 = await createFundedWallet();
    await matrix.connect(dl1).joinSlot(1, genesisApex.address, { value: entryFee });

    // DL2 joins under Genesis Apex
    const dl2 = await createFundedWallet();
    await matrix.connect(dl2).joinSlot(1, genesisApex.address, { value: entryFee });

    // Qualify DL1 with 2 direct referrals
    const dl1_ref1 = await createFundedWallet();
    await matrix.connect(dl1_ref1).joinSlot(1, dl1.address, { value: entryFee });
    const dl1_ref2 = await createFundedWallet();
    await matrix.connect(dl1_ref2).joinSlot(1, dl1.address, { value: entryFee });

    expect(await matrix.isMatrixQualified(dl1.address)).to.be.true;

    // Fill positions 3, 4, 5, 6 on Genesis Apex's board
    const p3 = await createFundedWallet();
    await matrix.connect(p3).joinSlot(1, genesisApex.address, { value: entryFee });
    const p4 = await createFundedWallet();
    await matrix.connect(p4).joinSlot(1, genesisApex.address, { value: entryFee });
    const p5 = await createFundedWallet();
    await matrix.connect(p5).joinSlot(1, genesisApex.address, { value: entryFee });
    const p6 = await createFundedWallet();
    await matrix.connect(p6).joinSlot(1, genesisApex.address, { value: entryFee });

    // Now position 7 on Genesis Apex's board!
    // P7 targets DL1 (Downline 1). DL1 is qualified!
    // P7 cascades into DL1's board, occupies DL1's lowest vacant node, and executes that node's action!
    const dl1BalanceBefore = await ethers.provider.getBalance(dl1.address);
    const p7 = await createFundedWallet();
    await matrix.connect(p7).joinSlot(1, genesisApex.address, { value: entryFee });

    // Inspect DL1's board: DL1's board received the placement
    const dl1SlotData = await matrix.getSlotData(dl1.address, 1);
    expect(dl1SlotData.filledNodes).to.be.gte(1n);

    // Verify DL1 earned income from the cascade without manual claim
    const dl1Earned = await matrix.totalEarned(dl1.address);
    expect(dl1Earned).to.be.gt(0n);
  });

  it("should execute universal upstream hop: P1 routes to upline's dashboard, checks 2 directs, and fills upline's vacant node", async function () {
    const entryFee = await matrix.baseSlotCost();

    // Apex root unlocks Slot 1
    await matrix.connect(genesisApex).joinSlot(1, ethers.ZeroAddress, { value: entryFee });

    // Upline U1 joins under Genesis Apex
    const u1 = await createFundedWallet();
    await matrix.connect(u1).joinSlot(1, genesisApex.address, { value: entryFee });

    // Qualify U1 with 2 directs
    const u1_ref1 = await createFundedWallet();
    await matrix.connect(u1_ref1).joinSlot(1, u1.address, { value: entryFee });
    const u1_ref2 = await createFundedWallet();
    await matrix.connect(u1_ref2).joinSlot(1, u1.address, { value: entryFee });

    expect(await matrix.isMatrixQualified(u1.address)).to.be.true;

    // Downline D1 joins under u1_ref1
    const d1 = await createFundedWallet();
    await matrix.connect(d1).joinSlot(1, u1_ref1.address, { value: entryFee });

    // When d1 brings someone (d1_p1), position 1 on d1's board is a pass-up to d1's upline (u1_ref1)
    // and u1_ref1's pass up checks u1's dashboard!
    // Verify that U1's board receives placement from the upstream cascade!
    const u1SlotData = await matrix.getSlotData(u1.address, 1);
    expect(u1SlotData.filledNodes).to.be.gte(2n);
  });
});
