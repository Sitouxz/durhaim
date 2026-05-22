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
  "updateSerialStatus(s.id, 'USED')",
  'serial admin must provide an explicit Mark Used action',
);
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

const productsApi = read('src/app/api/admin/products/route.ts');
for (const handler of ['export async function POST', 'export async function PATCH']) {
  if (!productsApi.includes(handler)) {
    failures.push(`src/app/api/admin/products/route.ts: missing ${handler}`);
  }
}

const productsPage = read('src/app/admin/products/page.tsx');
for (const needle of ['setShowProductForm', 'handleSaveProduct', 'togglePublished', 'Edit', 'New Product']) {
  if (!productsPage.includes(needle)) {
    failures.push(`src/app/admin/products/page.tsx: missing product management UI/control ${needle}`);
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
