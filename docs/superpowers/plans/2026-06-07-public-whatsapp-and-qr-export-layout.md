# Public WhatsApp Focus and QR Export Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove pricing from the public storefront, focus product enquiries on WhatsApp, and make QR PDF, PNG, and print spacing visually consistent.

**Architecture:** Public UI components stop presenting or describing prices while admin pricing remains unchanged. A pure QR layout helper owns orientation, flexible page sizing, square-cell sizing, equal margins, and coordinates; PDF and PNG exporters consume the same geometry.

**Tech Stack:** Next.js 15 App Router, React 18, TypeScript, jsPDF, Canvas API, QRCode, Node audit scripts

---

### Task 1: Add Public Price-Removal Audit

**Files:**
- Create: `scripts/audit-public-pricing.js`
- Modify: `package.json`

- [ ] **Step 1: Write the failing audit**

Create a source audit that reads the public navigation, homepage, catalogue, product detail, cart, and product metadata files. It must fail when those files contain visible price formatting, price-region controls, price sorting, or schema `offers`.

```js
const forbidden = [
  ['src/components/TopNavBar.tsx', 'priceRegion'],
  ['src/app/catalogue/page.tsx', 'formatPrice'],
  ['src/app/catalogue/page.tsx', 'price-high'],
  ['src/components/ProductDetailClient.tsx', 'formatPrice'],
  ['src/app/cart/page.tsx', 'formatPrice'],
  ['src/app/catalogue/[slug]/page.tsx', 'offers:'],
  ['src/app/page.tsx', 'regional pricing'],
];
```

Add `"audit:public-pricing": "node scripts/audit-public-pricing.js"` to `package.json` and include it in `verify`.

- [ ] **Step 2: Run the audit to verify it fails**

Run: `npm run audit:public-pricing`

Expected: FAIL listing the current public price surfaces.

- [ ] **Step 3: Commit the failing audit**

```bash
git add scripts/audit-public-pricing.js package.json
git commit -m "test: audit public pricing surfaces"
```

### Task 2: Remove Prices From Public Storefront

**Files:**
- Modify: `src/components/TopNavBar.tsx`
- Modify: `src/app/catalogue/page.tsx`
- Modify: `src/components/ProductDetailClient.tsx`
- Modify: `src/app/cart/page.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/catalogue/[slug]/page.tsx`
- Modify: `scripts/audit-catalogue.js`

- [ ] **Step 1: Remove navigation price controls**

Remove the region imports, region state usage, and both desktop/mobile currency selectors from `TopNavBar`. Keep language selection and the enquiry-cart link.

- [ ] **Step 2: Remove catalogue price behavior**

Change the catalogue commerce hook to:

```tsx
const { language, t } = useCommerce();
```

Stop sending `region`, remove region from the fetch effect dependencies, remove the `price-high` and `price-low` options, and remove the price element from each product card. Update `scripts/audit-catalogue.js` so its required request parameters remain `category`, `search`, `sort`, `page`, and `limit`.

- [ ] **Step 3: Focus product details on WhatsApp**

Change the product-detail commerce hook to:

```tsx
const { language, t } = useCommerce();
```

Remove the displayed price. Keep the direct WhatsApp anchor first and styled as `btn btn-primary`; keep the enquiry cart and back link as secondary actions.

- [ ] **Step 4: Remove enquiry-cart prices**

Remove `RegionalPrices`, `price`, and `regional_prices` from the cart item type and remove `formatPrice` plus the conditional price span. Keep product names, detail links, clear behavior, and the WhatsApp enquiry action.

- [ ] **Step 5: Remove public pricing copy and schema**

Replace the homepage regional-pricing FAQ with a WhatsApp enquiry FAQ in both languages. In `src/app/catalogue/[slug]/page.tsx`, remove regional-price imports, product `offers`, price-related FAQ content, and price wording from metadata.

- [ ] **Step 6: Run focused audits**

Run:

```bash
npm run audit:public-pricing
npm run audit:catalogue
npm run audit:public-id-copy
```

Expected: all PASS.

- [ ] **Step 7: Commit public storefront changes**

```bash
git add src/components/TopNavBar.tsx src/app/catalogue/page.tsx src/components/ProductDetailClient.tsx src/app/cart/page.tsx src/app/page.tsx "src/app/catalogue/[slug]/page.tsx" scripts/audit-catalogue.js
git commit -m "Remove pricing from public storefront"
```

### Task 3: Add Shared QR Layout Geometry

**Files:**
- Create: `src/lib/qr-export-layout.ts`
- Create: `scripts/audit-qr-export-layout.mjs`
- Modify: `package.json`

- [ ] **Step 1: Write the failing geometry audit**

Import `calculateQrExportLayout` from the TypeScript helper and assert portrait, landscape, and square-grid cases:

