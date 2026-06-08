# Simplified Serial Export Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the confusing immediate-action serial export controls with a date-and-product-first modal, visible export-type radio cards, hidden advanced controls, a live match count, and one explicit export button.

**Architecture:** Keep export generation in the existing admin serials page and extend the existing serials GET route to accept repeated `productId` parameters. The modal owns export-specific date and product filters that are independent from table filters; all-matching exports and counts use those filters, while selected-row and current-page scopes filter their local rows with the same export criteria.

**Tech Stack:** Next.js 15 App Router, React 18, TypeScript, Supabase JS, Tailwind CSS, Node audit scripts, jsPDF, QRCode

---

## File Structure

- Modify `scripts/audit-bulk-qr.js`: define the required modal structure and export behavior before implementation.
- Modify `scripts/audit-advanced-serials.js`: require repeated-product query support in the serials API.
- Modify `src/app/api/admin/serials/route.ts`: accept multiple product IDs, including custom-product serials.
- Modify `src/app/admin/serials/page.tsx`: add export-specific filter state, count loading, multi-product picker, radio groups, advanced disclosure, summary, and explicit submit behavior.

### Task 1: Add Failing Export UX Audits

**Files:**
- Modify: `scripts/audit-bulk-qr.js`
- Modify: `scripts/audit-advanced-serials.js`

- [ ] **Step 1: Add assertions for the approved modal behavior**

Require the page to contain:

```js
[
  'exportProductIds',
  'showExportAdvanced',
  'Export type',
  'Advanced options',
  'EXPORT ${exportScopeCount} SERIAL',
  'aria-live="polite"',
  'handleExportSubmit',
].forEach((requiredText) => {
  if (!page.includes(requiredText)) failures.push(`Missing simplified export behavior: ${requiredText}`);
});
```

Require the old immediate-action select handler to be absent from the modal:

```js
if (/onChange=\{\(event\) => handleExportAction/.test(page)) {
  failures.push('Choosing an export type must not immediately start the export.');
}
```

Require API repeated-product parsing and filtering:

```js
if (!route.includes("searchParams.getAll('productId')")) {
  failures.push('Serials API does not read multiple product IDs.');
}
if (!route.includes(".in('product_id'")) {
  failures.push('Serials API does not filter multiple product IDs.');
}
```

- [ ] **Step 2: Run audits and verify RED**

Run:

```powershell
node scripts/audit-bulk-qr.js
node scripts/audit-advanced-serials.js
```

Expected: both commands fail because the simplified modal and repeated-product API behavior do not exist yet.

- [ ] **Step 3: Commit the failing audits**

```powershell
git add scripts/audit-bulk-qr.js scripts/audit-advanced-serials.js
git commit -m "test: define simplified serial export flow"
```

### Task 2: Support Multiple Export Products In The API

**Files:**
- Modify: `src/app/api/admin/serials/route.ts`

- [ ] **Step 1: Parse repeated product filters**

Replace the single product parameter with:

```ts
const productIds = searchParams.getAll('productId').filter(Boolean);
```

- [ ] **Step 2: Apply product filters, including custom products**

Use:

```ts
const includesCustomProduct = productIds.includes(CUSTOM_PRODUCT);
const regularProductIds = productIds.filter((id) => id !== CUSTOM_PRODUCT);

if (includesCustomProduct && regularProductIds.length > 0) {
  query = query.or(`product_id.is.null,product_id.in.(${regularProductIds.join(',')})`);
} else if (includesCustomProduct) {
  query = query.is('product_id', null);
} else if (regularProductIds.length > 0) {
  query = query.in('product_id', regularProductIds);
}
```

- [ ] **Step 3: Run the advanced serial audit and verify GREEN**

Run:

```powershell
node scripts/audit-advanced-serials.js
```

Expected: PASS with `Advanced serial filters and selected QR export are present.`

- [ ] **Step 4: Commit API support**

```powershell
git add src/app/api/admin/serials/route.ts scripts/audit-advanced-serials.js
git commit -m "Support multi-product serial export filters"
```

### Task 3: Build The Simplified Export Modal

**Files:**
- Modify: `src/app/admin/serials/page.tsx`

- [ ] **Step 1: Add export-specific state and types**

Use an all-matching default scope and QR PDF default action:

