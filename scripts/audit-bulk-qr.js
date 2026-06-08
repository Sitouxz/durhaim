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

if (!/downloadBulkQR\(selectedSerials\)/.test(text) || !/downloadQrPng\(selectedSerials\)/.test(text)) {
  failures.push('Selected-row bulk bar does not export QR PDF and PNG directly.');
}

if (!/qrLayoutColumns/.test(text) || !/qrLayoutRows/.test(text)) {
  failures.push('QR export does not expose custom print layout rows and columns.');
}

if (!/useState\(16\)/.test(text) || !/useState\(32\)/.test(text)) {
  failures.push('QR export layout controls do not default to 16 columns and 32 rows.');
}

const exportModalSection = text.slice(text.indexOf('Export type'), text.indexOf('Advanced options'));
if (!exportModalSection.includes('Rows Per Sheet') || !exportModalSection.includes('QR layout columns')) {
  failures.push('QR layout row and column controls must stay visible before advanced options.');
}

if (!/qrExportScope/.test(text) || !/ALL_MATCHING_SERIALS/.test(text)) {
  failures.push('QR export does not allow exporting all matching serials.');
}

if (!/Filter Controls/.test(text) || !/Export Serials/.test(text)) {
  failures.push('Serials page must separate filter controls from export controls.');
}

if (!/showFilterModal/.test(text) || !/showExportModal/.test(text)) {
  failures.push('Serials filter and export controls must live in separate modals.');
}

if (!/exportDateFrom/.test(text) || !/exportDateTo/.test(text)) {
  failures.push('Export controls must expose a generated-date range.');
}

if (!/buildExportSerialsUrl/.test(text) || !/filterSerialsForExport/.test(text)) {
  failures.push('Export date and product filters must apply to all export scopes.');
}

if (!/aria-label="Open filter controls"/.test(text) || !/aria-label="Open export controls"/.test(text)) {
  failures.push('Serials toolbar must expose only compact filter and export buttons.');
}

if (!/getExportSerials/.test(text)) {
  failures.push('Export actions must share selected, current page, and all-filtered row selection.');
}

if (!/exportCsv = async/.test(text) || !/getExportSerials/.test(text)) {
  failures.push('CSV export must use the export row scope instead of only the current page.');
}

if (!/buildExportSerialsUrl\(nextPage, fetchPageSize\)/.test(text)) {
  failures.push('All-matching exports must use export-specific filters.');
}

if (!/QRCode\.toDataURL/.test(text) || !/new jsPDF/.test(text)) {
  failures.push('Bulk QR export must generate QR images and a PDF.');
}

for (const constant of [
  'QR_LABEL_MARGIN_MM',
  'QR_LABEL_PADDING_MM',
  'QR_LABEL_BORDER_WIDTH_MM',
]) {
  if (!text.includes(constant)) {
    failures.push(`QR exports must use shared ${constant} layout constant.`);
  }
}

if ((text.match(/calculateQrExportLayout\(\{ rows, columns/g) || []).length < 2) {
  failures.push('Bulk QR PDF and PNG exports must use the shared QR layout calculation.');
}

if (!/format: \[layout\.pageWidth, layout\.pageHeight\]/.test(text)) {
  failures.push('Bulk QR PDF must use flexible page dimensions from the shared layout.');
}

if (!/pdf\.rect\(cellX, cellY, layout\.cellWidth, layout\.cellHeight\)/.test(text)) {
  failures.push('Bulk QR PDF must draw a border around each label cell.');
}

if (!/context\.strokeRect\(cellX, cellY, layout\.cellWidth, layout\.cellHeight\)/.test(text)) {
  failures.push('Bulk QR PNG must draw a border around each label cell.');
}

if (!/handleExportSubmit/.test(text) || !/QR_PDF/.test(text) || !/QR_PNG/.test(text)) {
  failures.push('Export modal does not submit CSV, QR PDF, and QR PNG actions explicitly.');
}

[
  'exportProductIds',
  'showExportAdvanced',
  'Export type',
  'Advanced options',
  'handleExportSubmit',
  'aria-live="polite"',
].forEach((requiredText) => {
  if (!text.includes(requiredText)) {
    failures.push(`Missing simplified export behavior: ${requiredText}`);
  }
});

if (!/EXPORT \{exportScopeCount\} SERIAL/.test(text)) {
  failures.push('Export modal does not expose an explicit count-aware export button.');
}

if (/onChange=\{\(event\) => handleExportAction/.test(text)) {
  failures.push('Choosing an export type must not immediately start the export.');
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

  if (!/const layout = calculateQrExportLayout\(\{ rows, columns \}\);/.test(body)) {
    failures.push('Bulk QR PDF must use shared layout geometry.');
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
