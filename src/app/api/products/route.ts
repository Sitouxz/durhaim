import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const sort = searchParams.get('sort') ?? 'newest';
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? '12');
    const offset = (page - 1) * limit;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let query = supabase
      .from('products')
      .select('*, categories(name, slug)', { count: 'exact' })
      .eq('is_published', true)
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('categories.slug', category);
    }

    if (sort === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else if (sort === 'price-high') {
      query = query.order('price', { ascending: false });
    } else if (sort === 'price-low') {
      query = query.order('price', { ascending: true });
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      products: data ?? [],
      total: count ?? 0,
      page,
      limit,
      totalPages: Math.ceil((count ?? 0) / limit),
    });
  } catch (err) {
    console.error('Products API error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
