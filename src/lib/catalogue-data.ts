import { defaultRegionalPrices, getRegionalPrice, type RegionCode, type RegionalPrices } from "@/lib/commerce";
import { figmaCatalogueSeeds } from "@/data/figma-catalogue";

export type ProductCategory = {
  name: string;
  slug: string;
};

export type ProductSeries = {
  name: string;
  slug: string;
};

export type CatalogueProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number | null;
  regional_prices: RegionalPrices;
  categories: ProductCategory | null;
  category: ProductCategory;
  product_series: ProductSeries | null;
  series: ProductSeries | null;
  colorway: string;
  display_order: number;
  specifications: string[];
  images: string[];
  tags: string[];
  is_published: boolean;
  created_at: string;
};

export const categories: ProductCategory[] = [
  { name: "Vest & Chestrig", slug: "vest" },
  { name: "Pack & Pouches", slug: "pack" },
  { name: "Belt", slug: "belt" },
  { name: "Accessories", slug: "accessories" },
];

const categoryBySlug = new Map(categories.map((category) => [category.slug, category]));

export const fallbackProducts: CatalogueProduct[] = figmaCatalogueSeeds.map((seed) => {
  const category = categoryBySlug.get(seed.category) ?? { name: "Unassigned", slug: "uncategorized" };
  return {
    id: `figma-${seed.slug}`,
    name: seed.name,
    slug: seed.slug,
    description: seed.description,
    price: seed.price,
    regional_prices: seed.regional_prices,
    categories: category,
    category,
    product_series: seed.series,
    series: seed.series,
    colorway: seed.colorway,
    display_order: seed.display_order,
    specifications: seed.specifications,
    images: seed.images,
    tags: [],
    is_published: true,
    created_at: new Date(Date.UTC(2026, 7, 3, 0, 0, seed.display_order)).toISOString(),
  };
});

export function isMissingSchemaError(error: unknown) {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === "PGRST205");
}

function normalizeRelation<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function normalizeSpecifications(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>)
      .flatMap((item) => Array.isArray(item) ? item : [item])
      .map(String)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

export function normalizeProduct(raw: Record<string, unknown>): CatalogueProduct {
  const category = normalizeRelation(raw.categories as ProductCategory | ProductCategory[] | null);
  const safeCategory = category ?? { name: "Unassigned", slug: "uncategorized" };
  const series = normalizeRelation(raw.product_series as ProductSeries | ProductSeries[] | null);
  const rawPrice = raw.price;
  const price = rawPrice === null || rawPrice === undefined || rawPrice === "" ? null : Number(rawPrice);
  const safePrice = price !== null && Number.isFinite(price) ? price : null;
  const rawRegionalPrices = raw.regional_prices;

  return {
    id: String(raw.id),
    name: String(raw.name ?? "Untitled Product"),
    slug: String(raw.slug ?? raw.id),
    description: String(raw.description ?? ""),
    price: safePrice,
    regional_prices: rawRegionalPrices && typeof rawRegionalPrices === "object"
      ? rawRegionalPrices as RegionalPrices
      : safePrice === null
        ? {}
        : defaultRegionalPrices(safePrice),
    categories: safeCategory,
    category: safeCategory,
    product_series: series,
    series,
    colorway: String(raw.colorway ?? ""),
    display_order: Number.isFinite(Number(raw.display_order)) ? Number(raw.display_order) : 9999,
    specifications: normalizeSpecifications(raw.specifications),
    images: Array.isArray(raw.images) ? raw.images.map(String).filter(Boolean) : [],
    tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],
    is_published: raw.is_published !== false,
    created_at: String(raw.created_at ?? new Date(0).toISOString()),
  };
}

export function mergeCatalogueProducts(primary: CatalogueProduct[], additions = fallbackProducts) {
  const merged = new Map(additions.map((product) => [product.slug, product]));
  for (const product of primary) {
    const seed = merged.get(product.slug);
    const usesLegacyNullPriceSentinel = Boolean(
      seed
      && seed.price === null
      && product.price === 0
      && Object.keys(product.regional_prices).length === 0,
    );
    merged.set(product.slug, seed ? {
      ...seed,
      ...product,
      price: usesLegacyNullPriceSentinel ? null : product.price,
      images: product.images.length ? product.images : seed.images,
      specifications: product.specifications.length ? product.specifications : seed.specifications,
      series: product.series ?? seed.series,
      product_series: product.product_series ?? seed.product_series,
      category: product.category.slug === "uncategorized" ? seed.category : product.category,
      categories: product.category.slug === "uncategorized" ? seed.categories : product.categories,
    } : product);
  }
  return [...merged.values()];
}

export function applyCategoryOverrides(
  products: CatalogueProduct[],
  overrides: ProductCategory[] | null | undefined,
) {
  const categoriesBySlug = new Map((overrides ?? []).map((category) => [category.slug, category]));

  return products.map((product) => {
    const category = categoriesBySlug.get(product.category.slug);
    if (!category) return product;

    return {
      ...product,
      category,
      categories: category,
    };
  });
}

function sortablePrice(product: CatalogueProduct, region: RegionCode) {
  const regionalPrice = product.regional_prices[region];
  if (product.price === null && typeof regionalPrice !== "number") return null;
  return getRegionalPrice(product.price ?? regionalPrice ?? 0, product.regional_prices, region);
}

export function filterProducts(
  products: CatalogueProduct[],
  options: {
    category?: string | null;
    series?: string | null;
    search?: string | null;
    sort?: string | null;
    region?: RegionCode;
  },
) {
  const category = options.category?.trim();
  const series = options.series?.trim();
  const search = options.search?.trim().toLowerCase();
  const sort = options.sort ?? "newest";
  const region = options.region ?? "ID";

  const filtered = products.filter((product) => {
    const categoryMatches = !category || category === "all" || product.category.slug === category;
    const seriesMatches = !series || series === "all" || product.series?.slug === series;
    const searchMatches = !search
      || product.name.toLowerCase().includes(search)
      || product.description.toLowerCase().includes(search)
      || product.category.name.toLowerCase().includes(search)
      || product.series?.name.toLowerCase().includes(search)
      || product.colorway.toLowerCase().includes(search);
    return categoryMatches && seriesMatches && searchMatches;
  });

  return filtered.sort((a, b) => {
    if (sort === "display") return a.display_order - b.display_order || a.name.localeCompare(b.name);
    if (sort === "price-high" || sort === "price-low") {
      const aPrice = sortablePrice(a, region);
      const bPrice = sortablePrice(b, region);
      if (aPrice === null) return 1;
      if (bPrice === null) return -1;
      return sort === "price-high" ? bPrice - aPrice : aPrice - bPrice;
    }
    if (sort === "name-az") return a.name.localeCompare(b.name);
    if (sort === "name-za") return b.name.localeCompare(a.name);
    if (sort === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export function paginateProducts(products: CatalogueProduct[], page: number, limit: number) {
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 12;
  const offset = (safePage - 1) * safeLimit;
  return {
    products: products.slice(offset, offset + safeLimit),
    total: products.length,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.max(1, Math.ceil(products.length / safeLimit)),
  };
}
