import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isMissingSchemaError } from '@/lib/catalogue-data';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const NEWSLETTER_WINDOW_MS = 60 * 60 * 1000;
const NEWSLETTER_MAX_ATTEMPTS = 5;

function newsletterRateLimit(req: NextRequest, email: string) {
  return checkRateLimit({
    key: `newsletter:${getClientIp(req)}:${email}`,
    limit: NEWSLETTER_MAX_ATTEMPTS,
    windowMs: NEWSLETTER_WINDOW_MS,
  });
}

export async function POST(req: NextRequest) {
  const { email } = await req.json().catch(() => ({ email: '' }));
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return NextResponse.json({ ok: false, message: 'Enter a valid email address.' }, { status: 400 });
  }

  const rateLimit = newsletterRateLimit(req, normalizedEmail);
  if (rateLimit.limited) {
    return NextResponse.json(
      { ok: false, message: 'Too many subscription attempts. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } },
    );
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email: normalizedEmail });

    if (error && !isMissingSchemaError(error) && error.code !== '23505') throw error;

    return NextResponse.json({
      ok: true,
      message: isMissingSchemaError(error)
        ? 'Subscription captured for this session. Install newsletter schema to persist it.'
        : 'Subscribed.',
    });
  } catch (error) {
    console.error('Newsletter error:', error);
    return NextResponse.json({ ok: false, message: 'Subscription failed.' }, { status: 500 });
  }
}