```js
assert.equal(calculateQrExportLayout({ rows: 4, columns: 8 }).orientation, 'landscape');
assert.equal(calculateQrExportLayout({ rows: 8, columns: 4 }).orientation, 'portrait');

const layout = calculateQrExportLayout({ rows: 4, columns: 8 });
assert.equal(layout.cellWidth, layout.cellHeight);
assert.equal(layout.gridX, (layout.pageWidth - layout.gridWidth) / 2);
assert.equal(layout.gridY, (layout.pageHeight - layout.gridHeight) / 2);
assert.equal(layout.qrSize, layout.cellWidth - layout.padding * 2);
```

Add `"audit:qr-layout": "node scripts/audit-qr-export-layout.mjs"` to `package.json` and include it in `verify`.

- [ ] **Step 2: Run the audit to verify it fails**

Run: `npm run audit:qr-layout`

Expected: FAIL because `src/lib/qr-export-layout.ts` does not exist.

- [ ] **Step 3: Implement the pure helper**

Create shared constants and a helper with this interface:

```ts
export type QrExportLayout = {
  orientation: 'portrait' | 'landscape';
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
  getCellPosition: (index: number) => { cellX: number; cellY: number; qrX: number; qrY: number };
};

export function calculateQrExportLayout({ rows, columns, unitScale = 1 }: {
  rows: number;
  columns: number;
  unitScale?: number;
}): QrExportLayout;
```

Choose orientation from rows/columns, calculate one square cell size from the dominant grid axis, and derive a custom page size that wraps the grid with the same margin on all four sides.

- [ ] **Step 4: Run the geometry audit**

Run: `npm run audit:qr-layout`

Expected: PASS for portrait, landscape, square cells, equal padding, and centered grid assertions.

- [ ] **Step 5: Commit the shared helper**

```bash
git add src/lib/qr-export-layout.ts scripts/audit-qr-export-layout.mjs package.json
git commit -m "Add shared QR export layout geometry"
```

### Task 4: Apply Shared Geometry to Every Visual Export

**Files:**
- Modify: `src/app/admin/serials/page.tsx`
- Modify: `scripts/audit-bulk-qr.js`
- Modify: `scripts/audit-print-qr.js`

- [ ] **Step 1: Update the PDF exporter**

Import the shared constants and `calculateQrExportLayout`. Construct jsPDF with the helper orientation, and replace local cell math with:

```ts
const layout = calculateQrExportLayout({ rows, columns });
const pdf = new jsPDF({ orientation: layout.orientation, unit: 'mm', format: [layout.pageWidth, layout.pageHeight] });
const { cellX, cellY, qrX, qrY } = layout.getCellPosition(pageIndex);
pdf.rect(cellX, cellY, layout.cellWidth, layout.cellHeight);
pdf.addImage(dataUrl, 'PNG', qrX, qrY, layout.qrSize, layout.qrSize);
```

- [ ] **Step 2: Update the PNG exporter**

Use the helper with a pixel scale:

```ts
const layout = calculateQrExportLayout({ rows, columns, unitScale: pxPerMm });
canvas.width = Math.round(layout.pageWidth);
canvas.height = Math.round(layout.pageHeight);
```

Use `getCellPosition` for both `strokeRect` and `drawImage` so PNG geometry matches PDF geometry.

- [ ] **Step 3: Update single-label print spacing**

Generate print CSS from the shared margin constant so the page margin and label box sizing use the same spacing source.

- [ ] **Step 4: Update source audits**

Require both PDF and PNG paths to call `calculateQrExportLayout`, require square cells, and retain checks for QR-only output, borders, synchronous print-window opening, and image-load waiting.

- [ ] **Step 5: Run export audits**

Run:

```bash
npm run audit:qr-layout
npm run audit:bulk-qr
npm run audit:print-qr
```

Expected: all PASS.

- [ ] **Step 6: Commit export integration**

```bash
git add src/app/admin/serials/page.tsx scripts/audit-bulk-qr.js scripts/audit-print-qr.js
git commit -m "Align QR export margins and padding"
```

### Task 5: Verify Functionality and Visual Alignment

**Files:**
- Modify only if verification reveals a defect.

- [ ] **Step 1: Run full automated verification**

Run: `npm run verify`

Expected: lint, all audits, and production build PASS.

- [ ] **Step 2: Inspect public pages in browser**

Run the development server and inspect `/`, `/catalogue`, one `/catalogue/[slug]`, and `/cart` at desktop and mobile widths. Confirm no price or currency control appears and WhatsApp is the dominant product-detail action.

- [ ] **Step 3: Inspect QR layouts**

Generate or render representative `8x4`, `4x8`, and `6x6` layouts. Confirm square cells, identical horizontal/vertical gaps, identical QR padding, centered grids, and matching PDF/PNG orientation and geometry.

- [ ] **Step 4: Commit verification fixes if needed**

Commit only files changed to correct issues found during verification.
