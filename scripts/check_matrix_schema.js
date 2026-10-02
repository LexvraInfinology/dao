const dbUrl = "postgresql://neondb_owner:npg_VzZWl5Td8gxf@ep-super-heart-ax2fet8a.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require";

async function main() {
  for (const table of ['MatrixSlot', 'MatrixPlacement', 'MatrixCycleEvent']) {
    const res = await fetch("https://ep-super-heart-ax2fet8a.c-4.us-east-2.aws.neon.tech/sql", {
      method: "POST",
      headers: {
        "Neon-Connection-String": dbUrl,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query: `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${table}';`
      })
    });
    const json = await res.json();
    console.log(`Columns for ${table}:`, json.rows.map(r => `${r.column_name} (${r.data_type})`));
  }
}

main().catch(console.error);
