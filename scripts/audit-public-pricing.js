const fs = require('fs');
const path = require('path');

const root = process.cwd();
const failures = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

const required = [
  ['src/lib/catalogue-data.ts', 'price: number | null'],
  ['src/app/catalogue/page.tsx', 'const hasPrice = product.price !== null || typeof regionalPrice === "number"'],
  ['src/app/catalogue/page.tsx', 'formatPrice(product.price ?? regionalPrice ?? 0, product.regional_prices)'],
  ['src/components/ProductDetailClient.tsx', 'const hasPrice = product.price !== null || typeof regionalPrice === "number"'],
  ['src/components/ProductDetailClient.tsx', 'formatPrice(product.price ?? regionalPrice ?? 0, product.regional_prices)'],
  ['src/app/catalogue/[slug]/page.tsx', 'offers: product.price === null ? undefined'],
  ['src/app/admin/products/page.tsx', "nextForm.price.trim() === '' ? null"],
  ['supabase/schema.sql', 'ALTER COLUMN price DROP NOT NULL'],
];

for (const [file, text] of required) {
  if (!read(file).includes(text)) {
    failures.push(`${file} is missing nullable/regional pricing behavior "${text}".`);
  }
}

if (failures.length) {
  console.error('Public pricing audit failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Nullable regional pricing is present and hidden when unavailable.');
