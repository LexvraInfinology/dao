import prisma from "@equora/database";

export async function handleUserRegistered(event: {
  user: string;
  sponsor: string;
  userId: bigint;
  timestamp: bigint;
  txHash: string;
  blockNumber: bigint;
}) {
  const canonicalUser = event.user.toLowerCase();
  const canonicalSponsor =
    event.sponsor && event.sponsor !== "0x0000000000000000000000000000000000000000"
      ? event.sponsor.toLowerCase()
      : null;

  const regDate = new Date(Number(event.timestamp) * 1000);

  await prisma.$transaction(async (tx) => {
    // 1. Create / Upsert registered user
    await tx.user.upsert({
      where: { address: canonicalUser },
      create: {
        address: canonicalUser,
        userId: Number(event.userId),
        sponsorAddress: canonicalSponsor,
        registrationTimestamp: regDate,
        txHash: event.txHash,
        blockNumber: event.blockNumber,
        directReferralsCount: 0,
        isQualified: false,
      },
      update: {
        userId: Number(event.userId),
        sponsorAddress: canonicalSponsor,
        registrationTimestamp: regDate,
        txHash: event.txHash,
        blockNumber: event.blockNumber,
      },
    });

    // 2. Increment sponsor's referral count and check qualification (>= 2)
    if (canonicalSponsor) {
      const sponsor = await tx.user.findUnique({
        where: { address: canonicalSponsor },
      });

      if (sponsor) {
        const newCount = sponsor.directReferralsCount + 1;
        await tx.user.update({
          where: { address: canonicalSponsor },
          data: {
            directReferralsCount: newCount,
            isQualified: newCount >= 2,
          },
        });
      }
    }
  });

  console.log(`👤 [Indexer] User #${event.userId} Registered: ${canonicalUser} (Sponsor: ${canonicalSponsor || "ROOT"})`);
}
