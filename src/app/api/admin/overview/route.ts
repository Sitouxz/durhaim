import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { isMissingSchemaError } from '@/lib/catalogue-data';
import { requireAdminRole } from '@/lib/admin-permissions';

export const dynamic = 'force-dynamic';

async function countRows(
  supabase: ReturnType<typeof createAdminClient>,
  table: 'products' | 'serial_numbers',
  status?: string,
) {
  let query = supabase
    .from(table)
    .select('id', { count: 'exact', head: true });

  if (status) query = query.eq('status', status);

  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

async function sumVerificationCounts(supabase: ReturnType<typeof createAdminClient>) {
  let total = 0;
  let page = 0;
  const pageSize = 1000;

  while (true) {
    const from = page * pageSize;
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from('serial_numbers')
      .select('verification_count')
      .range(from, to);

    if (error) throw error;
    const rows = data ?? [];
    total += rows.reduce((sum, row) => sum + (Number(row.verification_count) || 0), 0);
    if (rows.length < pageSize) return total;
    page += 1;
  }
}

export async function GET() {
  try {
    const supabase = createAdminClient();
    const authorization = await requireAdminRole(supabase, ['OWNER', 'ADMIN', 'STAFF']);
    if (authorization.error) return authorization.error;

    const [
      totalProducts,
      totalSerials,
      unactivatedSerials,
      revokedSerials,
      verificationTotal,
      recentSerialsResult,
    ] = await Promise.all([
      countRows(supabase, 'products'),
      countRows(supabase, 'serial_numbers'),
      countRows(supabase, 'serial_numbers', 'INACTIVE'),
      countRows(supabase, 'serial_numbers', 'REVOKED'),
      sumVerificationCounts(supabase),
      supabase
        .from('serial_numbers')
        .select(`
          id,
          serial,
          status,
          verification_count,
          created_at,
          products ( name )
        `)
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    if (recentSerialsResult.error) throw recentSerialsResult.error;

    return NextResponse.json({
      totalProducts,
      totalSerials,
      unactivatedSerials,
      revokedSerials,
      verificationTotal,
      recentSerials: recentSerialsResult.data ?? [],
    });
  } catch (error) {
    console.error('Error fetching admin overview:', error);

    if (isMissingSchemaError(error)) {
      return NextResponse.json(
        { error: 'Database schema is not installed. Apply supabase/schema.sql.' },
        { status: 503 },
      );
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
