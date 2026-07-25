import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  fallbackProducts,
  filterProducts,
  isMissingSchemaError,
  normalizeProduct,
  paginateProducts,
} from '@/lib/catalogue-data';
import { detectRegionFromHeaders, type RegionCode } from '@/lib/commerce';

export const dynamic = 'force-dynamic';

function parsePositiveInt(value: string | null, fallback: number, max = Number.MAX_SAFE_INTEGER) {
  const parsed = parseInt(value ?? '', 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}

function sanitizeSearch(value: string | null) {
  const search = value?.trim();
  if (!search) return '';
  return search.replace(/[%,()]/g, ' ').replace(/\s+/g, ' ').slice(0, 80).trim();
}

// PostgREST answers an offset past the end of the result set with PGRST103.
function isRangeNotSatisfiableError(error: unknown) {
  return Boolean(
    error
      && typeof error === 'object'
      && 'code' in error
      && (error as { code?: string }).code === 'PGRST103',
  );
}

function buildSearchFilter(search: string) {
  return ['name', 'description']
    .map((column) => `${column}.ilike.%${search}%`)
    .join(',');
}

function applySort<T>(query: T, sort: string): T {
  const sortableQuery = query as T & { order: (column: string, options?: { ascending?: boolean }) => T };
  if (sort === 'price-low') return sortableQuery.order('price', { ascending: true });
  if (sort === 'price-high') return sortableQuery.order('price', { ascending: false });
  if (sort === 'name-az') return sortableQuery.order('name', { ascending: true });
  if (sort === 'name-za') return sortableQuery.order('name', { ascending: false });
  if (sort === 'oldest') return sortableQuery.order('created_at', { ascending: true });
  return sortableQuery.order('created_at', { ascending: false });
}

function buildProductResponse(req: NextRequest, sourceProducts = fallbackProducts) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const sort = searchParams.get('sort') ?? 'newest';
  const page = parsePositiveInt(searchParams.get('page'), 1);
  const limit = parsePositiveInt(searchParams.get('limit'), 12, 24);
  const region = (searchParams.get('region') || detectRegionFromHeaders(req.headers)) as RegionCode;
  const filtered = filterProducts(sourceProducts, { category, search, sort, region });

  return {
    ...paginateProducts(filtered, page, limit),
    region,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = sanitizeSearch(searchParams.get('search'));
    const sort = searchParams.get('sort') ?? 'newest';
    const page = parsePositiveInt(searchParams.get('page'), 1);
    const limit = parsePositiveInt(searchParams.get('limit'), 12, 24);
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const region = (searchParams.get('region') || detectRegionFromHeaders(req.headers)) as RegionCode;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    let query = supabase
      .from('products')
      .select('*, categories!inner(name, slug)', { count: 'exact' })
      .eq('is_published', true);

    if (category && category !== 'all') {
      query = query.eq('categories.slug', category);
    }

    if (search) {
      query = query.or(buildSearchFilter(search));
    }

    query = applySort(query, sort).range(from, to);

    const { data, error, count } = await query;

    if (error) {
      if (isMissingSchemaError(error)) {
        return NextResponse.json({
          ...buildProductResponse(req),
          source: 'fallback',
          warning: 'Database schema is not installed. Showing fallback catalogue data.',
        });
      }

      // A page past the end of the result set is ordinary user input (stale links,
      // crawlers), not a server fault. Report it as an empty page.
      if (isRangeNotSatisfiableError(error)) {
        return NextResponse.json({
          products: [], total: 0, page, limit, totalPages: 1, region, source: 'database',
        });
      }

      // Never forward error.message: it carries upstream text verbatim, including full
      // HTML block pages from the edge WAF, which fingerprints the infrastructure.
      console.error('Products API query error:', error);
      return NextResponse.json({ error: 'Unable to load products.' }, { status: 500 });
    }

    const normalized = (data ?? []).map((product) => normalizeProduct(product as Record<string, unknown>));

    return NextResponse.json({
      products: normalized,
      total: count ?? normalized.length,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil((count ?? normalized.length) / limit)),
      region,
      source: 'database',
    });
  } catch (err) {
    console.error('Products API error:', err);
    return NextResponse.json({
      ...buildProductResponse(req),
      source: 'fallback',
      warning: 'Products database is unavailable. Showing fallback catalogue data.',
    });
  }
}
