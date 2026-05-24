const fs = require('fs');
const path = require('path');

const apiFile = path.join(process.cwd(), 'src', 'app', 'api', 'products', 'route.ts');
const apiText = fs.readFileSync(apiFile, 'utf8');

if (!apiText.includes('categories!inner(name, slug)')) {
  console.error('Products API must use an inner category embed so category filters remove non-matching products.');
  process.exit(1);
}

if (!apiText.includes(".eq('categories.slug', category)")) {
  console.error('Products API must filter by the selected category slug.');
  process.exit(1);
}

if (apiText.includes('name.ilike.%${search}%') || apiText.includes('description.ilike.%${search}%')) {
  console.error('Products API must sanitize search before interpolating it into PostgREST filters.');
  process.exit(1);
}

if (!apiText.includes('.range(from, to)')) {
  console.error('Products API must paginate at the database query instead of fetching every product first.');
  process.exit(1);
}

const pageFile = path.join(process.cwd(), 'src', 'app', 'catalogue', 'page.tsx');
const pageText = fs.readFileSync(pageFile, 'utf8');

for (const required of ['category', 'search', 'sort', 'page', 'limit']) {
  if (!pageText.includes(`params.set('${required}'`)) {
    console.error(`Catalogue page does not send ${required} to the products API.`);
    process.exit(1);
  }
}

console.log('Catalogue API and controls are wired.');
