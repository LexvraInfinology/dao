import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import {
  EquoraDAOMembership,
} from "../typechain-types";

describe("EquoraDAOMembership — Soulbound ERC-721 Verification", function () {
  let membershipNFT: EquoraDAOMembership;
  let daoSigner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;

  beforeEach(async function () {
    [daoSigner, user1, user2] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("EquoraDAOMembership");
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

  it("Should allow authorized DAO to reassign a defaulted seat to a new member", async function () {
    await membershipNFT.connect(daoSigner).mint(user1.address, 1);
    expect(await membershipNFT.ownerOf(1)).to.equal(user1.address);
    expect(await membershipNFT.isMember(user1.address)).to.be.true;

    // DAO reassigns seat 1 from user1 to user2
    await membershipNFT.connect(daoSigner).reassignSeat(user1.address, user2.address, 1);

    expect(await membershipNFT.ownerOf(1)).to.equal(user2.address);
    expect(await membershipNFT.isMember(user1.address)).to.be.false;
    expect(await membershipNFT.isMember(user2.address)).to.be.true;
    expect(await membershipNFT.getPosition(user2.address)).to.equal(1n);
    expect(await membershipNFT.totalSupply()).to.equal(1n);
  });

  it("Should revert if an unauthorized caller attempts to reassign a seat", async function () {
    await membershipNFT.connect(daoSigner).mint(user1.address, 1);
    await expect(
      membershipNFT.connect(user1).reassignSeat(user1.address, user2.address, 1)
    ).to.be.revertedWithCustomError(membershipNFT, "OnlyDAO");
  });
});
