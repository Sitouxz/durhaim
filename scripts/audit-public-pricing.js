const fs = require('fs');
const path = require('path');

const root = process.cwd();
const failures = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

const forbidden = [
  ['src/components/TopNavBar.tsx', 'priceRegion'],
  ['src/components/TopNavBar.tsx', 'supportedRegions'],
  ['src/app/catalogue/page.tsx', 'formatPrice'],
  ['src/app/catalogue/page.tsx', 'price-high'],
  ['src/app/catalogue/page.tsx', 'price-low'],
  ['src/components/ProductDetailClient.tsx', 'formatPrice'],
  ['src/app/cart/page.tsx', 'formatPrice'],
  ['src/app/catalogue/[slug]/page.tsx', 'offers:'],
  ['src/app/catalogue/[slug]/page.tsx', 'regional pricing'],
  ['src/app/page.tsx', 'regional pricing'],
];

for (const [file, text] of forbidden) {
  if (read(file).toLowerCase().includes(text.toLowerCase())) {
    failures.push(`${file} still exposes public pricing through "${text}".`);
  }
}

if (failures.length) {
  console.error('Public pricing audit failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Public storefront contains no visible pricing surfaces.');