```ts
type QrExportScope = 'ALL_MATCHING_SERIALS' | 'SELECTED_SERIALS' | 'CURRENT_PAGE_SERIALS';
type ExportAction = 'CSV' | 'QR_PDF' | 'QR_PNG';

const [qrExportScope, setQrExportScope] = useState<QrExportScope>('ALL_MATCHING_SERIALS');
const [exportAction, setExportAction] = useState<ExportAction>('QR_PDF');
const [exportProductIds, setExportProductIds] = useState<string[]>([]);
const [exportProductSearch, setExportProductSearch] = useState('');
const [showExportProducts, setShowExportProducts] = useState(false);
const [showExportAdvanced, setShowExportAdvanced] = useState(false);
const [allMatchingExportCount, setAllMatchingExportCount] = useState(0);
const [isLoadingExportCount, setIsLoadingExportCount] = useState(false);
const [isExporting, setIsExporting] = useState(false);
```

- [ ] **Step 2: Build export URLs independent from table filters**

Add repeated product IDs to the URL and use only export dates/products for all-matching exports:

```ts
const buildExportSerialsUrl = (nextPage: number, nextPageSize: number) => {
  const url = new URL('/api/admin/serials', window.location.origin);
  url.searchParams.set('page', String(nextPage));
  url.searchParams.set('pageSize', String(nextPageSize));
  url.searchParams.set('sortBy', 'generated');
  url.searchParams.set('sortDirection', 'desc');
  if (exportDateFrom) url.searchParams.set('dateFrom', exportDateFrom);
  if (exportDateTo) url.searchParams.set('dateTo', exportDateTo);
  exportProductIds.forEach((id) => url.searchParams.append('productId', id));
  return url;
};
```

- [ ] **Step 3: Add local row filtering and count loading**

Filter selected/current-page rows by both export dates and products. Fetch page 1 with page size 1 when the modal opens or its export filters change, and read `pagination.total` into `allMatchingExportCount`. Do not fetch when the date range is invalid.

- [ ] **Step 4: Replace immediate export actions with explicit submit**

Use:

```ts
const handleExportSubmit = async () => {
  if (exportScopeCount === 0 || isExporting || isExportDateRangeInvalid) return;
  setIsExporting(true);
  try {
    if (exportAction === 'CSV') await exportCsv();
    if (exportAction === 'QR_PDF') await downloadBulkQR();
    if (exportAction === 'QR_PNG') await downloadQrPng();
    setShowExportModal(false);
  } finally {
    setIsExporting(false);
  }
};
```

Remove `handleExportAction` and prevent format selection from starting a download.

- [ ] **Step 5: Replace the modal markup**

The default visible modal contains:

```tsx
<DateFilterInput ... />
<DateFilterInput ... />
<button aria-expanded={showExportProducts}>...</button>
<fieldset><legend>Export type</legend>...</fieldset>
<button aria-expanded={showExportAdvanced}>Advanced options</button>
<div aria-live="polite">...</div>
<button onClick={handleExportSubmit}>EXPORT {exportScopeCount} SERIALS</button>
```

The searchable product dropdown contains Select all/Clear all actions and checkbox options for Custom Product plus all loaded products.

The expanded Advanced options contains a row-scope radio group. Render columns and rows-per-sheet inputs only when `exportAction !== 'CSV'`.

- [ ] **Step 6: Run focused audits and verify GREEN**

Run:

```powershell
node scripts/audit-bulk-qr.js
node scripts/audit-advanced-serials.js
node scripts/audit-qr-export-layout.mjs
```

Expected: all commands pass.

- [ ] **Step 7: Commit the modal**

```powershell
git add src/app/admin/serials/page.tsx scripts/audit-bulk-qr.js
git commit -m "Simplify serial export modal"
```

### Task 4: Verify The Complete Export Flow

**Files:**
- Modify only if verification reveals a defect.

- [ ] **Step 1: Run static verification**

Run:

```powershell
npm run lint
node scripts/audit-bulk-qr.js
node scripts/audit-advanced-serials.js
node scripts/audit-qr-export-layout.mjs
npm run build
```

Expected: every command exits with code 0.

- [ ] **Step 2: Verify the rendered modal in the browser**

Open the admin serials page and confirm:

- The modal initially shows dates, products, export type, summary, and one Export button.
- Advanced options are collapsed.
- Product choices support multiple selections.
- Format radio cards do not start downloads.
- Advanced options reveal row scope and QR-only layout fields.
- Match count and button label react to filter/scope changes.
- Invalid ranges and zero matches disable export.

- [ ] **Step 3: Review the final diff**

Run:

```powershell
git diff --check
git status --short
```

Expected: no whitespace errors and only intended files changed.
