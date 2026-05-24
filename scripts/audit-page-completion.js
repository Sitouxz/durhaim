const fs = require('fs');
const path = require('path');

const root = process.cwd();
const failures = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function assertIncludes(relativePath, needle, message) {
  const text = read(relativePath);
  if (!text.includes(needle)) failures.push(`${relativePath}: ${message}`);
}

function assertNotIncludes(relativePath, needle, message) {
  const text = read(relativePath);
  if (text.includes(needle)) failures.push(`${relativePath}: ${message}`);
}

assertIncludes(
  'src/components/ProductDetailClient.tsx',
  '<AddToCartButton product=',
  'product detail page must let users add products to the enquiry cart',
);

assertNotIncludes(
  'src/app/verify/[serial]/page.tsx',
  'recordVerificationView',
  'direct QR certificate pages must not mutate verification state on GET',
);

assertIncludes(
  'src/app/api/verify/route.ts',
  "rpc('record_serial_verification'",
  'rate-limited verification API must record verification through constrained RPC',
);

assertNotIncludes(
  'src/app/cart/page.tsx',
  'as the catalogue grows',
  'cart copy should not describe a future unfinished add-to-cart flow',
);

assertNotIncludes(
  'src/app/admin/settings/page.tsx',
  'can be connected',
  'admin settings should not describe auth as future wiring',
);

const sourceFiles = [
  'src/app/verify/[serial]/page.tsx',
  'src/components/SerialChecker.tsx',
  'src/app/battle-proven/page.tsx',
];

for (const relativePath of sourceFiles) {
  const text = read(relativePath);
  if (/[\u00c3\u00c2\u00e2][\s\S]*?[\u0153\u20ac\u2122\u2020]/.test(text) || text.includes('\u00e2')) {
    failures.push(`${relativePath}: contains mojibake text that can render as broken characters`);
  }
}

if (failures.length) {
  console.error('Page completion audit failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('No obvious unfinished page features found.');
