import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import {
  BTitanDAOMembership,
} from "../typechain-types";

describe("BTitanDAOMembership — Soulbound ERC-721 Verification", function () {
  let membershipNFT: BTitanDAOMembership;
  let daoSigner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;

  beforeEach(async function () {
    [daoSigner, user1, user2] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("BTitanDAOMembership");
    membershipNFT = await Factory.deploy(daoSigner.address);
  });

  it("Should allow the authorized DAO contract to mint tokens", async function () {
    await membershipNFT.connect(daoSigner).mint(user1.address, 1);
    expect(await membershipNFT.ownerOf(1)).to.equal(user1.address);
    expect(await membershipNFT.getPosition(user1.address)).to.equal(1n);
  });

  it("Should revert if an unauthorized caller attempts to mint", async function () {
    await expect(membershipNFT.connect(user1).mint(user1.address, 1)).to.be.revertedWithCustomError(
      membershipNFT,
      "OnlyDAO"
    );
  });

  it("Should strictly REVERT on transferFrom (Soulbound Property)", async function () {
    await membershipNFT.connect(daoSigner).mint(user1.address, 1);

    // Attempt transfer from user1 to user2
    await expect(
      membershipNFT.connect(user1).transferFrom(user1.address, user2.address, 1)
    ).to.be.revertedWithCustomError(membershipNFT, "SoulboundTransferBlocked");
  });

  it("Should strictly REVERT on safeTransferFrom (Soulbound Property)", async function () {
    await membershipNFT.connect(daoSigner).mint(user1.address, 1);

    // Attempt safeTransferFrom
    await expect(
      membershipNFT.connect(user1)["safeTransferFrom(address,address,uint256)"](
        user1.address,
        user2.address,
        1
      )
    ).to.be.revertedWithCustomError(membershipNFT, "SoulboundTransferBlocked");
  });
});
