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

UPDATE public.serial_numbers SET status = 'ACTIVE' WHERE status = 'USED';

ALTER TABLE public.serial_numbers
  ALTER COLUMN status SET DEFAULT 'INACTIVE';

ALTER TABLE public.serial_numbers
  DROP CONSTRAINT IF EXISTS serial_numbers_status_check;

ALTER TABLE public.serial_numbers
  ADD CONSTRAINT serial_numbers_status_check CHECK (status IN ('INACTIVE', 'ACTIVE', 'REVOKED'));

INSERT INTO public.categories (name, slug) VALUES
  ('Vest & Chestrig', 'vest'),
  ('Pack & Pouches', 'pack'),
  ('Belt', 'belt'),
  ('Accessories', 'accessories')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO public.products (name, slug, description, price, category_id, images, is_published)
VALUES
  (
    'TBP VEST MK-IV',
    'tbp-vest-mk-iv',
    'DURABILITY HARD IMPACT & MODULAR',
    1850000,
    (SELECT id FROM public.categories WHERE slug = 'vest'),
    ARRAY['/images/29_VC-1.png'],
    true
  ),
  (
    'RECON DAYPACK 25L',
    'recon-daypack-25l',
    'PERFECT FOR CARRYING YOUR EQUIPMENT',
    1250000,
    (SELECT id FROM public.categories WHERE slug = 'pack'),
    ARRAY['/images/31_PP-1.png'],
    true
  ),
  (
    'OPERATOR BELT GEN 2',
    'operator-belt-gen-2',
    'IT''S ALL ABOUT THE WAIST',
    850000,
    (SELECT id FROM public.categories WHERE slug = 'belt'),
    ARRAY['/images/33_B-1.png'],
    true
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
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
