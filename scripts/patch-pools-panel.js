const fs = require("fs");
const path = "apps/web-matrix/components/dashboard/ProtocolPoolsPanel.tsx";
let code = fs.readFileSync(path, "utf8");
code = code.replace(/claimableRewards\?\.magicBoxClaimableTrob \|\| 88\.25/g, "claimableRewards?.magicBoxClaimableTrob || 8.93");
fs.writeFileSync(path, code, "utf8");
console.log("Updated ProtocolPoolsPanel.tsx");

