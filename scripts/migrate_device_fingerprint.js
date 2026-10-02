const dbUrl = "postgresql://neondb_owner:npg_VzZWl5Td8gxf@ep-super-heart-ax2fet8a.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require";

async function main() {
  const res = await fetch("https://ep-super-heart-ax2fet8a.c-4.us-east-2.aws.neon.tech/sql", {
    method: "POST",
    headers: {
      "Neon-Connection-String": dbUrl,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      query: `ALTER TABLE "DaoMember" ADD COLUMN IF NOT EXISTS "deviceFingerprint" text;`
    })
  });
  const json = await res.json();
  console.log("Migration result:", json);
}

main().catch(console.error);
