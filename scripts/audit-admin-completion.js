const fs = require('fs');
const path = require('path');

const root = process.cwd();
const failures = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function requireText(relativePath, needle, message) {
  if (!read(relativePath).includes(needle)) failures.push(`${relativePath}: ${message}`);
}

requireText(
  'src/app/admin/serials/page.tsx',
  "updateSerialStatus(s.id, 'REVOKED')",
  'serial admin must provide an explicit Revoke action',
);
requireText(
  'src/app/admin/serials/page.tsx',
  "value=\"INACTIVE\"",
  'serial admin must expose unactivated serial status',
);

for (const relativePath of [
  'src/app/admin/serials/page.tsx',
  'src/app/api/admin/serials/route.ts',
]) {
  const text = read(relativePath);
  if (text.includes('USED') || text.includes('Mark Used')) {
    failures.push(`${relativePath}: USED/Mark Used should not exist in serial workflow`);
  }
}

requireText(
  'src/app/api/admin/serials/route.ts',
  "status: 'INACTIVE'",
  'generated serials must start as unactivated/inactive',
);

if (read('src/app/api/verify/route.ts').includes("update({ status: 'ACTIVE'")) {
  failures.push('src/app/api/verify/route.ts: customer verification must not activate serial status');
}

if (read('src/app/verify/[serial]/page.tsx').includes("status: 'ACTIVE'")) {
  failures.push('src/app/verify/[serial]/page.tsx: direct QR certificate view must not activate serial status');
}

const serialsPage = read('src/app/admin/serials/page.tsx');
const serialsTable = serialsPage.slice(serialsPage.indexOf('{/* Data Table */}'), serialsPage.indexOf('{showFilterModal && ('));
if (serialsTable.includes('Activate') || serialsTable.includes("updateSerialStatus(s.id, 'ACTIVE')")) {
  failures.push('src/app/admin/serials/page.tsx: serial table actions must not expose Activate');
}

const productsApi = read('src/app/api/admin/products/route.ts');
for (const handler of ['export async function POST', 'export async function PATCH', 'export async function DELETE']) {
  if (!productsApi.includes(handler)) {
    failures.push(`src/app/api/admin/products/route.ts: missing ${handler}`);
  }
}

const adminOverview = read('src/app/admin/page.tsx');
if (!adminOverview.includes('normalizeSerialsResponse') || !adminOverview.includes('Array.isArray(serialsData)')) {
  failures.push('src/app/admin/page.tsx: overview must normalize serial API array and paginated response shapes');
}

if (!adminOverview.includes('fetchDashboardData') || !adminOverview.includes('cache: \'no-store\'')) {
  failures.push('src/app/admin/page.tsx: overview dashboard data fetches must bypass stale cached admin API responses');
}

if (!adminOverview.includes("fetch('/api/admin/overview'") || !adminOverview.includes('Total Serials') || !adminOverview.includes('Unactivated')) {
  failures.push('src/app/admin/page.tsx: overview must load aggregate serial inventory metrics instead of active-only counts');
}

const overviewApiPath = path.join(root, 'src', 'app', 'api', 'admin', 'overview', 'route.ts');
if (!fs.existsSync(overviewApiPath)) {
  failures.push('src/app/api/admin/overview/route.ts: admin overview aggregate API is missing');
} else {
  const overviewApi = fs.readFileSync(overviewApiPath, 'utf8');
  for (const needle of ['export async function GET', 'totalSerials', 'unactivatedSerials', 'verificationTotal', 'recentSerials']) {
    if (!overviewApi.includes(needle)) failures.push(`src/app/api/admin/overview/route.ts: missing overview metric ${needle}`);
  }
}

if (!productsApi.includes('serial_numbers') || !productsApi.includes('Product is tied to QR serials')) {
  failures.push('src/app/api/admin/products/route.ts: product delete must be blocked when QR serials exist');
}

const productsPage = read('src/app/admin/products/page.tsx');
for (const needle of ['setShowProductForm', 'handleSaveProduct', 'togglePublished', 'handleDeleteProduct', 'Edit', 'Delete', 'New Product']) {
  if (!productsPage.includes(needle)) {
    failures.push(`src/app/admin/products/page.tsx: missing product management UI/control ${needle}`);
  }
}

const categoriesPageForModal = read('src/app/admin/categories/page.tsx');
const usersPageForModal = read('src/app/admin/users/page.tsx');

for (const [file, content] of [
  ['src/app/admin/products/page.tsx', productsPage],
  ['src/app/admin/categories/page.tsx', categoriesPageForModal],
  ['src/app/admin/users/page.tsx', usersPageForModal],
]) {
  if (content.includes('confirm(')) {
    failures.push(`${file}: edit/delete flows must use in-app modals instead of browser confirm dialogs`);
  }
}

