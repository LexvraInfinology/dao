const fs = require('fs');
const html = fs.readFileSync('docs/EQUORA_Fi_Matrix_Simulator_LATEST_VALIDATED_v1.4.html', 'utf8');
const scriptIdx = html.indexOf('<script>');
const bodyPart = html.slice(0, scriptIdx);
const cleaned = bodyPart.replace(/data:image\/[^;]+;base64,[^\"]+/g, 'DATA_URL');
const lines = cleaned.split('\n');
console.log('Total body lines:', lines.length);
for (let i = 25; i < lines.length; i++) {
  if (lines[i].trim()) {
    console.log(`${i}: ${lines[i].trim().slice(0, 160)}`);
  }
}
