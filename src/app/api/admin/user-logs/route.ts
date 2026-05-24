import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { isMissingSchemaError } from '@/lib/catalogue-data';
import { requireAdminRole } from '@/lib/admin-permissions';

export const dynamic = 'force-dynamic';

function isMissingUserLogSchemaError(error: unknown) {
  return Boolean(
    error
      && typeof error === 'object'
      && 'code' in error
      && (error.code === '42P01' || error.code === '42703' || isMissingSchemaError(error)),
  );
}

export async function GET() {
  try {
    const supabase = createAdminClient();
    const authorization = await requireAdminRole(supabase, ['OWNER', 'ADMIN']);
    if (authorization.error) return authorization.error;

    const { data, error } = await supabase
      .from('admin_activity_logs')
      .select('id, actor_email, action, entity_type, entity_id, summary, metadata, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      if (isMissingUserLogSchemaError(error)) {
        return NextResponse.json(
          { error: 'User log schema is not installed. Run supabase/add-user-management.sql.' },
          { status: 503 },
        );
      }

      throw error;
    }

    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error('Error fetching admin activity logs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
