import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase';
import {
  applyCategoryOverrides,
  fallbackProducts,
  isMissingSchemaError,
  mergeCatalogueProducts,
  normalizeProduct,
} from '@/lib/catalogue-data';
import {
  getCatalogueTombstoneSlugs,
  restoreCatalogueProduct,
  tombstoneCatalogueProduct,
} from '@/lib/catalogue-tombstones';
import { defaultRegionalPrices, supportedRegions, type RegionalPrices } from '@/lib/commerce';
import { requireAdminRole } from '@/lib/admin-permissions';

export const dynamic = 'force-dynamic';

const PRODUCT_SELECT = 'id, name, slug, description, price, regional_prices, images, specifications, colorway, display_order, is_published, category_id, series_id, categories(name, slug), product_series(name, slug)';
const PRODUCT_SELECT_LEGACY_RICH = 'id, name, slug, description, price, regional_prices, images, specifications, is_published, category_id, categories(name, slug)';
const PRODUCT_SELECT_LEGACY = 'id, name, slug, description, price, images, is_published, category_id, categories(name, slug)';

function revalidateCatalogueProduct(slug: string) {
  revalidatePath('/catalogue');
  revalidatePath(`/catalogue/${slug}`);
  revalidatePath('/sitemap.xml');
}

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

function isMissingCatalogueExtension(error: unknown) {
  if (!error || typeof error !== 'object') return false;
  const record = error as { code?: string; message?: string };
  return ['42703', '42P01', 'PGRST200'].includes(record.code ?? '')
    || /product_series|series_id|display_order|colorway|specifications/i.test(record.message ?? '');
}

