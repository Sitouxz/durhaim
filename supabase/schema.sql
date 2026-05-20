-- Supabase Schema for Durhaim

-- Categories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT
);

-- Products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  images TEXT[],
  specifications JSONB,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Serial Lists
CREATE TABLE public.serial_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  total_codes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Serial Numbers
CREATE TABLE public.serial_numbers (
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

-- Verification Logs
CREATE TABLE public.verification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  serial_id UUID REFERENCES public.serial_numbers(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Initial Mock Data

INSERT INTO public.categories (name, slug) VALUES 
('Vest & Chestrig', 'vest-chestrig'),
('Pack & Pouches', 'pack-pouches'),
('Belt', 'belt');

INSERT INTO public.products (name, slug, description, price, is_published) VALUES 
('TBP VEST MK-IV', 'tbp-vest-mk-iv', 'DURABILITY HARD IMPACT & MODULAR', 1850000, true),
('RECON DAYPACK 25L', 'recon-daypack-25l', 'PERFECT FOR CARRYING YOUR EQUIPMENT', 1250000, true),
('OPERATOR BELT GEN 2', 'operator-belt-gen-2', 'IT''S ALL ABOUT THE WAIST', 850000, true);

-- Add a test serial
-- Assuming you map the product UUIDs manually after or using subqueries:
INSERT INTO public.serial_numbers (serial, status) VALUES 
('DRH-TEST-260520-XXXX', 'ACTIVE');
