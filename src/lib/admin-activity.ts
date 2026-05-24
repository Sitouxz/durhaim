import { createAdminClient } from '@/lib/supabase';

type AdminActivityInput = {
  actorEmail?: string;
  action: string;
  entityType: string;
  entityId?: string;
  summary: string;
  metadata?: Record<string, unknown>;
};

export async function recordAdminActivity(input: AdminActivityInput) {
  try {
    const supabase = createAdminClient();
    await supabase.from('admin_activity_logs').insert({
      actor_email: input.actorEmail ?? 'admin@durhaim.com',
      action: input.action,
      entity_type: input.entityType,
      entity_id: input.entityId ?? null,
      summary: input.summary,
      metadata: input.metadata ?? {},
    });
  } catch (error) {
    console.error('Failed to record admin activity:', error);
  }
}
