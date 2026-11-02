const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '../apps/web-matrix/lib/contracts.ts');
let content = fs.readFileSync(file, 'utf8');

// 1. Patch getOnChainAllSlots to guard against empty raw
const targetAllSlots = `  const raw = await queryTrobConstant(
    CONTRACT_ADDRESSES.matrix,
    "getAllSlotsStatus(address)",
    param
  );

  const [unlockedArr, cyclesArr, filledArr] = coder.decode(
    ["bool[12]", "uint256[12]", "uint256[12]"],
    "0x" + raw
  );`;

const replaceAllSlots = `  const raw = await queryTrobConstant(
    CONTRACT_ADDRESSES.matrix,
    "getAllSlotsStatus(address)",
    param
  );

  if (!raw || raw.length < 64) {
    return [];
  }

  let unlockedArr: any[], cyclesArr: any[], filledArr: any[];
  try {
    const decoded = coder.decode(
      ["bool[12]", "uint256[12]", "uint256[12]"],
      "0x" + raw
    );
    unlockedArr = decoded[0];
    cyclesArr = decoded[1];
    filledArr = decoded[2];
  } catch {
    return [];
  }`;

content = content.replace(/\r\n/g, '\n');
const targetNorm = targetAllSlots.replace(/\r\n/g, '\n');
if (content.includes(targetNorm)) {
  content = content.replace(targetNorm, replaceAllSlots);
  console.log('Patched getOnChainAllSlots to prevent BUFFER_OVERRUN');
} else {
  console.log('Note: targetAllSlots not found');
}

// 2. Patch isUserRegisteredInMatrix to purge stale localStorage when slot 1 is not unlocked
const targetRegistered = `  // Authoritative on-chain Slot 1 status in EquoraMatrix contract
  try {
    const slot1 = await getOnChainSlotStatus(userAddress, 1);
    if (slot1 && slot1.isUnlocked) {
      if (typeof window !== "undefined") {
        localStorage.setItem(\`equora_matrix_registered_\${clean}\`, "true");
        localStorage.setItem(\`equora_matrix_registered_\${b58.toLowerCase()}\`, "true");
        localStorage.setItem(\`equora_matrix_registered_\${hex}\`, "true");
      }
      return true;
    }
  } catch (err) {
    console.warn("[isUserRegisteredInMatrix] Slot 1 check notice:", err);
  }

  // Fallback: check localStorage cache
  if (typeof window !== "undefined") {
    const cached =
      localStorage.getItem(\`equora_matrix_registered_\${clean}\`) === "true" ||
      localStorage.getItem(\`equora_matrix_registered_\${b58.toLowerCase()}\`) === "true" ||
      localStorage.getItem(\`equora_matrix_registered_\${hex}\`) === "true";
    if (cached) {
      return true;
    }
  }

  return false;`;

const replaceRegistered = `  // Authoritative on-chain Slot 1 status in EquoraMatrix contract
  try {
    const slot1 = await getOnChainSlotStatus(userAddress, 1);
    if (slot1 && slot1.isUnlocked) {
      if (typeof window !== "undefined") {
        localStorage.setItem(\`equora_matrix_registered_\${clean}\`, "true");
        localStorage.setItem(\`equora_matrix_registered_\${b58.toLowerCase()}\`, "true");
        localStorage.setItem(\`equora_matrix_registered_\${hex}\`, "true");
      }
      return true;
    } else {
      // Definitive check returned false: CLEAR stale localStorage cache so user sees /gate!
      if (typeof window !== "undefined") {
        localStorage.removeItem(\`equora_matrix_registered_\${clean}\`);
        localStorage.removeItem(\`equora_matrix_registered_\${b58.toLowerCase()}\`);
        localStorage.removeItem(\`equora_matrix_registered_\${hex}\`);
      }
      return false;
    }
  } catch (err) {
    console.warn("[isUserRegisteredInMatrix] Slot 1 check notice:", err);
  }

  return false;`;

const targetRegNorm = targetRegistered.replace(/\r\n/g, '\n');
if (content.includes(targetRegNorm)) {
  content = content.replace(targetRegNorm, replaceRegistered);
  console.log('Patched isUserRegisteredInMatrix to purge stale registration and stay on /gate');
} else {
  console.log('Note: targetRegistered not found');
}

fs.writeFileSync(file, content, 'utf8');
console.log('Finished patching apps/web-matrix/lib/contracts.ts');

