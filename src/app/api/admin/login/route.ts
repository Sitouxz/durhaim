import { NextRequest, NextResponse } from 'next/server';
import { createAdminSessionToken, getAdminCookieOptions, ADMIN_SESSION_COOKIE, verifyAdminPassword } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({ password: '' }));
  const password = typeof body.password === 'string' ? body.password : '';

  if (!(await verifyAdminPassword(password))) {
    return NextResponse.json({ ok: false, error: 'Invalid admin password.' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_SESSION_COOKIE, await createAdminSessionToken(), getAdminCookieOptions());
  return res;
}
