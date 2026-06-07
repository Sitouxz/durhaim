import assert from 'node:assert/strict';
import { calculateQrExportLayout } from '../src/lib/qr-export-layout.ts';

const wide = calculateQrExportLayout({ rows: 4, columns: 8 });
const tall = calculateQrExportLayout({ rows: 8, columns: 4 });
const square = calculateQrExportLayout({ rows: 6, columns: 6 });
const scaled = calculateQrExportLayout({ rows: 4, columns: 8, unitScale: 10 });

assert.equal(wide.orientation, 'landscape');
assert.equal(tall.orientation, 'portrait');
assert.equal(square.orientation, 'portrait');

for (const layout of [wide, tall, square, scaled]) {
  assert.equal(layout.cellWidth, layout.cellHeight);
  assert.equal(layout.gridX, (layout.pageWidth - layout.gridWidth) / 2);
  assert.equal(layout.gridY, (layout.pageHeight - layout.gridHeight) / 2);
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

console.log('QR export layout uses adaptive orientation, square cells, equal padding, and centered grids.');
