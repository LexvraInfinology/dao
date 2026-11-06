import { ethers } from "hardhat";

async function main() {
  const [owner, upline2, upline1, matrixOwner, downline1, downline2] = await ethers.getSigners();
  const MockToken = await ethers.getContractFactory("MockToken");
  const token = await MockToken.deploy();
  const EquoraRegistry = await ethers.getContractFactory("EquoraRegistry");
  const registry = await EquoraRegistry.deploy(owner.address);
  const EquoraNFT = await ethers.getContractFactory("EquoraNFT");
  const nft = await EquoraNFT.deploy();
  const EquoraVault = await ethers.getContractFactory("EquoraVault");
  const vault = await EquoraVault.deploy(await token.getAddress(), await registry.getAddress());
  const EquoraMatrix = await ethers.getContractFactory("EquoraMatrix");
  const matrix = await EquoraMatrix.deploy(await token.getAddress(), await registry.getAddress(), await nft.getAddress(), await vault.getAddress());
  await matrix.setVaultContract(await vault.getAddress());
  await registry.setAuthorizedContracts(await vault.getAddress(), owner.address, await matrix.getAddress());

  await token.mint(matrixOwner.address, ethers.parseEther("100"));
  await token.connect(matrixOwner).approve(await matrix.getAddress(), ethers.MaxUint256);
  await matrix.connect(matrixOwner).joinSlot(1, upline1.address);

  await token.mint(downline1.address, ethers.parseEther("100"));
  await token.connect(downline1).approve(await matrix.getAddress(), ethers.MaxUint256);
  await matrix.connect(downline1).joinSlot(1, matrixOwner.address);

  await token.mint(downline2.address, ethers.parseEther("100"));
  await token.connect(downline2).approve(await matrix.getAddress(), ethers.MaxUint256);
  await matrix.connect(downline2).joinSlot(1, matrixOwner.address);

  console.log("matrixOwner filledNodes after dl1, dl2:", (await matrix.getSlotData(matrixOwner.address, 1)).filledNodes.toString());
  console.log("matrixOwner node 1:", (await matrix.getSlotData(matrixOwner.address, 1)).nodes[0]);
  console.log("matrixOwner node 2:", (await matrix.getSlotData(matrixOwner.address, 1)).nodes[1]);
  console.log("matrixOwner node 3:", (await matrix.getSlotData(matrixOwner.address, 1)).nodes[2]);

  const r1 = ethers.Wallet.createRandom().connect(ethers.provider);
  const r2 = ethers.Wallet.createRandom().connect(ethers.provider);
  await owner.sendTransaction({ to: r1.address, value: ethers.parseEther("1") });
  await owner.sendTransaction({ to: r2.address, value: ethers.parseEther("1") });
  await token.mint(r1.address, ethers.parseEther("100"));
  await token.mint(r2.address, ethers.parseEther("100"));
  await token.connect(r1).approve(await matrix.getAddress(), ethers.MaxUint256);
  await token.connect(r2).approve(await matrix.getAddress(), ethers.MaxUint256);

  await matrix.connect(r1).joinSlot(1, downline2.address);
  await matrix.connect(r2).joinSlot(1, downline2.address);

  console.log("matrixOwner filledNodes after r1, r2:", (await matrix.getSlotData(matrixOwner.address, 1)).filledNodes.toString());
  console.log("matrixOwner node 3 after r1, r2:", (await matrix.getSlotData(matrixOwner.address, 1)).nodes[2]);
  console.log("downline2 filledNodes after r1, r2:", (await matrix.getSlotData(downline2.address, 1)).filledNodes.toString());
  console.log("downline2 isQualified:", await matrix.isMatrixQualified(downline2.address));

  // Now fill P3..P6 for matrixOwner
  for (let i = 0; i < 4; i++) {
    const w = ethers.Wallet.createRandom().connect(ethers.provider);
    await owner.sendTransaction({ to: w.address, value: ethers.parseEther("1") });
    await token.mint(w.address, ethers.parseEther("100"));
    await token.connect(w).approve(await matrix.getAddress(), ethers.MaxUint256);
    await matrix.connect(w).joinSlot(1, matrixOwner.address);
  }
  console.log("matrixOwner filledNodes after 4 more:", (await matrix.getSlotData(matrixOwner.address, 1)).filledNodes.toString());

  // Now p7 joins under matrixOwner
  const p7 = ethers.Wallet.createRandom().connect(ethers.provider);
  await owner.sendTransaction({ to: p7.address, value: ethers.parseEther("1") });
  await token.mint(p7.address, ethers.parseEther("100"));
  await token.connect(p7).approve(await matrix.getAddress(), ethers.MaxUint256);

  const dl2BalBefore = await token.balanceOf(downline2.address);
  const tx = await matrix.connect(p7).joinSlot(1, matrixOwner.address);
  const rc = await tx.wait();
  if (rc) for (const log of rc.logs) {
    try {
      const parsed = matrix.interface.parseLog(log);
      console.log("Matrix Event:", parsed?.name, parsed?.args);
    } catch {}
  }
  const dl2BalAfter = await token.balanceOf(downline2.address);
  console.log("dl2BalBefore:", dl2BalBefore.toString(), "dl2BalAfter:", dl2BalAfter.toString());
  console.log("downline2 filledNodes after p7:", (await matrix.getSlotData(downline2.address, 1)).filledNodes.toString());
  console.log("downline2 totalEarned:", (await matrix.totalEarned(downline2.address)).toString());
  console.log("downline2 userBalance:", (await matrix.userBalance(downline2.address)).toString());
  console.log("matrix token balance:", (await token.balanceOf(await matrix.getAddress())).toString());
  console.log("vault token balance:", (await token.balanceOf(await vault.getAddress())).toString());
}

main().catch(console.error);

