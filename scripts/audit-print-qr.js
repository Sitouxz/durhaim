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

if (body.includes('window.close()') || body.includes('printWindow.close()')) {
  console.error('printQR closes the print window automatically, which can make the QR popup blink and disappear.');
  process.exit(1);
}

if (!body.includes('qrImage.onload')) {
  console.error('printQR does not wait for the QR image to load before printing.');
  process.exit(1);
}

if (body.includes("logo.textContent = 'DURHAIM'") || body.includes("caption.textContent = 'Scan to Verify Authenticity'")) {
  console.error('printQR must not include DURHAIM or Scan to Verify Authenticity text.');
  process.exit(1);
}

if (!body.includes('width: 100%; height: 100%;') || !body.includes('@page { margin: 2mm; }')) {
  console.error('printQR must render only a full-page QR with minimal print margin.');
  process.exit(1);
}

if (body.includes('serialText') || body.includes('font-size: clamp(') || body.includes('white-space: nowrap')) {
  console.error('printQR must not render serial text.');
  process.exit(1);
}

console.log('QR print popup opens synchronously.');
