import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { isMissingSchemaError } from '@/lib/catalogue-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('products')
      .select('id, name, slug, price, is_published, categories(name, slug)')
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
