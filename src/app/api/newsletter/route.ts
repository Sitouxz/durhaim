import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isMissingSchemaError } from '@/lib/catalogue-data';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const { email } = await req.json().catch(() => ({ email: '' }));
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return NextResponse.json({ ok: false, message: 'Enter a valid email address.' }, { status: 400 });
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { error } = await supabase
      .from('newsletter_subscribers')
      .upsert({ email: normalizedEmail }, { onConflict: 'email' });

    if (error && !isMissingSchemaError(error)) throw error;

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
