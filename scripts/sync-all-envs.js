const fs = require("fs");
const path = require("path");

const NEW_CONTRACTS = {
  MATRIX_ADDRESS: "TCNeVcVAA3H22QxxRsmG2NsXCsk1q3JpFz",
  MATRIX_HEX: "411a5f193d5b9654282fed67931d9123c00da9c879",
  REGISTRY_ADDRESS: "TCPJuV7134EpeaBrqkUAWa2uiMa38EJTpN",
  REGISTRY_HEX: "411a7f29b91424fd6715c5048b458dcf7beeeaeebc",
  NFT_ADDRESS: "TYhsf65YRD64Dz5b8CpRsjGzb22ZYtacZj",
  NFT_HEX: "41f964817a670445817918c88f926b5850d753474d",
};

const envFiles = [
  path.resolve(__dirname, "../apps/web-matrix/.env.local"),
  path.resolve(__dirname, "../apps/web-dao/.env.local"),
  path.resolve(__dirname, "../.env"),
];

for (const envPath of envFiles) {
  if (!fs.existsSync(envPath)) continue;
  let content = fs.readFileSync(envPath, "utf8");

  content = content.replace(/NEXT_PUBLIC_MATRIX_ADDRESS=[^\r\n]*/g, `NEXT_PUBLIC_MATRIX_ADDRESS=${NEW_CONTRACTS.MATRIX_ADDRESS}`);
  content = content.replace(/NEXT_PUBLIC_MATRIX_HEX=[^\r\n]*/g, `NEXT_PUBLIC_MATRIX_HEX=${NEW_CONTRACTS.MATRIX_HEX}`);

  content = content.replace(/NEXT_PUBLIC_REGISTRY_ADDRESS=[^\r\n]*/g, `NEXT_PUBLIC_REGISTRY_ADDRESS=${NEW_CONTRACTS.REGISTRY_ADDRESS}`);
  content = content.replace(/NEXT_PUBLIC_REGISTRY_HEX=[^\r\n]*/g, `NEXT_PUBLIC_REGISTRY_HEX=${NEW_CONTRACTS.REGISTRY_HEX}`);

  // In web-matrix update NFT as well
  if (envPath.includes("web-matrix")) {
    content = content.replace(/NEXT_PUBLIC_NFT_ADDRESS=[^\r\n]*/g, `NEXT_PUBLIC_NFT_ADDRESS=${NEW_CONTRACTS.NFT_ADDRESS}`);
    content = content.replace(/NEXT_PUBLIC_NFT_HEX=[^\r\n]*/g, `NEXT_PUBLIC_NFT_HEX=${NEW_CONTRACTS.NFT_HEX}`);
  }

  fs.writeFileSync(envPath, content);
  console.log(`✅ Synced contracts into ${path.relative(path.resolve(__dirname, ".."), envPath)}`);
}

