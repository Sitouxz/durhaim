import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { isMissingSchemaError } from '@/lib/catalogue-data';
import { recordAdminActivity } from '@/lib/admin-activity';
import { hashAdminPassword } from '@/lib/admin-passwords';
import { requireAdminRole } from '@/lib/admin-permissions';

export const dynamic = 'force-dynamic';

const USER_SELECT = 'id, full_name, email, role, status, notes, last_login_at, created_at, updated_at';
const roles = new Set(['OWNER', 'ADMIN', 'STAFF']);
const statuses = new Set(['ACTIVE', 'SUSPENDED']);

function isMissingUserSchemaError(error: unknown) {
  return Boolean(
    error
      && typeof error === 'object'
      && 'code' in error
      && (error.code === '42P01' || error.code === '42703' || isMissingSchemaError(error)),
  );
}

function parseUserBody(body: Record<string, unknown>) {
  const fullName = typeof body.full_name === 'string' ? body.full_name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const role = typeof body.role === 'string' ? body.role.trim().toUpperCase() : 'STAFF';
  const status = typeof body.status === 'string' ? body.status.trim().toUpperCase() : 'ACTIVE';
  const notes = typeof body.notes === 'string' ? body.notes.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!fullName || !email || !email.includes('@')) {
    return { error: 'Name and valid email are required.' };
  }

  if (!roles.has(role)) {
    return { error: 'Role must be OWNER, ADMIN, or STAFF.' };
  }

  if (!statuses.has(status)) {
    return { error: 'Status must be ACTIVE or SUSPENDED.' };
  }

  if (password && password.length < 12) {
    return { error: 'Password must be at least 12 characters.' };
  }

  return { fullName, email, role, status, notes, password };
}

async function requireUserManager(supabase: ReturnType<typeof createAdminClient>) {
  return requireAdminRole(supabase, ['OWNER', 'ADMIN']);
}

function requiresOwnerRole(targetRole: string, existingRole?: string) {
  return targetRole === 'OWNER' || existingRole === 'OWNER';
}

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('admin_users')
      .select(USER_SELECT)
      .order('created_at', { ascending: false });

    if (error) {
      if (isMissingUserSchemaError(error)) {
        return NextResponse.json(
          { error: 'User management schema is not installed. Run supabase/add-user-management.sql.' },
          { status: 503 },
        );
      }

      throw error;
    }

    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const authorization = await requireUserManager(supabase);
    if (authorization.error) return authorization.error;

    const body = await req.json().catch(() => ({}));
    const parsed = parseUserBody(body);

    if ('error' in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    if (parsed.role === 'OWNER' && authorization.currentUser.role !== 'OWNER') {
      return NextResponse.json({ error: 'Only owners can create owner users.' }, { status: 403 });
    }

    if (!parsed.password) {
      return NextResponse.json({ error: 'Password is required for new users.' }, { status: 400 });
    }

    const passwordHash = await hashAdminPassword(parsed.password);

    const { data, error } = await supabase
      .from('admin_users')
      .insert({
        full_name: parsed.fullName,
        email: parsed.email,
        role: parsed.role,
        status: parsed.status,
        notes: parsed.notes || null,
        ...passwordHash,
      })
      .select(USER_SELECT)
      .single();

    if (error) {
      if (isMissingUserSchemaError(error)) {
        return NextResponse.json(
          { error: 'User management schema is not installed. Run supabase/add-user-management.sql.' },
          { status: 503 },
        );
      }
      if (error.code === '23505') {
        return NextResponse.json({ error: 'A user with this email already exists.' }, { status: 409 });
      }
      throw error;
    }

    await recordAdminActivity({
      actorEmail: authorization.currentUser.email,
      action: 'USER_CREATED',
      entityType: 'admin_user',
      entityId: data.id,
      summary: `Created admin user ${data.email}`,
      metadata: { role: data.role, status: data.status },
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating admin user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const authorization = await requireUserManager(supabase);
    if (authorization.error) return authorization.error;

    const body = await req.json().catch(() => ({}));
    const userId = typeof body.id === 'string' ? body.id : '';

    if (!userId) {
      return NextResponse.json({ error: 'User id is required.' }, { status: 400 });
    }

    const parsed = parseUserBody(body);
    if ('error' in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { data: existingUser, error: existingError } = await supabase
      .from('admin_users')
      .select('id, email, role')
      .eq('id', userId)
      .single();

    if (existingError) {
      if (isMissingUserSchemaError(existingError)) {
        return NextResponse.json(
          { error: 'User management schema is not installed. Run supabase/add-user-management.sql.' },
          { status: 503 },
        );
      }
      throw existingError;
    }

    if (requiresOwnerRole(parsed.role, existingUser?.role) && authorization.currentUser.role !== 'OWNER') {
      return NextResponse.json({ error: 'Only owners can edit owner-level users.' }, { status: 403 });
    }

    const passwordHash = parsed.password ? await hashAdminPassword(parsed.password) : {};

    const { data, error } = await supabase
      .from('admin_users')
      .update({
        full_name: parsed.fullName,
        email: parsed.email,
        role: parsed.role,
        status: parsed.status,
        notes: parsed.notes || null,
        ...passwordHash,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select(USER_SELECT)
      .single();

    if (error) {
      if (isMissingUserSchemaError(error)) {
        return NextResponse.json(
          { error: 'User management schema is not installed. Run supabase/add-user-management.sql.' },
          { status: 503 },
        );
      }
      if (error.code === '23505') {
        return NextResponse.json({ error: 'A user with this email already exists.' }, { status: 409 });
      }
      throw error;
    }

    await recordAdminActivity({
      actorEmail: authorization.currentUser.email,
      action: 'USER_UPDATED',
      entityType: 'admin_user',
      entityId: data.id,
      summary: `Updated admin user ${data.email}`,
      metadata: { role: data.role, status: data.status },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating admin user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
