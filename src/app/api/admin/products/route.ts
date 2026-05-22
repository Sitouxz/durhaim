import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { isMissingSchemaError } from '@/lib/catalogue-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('products')
      .select('id, name, slug, description, price, images, is_published, category_id, categories(name, slug)')
      .order('name');

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
  const price = Number(body.price ?? 0);
  const images = Array.isArray(body.images)
    ? body.images.map(String).map((image) => image.trim()).filter(Boolean)
    : [];
  const isPublished = body.is_published !== false;

  if (!name || !slug || !Number.isFinite(price) || price < 0) {
    return { error: 'Name, slug, and valid price are required.' };
  }

  return { name, slug, description, categorySlug, price, images, isPublished };
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient();
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
        category_id: categoryId,
        images: parsed.images,
        is_published: parsed.isPublished,
      })
      .select('id, name, slug, description, price, images, is_published, category_id, categories(name, slug)')
      .single();

    if (error) {
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
        category_id: categoryId,
        images: parsed.images,
        is_published: parsed.isPublished,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId)
      .select('id, name, slug, description, price, images, is_published, category_id, categories(name, slug)')
      .single();

    if (error) {
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
