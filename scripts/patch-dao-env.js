const fs = require("fs");
const path = "apps/web-dao/.env.local";
let content = fs.readFileSync(path, "utf8");
content = content.replace(/NEXT_PUBLIC_MAGIC_BOX_ADDRESS="[^"]*"/, 'NEXT_PUBLIC_MAGIC_BOX_ADDRESS="TFVFJcD27qeQnqVLEpSiHt4zcMctomsxYQ"');
content = content.replace(/NEXT_PUBLIC_MAGIC_BOX_HEX="[^"]*"/, 'NEXT_PUBLIC_MAGIC_BOX_HEX="413c8707a4c66a120d99c7f54c58368a14f2342f25"');
fs.writeFileSync(path, content, "utf8");
console.log("Updated web-dao .env.local");

