const fs = require('fs');
const path = require('path');

const pagePath = path.join(process.cwd(), 'src', 'app', 'admin', 'serials', 'page.tsx');
const routePath = path.join(process.cwd(), 'src', 'app', 'api', 'admin', 'serials', 'route.ts');
const globalsPath = path.join(process.cwd(), 'src', 'app', 'globals.css');
const page = fs.readFileSync(pagePath, 'utf8');
const route = fs.readFileSync(routePath, 'utf8');
const globals = fs.readFileSync(globalsPath, 'utf8');

const failures = [];

[
  'dateFrom',
  'dateTo',
  'minScans',
  'maxScans',
].forEach((param) => {
  if (!route.includes(`searchParams.get('${param}')`)) {
    failures.push(`Serials API does not read ${param}.`);
  }
  if (!page.includes(`url.searchParams.set('${param}'`)) {
    failures.push(`Serials page does not send ${param}.`);
  }
});

if (!route.includes("searchParams.getAll('productId')")) {
  failures.push('Serials API does not read multiple product IDs.');
}

if (!page.includes("url.searchParams.set('productId'") && !page.includes("url.searchParams.append('productId'")) {
  failures.push('Serials page does not send productId.');
}

if (!route.includes(".in('product_id'")) {
  failures.push('Serials API does not filter multiple product IDs.');
}

if (!page.includes('selectedSerialIds')) {
  failures.push('Serials page does not track selected serial rows.');
}

if (!page.includes('bulkRevokeSelected') || !route.includes('serialIds')) {
  failures.push('Serials page does not provide an efficient bulk revoke action.');
}

if (!page.includes('BULK QR PDF') || !page.includes('BULK QR PNG') || !page.includes('CLEAR SELECTION')) {
  failures.push('Serials page does not expose selected-row bulk actions.');
}

if (!page.includes('bg-signal-orange/10') || !page.includes('border-l-signal-orange')) {
  failures.push('Selected serial rows are not visually emphasized.');
}

if (!page.includes('toggleSerialSelection') || !page.includes('toggleAllVisibleSerials')) {
  failures.push('Serials page does not expose row and visible-row selection controls.');
}

if (!page.includes("useState<QrExportScope>('ALL_MATCHING_SERIALS')")) {
  failures.push('Export controls do not default to all serials matching the export filters.');
}

if (!page.includes('selectedSerials.length')) {
  failures.push('QR export UI does not show or use selected serial count.');
}

if (!page.includes('resetFilters')) {
  failures.push('Serials page does not provide an advanced filter reset.');
}

if (!page.includes('date-input-hide-indicator') || !globals.includes('.date-input-hide-indicator::-webkit-calendar-picker-indicator')) {
  failures.push('Admin date inputs do not hide the duplicate browser-native calendar icon.');
}

const toolbarSection = page.slice(page.indexOf('<div className="bg-charcoal-field border border-surface-container-highest">'), page.indexOf('{/* Data Table */}'));
if (!toolbarSection.includes('Search serials') || !toolbarSection.includes('handleToolbarSearch')) {
  failures.push('Serials toolbar must expose a visible search bar before the table.');
}

[
  'page',
  'pageSize',
].forEach((param) => {
  if (!route.includes(`searchParams.get('${param}')`)) {
    failures.push(`Serials API does not read ${param}.`);
  }
  if (!page.includes(`url.searchParams.set('${param}'`)) {
    failures.push(`Serials page does not send ${param}.`);
  }
});

if (!route.includes('count: \'exact\'')) {
  failures.push('Serials API does not request an exact row count for pagination.');
}

if (!route.includes('.range(')) {
  failures.push('Serials API does not limit results with a Supabase range.');
}

if (!page.includes('pagination') || !page.includes('totalPages')) {
  failures.push('Serials page does not track pagination metadata.');
}

if (!page.includes('goToPage') || !page.includes('setPageSize')) {
  failures.push('Serials page does not expose pagination controls.');
}

if (!page.includes('handlePageJump') || !page.includes('pageInput')) {
  failures.push('Serials page does not support direct page entry.');
}

if (!page.includes('[10, 25, 50, 100, 512]') || !route.includes('Math.min(512')) {
  failures.push('Serials pagination does not support a 512-row page size.');
}

if (!page.includes('aria-label="First page"') || !page.includes('aria-label="Last page"')) {
  failures.push('Serials page does not expose first and last page controls.');
}

[
  'sortBy',
  'sortDirection',
].forEach((param) => {
  if (!route.includes(`searchParams.get('${param}')`)) {
    failures.push(`Serials API does not read ${param}.`);
  }
  if (!page.includes(`url.searchParams.set('${param}'`)) {
    failures.push(`Serials page does not send ${param}.`);
  }
});

if (!page.includes('handleSort') || !page.includes('SortableHeader')) {
  failures.push('Serials page does not expose sortable table headers.');
}

if (!route.includes('sortableSerialColumns') || !route.includes('sortDirection')) {
  failures.push('Serials API does not validate and apply serial sorting.');
}

if (!page.includes('rowNumber') || !page.includes('pageStart + index')) {
  failures.push('Serials page does not show a stable row number column.');
}

if (!page.includes('colSpan={7}')) {
  failures.push('Serials table empty/loading rows do not span the visible table columns.');
}

const tableSection = page.slice(page.indexOf('{/* Data Table */}'), page.indexOf('{showFilterModal && ('));
if (tableSection.includes('label="Status"') || tableSection.includes('UNACTIVATED') || tableSection.includes('>ACTIVE<')) {
  failures.push('Serials table must not show an activation/status column.');
}

if (tableSection.includes('Activate')) {
  failures.push('Serials table actions must not show an Activate button.');
}

if (!page.includes('ALL_DURHAIM_PRODUCTS') || !page.includes('All Durhaim Product')) {
  failures.push('Serial generation modal does not provide an All Durhaim Product option.');
}

if (!route.includes('ALL_DURHAIM_PRODUCTS') || !route.includes('productsToGenerate')) {
  failures.push('Serials API does not generate serials across all Durhaim products.');
}

if (!page.includes('CUSTOM_PRODUCT') || !page.includes('Custom Product / All Durhaim Product')) {
  failures.push('Serials page does not expose a Custom Product / All Durhaim Product option.');
}

if (!route.includes('CUSTOM_PRODUCT') || !route.includes('id: null') || !route.includes('product_id: product.id')) {
  failures.push('Serials API does not generate serials for custom outside-website products.');
}

if (!route.includes(".is('product_id', null)")) {
  failures.push('Serials API does not filter custom outside-website product serials.');
}

if (failures.length > 0) {
  console.error('Advanced serial filters audit failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Advanced serial filters and selected QR export are present.');
