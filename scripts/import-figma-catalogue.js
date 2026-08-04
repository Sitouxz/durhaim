const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// The Figma catalogue includes an intentionally empty accordion for this upcoming range.
// Keep it in the series table even though it does not yet own a product record.
const standaloneSeries = [
  {
    name: 'Anaconda Assault Backpack',
    slug: 'anaconda',
    category: 'pack',
    display_order: 23,
  },
];

function loadEnv() {
  const file = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(file)) return {};
  return Object.fromEntries(
    fs.readFileSync(file, 'utf8')
      .split(/\r?\n/)
      .filter((line) => line && !line.trim().startsWith('#') && line.includes('='))
      .map((line) => {
        const index = line.indexOf('=');
        return [line.slice(0, index), line.slice(index + 1)];
      }),
  );
}

function readSeeds() {
  const source = fs.readFileSync(path.join(process.cwd(), 'src', 'data', 'figma-catalogue.ts'), 'utf8');
  const match = source.match(/export const figmaCatalogueSeeds:[^=]+?=\s*(\[[\s\S]*\]);\s*$/);
  if (!match) throw new Error('Unable to parse src/data/figma-catalogue.ts.');
  return JSON.parse(match[1]);
}

function validateSeeds(seeds) {
  const slugs = new Set();
  const duplicates = [];
  const missingAssets = [];
  for (const product of seeds) {
    if (slugs.has(product.slug)) duplicates.push(product.slug);
    slugs.add(product.slug);
    for (const image of product.images) {
      const assetPath = path.join(process.cwd(), 'public', image.replace(/^\//, '').replace(/^storefront[\\/]/, 'storefront/'));
      if (!fs.existsSync(assetPath)) missingAssets.push({ slug: product.slug, image });
    }
  }
  return {
    products: seeds.length,
    categories: new Set(seeds.map((product) => product.category)).size,
    series: new Set([
      ...seeds.map((product) => product.series.slug),
      ...standaloneSeries.map((series) => series.slug),
    ]).size,
    assets: new Set(seeds.flatMap((product) => product.images)).size,
    duplicates,
    missingAssets,
  };
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const apply = args.has('--apply');
  const publish = args.has('--publish');
  const seeds = readSeeds();
  const report = validateSeeds(seeds);
  console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', publish, ...report }, null, 2));

  if (report.duplicates.length || report.missingAssets.length) {
    throw new Error('Catalogue validation failed; fix duplicate slugs or missing assets before import.');
  }
  if (!apply) return;

  const localEnv = loadEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || localEnv.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || localEnv.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

  const { data: currentProducts, error: backupError } = await supabase.from('products').select('*');
  if (backupError) throw backupError;
  const backupDirectory = path.join(process.cwd(), 'backups');
  fs.mkdirSync(backupDirectory, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDirectory, `products-before-figma-${stamp}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(currentProducts ?? [], null, 2) + '\n');

  const categoryNames = {
    vest: 'Vest & Chestrig',
    pack: 'Pack & Pouches',
    belt: 'Belt',
    accessories: 'Accessories',
  };
  const { data: categories, error: categoryError } = await supabase
    .from('categories')
    .upsert(Object.entries(categoryNames).map(([slug, name]) => ({ slug, name })), { onConflict: 'slug' })
    .select('id, slug');
  if (categoryError) throw categoryError;
  const categoryIds = new Map(categories.map((category) => [category.slug, category.id]));

  const seriesBySlug = new Map();
  for (const product of seeds) {
    const current = seriesBySlug.get(product.series.slug);
    if (!current || product.display_order < current.display_order) {
      seriesBySlug.set(product.series.slug, {
        name: product.series.name,
        slug: product.series.slug,
        category_id: categoryIds.get(product.category) ?? null,
        display_order: product.display_order,
      });
    }
  }
  for (const series of standaloneSeries) {
    seriesBySlug.set(series.slug, {
      name: series.name,
      slug: series.slug,
      category_id: categoryIds.get(series.category) ?? null,
      display_order: series.display_order,
    });
  }
  const uniqueSeries = [...seriesBySlug.values()];
  const { data: seriesRows, error: seriesError } = await supabase
    .from('product_series')
    .upsert(uniqueSeries, { onConflict: 'slug' })
    .select('id, slug');
  if (seriesError) throw seriesError;
  const seriesIds = new Map(seriesRows.map((series) => [series.slug, series.id]));

  const productRows = seeds.map((product) => ({
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    regional_prices: product.regional_prices,
    category_id: categoryIds.get(product.category) ?? null,
    series_id: seriesIds.get(product.series.slug) ?? null,
    colorway: product.colorway || null,
    display_order: product.display_order,
    specifications: product.specifications,
    images: product.images,
    is_published: publish,
    updated_at: new Date().toISOString(),
  }));
  const { error: productError } = await supabase.from('products').upsert(productRows, { onConflict: 'slug' });
  if (productError) throw productError;

  const importedSlugs = new Set(seeds.map((product) => product.slug));
  const unmatchedIds = (currentProducts ?? [])
    .filter((product) => !importedSlugs.has(product.slug))
    .map((product) => product.id);
  if (unmatchedIds.length) {
    const { error: draftError } = await supabase
      .from('products')
      .update({ is_published: false, updated_at: new Date().toISOString() })
      .in('id', unmatchedIds);
    if (draftError) throw draftError;
  }

  const { count, error: countError } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .in('slug', [...importedSlugs]);
  if (countError) throw countError;
  if (count !== seeds.length) throw new Error(`Imported product count mismatch: expected ${seeds.length}, found ${count}.`);

  console.log(JSON.stringify({
    status: 'complete',
    backup: path.relative(process.cwd(), backupPath),
    importedProducts: count,
    importedSeries: uniqueSeries.length,
    unmatchedDrafted: unmatchedIds.length,
    published: publish,
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
