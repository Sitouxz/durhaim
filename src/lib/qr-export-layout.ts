export const QR_LABEL_MARGIN_MM = 0.5;
export const QR_LABEL_GAP_MM = 0.5;
export const QR_LABEL_PADDING_MM = 0.25;
export const QR_LABEL_BORDER_WIDTH_MM = 0.05;
export const QR_LABEL_BORDER_COLOR = '#111111';

const A4_PORTRAIT_WIDTH_MM = 210;
const A4_PORTRAIT_HEIGHT_MM = 297;

export type QrPageOrientation = 'portrait' | 'landscape';

type QrExportLayoutInput = {
  rows: number;
  columns: number;
  unitScale?: number;
};

type QrCellPosition = {
  cellX: number;
  cellY: number;
  qrX: number;
  qrY: number;
};

export type QrExportLayout = {
  orientation: QrPageOrientation;
  rows: number;
  columns: number;
  pageWidth: number;
  pageHeight: number;
  margin: number;
  gap: number;
  padding: number;
  cellWidth: number;
  cellHeight: number;
  qrSize: number;
  gridWidth: number;
  gridHeight: number;
  gridX: number;
  gridY: number;
  getCellPosition: (index: number) => QrCellPosition;
};

export function calculateQrExportLayout({
  rows,
  columns,
  unitScale = 1,
}: QrExportLayoutInput): QrExportLayout {
  const safeRows = Math.max(1, Math.floor(rows) || 1);
  const safeColumns = Math.max(1, Math.floor(columns) || 1);
  const safeScale = Number.isFinite(unitScale) && unitScale > 0 ? unitScale : 1;
  const orientation: QrPageOrientation = safeColumns > safeRows ? 'landscape' : 'portrait';
  const margin = QR_LABEL_MARGIN_MM * safeScale;
  const gap = QR_LABEL_GAP_MM * safeScale;
  const padding = QR_LABEL_PADDING_MM * safeScale;
  const dominantCount = Math.max(safeRows, safeColumns);
  const dominantPageSizeMm = safeRows === safeColumns ? A4_PORTRAIT_WIDTH_MM : A4_PORTRAIT_HEIGHT_MM;
  const dominantPageSize = dominantPageSizeMm * safeScale;
  const cellSize = Math.max(
    Number.EPSILON,
    (dominantPageSize - margin * 2 - gap * (dominantCount - 1)) / dominantCount,
  );
  const qrSize = Math.max(Number.EPSILON, cellSize - padding * 2);
  const gridWidth = cellSize * safeColumns + gap * (safeColumns - 1);
  const gridHeight = cellSize * safeRows + gap * (safeRows - 1);
  const pageWidth = gridWidth + margin * 2;
  const pageHeight = gridHeight + margin * 2;
  const gridX = margin;
  const gridY = margin;

  return {
    orientation,
    rows: safeRows,
    columns: safeColumns,
    pageWidth,
    pageHeight,
    margin,
    gap,
    padding,
    cellWidth: cellSize,
    cellHeight: cellSize,
    qrSize,
    gridWidth,
    gridHeight,
    gridX,
    gridY,
    getCellPosition(index) {
      const pageIndex = Math.max(0, Math.floor(index) || 0);
      const column = pageIndex % safeColumns;
      const row = Math.floor(pageIndex / safeColumns);
      const cellX = gridX + column * (cellSize + gap);
      const cellY = gridY + row * (cellSize + gap);

      return {
        cellX,
        cellY,
        qrX: cellX + padding,
        qrY: cellY + padding,
      };
    },
  };
}
