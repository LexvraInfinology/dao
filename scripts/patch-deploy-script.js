const fs = require("fs");
const path = require("path");

const file = path.resolve(__dirname, "../packages/hardhat/scripts/deploy-fresh-ecosystem.js");
let content = fs.readFileSync(file, "utf8");

const startStr = "// K. Register 2 DAO IDs";
const endStr = 'EquoraDAOv2.migrateGenuineMembers(Seat 1 & Seat 2)"\n  );';
const endStrCRLF = 'EquoraDAOv2.migrateGenuineMembers(Seat 1 & Seat 2)"\r\n  );';

let startIdx = content.indexOf(startStr);
let endIdx = content.indexOf(endStr);
let offset = endStr.length;

if (endIdx === -1) {
  endIdx = content.indexOf(endStrCRLF);
  offset = endStrCRLF.length;
}

if (startIdx !== -1 && endIdx !== -1) {
  const replacement = `// K. Pristine DAO starts with 0 members (No past IDs merged)
  console.log("\\n======================================================");
  console.log("🏛️ PRISTINE DAO: 0 INITIAL MEMBERS (NO PAST IDs)");
  console.log("======================================================");`;
  content = content.slice(0, startIdx) + replacement + content.slice(endIdx + offset);
  fs.writeFileSync(file, content, "utf8");
  console.log("✅ Successfully replaced step K with pristine 0-member DAO initialization!");
} else {
  console.error("❌ Could not find target strings:", { startIdx, endIdx });
}
