const dbUrl = "postgresql://neondb_owner:npg_VzZWl5Td8gxf@ep-super-heart-ax2fet8a.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require";

async function main() {
  const query = `
    ALTER TABLE "DaoMember" 
    ADD COLUMN IF NOT EXISTS "retopupDeadline" TIMESTAMP WITHOUT TIME ZONE,
    ADD COLUMN IF NOT EXISTS "cappedAt" TIMESTAMP WITHOUT TIME ZONE,
    ADD COLUMN IF NOT EXISTS "retopupCount" INTEGER DEFAULT 0;
  `;

  const res = await fetch("https://ep-super-heart-ax2fet8a.c-4.us-east-2.aws.neon.tech/sql", {
    method: "POST",
    headers: {
      "Neon-Connection-String": dbUrl,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query })
  });

  const json = await res.json();
  console.log("Migration status:", json);
}

main().catch(console.error);
