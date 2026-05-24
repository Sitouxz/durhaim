import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, getActiveAdminSessionUser } from '@/lib/admin-auth';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
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
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
