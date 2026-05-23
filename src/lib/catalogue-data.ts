export type ProductCategory = {
  name: string;
  slug: string;
};

export type CatalogueProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  categories: ProductCategory | null;
  category: ProductCategory;
  images: string[];
  tags: string[];
  is_published: boolean;
  created_at: string;
};

export const categories: ProductCategory[] = [
  { name: 'Vest & Chestrig', slug: 'vest' },
  { name: 'Pack & Pouches', slug: 'pack' },
  { name: 'Belt', slug: 'belt' },
  { name: 'Accessories', slug: 'accessories' },
];

export const fallbackProducts: CatalogueProduct[] = [
  {
    id: 'fallback-cobra-mcb-vest',
    name: 'Cobra Multicam Black Vest',
    slug: 'cobra-multicam-black-vest',
    description: 'MODULAR TACTICAL CARRIER / QUICK RELEASE SYSTEM / LASER CUT MOLLE',
    price: 1850000,
    categories: categories[0],
    category: categories[0],
    images: ['/images/29_VC-1.png'],
    tags: ['BATTLE PROVEN'],
    is_published: true,
    created_at: '2026-05-01T00:00:00.000Z',
  },
  {
    id: 'fallback-black-thunder-vest',
    name: 'Black Thunder Vest',
    slug: 'black-thunder-vest',
    description: 'HEAVY DUTY PLATE CARRIER / TRIPLE MAG POUCH INCLUDED / ADJUSTABLE HARNESS',
    price: 1750000,
    categories: categories[0],
    category: categories[0],
    images: ['/images/29_VC-1.png'],
    tags: [],
    is_published: true,
    created_at: '2026-04-20T00:00:00.000Z',
  },
  {
    id: 'fallback-anaconda-mcb-pack',
    name: 'Anaconda MCB Pack',
    slug: 'anaconda-mcb-pack',
    description: '30L CAPACITY / HYDRATION COMPATIBLE / MULTICAM BLACK CORDURA',
    price: 1250000,
    categories: categories[1],
    category: categories[1],
    images: ['/images/31_PP-1.png'],
    tags: ['NEW ARRIVAL'],
    is_published: true,
    created_at: '2026-05-10T00:00:00.000Z',
  },
  {
    id: 'fallback-black-trojan-pro-belt',
    name: 'Black Trojan Pro Belt',
    slug: 'black-trojan-pro-belt',
    description: 'RIGGER BELT / QUICK RELEASE BUCKLE / INTEGRATED POUCH SYSTEM',
    price: 850000,
    categories: categories[2],
    category: categories[2],
    images: ['/images/33_B-1.png'],
    tags: [],
    is_published: true,
    created_at: '2026-04-02T00:00:00.000Z',
  },
  {
    id: 'fallback-rattle-belt-mcb',
    name: 'Rattle Belt MCB',
    slug: 'rattle-belt-mcb',
    description: 'TACTICAL WAIST BELT / MULTICAM BLACK / COBRA STYLE BUCKLE / MAG POUCHES',
    price: 950000,
    categories: categories[2],
    category: categories[2],
    images: ['/images/33_B-1.png'],
    tags: ['LIMITED STOCK'],
    is_published: true,
    created_at: '2026-03-22T00:00:00.000Z',
  },
];

export function isMissingSchemaError(error: unknown) {
  return Boolean(error && typeof error === 'object' && 'code' in error && error.code === 'PGRST205');
}

export function normalizeProduct(raw: Record<string, unknown>): CatalogueProduct {
  const relation = raw.categories as ProductCategory | ProductCategory[] | null | undefined;
  const category = Array.isArray(relation) ? relation[0] : relation;
  const safeCategory = category ?? { name: 'Unassigned', slug: 'uncategorized' };

  return {
    id: String(raw.id),
    name: String(raw.name ?? 'Untitled Product'),
    slug: String(raw.slug ?? raw.id),
    description: String(raw.description ?? ''),
    price: Number(raw.price ?? 0),
    categories: safeCategory,
    category: safeCategory,
    images: Array.isArray(raw.images) ? raw.images.map(String) : [],
    tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],
    is_published: raw.is_published !== false,
    created_at: String(raw.created_at ?? new Date(0).toISOString()),
  };
}

export function filterProducts(
  products: CatalogueProduct[],
  options: { category?: string | null; search?: string | null; sort?: string | null },
) {
  const category = options.category?.trim();
  const search = options.search?.trim().toLowerCase();
  const sort = options.sort ?? 'newest';

  const filtered = products.filter((product) => {
    const categoryMatches = !category || category === 'all' || product.category.slug === category;
    const searchMatches = !search
      || product.name.toLowerCase().includes(search)
      || product.description.toLowerCase().includes(search)
      || product.category.name.toLowerCase().includes(search);

    return categoryMatches && searchMatches;
  });

  return filtered.sort((a, b) => {
    if (sort === 'price-high') return b.price - a.price;
    if (sort === 'price-low') return a.price - b.price;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export function paginateProducts(products: CatalogueProduct[], page: number, limit: number) {
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 12;
  const offset = (safePage - 1) * safeLimit;
  const paginated = products.slice(offset, offset + safeLimit);

  return {
    products: paginated,
    total: products.length,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.max(1, Math.ceil(products.length / safeLimit)),
  };
}
