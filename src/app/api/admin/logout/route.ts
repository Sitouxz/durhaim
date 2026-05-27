import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, getAdminCookieOptions } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_SESSION_COOKIE, '', {
    ...getAdminCookieOptions(req),
    maxAge: 0,
  });
  return res;
}
