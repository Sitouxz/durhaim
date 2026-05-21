import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  fallbackProducts,
  filterProducts,
  isMissingSchemaError,
  normalizeProduct,
  paginateProducts,
} from '@/lib/catalogue-data';

export const dynamic = 'force-dynamic';

function buildProductResponse(req: NextRequest, sourceProducts = fallbackProducts) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const sort = searchParams.get('sort') ?? 'newest';
  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const limit = parseInt(searchParams.get('limit') ?? '12', 10);
  const filtered = filterProducts(sourceProducts, { category, search, sort });

  return paginateProducts(filtered, page, limit);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') ?? 'newest';
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const limit = parseInt(searchParams.get('limit') ?? '12', 10);
    const offset = (Math.max(page, 1) - 1) * Math.max(limit, 1);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    let query = supabase
      .from('products')
      .select('*, categories(name, slug)', { count: 'exact' })
      .eq('is_published', true)
      .range(offset, offset + Math.max(limit, 1) - 1);

    if (category && category !== 'all') {
      query = query.eq('categories.slug', category);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (sort === 'price-high') {
      query = query.order('price', { ascending: false });
    } else if (sort === 'price-low') {
      query = query.order('price', { ascending: true });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error, count } = await query;

    if (error) {
      if (isMissingSchemaError(error)) {
        return NextResponse.json({
          ...buildProductResponse(req),
          source: 'fallback',
          warning: 'Database schema is not installed. Showing fallback catalogue data.',
        });
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      products: (data ?? []).map((product) => normalizeProduct(product as Record<string, unknown>)),
      total: count ?? 0,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil((count ?? 0) / Math.max(limit, 1))),
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
