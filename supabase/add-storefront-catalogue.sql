-- DURHAIM Figma storefront catalogue extension.
-- Idempotent and non-destructive: existing products and serial relationships are retained.

CREATE TABLE IF NOT EXISTS public.product_series (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS series_id UUID REFERENCES public.product_series(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS colorway TEXT,
  ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS specifications JSONB NOT NULL DEFAULT '[]'::jsonb;

UPDATE public.products
SET specifications = '[]'::jsonb
WHERE specifications IS NULL OR jsonb_typeof(specifications) <> 'array';

ALTER TABLE public.products
  ALTER COLUMN specifications SET DEFAULT '[]'::jsonb,
  ALTER COLUMN specifications SET NOT NULL,
  ALTER COLUMN price DROP NOT NULL,
  ALTER COLUMN price DROP DEFAULT;

CREATE INDEX IF NOT EXISTS products_display_order_idx ON public.products (display_order, name);
CREATE INDEX IF NOT EXISTS products_series_id_idx ON public.products (series_id);
CREATE INDEX IF NOT EXISTS product_series_category_order_idx ON public.product_series (category_id, display_order, name);

ALTER TABLE public.product_series ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS public_read_product_series ON public.product_series;
CREATE POLICY public_read_product_series
  ON public.product_series
  FOR SELECT
  TO anon, authenticated
  USING (true);
