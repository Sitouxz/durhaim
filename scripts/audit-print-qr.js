const fs = require('fs');
const path = require('path');

const file = path.join(process.cwd(), 'src', 'app', 'admin', 'serials', 'page.tsx');
const text = fs.readFileSync(file, 'utf8');
const fnMatch = text.match(/const printQR = async \(serial: string\) => \{([\s\S]*?)\n  \};/);

if (!fnMatch) {
  console.error('Could not find printQR function.');
  process.exit(1);
}

const body = fnMatch[1];
const windowOpenIndex = body.indexOf('window.open');
const qrAwaitIndex = body.indexOf('await QRCode.toDataURL');

if (windowOpenIndex === -1) {
  console.error('printQR does not open a print window.');
  process.exit(1);
}

if (qrAwaitIndex !== -1 && qrAwaitIndex < windowOpenIndex) {
  console.error('printQR opens the print window after async QR generation, which browsers can block.');
  process.exit(1);
}

console.log('QR print popup opens synchronously.');
