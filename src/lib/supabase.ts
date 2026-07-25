import { createClient } from '@supabase/supabase-js';

// This client is constructed at import time, so a missing value fails the build
// during page-data collection with supabase-js's opaque "supabaseUrl is
// required". Naming the variable here is the difference between a two-minute
// fix and digging through a minified chunk.
// Read as literal `process.env.NEXT_PUBLIC_*` so Next.js still inlines them at
// build time; a dynamic lookup would leave them undefined in the browser bundle.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
}

if (!supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
}

// Public client (for browser/client-side use)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side admin client (service role — only used in API routes / server components)
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
