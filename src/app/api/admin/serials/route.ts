import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { isMissingSchemaError } from '@/lib/catalogue-data';
import { requireAdminRole } from '@/lib/admin-permissions';

export const dynamic = 'force-dynamic';

const ALL_DURHAIM_PRODUCTS = 'ALL_DURHAIM_PRODUCTS';

const sortableSerialColumns = {
  serial: 'serial',
  product: 'products(name)',
  status: 'status',
  scans: 'verification_count',
  generated: 'created_at',
} as const;

type SortableSerialColumn = keyof typeof sortableSerialColumns;

type ProductForSerialGeneration = {
  id: string;
  categories: unknown;
};

function getCategoryPrefix(categoryData: unknown) {
  let categorySlug = 'GEN';
  if (Array.isArray(categoryData) && categoryData.length > 0) {
    categorySlug = (categoryData[0] as { slug: string }).slug;
  } else if (categoryData && typeof categoryData === 'object') {
    categorySlug = (categoryData as { slug: string }).slug;
  }

  return categorySlug.split('-').map((s) => s[0]).join('').substring(0, 3).toUpperCase().padEnd(3, 'X');
}

function generateSerialRows(productsToGenerate: ProductForSerialGeneration[], count: number) {
  const date = new Date();
  const yymmdd = date.getFullYear().toString().slice(-2) +
                 (date.getMonth() + 1).toString().padStart(2, '0') +
                 date.getDate().toString().padStart(2, '0');

  const generateRandom4Char = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  return productsToGenerate.flatMap((product) => {
    const catPrefix = getCategoryPrefix(product.categories);
    return Array.from({ length: count }, () => ({
      product_id: product.id,
      serial: `DRH-${catPrefix}-${yymmdd}-${generateRandom4Char()}`,
      status: 'INACTIVE',
    }));
  });
}

// GET all serial numbers with pagination and search
export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const authorization = await requireAdminRole(supabase, ['OWNER', 'ADMIN', 'STAFF']);
    if (authorization.error) return authorization.error;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const productId = searchParams.get('productId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const minScans = searchParams.get('minScans');
    const maxScans = searchParams.get('maxScans');
    const pageParam = searchParams.get('page');
    const pageSizeParam = searchParams.get('pageSize');
    const sortByParam = searchParams.get('sortBy');
    const sortDirectionParam = searchParams.get('sortDirection');
    const wantsPagination = pageParam !== null || pageSizeParam !== null;
    const page = Math.max(1, Number(pageParam) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(pageSizeParam) || 25));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const sortBy: SortableSerialColumn = sortByParam && sortByParam in sortableSerialColumns
      ? sortByParam as SortableSerialColumn
      : 'generated';
    const sortDirection = sortDirectionParam === 'asc' ? 'asc' : 'desc';
    
    let query = supabase
      .from('serial_numbers')
      .select(`
        id, 
        serial, 
        status, 
        verification_count, 
        created_at,
        products ( id, name, categories ( slug ) )
      `, wantsPagination ? { count: 'exact' } : undefined);

    if (search) {
      query = query.ilike('serial', `%${search}%`);
    }

    if (status && ['INACTIVE', 'ACTIVE', 'REVOKED'].includes(status)) {
      query = query.eq('status', status);
    }

    if (productId) {
      query = query.eq('product_id', productId);
    }

    if (dateFrom) {
      query = query.gte('created_at', `${dateFrom}T00:00:00.000Z`);
    }

    if (dateTo) {
      query = query.lte('created_at', `${dateTo}T23:59:59.999Z`);
    }

    const parsedMinScans = minScans ? Number(minScans) : null;
    if (parsedMinScans !== null && Number.isFinite(parsedMinScans) && parsedMinScans >= 0) {
      query = query.gte('verification_count', parsedMinScans);
    }

    const parsedMaxScans = maxScans ? Number(maxScans) : null;
    if (parsedMaxScans !== null && Number.isFinite(parsedMaxScans) && parsedMaxScans >= 0) {
      query = query.lte('verification_count', parsedMaxScans);
    }

    query = query.order(sortableSerialColumns[sortBy], { ascending: sortDirection === 'asc' });

    if (sortBy !== 'generated') {
      query = query.order('created_at', { ascending: false });
    }

    if (wantsPagination) {
      query = query.range(from, to);
    }

    const { data, error, count } = await query;
    if (error) {
      if (isMissingSchemaError(error)) {
        return NextResponse.json(
          { error: 'Database schema is not installed. Apply supabase/schema.sql.' },
          { status: 503 },
        );
      }

      throw error;
    }

    if (wantsPagination) {
      const total = count ?? 0;
      return NextResponse.json({
        data: data ?? [],
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.max(1, Math.ceil(total / pageSize)),
        },
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching serials:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST to bulk generate serial numbers
export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const authorization = await requireAdminRole(supabase, ['OWNER', 'ADMIN']);
    if (authorization.error) return authorization.error;

    const body = await req.json();
    const { productId, count } = body;

    if (!productId || !count || count <= 0) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    let productsToGenerate: ProductForSerialGeneration[] = [];

    if (productId === ALL_DURHAIM_PRODUCTS) {
      const { data: products, error: productsErr } = await supabase
        .from('products')
        .select('id, categories(slug)')
        .order('name', { ascending: true });

      if (productsErr) {
        if (isMissingSchemaError(productsErr)) {
          return NextResponse.json(
            { error: 'Database schema is not installed. Apply supabase/schema.sql.' },
            { status: 503 },
          );
        }

        throw productsErr;
      }

      productsToGenerate = (products ?? []) as ProductForSerialGeneration[];
      if (productsToGenerate.length === 0) {
        return NextResponse.json({ error: 'No products found' }, { status: 404 });
      }
    } else {
      // Get the product category slug to use in the serial format
      const { data: product, error: prodErr } = await supabase
        .from('products')
        .select('id, categories(slug)')
        .eq('id', productId)
        .single();

      if (prodErr || !product) {
        if (isMissingSchemaError(prodErr)) {
          return NextResponse.json(
            { error: 'Database schema is not installed. Apply supabase/schema.sql.' },
            { status: 503 },
          );
        }

        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      productsToGenerate = [product as ProductForSerialGeneration];
    }
    
    const serialsToInsert = generateSerialRows(productsToGenerate, count);

    let { data, error } = await supabase
      .from('serial_numbers')
      .insert(serialsToInsert)
      .select();

    if (error && error.code === '23505') {
      const retrySerials = generateSerialRows(productsToGenerate, count);

      const retry = await supabase
        .from('serial_numbers')
        .insert(retrySerials)
        .select();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      if (isMissingSchemaError(error)) {
        return NextResponse.json(
          { error: 'Database schema is not installed. Apply supabase/schema.sql.' },
          { status: 503 },
        );
      }

      throw error;
    }

    return NextResponse.json({ success: true, count: data?.length ?? 0, data: data ?? [] });
  } catch (error) {
    console.error('Error generating serials:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH to update serial status (Activate/Revoke/Reset)
export async function PATCH(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const authorization = await requireAdminRole(supabase, ['OWNER', 'ADMIN']);
    if (authorization.error) return authorization.error;

    const body = await req.json();
    const { serialId, status } = body;

    if (!serialId || !['INACTIVE', 'ACTIVE', 'REVOKED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('serial_numbers')
      .update({ status })
      .eq('id', serialId)
      .select()
      .single();

    if (error) {
      if (isMissingSchemaError(error)) {
        return NextResponse.json(
          { error: 'Database schema is not installed. Apply supabase/schema.sql.' },
          { status: 503 },
        );
      }

      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating serial:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
