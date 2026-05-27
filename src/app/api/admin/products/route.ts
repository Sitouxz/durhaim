import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { isMissingSchemaError } from '@/lib/catalogue-data';
import { defaultRegionalPrices, supportedRegions, type RegionalPrices } from '@/lib/commerce';
import { requireAdminRole } from '@/lib/admin-permissions';

export const dynamic = 'force-dynamic';

const PRODUCT_SELECT = 'id, name, slug, description, price, regional_prices, images, is_published, category_id, categories(name, slug)';
const PRODUCT_SELECT_LEGACY = 'id, name, slug, description, price, images, is_published, category_id, categories(name, slug)';

function isMissingRegionalPricesColumn(error: unknown) {
  return Boolean(
    error
      && typeof error === 'object'
      && 'code' in error
      && error.code === '42703'
      && 'message' in error
      && typeof error.message === 'string'
      && error.message.includes('regional_prices'),
  );
}

function withDefaultRegionalPrices<T extends { price?: number | string; regional_prices?: RegionalPrices }>(product: T) {
  return {
    ...product,
    regional_prices: product.regional_prices ?? defaultRegionalPrices(Number(product.price ?? 0)),
  };
}

export async function GET() {
  try {
    const supabase = createAdminClient();
    const authorization = await requireAdminRole(supabase, ['OWNER', 'ADMIN', 'STAFF']);
    if (authorization.error) return authorization.error;

    let { data, error } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .order('name');

    if (error) {
      if (isMissingRegionalPricesColumn(error)) {
        const legacyResult = await supabase
          .from('products')
          .select(PRODUCT_SELECT_LEGACY)
          .order('name');

        data = legacyResult.data?.map((product) => withDefaultRegionalPrices(product)) ?? null;
        error = legacyResult.error;
      }
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

    const productIds = (data ?? []).map((product) => product.id);
    const { data: serialRows, error: serialsError } = productIds.length > 0
      ? await supabase
          .from('serial_numbers')
          .select('product_id')
          .in('product_id', productIds)
      : { data: [], error: null };

    if (serialsError) {
      if (isMissingSchemaError(serialsError)) {
        return NextResponse.json(
          { error: 'Database schema is not installed. Apply supabase/schema.sql.' },
          { status: 503 },
        );
      }

      throw serialsError;
    }

    const serialCounts = new Map<string, number>();
    for (const serial of serialRows ?? []) {
      const productId = String(serial.product_id);
      serialCounts.set(productId, (serialCounts.get(productId) ?? 0) + 1);
    }

    return NextResponse.json((data ?? []).map((product) => ({
      ...product,
      serial_count: serialCounts.get(product.id) ?? 0,
    })));
  } catch (error) {
    console.error('Error fetching admin products:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function getCategoryId(supabase: ReturnType<typeof createAdminClient>, categorySlug?: string) {
  if (!categorySlug) return null;

  const { data, error } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .single();

  if (error) throw error;
  return data?.id ?? null;
}

function parseProductBody(body: Record<string, unknown>) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const slug = typeof body.slug === 'string' ? body.slug.trim().toLowerCase() : '';
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  const categorySlug = typeof body.categorySlug === 'string' ? body.categorySlug.trim() : '';
  const regionalPrices = typeof body.regional_prices === 'object' && body.regional_prices
    ? supportedRegions.reduce<RegionalPrices>((prices, region) => {
        const value = Number((body.regional_prices as Record<string, unknown>)[region]);
        if (Number.isFinite(value) && value >= 0) prices[region] = value;
        return prices;
      }, {})
    : {};
  const price = Number(regionalPrices.ID ?? 0);
  const images = Array.isArray(body.images)
    ? body.images.map(String).map((image) => image.trim()).filter(Boolean)
    : [];
  const isPublished = body.is_published !== false;

  const hasValidRegionalPrices = supportedRegions.every((region) => {
    const value = regionalPrices[region];
    return typeof value === 'number' && Number.isFinite(value) && value >= 0;
  });

  if (!name || !slug || !hasValidRegionalPrices) {
    return { error: 'Name, slug, and valid regional prices are required.' };
  }

  return { name, slug, description, categorySlug, price, regionalPrices, images, isPublished };
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const authorization = await requireAdminRole(supabase, ['OWNER', 'ADMIN']);
    if (authorization.error) return authorization.error;

    const body = await req.json().catch(() => ({}));
    const parsed = parseProductBody(body);

    if ('error' in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const categoryId = await getCategoryId(supabase, parsed.categorySlug);
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: parsed.name,
        slug: parsed.slug,
        description: parsed.description,
        price: parsed.price,
        regional_prices: parsed.regionalPrices,
        category_id: categoryId,
        images: parsed.images,
        is_published: parsed.isPublished,
      })
      .select(PRODUCT_SELECT)
      .single();

    if (error) {
      if (isMissingRegionalPricesColumn(error)) {
        return NextResponse.json(
          { error: 'Database migration required. Add products.regional_prices before saving regional prices.' },
          { status: 503 },
        );
      }
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Product slug already exists.' }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const authorization = await requireAdminRole(supabase, ['OWNER', 'ADMIN']);
    if (authorization.error) return authorization.error;

    const body = await req.json().catch(() => ({}));
    const productId = typeof body.id === 'string' ? body.id : '';

    if (!productId) {
      return NextResponse.json({ error: 'Product id is required.' }, { status: 400 });
    }

    const parsed = parseProductBody(body);
    if ('error' in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const categoryId = await getCategoryId(supabase, parsed.categorySlug);
    const { data, error } = await supabase
      .from('products')
      .update({
        name: parsed.name,
        slug: parsed.slug,
        description: parsed.description,
        price: parsed.price,
        regional_prices: parsed.regionalPrices,
        category_id: categoryId,
        images: parsed.images,
        is_published: parsed.isPublished,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId)
      .select(PRODUCT_SELECT)
      .single();

    if (error) {
      if (isMissingRegionalPricesColumn(error)) {
        return NextResponse.json(
          { error: 'Database migration required. Add products.regional_prices before saving regional prices.' },
          { status: 503 },
        );
      }
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Product slug already exists.' }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const authorization = await requireAdminRole(supabase, ['OWNER', 'ADMIN']);
    if (authorization.error) return authorization.error;

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('id');

    if (!productId) {
      return NextResponse.json({ error: 'Product id is required.' }, { status: 400 });
    }

    const { count, error: serialsError } = await supabase
      .from('serial_numbers')
      .select('id', { count: 'exact', head: true })
      .eq('product_id', productId);

    if (serialsError) {
      if (isMissingSchemaError(serialsError)) {
        return NextResponse.json(
          { error: 'Database schema is not installed. Apply supabase/schema.sql.' },
          { status: 503 },
        );
      }

      throw serialsError;
    }

    if ((count ?? 0) > 0) {
      return NextResponse.json(
        { error: 'Product is tied to QR serials and cannot be deleted.' },
        { status: 409 },
      );
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      if (isMissingSchemaError(error)) {
        return NextResponse.json(
          { error: 'Database schema is not installed. Apply supabase/schema.sql.' },
          { status: 503 },
        );
      }

      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
