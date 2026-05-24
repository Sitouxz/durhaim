import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ADMIN_SESSION_COOKIE, getAdminSessionUser } from '@/lib/admin-auth';

export type AdminRole = 'OWNER' | 'ADMIN' | 'STAFF';
export type AdminStatus = 'ACTIVE' | 'SUSPENDED';

export type CurrentAdminUser = {
  id: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
};

export async function getCurrentAdminUser(supabase: SupabaseClient): Promise<CurrentAdminUser | null> {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  const sessionUser = await getAdminSessionUser(token);
  if (!sessionUser) return null;

  const { data, error } = await supabase
    .from('admin_users')
    .select('id, email, role, status')
    .eq('email', sessionUser.email)
    .single();

  if (error || !data || data.status !== 'ACTIVE') return null;
  return data as CurrentAdminUser;
}

export async function requireAdminRole(supabase: SupabaseClient, allowedRoles: AdminRole[]) {
  const currentUser = await getCurrentAdminUser(supabase);
  if (!currentUser) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      currentUser: null,
    };
  }

  if (!allowedRoles.includes(currentUser.role)) {
    return {
      error: NextResponse.json({ error: 'Insufficient admin permissions.' }, { status: 403 }),
      currentUser,
    };
  }

  return { error: null, currentUser };
}
