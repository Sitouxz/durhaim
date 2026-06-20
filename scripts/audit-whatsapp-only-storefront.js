const fs = require('fs');
const path = require('path');

const root = process.cwd();
const failures = [];
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

if (fs.existsSync(path.join(root, 'src/components/AddToCartButton.tsx'))) {
  failures.push('AddToCartButton must be removed.');
}

for (const relativePath of ['src/components/TopNavBar.tsx', 'src/components/ProductDetailClient.tsx']) {
  const source = read(relativePath);
  if (source.includes('/cart') || source.includes('AddToCartButton') || source.includes('shopping_cart')) {
    failures.push(`${relativePath} still exposes a cart control.`);
  }
}

const cartRoute = read('src/app/cart/page.tsx');
if (!cartRoute.includes('redirect("/catalogue")')) {
  failures.push('The legacy cart route must redirect to the catalogue.');
}

if (failures.length) {
  console.error('WhatsApp-only storefront audit failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('The storefront routes every product enquiry through WhatsApp.');
