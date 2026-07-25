import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isMissingSchemaError } from '@/lib/catalogue-data';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { parseSerialVerification } from '@/lib/serial-verification';

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
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    // serial_numbers is not readable by the anon role, because the anon key is
    // public and a table-level grant would expose the whole registry. The RPC
    // looks up exactly one serial and records the verification in the same call.
    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown';
    const { data, error } = await supabase.rpc('record_serial_verification', {
      p_serial: normalizedSerial,
      p_ip_address: ip,
      p_user_agent: req.headers.get('user-agent') ?? '',
    });

    if (isMissingSchemaError(error)) {
      return NextResponse.json({
        found: false,
        message: 'Database schema is not installed. Apply supabase/schema.sql.',
      }, { status: 503 });
    }

    if (error) {
      console.error('Verify API log error:', error);
      return NextResponse.json({ found: false, message: 'Unable to record verification attempt.' }, { status: 500 });
    }

    const result = parseSerialVerification(data);

    if (!result) {
      return NextResponse.json({
        found: false,
        message: 'Serial number not found in our system.',
      });
    }

    if (result.status === 'REVOKED') {
      return NextResponse.json({
        found: false,
        message: 'This serial number has been revoked.',
      });
    }

    return NextResponse.json({
      found: true,
      serial: result.serial,
      product: {
        name: result.productName,
        status: result.status,
      },
    });
  } catch (err) {
    console.error('Verify API error:', err);
    return NextResponse.json({ found: false, message: 'Server error. Please try again.' }, { status: 500 });
  }
}
