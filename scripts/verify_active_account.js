const dbUrl = "postgresql://neondb_owner:npg_VzZWl5Td8gxf@ep-super-heart-ax2fet8a.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require";

async function main() {
  const address = "TFciprfGxcZ9W7gzwu1Nvc9cEoqnv8mdCp".toLowerCase();
  const res = await fetch("https://ep-super-heart-ax2fet8a.c-4.us-east-2.aws.neon.tech/sql", {
    method: "POST",
    headers: {
      "Neon-Connection-String": dbUrl,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      query: `INSERT INTO whatsapp_verifications (address, phone, verified, verified_at)
              VALUES ('${address}', '+919999999999', true, NOW())
              ON CONFLICT (address) DO UPDATE SET verified = true, verified_at = NOW();`
    })
  });
  const json = await res.json();
  console.log("Verified:", json);
}

main().catch(console.error);
