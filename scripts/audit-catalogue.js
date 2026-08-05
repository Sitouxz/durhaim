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
    console.error(`Catalogue filters must follow managed category names: ${required}.`);
    process.exit(1);
  }
}

console.log('Catalogue API and controls are wired.');
