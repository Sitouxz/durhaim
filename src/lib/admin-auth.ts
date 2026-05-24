export const ADMIN_SESSION_COOKIE = 'durhaim_admin_session';

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const SESSION_VERSION = 'v1';

export type ActiveAdminSessionUser = {
  id: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'STAFF';
  status: 'ACTIVE' | 'SUSPENDED';
};

function getAdminPassword() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error('ADMIN_PASSWORD is not set');
  }
  return password;
}

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    throw new Error('ADMIN_SESSION_SECRET or SUPABASE_SERVICE_ROLE_KEY is not set');
  }
  return secret;
}

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function encodeSessionEmail(email: string) {
  const bytes = encoder.encode(email.trim().toLowerCase());
  let value = '';
  for (let index = 0; index < bytes.length; index += 1) {
    value += String.fromCharCode(bytes[index]);
  }
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function decodeSessionEmail(value: string) {
  try {
    const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
    const binary = atob(padded);
    return decoder.decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)));
  } catch {
    return '';
  }
}

async function signSessionEmail(email: string) {
  return sha256Hex(`${SESSION_VERSION}:${email}:${getAdminPassword()}:${getSessionSecret()}`);
}

export async function createAdminSessionToken(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  return `${SESSION_VERSION}.${encodeSessionEmail(normalizedEmail)}.${await signSessionEmail(normalizedEmail)}`;
}

export async function verifyAdminPassword(password: string) {
  return password === getAdminPassword();
}

export async function verifyAdminSessionToken(token?: string | null) {
  return Boolean(await getActiveAdminSessionUser(token));
}

export async function getAdminSessionUser(token?: string | null) {
  if (!token) return null;
  const [version, encodedEmail, signature] = token.split('.');
  if (version !== SESSION_VERSION || !encodedEmail || !signature) return null;

  const email = decodeSessionEmail(encodedEmail);
  if (!email || signature !== await signSessionEmail(email)) return null;

  return { email };
}

export async function getActiveAdminSessionUser(token?: string | null): Promise<ActiveAdminSessionUser | null> {
  const sessionUser = await getAdminSessionUser(token);
  if (!sessionUser) return null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return null;

  const response = await fetch(
    `${supabaseUrl}/rest/v1/admin_users?email=eq.${encodeURIComponent(sessionUser.email)}&select=id,email,role,status&limit=1`,
    {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      cache: 'no-store',
    },
  ).catch(() => null);

  if (!response?.ok) return null;

  const users = await response.json().catch(() => []) as ActiveAdminSessionUser[];
  const user = users[0];
  return user?.status === 'ACTIVE' ? user : null;
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
