const fs = require('fs');
const path = require('path');

const apiFile = path.join(process.cwd(), 'src', 'app', 'api', 'products', 'route.ts');
const apiText = fs.readFileSync(apiFile, 'utf8');

if (!apiText.includes('categories!inner(name, slug)')) {
  console.error('Products API must use an inner category embed so category filters remove non-matching products.');
  process.exit(1);
}

if (apiText.includes('name.ilike.%${search}%') || apiText.includes('description.ilike.%${search}%')) {
  console.error('Products API must sanitize search before interpolating it into PostgREST filters.');
  process.exit(1);
}

for (const required of ['sanitizeSearch', 'filterProducts', 'paginateProducts', 'searchParams.get("category")', 'searchParams.get("series")', 'searchParams.get("page")', 'searchParams.get("limit")']) {
  if (!apiText.includes(required)) {
    console.error(`Products API is missing the backward-compatible catalogue behavior: ${required}.`);
    process.exit(1);
  }
}

if (!apiText.includes('parsePositiveInt(searchParams.get("limit"), 12, 200)')) {
  console.error('Products API must preserve the 12-item default while allowing the Figma catalogue to request up to 200 products.');
  process.exit(1);
}

if (!apiText.includes('categories: categoryOverrides')) {
  console.error('Products API must expose managed category names to public catalogue controls.');
  process.exit(1);
}

for (const required of [
  'getCatalogueTombstoneSlugs',
  'mergeCatalogueProducts(databaseProducts, fallbackProducts, tombstonedSlugs)',
  '!tombstonedSlugs.has(product.slug)',
]) {
  if (!apiText.includes(required)) {
    console.error(`Products API can resurrect deleted bundled products; missing ${required}.`);
    process.exit(1);
  }
}

const adminProductsFile = path.join(process.cwd(), 'src', 'app', 'api', 'admin', 'products', 'route.ts');
const adminProductsText = fs.readFileSync(adminProductsFile, 'utf8');
for (const required of [
  'tombstoneCatalogueProduct(supabase, product.slug)',
  ".select('id, slug')",
  'if (error || !deletedProduct)',
  'restoreCatalogueProduct(supabase, parsed.slug)',
]) {
  if (!adminProductsText.includes(required)) {
    console.error(`Admin product deletion is missing its persistence guard: ${required}.`);
    process.exit(1);
  }
}

const productDetailFile = path.join(process.cwd(), 'src', 'app', 'catalogue', '[slug]', 'page.tsx');
const productDetailText = fs.readFileSync(productDetailFile, 'utf8');
if (!productDetailText.includes('if (tombstonedSlugs.has(slug)) return null;')) {
  console.error('Product detail pages must return not-found for deleted bundled products.');
  process.exit(1);
}

const pageFile = path.join(process.cwd(), 'src', 'app', 'catalogue', 'page.tsx');
const pageText = fs.readFileSync(pageFile, 'utf8');

for (const required of ['category', 'search']) {
  if (!new RegExp(`params\\.set\\(["']${required}["']`).test(pageText)) {
    console.error(`Catalogue page does not send ${required} to the products API.`);
    process.exit(1);
  }
}

for (const required of ['sort', 'limit: "200"', 'region']) {
  if (!pageText.includes(required)) {
    console.error(`Catalogue page does not request the complete regional catalogue with ${required}.`);
    process.exit(1);
  }
}

for (const required of ['managedCategoryNames', 'data.categories', 'localizeCategoryName']) {
  if (!pageText.includes(required)) {
    console.error(`Catalogue category headings are missing localization support: ${required}.`);
    process.exit(1);
  }
}

const catalogueDataFile = path.join(process.cwd(), 'src', 'data', 'figma-catalogue.ts');
const catalogueDataText = fs.readFileSync(catalogueDataFile, 'utf8');
const catalogueDataMatch = catalogueDataText.match(/export const figmaCatalogueSeeds:[^=]+?=\s*(\[[\s\S]*\]);\s*$/);
if (!catalogueDataMatch) {
  console.error('Unable to parse the bundled catalogue data.');
  process.exit(1);
}

const catalogueSeeds = JSON.parse(catalogueDataMatch[1]);
const productIdentities = new Set();
for (const product of catalogueSeeds) {
  const identity = [product.name, product.category, product.series.slug, product.colorway]
    .map((value) => String(value).trim().toLowerCase())
    .join('|');
  if (productIdentities.has(identity)) {
    console.error(`Catalogue photos must be grouped into one product gallery: ${product.name}.`);
    process.exit(1);
  }
  productIdentities.add(identity);
}

const blackAimVortex = catalogueSeeds.find((product) => product.slug === 'black-aim-vortex');
if (!blackAimVortex || blackAimVortex.images.length !== 3) {
  console.error('Black Aim Vortex must keep one main image and two detail images.');
  process.exit(1);
}

const nextConfig = fs.readFileSync(path.join(process.cwd(), 'next.config.mjs'), 'utf8');
for (const legacySlug of ['black-aim-vortex-2', 'black-aim-vortex-3', 'multicam-black-aim-vortex-2']) {
  if (!nextConfig.includes(`/catalogue/${legacySlug}`)) {
    console.error(`Missing permanent redirect for legacy catalogue slug: ${legacySlug}.`);
    process.exit(1);
  }
}

console.log('Catalogue API and controls are wired.');
