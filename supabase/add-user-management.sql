CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'STAFF',
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  password_hash TEXT,
  password_salt TEXT,
  password_iterations INTEGER,
  password_updated_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_email TEXT NOT NULL DEFAULT 'system',
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  summary TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.admin_users
  DROP CONSTRAINT IF EXISTS admin_user_role_check;

ALTER TABLE public.admin_users
  ADD CONSTRAINT admin_user_role_check CHECK (role IN ('OWNER', 'ADMIN', 'STAFF'));

ALTER TABLE public.admin_users
  DROP CONSTRAINT IF EXISTS admin_user_status_check;

ALTER TABLE public.admin_users
  ADD CONSTRAINT admin_user_status_check CHECK (status IN ('ACTIVE', 'SUSPENDED'));

ALTER TABLE public.admin_users
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS password_salt TEXT,
  ADD COLUMN IF NOT EXISTS password_iterations INTEGER,
  ADD COLUMN IF NOT EXISTS password_updated_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

INSERT INTO public.admin_users (full_name, email, role, status, notes)
VALUES (
  'Durhaim Admin',
  'admin@durhaim.com',
  'OWNER',
  'ACTIVE',
  'Default command center owner record.'
)
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  updated_at = NOW();