for (const [file, content, formFlag] of [
  ['src/app/admin/products/page.tsx', productsPage, 'showProductForm'],
  ['src/app/admin/categories/page.tsx', categoriesPageForModal, 'showCategoryForm'],
  ['src/app/admin/users/page.tsx', usersPageForModal, 'showForm'],
]) {
  if (!content.includes('fixed inset-0') || !content.includes(formFlag)) {
    failures.push(`${file}: edit/create form must render inside a modal overlay`);
  }
}

for (const [file, content, deleteFlag] of [
  ['src/app/admin/products/page.tsx', productsPage, 'productPendingDelete'],
  ['src/app/admin/categories/page.tsx', categoriesPageForModal, 'categoryPendingDelete'],
]) {
  if (!content.includes(deleteFlag) || !content.includes('Confirm Delete')) {
    failures.push(`${file}: delete action must use a confirmation modal`);
  }
}

if (productsPage.includes('Base Price') || productsPage.includes('handleBasePriceChange')) {
  failures.push('src/app/admin/products/page.tsx: add/edit product form must use regional prices only, without a base price field');
}

if (productsPage.includes('price: Number(nextForm.price)')) {
  failures.push('src/app/admin/products/page.tsx: product save payload must not send a manually edited base price');
}

if (!productsPage.includes('serial_count') || !productsPage.includes('Tied to QR')) {
  failures.push('src/app/admin/products/page.tsx: products tied to QR must show notice and disable delete');
}

if (!productsPage.includes("fetch('/api/admin/categories')")) {
  failures.push('src/app/admin/products/page.tsx: product form must load managed categories from the admin categories API');
}

if (!productsPage.includes('type="file"') || !productsPage.includes('handleProductImageUpload')) {
  failures.push('src/app/admin/products/page.tsx: product form must support image file uploads');
}

for (const needle of ['MAX_PRODUCT_IMAGE_SIZE', 'ALLOWED_PRODUCT_IMAGE_TYPES']) {
  if (!productsPage.includes(needle)) {
    failures.push(`src/app/admin/products/page.tsx: missing client-side image upload restriction ${needle}`);
  }
}

const productImagesApiPath = path.join(root, 'src', 'app', 'api', 'admin', 'product-images', 'route.ts');
if (!fs.existsSync(productImagesApiPath)) {
  failures.push('src/app/api/admin/product-images/route.ts: product image upload API is missing');
} else {
  const productImagesApi = fs.readFileSync(productImagesApiPath, 'utf8');
  for (const needle of ['export async function POST', 'MAX_PRODUCT_IMAGE_SIZE', 'ALLOWED_PRODUCT_IMAGE_TYPES', 'storage.from']) {
    if (!productImagesApi.includes(needle)) failures.push(`src/app/api/admin/product-images/route.ts: missing image upload handling ${needle}`);
  }
}

const adminLayout = read('src/app/admin/layout.tsx');
if (!adminLayout.includes('/admin/categories') || !adminLayout.includes('Categories')) {
  failures.push('src/app/admin/layout.tsx: admin navigation must include category management');
}

const categoriesApiPath = path.join(root, 'src', 'app', 'api', 'admin', 'categories', 'route.ts');
if (!fs.existsSync(categoriesApiPath)) {
  failures.push('src/app/api/admin/categories/route.ts: categories API is missing');
} else {
  const categoriesApi = fs.readFileSync(categoriesApiPath, 'utf8');
  for (const handler of ['export async function GET', 'export async function POST', 'export async function PATCH', 'export async function DELETE']) {
    if (!categoriesApi.includes(handler)) failures.push(`src/app/api/admin/categories/route.ts: missing ${handler}`);
  }
}

const categoriesPagePath = path.join(root, 'src', 'app', 'admin', 'categories', 'page.tsx');
if (!fs.existsSync(categoriesPagePath)) {
  failures.push('src/app/admin/categories/page.tsx: category management page is missing');
} else {
  const categoriesPage = fs.readFileSync(categoriesPagePath, 'utf8');
  for (const needle of ['fetchCategories', 'handleSaveCategory', 'handleDeleteCategory', 'New Category', 'Edit']) {
    if (!categoriesPage.includes(needle)) failures.push(`src/app/admin/categories/page.tsx: missing category management UI/control ${needle}`);
  }
}

const settingsApiPath = path.join(root, 'src', 'app', 'api', 'admin', 'settings', 'route.ts');
if (!fs.existsSync(settingsApiPath)) {
  failures.push('src/app/api/admin/settings/route.ts: settings API is missing');
} else {
  const settingsApi = fs.readFileSync(settingsApiPath, 'utf8');
  for (const handler of ['export async function GET', 'export async function PATCH']) {
    if (!settingsApi.includes(handler)) failures.push(`src/app/api/admin/settings/route.ts: missing ${handler}`);
  }
}

requireText(
  'src/app/admin/settings/page.tsx',
  'handleSaveSettings',
  'settings page must save editable settings',
);
requireText(
  'supabase/schema.sql',
  'CREATE TABLE IF NOT EXISTS public.site_settings',
  'site_settings table must exist in schema',
);

if (failures.length) {
  console.error('Admin completion audit failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Admin serials, products, and settings flows are complete.');
