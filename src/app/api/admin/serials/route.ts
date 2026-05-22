import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { isMissingSchemaError } from '@/lib/catalogue-data';

export const dynamic = 'force-dynamic';

// GET all serial numbers with pagination and search
export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    
    let query = supabase
      .from('serial_numbers')
      .select(`
        id, 
        serial, 
        status, 
        verification_count, 
        created_at,
        products ( id, name, categories ( slug ) )
      `)
      .order('created_at', { ascending: false });

    if (search) {
      query = query.ilike('serial', `%${search}%`);
    }

    if (status && ['INACTIVE', 'ACTIVE', 'REVOKED'].includes(status)) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
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
    console.error('Error fetching serials:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST to bulk generate serial numbers
export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await req.json();
    const { productId, count } = body;

    if (!productId || !count || count <= 0) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // Get the product category slug to use in the serial format
    const { data: product, error: prodErr } = await supabase
      .from('products')
      .select('categories(slug)')
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

    // Supabase relation typing handling
    const categoryData = product.categories as unknown;
    let categorySlug = 'GEN';
    if (Array.isArray(categoryData) && categoryData.length > 0) {
      categorySlug = (categoryData[0] as { slug: string }).slug;
    } else if (categoryData && typeof categoryData === 'object') {
      categorySlug = (categoryData as { slug: string }).slug;
    }
    
    // Extract a 3-4 letter prefix from category (e.g. 'vest-chestrig' -> 'VST')
    const catPrefix = categorySlug.split('-').map(s => s[0]).join('').substring(0, 3).toUpperCase().padEnd(3, 'X');
    
    // Format: DRH-{CAT}-{YYMMDD}-{RANDOM_4CHAR}
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

    const serialsToInsert = [];
    for (let i = 0; i < count; i++) {
      serialsToInsert.push({
        product_id: productId,
        serial: `DRH-${catPrefix}-${yymmdd}-${generateRandom4Char()}`,
        status: 'INACTIVE'
      });
    }

    let { data, error } = await supabase
      .from('serial_numbers')
      .insert(serialsToInsert)
      .select();

    if (error && error.code === '23505') {
      const retrySerials = [];
      for (let i = 0; i < count; i++) {
        retrySerials.push({
          product_id: productId,
          serial: `DRH-${catPrefix}-${yymmdd}-${generateRandom4Char()}`,
          status: 'INACTIVE'
        });
      }

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
