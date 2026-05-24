import { NextRequest, NextResponse } from 'next/server';
import { createAdminSessionToken, getAdminCookieOptions, ADMIN_SESSION_COOKIE, verifyAdminPassword } from '@/lib/admin-auth';
import { recordAdminActivity } from '@/lib/admin-activity';
import { createAdminClient } from '@/lib/supabase';
import { hashAdminPassword, verifyAdminPasswordHash } from '@/lib/admin-passwords';

export const dynamic = 'force-dynamic';

const LOGIN_WINDOW_MS = 10 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 5;
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function getLoginKey(req: NextRequest, email: string) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || 'unknown';
  return `${ip}:${email}`;
}

function isRateLimited(key: string) {
  const now = Date.now();
  const current = loginAttempts.get(key);
  if (!current || current.resetAt <= now) {
    loginAttempts.set(key, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    return false;
  }

  current.count += 1;
  loginAttempts.set(key, current);
  return current.count > LOGIN_MAX_ATTEMPTS;
}

function clearLoginAttempts(key: string) {
  loginAttempts.delete(key);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({ password: '' }));
  const password = typeof body.password === 'string' ? body.password : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

  if (!email || !email.includes('@')) {
    return NextResponse.json({ ok: false, error: 'Valid user email is required.' }, { status: 400 });
  }

  const loginKey = getLoginKey(req, email);
  if (isRateLimited(loginKey)) {
    await recordAdminActivity({
      actorEmail: email,
      action: 'LOGIN_RATE_LIMITED',
      entityType: 'admin_session',
      summary: `Rate limited admin login for ${email}`,
      metadata: { windowMs: LOGIN_WINDOW_MS, maxAttempts: LOGIN_MAX_ATTEMPTS },
    });
    return NextResponse.json({ ok: false, error: 'Too many login attempts. Please try again later.' }, { status: 429 });
  }

  try {
    const supabase = createAdminClient();
    const { data: user, error } = await supabase
      .from('admin_users')
      .select('id, email, status, role, password_hash, password_salt, password_iterations')
      .eq('email', email)
      .single();

    if (error || !user || user.status !== 'ACTIVE') {
      await recordAdminActivity({
        actorEmail: email,
        action: 'LOGIN_FAILED',
        entityType: 'admin_session',
        summary: `Failed admin login for ${email}`,
        metadata: { reason: error ? 'user_not_found' : 'inactive_user' },
      });
      return NextResponse.json({ ok: false, error: 'Invalid or inactive admin user.' }, { status: 401 });
    }

    const passwordMatchesHash = await verifyAdminPasswordHash(
      password,
      user.password_hash,
      user.password_salt,
      user.password_iterations,
    );
    const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL || 'admin@durhaim.com';
    const canBootstrapPassword = !user.password_hash && user.role === 'OWNER' && user.email === bootstrapEmail;
    const passwordMatchesBootstrap = canBootstrapPassword && await verifyAdminPassword(password);

    if (!passwordMatchesHash && !passwordMatchesBootstrap) {
      await recordAdminActivity({
        actorEmail: email,
        action: 'LOGIN_FAILED',
        entityType: 'admin_session',
        summary: `Failed admin password check for ${email}`,
        metadata: { reason: 'invalid_password' },
      });
      return NextResponse.json({ ok: false, error: 'Invalid admin password.' }, { status: 401 });
    }

    if (passwordMatchesBootstrap) {
      const passwordHash = await hashAdminPassword(password);
      const { error: passwordHashError } = await supabase
        .from('admin_users')
        .update({
          ...passwordHash,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (passwordHashError) throw passwordHashError;
    }

    await supabase
      .from('admin_users')
      .update({ last_login_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', user.id);

    await recordAdminActivity({
      actorEmail: email,
      action: 'LOGIN_SUCCESS',
      entityType: 'admin_session',
      entityId: user.id,
      summary: `Admin signed in as ${email}`,
      metadata: { role: user.role },
    });
    clearLoginAttempts(loginKey);

    const res = NextResponse.json({ ok: true, user: { email: user.email, role: user.role } });
    res.cookies.set(ADMIN_SESSION_COOKIE, await createAdminSessionToken(email), getAdminCookieOptions());
    return res;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ ok: false, error: 'Unable to verify admin user.' }, { status: 500 });
  }
}
