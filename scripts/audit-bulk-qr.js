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

if (!/const downloadQrPng/.test(text)) {
  failures.push('Admin serials page does not define downloadQrPng.');
}

if (!/qrLayoutColumns/.test(text) || !/qrLayoutRows/.test(text)) {
  failures.push('QR export does not expose custom print layout rows and columns.');
}

if (!/qrExportScope/.test(text) || !/ALL_FILTERED_SERIALS/.test(text)) {
  failures.push('QR export does not allow exporting all matching serials.');
}

if (!/QRCode\.toDataURL/.test(text) || !/new jsPDF/.test(text)) {
  failures.push('Bulk QR export must generate QR images and a PDF.');
}

if (!/handleExportAction/.test(text) || !/QR_PDF/.test(text) || !/QR_PNG/.test(text)) {
  failures.push('Toolbar does not use a single export dropdown with QR PDF and QR PNG actions.');
}

if (!/QR PDF/.test(text)) {
  failures.push('Toolbar does not expose a QR PDF action.');
}

if (!/QR PNG/.test(text)) {
  failures.push('Toolbar does not expose a QR PNG action.');
}

if (/onClick=\{downloadBulkQR\}/.test(text) || /onClick=\{downloadQrPng\}/.test(text)) {
  failures.push('Toolbar should not expose separate QR PDF/PNG buttons.');
}

const bulkQrMatch = text.match(/const downloadBulkQR = async[\s\S]*?\n  const handleGenerate/);
if (!bulkQrMatch) {
  failures.push('Could not inspect downloadBulkQR body.');
} else {
  const body = bulkQrMatch[0];
  const serialTextIndex = body.indexOf('pdf.text(serial.serial');
  const qrImageIndex = body.indexOf('pdf.addImage(dataUrl');

  if (!/const qrGap = 1;/.test(body) || !/const margin = 2;/.test(body)) {
    failures.push('Bulk QR PDF must use minimal margins and gaps.');
  }

  if (body.includes("pdf.text('DURHAIM'") || body.includes("pdf.text('Scan to Verify Authenticity'") || body.includes('pdf.text(serial.serial')) {
    failures.push('Bulk QR PDF must print only QR images with no text.');
  }

  if (qrImageIndex === -1) {
    failures.push('Bulk QR PDF must add QR images to the page.');
  }

  if (body.includes('pdf.splitTextToSize(serial.serial')) {
    failures.push('Bulk QR PDF serial text must stay on one line.');
  }
}

if (failures.length) {
  console.error('Bulk QR audit failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Bulk QR PDF export is present.');
