export const ADMIN_SESSION_COOKIE = 'durhaim_admin_session';

const encoder = new TextEncoder();

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || 'durhaim-admin-2026';
}

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'durhaim-local-session-secret';
}

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function createAdminSessionToken() {
  return sha256Hex(`${getAdminPassword()}:${getSessionSecret()}`);
}

export async function verifyAdminPassword(password: string) {
  return password === getAdminPassword();
}

export async function verifyAdminSessionToken(token?: string | null) {
  if (!token) return false;
  return token === await createAdminSessionToken();
}

export function getAdminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8,
  };
}
