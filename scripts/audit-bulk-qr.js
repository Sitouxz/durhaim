const fs = require('fs');
const path = require('path');

const file = path.join(process.cwd(), 'src', 'app', 'admin', 'serials', 'page.tsx');
const text = fs.readFileSync(file, 'utf8');
const failures = [];

if (!/from ['"]jspdf['"]/.test(text)) {
  failures.push('Admin serials page does not import jsPDF.');
}

if (!/const downloadBulkQR/.test(text)) {
  failures.push('Admin serials page does not define downloadBulkQR.');
}

if (!/QRCode\.toDataURL/.test(text) || !/new jsPDF/.test(text)) {
  failures.push('Bulk QR export must generate QR images and a PDF.');
}

if (!/onClick=\{downloadBulkQR\}/.test(text)) {
  failures.push('No toolbar button calls downloadBulkQR.');
}

if (!/QR PDF/.test(text)) {
  failures.push('Toolbar does not expose a QR PDF action.');
}

if (failures.length) {
  console.error('Bulk QR audit failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Bulk QR PDF export is present.');
