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
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'USED', 'REVOKED')),
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
    ARRAY['https://lh3.googleusercontent.com/aida/ADBb0uhHmarY6x8tQQajILZYGhdMrE_-8N5sRpGivbjfVr7JV1GKgh1VPOJ5UwwZq8boGUAATN8Qo2TJt70_N3aFkd0KyOTZdkRBzyUxSj2dm9l1ZquJ2XLAk_BfM1vXPEdXbeOy3ZRiMPtCuihStQPqlz-Ljk89EELaFmWl1P5VsCg2rZ5Tgknyxr3uqk4ZdS-STDpVubokBOe0xfV1lk0DyQ6J3FtvcnBqUk1-fyua1f5e22SHPkccNAigEb-M'],
    true
  ),
  (
    'RECON DAYPACK 25L',
    'recon-daypack-25l',
    'PERFECT FOR CARRYING YOUR EQUIPMENT',
    1250000,
    (SELECT id FROM public.categories WHERE slug = 'pack'),
    ARRAY['https://lh3.googleusercontent.com/aida/ADBb0uiJ-0dldTUMcqTvYSs4D2qAbjpDJQUr1-nPktRvlp2KIzJkPY6OUjsjU7jtBcOMDLls2lxCoX8DdrqcJOVZ-SaP5Yxj2W0LZo3R0Wf03VwUSnWBlUfRTBOsMQdAPm4DdS9G-QksTMT-qMn50Zo5D7WaKpB7okI3X0r5vkblC2RlaxER_YVu-AoV7tJpTOL7d59f_eqEQyNdrY6eLdJvUDITW3mYc-iOy0r_MDFWHF8x3Ayuz_EkEfG5Kso'],
    true
  ),
  (
    'OPERATOR BELT GEN 2',
    'operator-belt-gen-2',
    'IT''S ALL ABOUT THE WAIST',
    850000,
    (SELECT id FROM public.categories WHERE slug = 'belt'),
    ARRAY['https://lh3.googleusercontent.com/aida/ADBb0uiGfLUwNlkyOM4_t7brXJ7tRUTTlJpCltHvq0-kb43jSMjb2P8nA8rI7yeAqXqA1l0A2NKuMA_g7ZGZRMZsdoWwXws8auj2Vx9W47RF88WNrVdVck5TfFTMrdA2Csu_6-Gp5nlSPZeUk1h0OJ00Hxh9T-PStsy_SHG4JWoqe_Q34Xg3EA0-40b71L7fOfkBfgaDUrLeKyBWIaSyBkBRKMUIbXiIBHGz_dHG7Hy2SzHjGsBxZ-PrtvxTLSPn'],
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
