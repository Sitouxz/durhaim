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
    images: ['https://lh3.googleusercontent.com/aida/ADBb0uhHmarY6x8tQQajILZYGhdMrE_-8N5sRpGivbjfVr7JV1GKgh1VPOJ5UwwZq8boGUAATN8Qo2TJt70_N3aFkd0KyOTZdkRBzyUxSj2dm9l1ZquJ2XLAk_BfM1vXPEdXbeOy3ZRiMPtCuihStQPqlz-Ljk89EELaFmWl1P5VsCg2rZ5Tgknyxr3uqk4ZdS-STDpVubokBOe0xfV1lk0DyQ6J3FtvcnBqUk1-fyua1f5e22SHPkccNAigEb-M'],
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
    images: ['https://lh3.googleusercontent.com/aida/ADBb0uizMNhgZuQE8K5Kr6MB6l2F2tLSm2LxztpQ3QQyiGc3k1a4bGCHPtrGwYPx8k2WqeccGyjcgZJshyffU5xjr5qVTeDFDCeE7mlP2goKZvi1in6qX913WsCOquO9vIIVh3ufOl2KN7ypB0O02wgPOafINEHz9ZTxLEGLnZYTzjOL50QdIetgXo3UyuoAPX_Mufg0sPa5bq6ZIqhMOr1nHbKLlYBpDtNgbVpxNb7AESjvTfIfFkilq2wM8r4'],
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
    images: ['https://lh3.googleusercontent.com/aida/ADBb0uiJ-0dldTUMcqTvYSs4D2qAbjpDJQUr1-nPktRvlp2KIzJkPY6OUjsjU7jtBcOMDLls2lxCoX8DdrqcJOVZ-SaP5Yxj2W0LZo3R0Wf03VwUSnWBlUfRTBOsMQdAPm4DdS9G-QksTMT-qMn50Zo5D7WaKpB7okI3X0r5vkblC2RlaxER_YVu-AoV7tJpTOL7d59f_eqEQyNdrY6eLdJvUDITW3mYc-iOy0r_MDFWHF8x3Ayuz_EkEfG5Kso'],
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
    images: ['https://lh3.googleusercontent.com/aida/ADBb0uiGfLUwNlkyOM4_t7brXJ7tRUTTlJpCltHvq0-kb43jSMjb2P8nA8rI7yeAqXqA1l0A2NKuMA_g7ZGZRMZsdoWwXws8auj2Vx9W47RF88WNrVdVck5TfFTMrdA2Csu_6-Gp5nlSPZeUk1h0OJ00Hxh9T-PStsy_SHG4JWoqe_Q34Xg3EA0-40b71L7fOfkBfgaDUrLeKyBWIaSyBkBRKMUIbXiIBHGz_dHG7Hy2SzHjGsBxZ-PrtvxTLSPn'],
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
    images: ['https://lh3.googleusercontent.com/aida/ADBb0ugf8XCbATiLEBjkn4DG_EzmdZ7e87WonQUAZr1pHTPTAyo899lkLlCQrpA9aoSe9P3H-FkgE1PdKjWcgjphJo71Z3slpAoQdacw2f8FZ-5qekwbdbfpX7tTfZ5Kiiw9IAwfIKasrBb_-XcOX1EPYyNDxOkMhSbxVGuj0IXD9Hmka3jPhQY84q3DyZ91hJRc5FDoeLRco0kHcm_3rvnR8f9mD9B70urXJobfLZHPJKQLSGzsrBWLeH5SyZY'],
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
