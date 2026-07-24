import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, getActiveAdminSessionUser } from '@/lib/admin-auth';

// Legacy WordPress QR labels encode https://durhaim.com/?code=XXXX&action=validate.
// The new site verifies serials at /verify/[serial], so redirect old printed codes there.
const LEGACY_QR_SERIAL_PATTERN = /^[A-Z0-9-]{6,40}$/;

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  if (pathname === '/') {
    const code = searchParams.get('code');
    if (searchParams.get('action') === 'validate' && code) {
      const normalizedCode = code.trim().toUpperCase();
      if (LEGACY_QR_SERIAL_PATTERN.test(normalizedCode)) {
        const verifyUrl = req.nextUrl.clone();
        verifyUrl.pathname = `/verify/${normalizedCode}`;
        verifyUrl.search = '';
        return NextResponse.redirect(verifyUrl, 308);
      }
    }
    return NextResponse.next();
  }

  const isAdminLogin = pathname === '/admin/login' || pathname === '/api/admin/login';
  const isAdminLogout = pathname === '/api/admin/logout';

  if (isAdminLogin || isAdminLogout) {
    return NextResponse.next();
  }

  const sessionUser = await getActiveAdminSessionUser(req.cookies.get(ADMIN_SESSION_COOKIE)?.value);
  if (sessionUser) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = '/admin/login';
  loginUrl.searchParams.set('next', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/', '/admin/:path*', '/api/admin/:path*'],
};
