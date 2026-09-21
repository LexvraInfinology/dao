import crypto from "crypto";
import { SiweMessage, generateNonce } from "siwe";
import jwt from "jsonwebtoken";
import prisma from "@equora/database";
import { config } from "../../config";

export class AuthService {
  /**
   * Generate an EIP-4361 compliant cryptographic nonce and store in DB/memory
   */
  async generateNonceForAddress(address: string): Promise<string> {
    const canonicalAddress = address.toLowerCase();
    const nonce = generateNonce();
    const expiresAt = new Date(Date.now() + config.siwe.nonceTtlSeconds * 1000);

    // Store in PostgreSQL database (or Redis if active)
    await prisma.authNonce.create({
      data: {
        address: canonicalAddress,
        nonce,
        expiresAt,
      },
    });

    return nonce;
  }

  /**
   * Verify SIWE signature and issue JWT session token
   */
  async verifySignature(messageText: string, signature: string) {
    const siweMessage = new SiweMessage(messageText);
    const { data: fields } = await siweMessage.verify({ signature });

    const canonicalAddress = fields.address.toLowerCase();

    // Verify nonce matches and is not expired
    const validNonce = await prisma.authNonce.findFirst({
      where: {
        address: canonicalAddress,
        nonce: fields.nonce,
        expiresAt: { gt: new Date() },
      },
    });

    if (!validNonce) {
      throw new Error("Invalid or expired authentication challenge nonce.");
    }

    // Delete used nonce (prevent replay attacks)
    await prisma.authNonce.deleteMany({
      where: {
        address: canonicalAddress,
      },
    });

    // Check if user is registered in database
    const user = await prisma.user.findUnique({
      where: { address: canonicalAddress },
    });

    // Issue JWT token
    const token = jwt.sign(
      {
        address: canonicalAddress,
        chainId: fields.chainId,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn as any }
    );

    return {
      token,
      user: {
        address: canonicalAddress,
        chainId: fields.chainId,
        isRegistered: !!user,
        userId: user?.userId ?? null,
        sponsor: user?.sponsorAddress ?? null,
        isQualified: user?.isQualified ?? false,
      },
    };
  }

  /**
   * Get user session profile by token address
   */
  async getSessionProfile(address: string) {
    const canonicalAddress = address.toLowerCase();
    const user = await prisma.user.findUnique({
      where: { address: canonicalAddress },
      include: {
        daoMembership: true,
        nftBadges: true,
      },
    });

    return {
      address: canonicalAddress,
      isRegistered: !!user,
      userId: user?.userId ?? null,
      sponsor: user?.sponsorAddress ?? null,
      isQualified: user?.isQualified ?? false,
      directReferralsCount: user?.directReferralsCount ?? 0,
      daoPosition: user?.daoMembership?.position ?? null,
      nftRanks: user?.nftBadges.map((b) => b.rank) ?? [],
    };
  }
}

export const authService = new AuthService();
