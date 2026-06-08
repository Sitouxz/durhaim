import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isMissingSchemaError } from '@/lib/catalogue-data';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

const VERIFY_WINDOW_MS = 10 * 60 * 1000;
const VERIFY_MAX_ATTEMPTS = 20;

function verifyRateLimit(req: NextRequest, serial: string) {
  return checkRateLimit({
    key: `verify:${getClientIp(req)}:${serial}`,
    limit: VERIFY_MAX_ATTEMPTS,
    windowMs: VERIFY_WINDOW_MS,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { serial } = body;

    if (!serial || typeof serial !== 'string') {
      return NextResponse.json({ found: false, message: 'Invalid serial number' }, { status: 400 });
    }

    const normalizedSerial = serial.trim().toUpperCase();
    if (!/^[A-Z0-9-]{6,40}$/.test(normalizedSerial)) {
      return NextResponse.json({ found: false, message: 'Invalid serial number format' }, { status: 400 });
    }

    const rateLimit = verifyRateLimit(req, normalizedSerial);
    if (rateLimit.limited) {
      return NextResponse.json(
        { found: false, message: 'Too many verification attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } },
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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



    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown';
    const userAgent = req.headers.get('user-agent') ?? '';
    
    // Manually increment the verification count bypassing the RPC
    const newCount = (data.verification_count || 0) + 1;
    const { error: updateError } = await supabase
      .from('serial_numbers')
      .update({ verification_count: newCount })
      .eq('id', data.id);

    if (updateError) {
      console.error('Verify API log error (update):', updateError);
      return NextResponse.json({ found: false, message: 'Unable to record verification attempt.' }, { status: 500 });
    }

    const { error: logError } = await supabase
      .from('verification_logs')
      .insert({
        serial_id: data.id,
        ip_address: ip.substring(0, 256),
        user_agent: userAgent.substring(0, 512),
      });
      
    if (logError) {
      console.error('Verify API log error (insert):', logError);
    }

    // Supabase may return joined data as array or object depending on schema
    const products = data.products as unknown;
    let productName: string | null = null;
    if (Array.isArray(products) && products.length > 0) {
      productName = (products[0] as { name: string }).name ?? null;
    } else if (products && typeof products === 'object') {
      productName = (products as { name: string }).name ?? null;
    }

    return NextResponse.json({
      found: true,
      serial: data.serial,
      product: {
        name: productName,
        status: data.status,
      },
    });
  } catch (err) {
    console.error('Verify API error:', err);
    return NextResponse.json({ found: false, message: 'Server error. Please try again.' }, { status: 500 });
  }
}
