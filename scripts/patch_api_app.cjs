const fs = require('fs');

let appTs = fs.readFileSync('apps/api/src/app.ts', 'utf8');

const srDecl = `  // Official Super Representative (SR) Address (Mainnet vs Testnet)
  const isMainnetEnv =
    process.env.IS_MAINNET === "true" ||
    process.env.NEXT_PUBLIC_IS_MAINNET === "true" ||
    (process.env.TARGET_NETWORK || process.env.NEXT_PUBLIC_TARGET_NETWORK || "").toLowerCase() === "mainnet";

  const OFFICIAL_SR_TESTNET_B58 = process.env.OFFICIAL_SR_TESTNET_ADDRESS || process.env.NEXT_PUBLIC_OFFICIAL_SR_TESTNET_ADDRESS || "TJRjpQo1M8Ai8LQaVqX1o6kCFvgR2qJvV5";
  const OFFICIAL_SR_TESTNET_HEX = "415cc58ba778a87ac1ea060d4aa116509691fb0ae0";
  const OFFICIAL_SR_MAINNET_B58 = process.env.OFFICIAL_SR_MAINNET_ADDRESS || process.env.NEXT_PUBLIC_OFFICIAL_SR_MAINNET_ADDRESS || "TC7LCXJ5qhhw6ewLzK8SJuJiwtWmLExLYY";
  const OFFICIAL_SR_MAINNET_HEX = "411779966a94d43d2c03ee4b15c4a86b599491f052";`;

appTs = appTs.replace(
  /\s*\/\/\s*Official Super Representative \(SR\) Address \(Mainnet\)[\s\S]*?const OFFICIAL_SR_MAINNET_B58 = "TC7LCXJ5qhhw6ewLzK8SJuJiwtWmLExLYY";/,
  '\n' + srDecl
);

// Also replace vote checking
const voteCheckRegex = /return\s*\(\s*rawV\s*===\s*OFFICIAL_SR_MAINNET_HEX\s*\|\|\s*rawV\s*===\s*OFFICIAL_SR_MAINNET_B58\.toLowerCase\(\)\s*\|\|\s*hexV\s*===\s*OFFICIAL_SR_MAINNET_HEX\s*\);/g;

const voteCheckRepl = `return (
                  rawV === OFFICIAL_SR_MAINNET_HEX ||
                  rawV === OFFICIAL_SR_TESTNET_HEX ||
                  rawV === OFFICIAL_SR_MAINNET_B58.toLowerCase() ||
                  rawV === OFFICIAL_SR_TESTNET_B58.toLowerCase() ||
                  hexV === OFFICIAL_SR_MAINNET_HEX ||
                  hexV === OFFICIAL_SR_TESTNET_HEX
                );`;

appTs = appTs.replace(voteCheckRegex, voteCheckRepl);

fs.writeFileSync('apps/api/src/app.ts', appTs, 'utf8');
console.log('Successfully patched apps/api/src/app.ts');

