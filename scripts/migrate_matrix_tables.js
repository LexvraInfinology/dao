async function migrate() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error("DATABASE_URL environment variable is required");
  }
  const directUrl = dbUrl.replace("-pooler.", ".");
  const match = directUrl.match(/@([^/:]+)/);
  const host = match ? match[1] : "";
  const endpoint = `https://${host}/sql`;

  const ddlStatements = [
    `ALTER TABLE "MatrixSlot" ADD COLUMN IF NOT EXISTS "recyclesCount" INTEGER NOT NULL DEFAULT 0;`,

    `CREATE TABLE IF NOT EXISTS "MatrixProfile" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userAddress" TEXT NOT NULL UNIQUE,
      "username" TEXT,
      "avatarUrl" TEXT,
      "bio" TEXT,
      "telegram" TEXT,
      "twitter" TEXT,
      "totalEarnings" DECIMAL(36,18) NOT NULL DEFAULT 0,
      "directEarnings" DECIMAL(36,18) NOT NULL DEFAULT 0,
      "matrixEarnings" DECIMAL(36,18) NOT NULL DEFAULT 0,
      "poolEarnings" DECIMAL(36,18) NOT NULL DEFAULT 0,
      "availableBalance" DECIMAL(36,18) NOT NULL DEFAULT 0,
      "withdrawnTotal" DECIMAL(36,18) NOT NULL DEFAULT 0,
      "recyclesCount" INTEGER NOT NULL DEFAULT 0,
      "teamCount" INTEGER NOT NULL DEFAULT 0,
      "rankTier" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "MatrixProfile_userAddress_fkey" FOREIGN KEY ("userAddress") REFERENCES "User"("address") ON DELETE CASCADE ON UPDATE CASCADE
    );`,
    `CREATE INDEX IF NOT EXISTS "MatrixProfile_userAddress_idx" ON "MatrixProfile"("userAddress");`,
    `CREATE INDEX IF NOT EXISTS "MatrixProfile_rankTier_idx" ON "MatrixProfile"("rankTier");`,
    `CREATE INDEX IF NOT EXISTS "MatrixProfile_totalEarnings_idx" ON "MatrixProfile"("totalEarnings");`,

    `CREATE TABLE IF NOT EXISTS "MatrixTransaction" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userAddress" TEXT NOT NULL,
      "type" TEXT NOT NULL,
      "slotNumber" INTEGER,
      "cycle" INTEGER,
      "position" INTEGER,
      "amount" DECIMAL(36,18) NOT NULL,
      "amountUsd" DECIMAL(36,18),
      "token" TEXT NOT NULL DEFAULT 'TROB',
      "fromAddress" TEXT,
      "toAddress" TEXT,
      "txHash" TEXT,
      "status" TEXT NOT NULL DEFAULT 'COMPLETED',
      "description" TEXT,
      "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "MatrixTransaction_userAddress_fkey" FOREIGN KEY ("userAddress") REFERENCES "User"("address") ON DELETE CASCADE ON UPDATE CASCADE
    );`,
    `CREATE INDEX IF NOT EXISTS "MatrixTransaction_userAddress_idx" ON "MatrixTransaction"("userAddress");`,
    `CREATE INDEX IF NOT EXISTS "MatrixTransaction_type_idx" ON "MatrixTransaction"("type");`,
    `CREATE INDEX IF NOT EXISTS "MatrixTransaction_status_idx" ON "MatrixTransaction"("status");`,
    `CREATE INDEX IF NOT EXISTS "MatrixTransaction_timestamp_idx" ON "MatrixTransaction"("timestamp");`,

    `CREATE TABLE IF NOT EXISTS "MatrixActivity" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userAddress" TEXT NOT NULL,
      "action" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "description" TEXT NOT NULL,
      "slotNumber" INTEGER,
      "amount" DECIMAL(36,18),
      "txHash" TEXT,
      "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "MatrixActivity_userAddress_fkey" FOREIGN KEY ("userAddress") REFERENCES "User"("address") ON DELETE CASCADE ON UPDATE CASCADE
    );`,
    `CREATE INDEX IF NOT EXISTS "MatrixActivity_userAddress_idx" ON "MatrixActivity"("userAddress");`,
    `CREATE INDEX IF NOT EXISTS "MatrixActivity_action_idx" ON "MatrixActivity"("action");`,
    `CREATE INDEX IF NOT EXISTS "MatrixActivity_timestamp_idx" ON "MatrixActivity"("timestamp");`,

    `CREATE TABLE IF NOT EXISTS "MatrixSettings" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userAddress" TEXT NOT NULL UNIQUE,
      "autoUpgrade" BOOLEAN NOT NULL DEFAULT true,
      "autoReinvest" BOOLEAN NOT NULL DEFAULT true,
      "telegramNotifications" BOOLEAN NOT NULL DEFAULT true,
      "emailNotifications" BOOLEAN NOT NULL DEFAULT false,
      "soundEffects" BOOLEAN NOT NULL DEFAULT true,
      "currency" TEXT NOT NULL DEFAULT 'USD',
      "theme" TEXT NOT NULL DEFAULT 'dark',
      "matrixDisplayMode" TEXT NOT NULL DEFAULT 'level',
      "hideZeroBalances" BOOLEAN NOT NULL DEFAULT false,
      "email" TEXT,
      "telegram" TEXT,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "MatrixSettings_userAddress_fkey" FOREIGN KEY ("userAddress") REFERENCES "User"("address") ON DELETE CASCADE ON UPDATE CASCADE
    );`,
    `CREATE INDEX IF NOT EXISTS "MatrixSettings_userAddress_idx" ON "MatrixSettings"("userAddress");`,

    `CREATE TABLE IF NOT EXISTS "MatrixRankPoolState" (
      "tier" INTEGER NOT NULL PRIMARY KEY,
      "tierName" TEXT NOT NULL,
      "poolBalance" DECIMAL(36,18) NOT NULL DEFAULT 0,
      "totalDistributed" DECIMAL(36,18) NOT NULL DEFAULT 0,
      "qualifierCount" INTEGER NOT NULL DEFAULT 0,
      "nextDistributionAt" TIMESTAMP(3),
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`
  ];

  console.log(`Executing ${ddlStatements.length} DDL migrations on Neon DB via HTTPS...`);
  for (let i = 0; i < ddlStatements.length; i++) {
    const stmt = ddlStatements[i];
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Neon-Connection-String': dbUrl,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: stmt })
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`Statement ${i + 1} failed:`, err);
    } else {
      console.log(`✓ Statement ${i + 1} succeeded.`);
    }
  }

  console.log('✅ Matrix tables migration completed successfully!');
}

migrate().catch(console.error);
