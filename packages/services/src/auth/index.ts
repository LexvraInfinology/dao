import { SiweMessage, generateNonce } from "siwe";
import jwt from "jsonwebtoken";
import prisma from "@equora/database";
import { servicesConfig } from "../config";
import { AuthVerifyResultDTO, SessionProfileDTO } from "./model";

export class AuthService {
  async generateNonceForAddress(address: string): Promise<string> {
    const canonicalAddress = address.toLowerCase();
    const nonce = generateNonce();
    const expiresAt = new Date(Date.now() + servicesConfig.siwe.nonceTtlSeconds * 1000);

    await prisma.authNonce.create({
      data: {
        address: canonicalAddress,
        nonce,
        expiresAt,
      },
    });

    return nonce;
  }

  async verifySignature(messageText: string, signature: string): Promise<AuthVerifyResultDTO> {
    const siweMessage = new SiweMessage(messageText);
    const { data: fields } = await siweMessage.verify({ signature });

    const canonicalAddress = fields.address.toLowerCase();

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

    await prisma.authNonce.deleteMany({
      where: {
        address: canonicalAddress,
      },
    });

    const user = await prisma.user.findUnique({
      where: { address: canonicalAddress },
    });

    const token = jwt.sign(
      {
        address: canonicalAddress,
        chainId: fields.chainId,
      },
      servicesConfig.jwt.secret,
      { expiresIn: servicesConfig.jwt.expiresIn as any }
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

  async verifyToken(token: string): Promise<{ address: string; chainId?: number }> {
    try {
      const decoded = jwt.verify(token, servicesConfig.jwt.secret) as {
        address: string;
        chainId?: number;
      };
      return decoded;
    } catch (err) {
      throw new Error("Invalid or expired session token.");
    }
  }

  async getSessionProfile(address: string): Promise<SessionProfileDTO | null> {
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
      daoMember: !!user?.daoMembership,
      daoPosition: user?.daoMembership?.position ?? null,
      nftBadgesCount: user?.nftBadges.length ?? 0,
    };
  }
}

export const authService = new AuthService();
export * from "./model";