function isMissingLegacyProductColumn(error: unknown) {
  if (!error || typeof error !== 'object') return false;
  const record = error as { code?: string; message?: string };
  return record.code === '42703' && /regional_prices|specifications/i.test(record.message ?? '');
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
      if (isMissingRegionalPricesColumn(error) || isMissingCatalogueExtension(error)) {
        let legacyResult = await supabase
          .from('products')
          .select(PRODUCT_SELECT_LEGACY_RICH)
          .order('name');

        if (legacyResult.error && isMissingLegacyProductColumn(legacyResult.error)) {
          const basicLegacyResult = await supabase
            .from('products')
            .select(PRODUCT_SELECT_LEGACY)
            .order('name');

          legacyResult = {
            ...basicLegacyResult,
            data: basicLegacyResult.data?.map((product) => withDefaultRegionalPrices(product)) ?? null,
          } as typeof legacyResult;
        }

        data = legacyResult.data as unknown as typeof data;
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

    const categoryResult = await supabase
      .from('categories')
      .select('name, slug');
    if (categoryResult.error) throw categoryResult.error;
    const tombstonedSlugs = await getCatalogueTombstoneSlugs(supabase);

    const databaseProducts = (data ?? []).map((product) =>
      normalizeProduct(product as Record<string, unknown>));
    const databaseSlugs = new Set(databaseProducts.map((product) => product.slug));
    const dashboardProducts = applyCategoryOverrides(
      process.env.STOREFRONT_V2_ENABLED === 'false'
      ? databaseProducts
      : mergeCatalogueProducts(databaseProducts, fallbackProducts, tombstonedSlugs),
      categoryResult.data,
    );

    return NextResponse.json(dashboardProducts
      .map((product) => ({
        ...product,
        catalogue_only: !databaseSlugs.has(product.slug),
        serial_count: serialCounts.get(product.id) ?? 0,
      }))
      .sort((a, b) => a.name.localeCompare(b.name)));
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

async function getSeriesId(supabase: ReturnType<typeof createAdminClient>, seriesSlug?: string) {
  if (!seriesSlug) return null;
  const { data, error } = await supabase
    .from('product_series')
    .select('id')
    .eq('slug', seriesSlug)
    .single();
  if (error && isMissingCatalogueExtension(error)) return null;
  if (error) throw error;
  return data?.id ?? null;
}

type ParsedProductBody = {
  name: string;
  slug: string;
  description: string;
  categorySlug: string;
  seriesSlug: string;
  colorway: string;
  displayOrder: number;
  price: number | null;
  regionalPrices: RegionalPrices;
  images: string[];
  specifications: string[];
  isPublished: boolean;
};

function parseProductBody(body: Record<string, unknown>): ParsedProductBody | { error: string } {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const slug = typeof body.slug === 'string' ? body.slug.trim().toLowerCase() : '';
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  const categorySlug = typeof body.categorySlug === 'string' ? body.categorySlug.trim() : '';
  const seriesSlug = typeof body.seriesSlug === 'string' ? body.seriesSlug.trim() : '';
  const colorway = typeof body.colorway === 'string' ? body.colorway.trim() : '';
  const displayOrder = Number(body.display_order ?? 0);
  const regionalPrices = typeof body.regional_prices === 'object' && body.regional_prices
    ? supportedRegions.reduce<RegionalPrices>((prices, region) => {
        const value = Number((body.regional_prices as Record<string, unknown>)[region]);
        if (Number.isFinite(value) && value >= 0) prices[region] = value;
        return prices;
      }, {})
    : {};
  const explicitPrice = body.price === null || body.price === '' || body.price === undefined
    ? null
    : Number(body.price);
  const price = explicitPrice !== null && Number.isFinite(explicitPrice)
    ? explicitPrice
    : typeof regionalPrices.ID === 'number'
      ? regionalPrices.ID
      : null;
  const images = Array.isArray(body.images)
    ? body.images.map(String).map((image) => image.trim()).filter(Boolean)
    : [];
  const specifications = Array.isArray(body.specifications)
    ? body.specifications.map(String).map((item) => item.trim()).filter(Boolean)
    : [];
  const isPublished = body.is_published !== false;

  const hasValidRegionalPrices = supportedRegions.every((region) => {
    const value = regionalPrices[region];
    return value === undefined || (typeof value === 'number' && Number.isFinite(value) && value >= 0);
  });

  if (!name || !slug || !hasValidRegionalPrices || !Number.isInteger(displayOrder) || displayOrder < 0) {
    return { error: 'Name, slug, non-negative display order, and valid optional regional prices are required.' };
  }

  // There was no cap, and no column constraint behind it: a 5,000-character name was accepted
  // and stored, which would break catalogue cards, page titles and the Product schema.
  if (name.length > 160) {
    return { error: 'Product name must be 160 characters or fewer.' };
  }

  if (slug.length > 120) {
    return { error: 'Product slug must be 120 characters or fewer.' };
  }

  if (description.length > 2000) {
    return { error: 'Product description must be 2000 characters or fewer.' };
  }

  if (colorway.length > 120) {
    return { error: 'Colorway must be 120 characters or fewer.' };
  }

  return {
    name,
    slug,
    description,
    categorySlug,
    seriesSlug,
    colorway,
    displayOrder,
    price,
    regionalPrices,
    images,
    specifications,
    isPublished,
  };
}

function fullProductPayload(
  parsed: ParsedProductBody,
  categoryId: string | null,
  seriesId: string | null,
) {
  return {
    name: parsed.name,
    slug: parsed.slug,
    description: parsed.description,
    price: parsed.price,
    regional_prices: parsed.regionalPrices,
    category_id: categoryId,
    series_id: seriesId,
    colorway: parsed.colorway || null,
    display_order: parsed.displayOrder,
    images: parsed.images,
    specifications: parsed.specifications,
    is_published: parsed.isPublished,
    updated_at: new Date().toISOString(),
  };
}

function legacyProductPayload(parsed: ParsedProductBody, categoryId: string | null) {
  return {
    name: parsed.name,
    slug: parsed.slug,
    description: parsed.description,
    // The deployed legacy schema still requires a numeric price. Zero is only
    // a storage sentinel; mergeCatalogueProducts converts it back to null when
    // the bundled catalogue product has no regional prices.
    price: parsed.price ?? 0,
    regional_prices: parsed.regionalPrices,
    category_id: categoryId,
    images: parsed.images,
    specifications: parsed.specifications,
    is_published: parsed.isPublished,
    updated_at: new Date().toISOString(),
  };
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
    const seriesId = await getSeriesId(supabase, parsed.seriesSlug);
    let { data, error } = await supabase
      .from('products')
      .insert(fullProductPayload(parsed, categoryId, seriesId))
      .select(PRODUCT_SELECT)
      .single();

    if (error && (isMissingRegionalPricesColumn(error) || isMissingCatalogueExtension(error))) {
      const legacyResult = await supabase
        .from('products')
        .insert(legacyProductPayload(parsed, categoryId))
        .select(PRODUCT_SELECT_LEGACY_RICH)
        .single();
      data = legacyResult.data as unknown as typeof data;
      error = legacyResult.error;
    }

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Product slug already exists.' }, { status: 409 });
      }
      throw error;
    }

    await restoreCatalogueProduct(supabase, parsed.slug);
    revalidateCatalogueProduct(parsed.slug);

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
    const seriesId = await getSeriesId(supabase, parsed.seriesSlug);
    const catalogueSeed = fallbackProducts.find((product) => product.id === productId) ?? null;

    if (catalogueSeed && parsed.slug !== catalogueSeed.slug) {
      return NextResponse.json(
        { error: 'The slug of a bundled catalogue product cannot be changed.' },
        { status: 400 },
      );
    }

    const fullPayload = {
      ...fullProductPayload(parsed, categoryId, seriesId),
      slug: catalogueSeed?.slug ?? parsed.slug,
    };
    let fullResult = catalogueSeed
      ? await supabase
          .from('products')
          .upsert(fullPayload, { onConflict: 'slug' })
          .select(PRODUCT_SELECT)
          .single()
      : await supabase
          .from('products')
          .update(fullPayload)
          .eq('id', productId)
          .select(PRODUCT_SELECT)
          .single();

    if (fullResult.error && (isMissingRegionalPricesColumn(fullResult.error) || isMissingCatalogueExtension(fullResult.error))) {
      const legacyPayload = {
        ...legacyProductPayload(parsed, categoryId),
        slug: catalogueSeed?.slug ?? parsed.slug,
      };
      const legacyResult = catalogueSeed
        ? await supabase
            .from('products')
            .upsert(legacyPayload, { onConflict: 'slug' })
            .select(PRODUCT_SELECT_LEGACY_RICH)
            .single()
        : await supabase
            .from('products')
            .update(legacyPayload)
            .eq('id', productId)
            .select(PRODUCT_SELECT_LEGACY_RICH)
            .single();
      fullResult = legacyResult as unknown as typeof fullResult;
    }

    const { data, error } = fullResult;

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Product slug already exists.' }, { status: 409 });
      }
      throw error;
    }

    await restoreCatalogueProduct(supabase, parsed.slug);
    revalidateCatalogueProduct(parsed.slug);

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

    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, slug')
      .eq('id', productId)
      .maybeSingle();

    if (productError) {
      if (isMissingSchemaError(productError)) {
        return NextResponse.json(
          { error: 'Database schema is not installed. Apply supabase/schema.sql.' },
          { status: 503 },
        );
      }
      throw productError;
    }

    if (!product) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
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

    const isBundledProduct = fallbackProducts.some((item) => item.slug === product.slug);
    if (isBundledProduct) {
      await tombstoneCatalogueProduct(supabase, product.slug);
    }

    const { data: deletedProduct, error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)
      .select('id, slug')
      .maybeSingle();

    if (error || !deletedProduct) {
      if (isBundledProduct) {
        try {
          await restoreCatalogueProduct(supabase, product.slug);
        } catch (rollbackError) {
          console.error('Failed to roll back catalogue product tombstone:', rollbackError);
        }
      }

      if (isMissingSchemaError(error)) {
        return NextResponse.json(
          { error: 'Database schema is not installed. Apply supabase/schema.sql.' },
          { status: 503 },
        );
      }

      if (error) throw error;
      return NextResponse.json({ error: 'Product was not deleted.' }, { status: 409 });
    }

    revalidateCatalogueProduct(product.slug);
    return NextResponse.json({ success: true, product: deletedProduct });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
