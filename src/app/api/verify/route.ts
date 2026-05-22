import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isMissingSchemaError } from '@/lib/catalogue-data';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { serial } = body;

    if (!serial || typeof serial !== 'string') {
      return NextResponse.json({ found: false, message: 'Invalid serial number' }, { status: 400 });
    }

    const normalizedSerial = serial.trim().toUpperCase();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Look up serial number
    const { data, error } = await supabase
      .from('serial_numbers')
      .select('id, serial, status, verification_count, products(name, id)')
      .eq('serial', normalizedSerial)
      .single();

    if (isMissingSchemaError(error)) {
      return NextResponse.json({
        found: false,
        message: 'Database schema is not installed. Apply supabase/schema.sql.',
      }, { status: 503 });
    }

    if (error || !data) {
      return NextResponse.json({
        found: false,
        message: 'Serial number not found in our system.',
      });
    }

    if (data.status === 'REVOKED') {
      return NextResponse.json({
        found: false,
        message: 'This serial number has been revoked.',
      });
    }

    // Increment verification count
    await supabase
      .from('serial_numbers')
      .update({ status: 'ACTIVE', verification_count: (data.verification_count ?? 0) + 1 })
      .eq('id', data.id);

    // Log verification attempt
    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown';
    await supabase.from('verification_logs').insert({
      serial_id: data.id,
      ip_address: ip,
      user_agent: req.headers.get('user-agent') ?? '',
    });

    // Supabase may return joined data as array or object depending on schema
    const products = data.products as unknown;
    let productName = 'Unknown Product';
    if (Array.isArray(products) && products.length > 0) {
      productName = (products[0] as { name: string }).name ?? 'Unknown Product';
    } else if (products && typeof products === 'object') {
      productName = (products as { name: string }).name ?? 'Unknown Product';
    }

    return NextResponse.json({
      found: true,
      serial: data.serial,
      product: {
        name: productName,
        status: 'ACTIVE',
      },
    });
  } catch (err) {
    console.error('Verify API error:', err);
    return NextResponse.json({ found: false, message: 'Server error. Please try again.' }, { status: 500 });
  }
}
