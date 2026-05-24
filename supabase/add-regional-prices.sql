ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS regional_prices JSONB NOT NULL DEFAULT '{}'::jsonb;

UPDATE public.products
SET regional_prices = jsonb_build_object(
  'ID', price,
  'GLOBAL', GREATEST(1, ROUND(price * 0.000075))
)
WHERE regional_prices = '{}'::jsonb;
