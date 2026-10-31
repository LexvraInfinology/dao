const { ethers } = require('ethers');
const B58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
function encode58(buffer) {
  const digits = [0];
  for (let i = 0; i < buffer.length; i++) {
    for (let j = 0; j < digits.length; j++) digits[j] <<= 8;
    digits[0] += buffer[i];
    let carry = 0;
    for (let j = 0; j < digits.length; j++) {
      bytes = digits[j] + carry;
      carry = (bytes / 58) | 0;
      digits[j] = bytes % 58;
    }
    while (carry) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  for (let i = 0; i < buffer.length && buffer[i] === 0; i++) digits.push(0);
  return digits.reverse().map((d) => B58_ALPHABET[d]).join('');
}
function hexToBase58(hex) {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  const addressHex = clean.length === 40 ? '41' + clean : clean;
  const buffer = Buffer.from(addressHex, 'hex');
  const h1 = ethers.sha256(buffer);
  const h2 = ethers.sha256(ethers.getBytes(h1));
  const checksum = ethers.getBytes(h2).slice(0, 4);
  const total = new Uint8Array(buffer.length + 4);
  total.set(buffer);
  total.set(checksum, buffer.length);
  return encode58(total);
}

const underfundedWallets = [
  { seat: 12, hex: '0x11CB6581c990836Dd830FFDB1289173167Ad5B35' },
  { seat: 76, hex: '0x14Ca3FF097277C8DCeACB045746a1eA9125Fa549' },
  { seat: 79, hex: '0xA3CAf1d9a5D24a1179A5EC802De1e52bf6E00386' },
  { seat: 80, hex: '0x89B93deD80f0a6B93AB012AFd4745CB759767A63' },
  { seat: 84, hex: '0xC54AE4f43c00faeD38F135AbBdA244b22e2F4a97' },
  { seat: 85, hex: '0x1aA278132cB6410E5dDe9977e8539B40Fd8f026B' },
  { seat: 90, hex: '0x5a982e56c444f6d8e4Cc369F982b07f45a4e95aA' },
  { seat: 91, hex: '0xC59C54a719e2CB5af3f90A72e390a81Fe4fb5c33' }
];

underfundedWallets.forEach(w => {
  console.log('Seat ' + w.seat + ': hex = ' + w.hex + ' -> base58 = ' + hexToBase58(w.hex));
});

