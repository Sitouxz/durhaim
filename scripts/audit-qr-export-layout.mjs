import assert from 'node:assert/strict';
import {
  calculateQrExportLayout,
  QR_LABEL_BORDER_WIDTH_MM,
  QR_LABEL_GAP_MM,
  QR_LABEL_MARGIN_MM,
  QR_LABEL_PADDING_MM,
} from '../src/lib/qr-export-layout.ts';

const wide = calculateQrExportLayout({ rows: 4, columns: 8 });
const tall = calculateQrExportLayout({ rows: 8, columns: 4 });
const square = calculateQrExportLayout({ rows: 6, columns: 6 });
const scaled = calculateQrExportLayout({ rows: 4, columns: 8, unitScale: 10 });

assert.equal(wide.orientation, 'landscape');
assert.equal(tall.orientation, 'portrait');
assert.equal(square.orientation, 'portrait');
assert.equal(QR_LABEL_MARGIN_MM, 1);
assert.equal(QR_LABEL_GAP_MM, 0.75);
assert.equal(QR_LABEL_PADDING_MM, 0.5);
assert.equal(QR_LABEL_BORDER_WIDTH_MM, 0.05);

for (const layout of [wide, tall, square, scaled]) {
  assert.equal(layout.cellWidth, layout.cellHeight);
  assert.equal(layout.gridX, layout.margin);
  assert.equal(layout.gridY, layout.margin);
  assert.equal(layout.pageWidth - layout.gridWidth, layout.margin * 2);
  assert.equal(layout.pageHeight - layout.gridHeight, layout.margin * 2);
  assert.equal(layout.qrSize, layout.cellWidth - layout.padding * 2);

  const first = layout.getCellPosition(0);
  assert.equal(first.cellX, layout.gridX);
  assert.equal(first.cellY, layout.gridY);
  assert.equal(first.qrX - first.cellX, layout.padding);
  assert.equal(first.qrY - first.cellY, layout.padding);
}

assert.equal(scaled.pageWidth, wide.pageWidth * 10);
assert.equal(scaled.pageHeight, wide.pageHeight * 10);
assert.equal(scaled.gap, wide.gap * 10);
assert.equal(scaled.padding, wide.padding * 10);

const wideLast = wide.getCellPosition(31);
assert.equal(wide.pageWidth - (wideLast.cellX + wide.cellWidth), wide.gridX);
assert.equal(wide.pageHeight - (wideLast.cellY + wide.cellHeight), wide.gridY);

console.log('QR export layout uses flexible pages, square cells, equal padding, gaps, and outer margins.');
