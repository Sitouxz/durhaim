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
  "updateSerialStatus(s.id, 'ACTIVE')",
  'serial admin must provide an explicit Restore/Activate action',
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
requireText(
  'src/app/api/verify/route.ts',
  "update({ status: 'ACTIVE'",
  'customer verification must activate serial status',
);
requireText(
  'src/app/verify/[serial]/page.tsx',
  "status: 'ACTIVE'",
  'direct QR certificate view must activate serial status',
);

const productsApi = read('src/app/api/admin/products/route.ts');
for (const handler of ['export async function POST', 'export async function PATCH', 'export async function DELETE']) {
  if (!productsApi.includes(handler)) {
    failures.push(`src/app/api/admin/products/route.ts: missing ${handler}`);
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
