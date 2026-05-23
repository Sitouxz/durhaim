import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { isMissingSchemaError } from '@/lib/catalogue-data';

export const dynamic = 'force-dynamic';

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseCategoryBody(body: Record<string, unknown>) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const slug = typeof body.slug === 'string' ? slugify(body.slug) : slugify(name);
  const icon = typeof body.icon === 'string' ? body.icon.trim() : '';

  if (!name || !slug) {
    return { error: 'Name and slug are required.' };
  }

  return { name, slug, icon };
}

function handleCategoryError(error: unknown) {
  if (isMissingSchemaError(error)) {
    return NextResponse.json(
      { error: 'Database schema is not installed. Apply supabase/schema.sql.' },
      { status: 503 },
    );
  }

  if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
    return NextResponse.json({ error: 'Category slug already exists.' }, { status: 409 });
  }

  throw error;
}

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, icon')
      .order('name', { ascending: true });

    if (error) return handleCategoryError(error);

    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error('Error fetching admin categories:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await req.json().catch(() => ({}));
    const parsed = parseCategoryBody(body);

    if ('error' in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: parsed.name,
        slug: parsed.slug,
        icon: parsed.icon || null,
      })
      .select('id, name, slug, icon')
      .single();

    if (error) return handleCategoryError(error);

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await req.json().catch(() => ({}));
    const categoryId = typeof body.id === 'string' ? body.id : '';

    if (!categoryId) {
      return NextResponse.json({ error: 'Category id is required.' }, { status: 400 });
    }

    const parsed = parseCategoryBody(body);
    if ('error' in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('categories')
      .update({
        name: parsed.name,
        slug: parsed.slug,
        icon: parsed.icon || null,
      })
      .eq('id', categoryId)
      .select('id, name, slug, icon')
      .single();

    if (error) return handleCategoryError(error);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('id');

    if (!categoryId) {
      return NextResponse.json({ error: 'Category id is required.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (error) return handleCategoryError(error);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
