-- Supabase Schema for Durhaim
-- Safe to run more than once.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT
);

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  regional_prices JSONB NOT NULL DEFAULT '{}'::jsonb,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  images TEXT[] DEFAULT '{}',
  specifications JSONB DEFAULT '{}'::jsonb,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.serial_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  total_codes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.serial_numbers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  serial TEXT UNIQUE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  list_id UUID REFERENCES public.serial_lists(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'INACTIVE' CHECK (status IN ('INACTIVE', 'ACTIVE', 'REVOKED')),
  link TEXT,
  ordered BOOLEAN DEFAULT false,
  svp TEXT,
  warranty_expires_at TIMESTAMP WITH TIME ZONE,
  verification_count INTEGER DEFAULT 0,
  wp_imported BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.verification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  serial_id UUID REFERENCES public.serial_numbers(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

UPDATE public.serial_numbers SET status = 'ACTIVE' WHERE status = 'USED';

ALTER TABLE public.serial_numbers
  ALTER COLUMN status SET DEFAULT 'INACTIVE';

ALTER TABLE public.serial_numbers
  DROP CONSTRAINT IF EXISTS serial_numbers_status_check;

ALTER TABLE public.serial_numbers
  ADD CONSTRAINT serial_numbers_status_check CHECK (status IN ('INACTIVE', 'ACTIVE', 'REVOKED'));

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS regional_prices JSONB NOT NULL DEFAULT '{}'::jsonb;

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

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.serial_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.serial_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS public_read_categories ON public.categories;
CREATE POLICY public_read_categories
  ON public.categories
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS public_read_published_products ON public.products;
CREATE POLICY public_read_published_products
  ON public.products
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

DROP POLICY IF EXISTS public_read_verifiable_serials ON public.serial_numbers;
CREATE POLICY public_read_verifiable_serials
  ON public.serial_numbers
  FOR SELECT
  TO anon, authenticated
  USING (status IN ('ACTIVE', 'REVOKED'));

DROP POLICY IF EXISTS public_insert_newsletter_subscribers ON public.newsletter_subscribers;
CREATE POLICY public_insert_newsletter_subscribers
  ON public.newsletter_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$');

CREATE OR REPLACE FUNCTION public.record_serial_verification(
  p_serial TEXT,
  p_ip_address TEXT,
  p_user_agent TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  serial_row public.serial_numbers%ROWTYPE;
  next_count INTEGER;
BEGIN
  SELECT *
  INTO serial_row
  FROM public.serial_numbers
  WHERE serial = UPPER(TRIM(p_serial))
    AND status = 'ACTIVE'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  UPDATE public.serial_numbers
  SET verification_count = COALESCE(verification_count, 0) + 1
  WHERE id = serial_row.id
  RETURNING verification_count INTO next_count;

  INSERT INTO public.verification_logs (serial_id, ip_address, user_agent)
  VALUES (
    serial_row.id,
    LEFT(COALESCE(p_ip_address, 'unknown'), 256),
    LEFT(COALESCE(p_user_agent, ''), 512)
  );

  RETURN next_count;
END;
$$;

REVOKE ALL ON FUNCTION public.record_serial_verification(TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_serial_verification(TEXT, TEXT, TEXT) TO anon, authenticated;

INSERT INTO public.categories (name, slug) VALUES
  ('Vest & Chestrig', 'vest'),
  ('Pack & Pouches', 'pack'),
  ('Belt', 'belt'),
  ('Accessories', 'accessories')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO public.products (name, slug, description, price, regional_prices, category_id, images, is_published)
VALUES
  (
    'TBP VEST MK-IV',
    'tbp-vest-mk-iv',
    'DURABILITY HARD IMPACT & MODULAR',
    1850000,
    '{"ID":1850000,"GLOBAL":139}'::jsonb,
    (SELECT id FROM public.categories WHERE slug = 'vest'),
    ARRAY['/images/29_VC-1.png'],
    true
  ),
  (
    'RECON DAYPACK 25L',
    'recon-daypack-25l',
    'PERFECT FOR CARRYING YOUR EQUIPMENT',
    1250000,
    '{"ID":1250000,"GLOBAL":94}'::jsonb,
    (SELECT id FROM public.categories WHERE slug = 'pack'),
    ARRAY['/images/31_PP-1.png'],
    true
  ),
  (
    'OPERATOR BELT GEN 2',
    'operator-belt-gen-2',
    'IT''S ALL ABOUT THE WAIST',
    850000,
    '{"ID":850000,"GLOBAL":64}'::jsonb,
    (SELECT id FROM public.categories WHERE slug = 'belt'),
    ARRAY['/images/33_B-1.png'],
    true
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  regional_prices = EXCLUDED.regional_prices,
  category_id = EXCLUDED.category_id,
  images = EXCLUDED.images,
  is_published = EXCLUDED.is_published,
  updated_at = NOW();

INSERT INTO public.serial_numbers (serial, product_id, status)
VALUES (
  'DRH-TEST-260520-XXXX',
  (SELECT id FROM public.products WHERE slug = 'tbp-vest-mk-iv'),
  'ACTIVE'
)
ON CONFLICT (serial) DO UPDATE SET
  product_id = EXCLUDED.product_id,
  status = EXCLUDED.status;

INSERT INTO public.site_settings (key, value)
VALUES
  ('public_domain', 'durhaim.com'),
  ('whatsapp_contact', '+62 821-2010-1473'),
  ('support_email', 'durhaimgear@gmail.com'),
  ('location', 'Komp. Mitra Dago Parahyangan Jl. Anyelir No. C8 Bandung')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();

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
