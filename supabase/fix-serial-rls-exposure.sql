-- Close public read access to serial_numbers.
-- Safe to run more than once.
--
-- PROBLEM
-- The `public_read_verifiable_serials` policy granted SELECT on serial_numbers
-- to the `anon` role for every row where status != 'REVOKED'. Because
-- NEXT_PUBLIC_SUPABASE_ANON_KEY ships in the browser bundle, anyone could call
-- PostgREST directly and enumerate the entire authenticity registry
-- (40,338 active serials), then print matching counterfeit QR labels.
--
-- FIX
-- Drop the table-level policy. Public verification already goes through the
-- SECURITY DEFINER function `record_serial_verification`, which is constrained
-- to a single serial per call. That function now also returns the certificate
-- payload the public pages need, so the anon role never requires direct table
-- access — and public verification still does not touch the service-role key.

DROP POLICY IF EXISTS public_read_verifiable_serials ON public.serial_numbers;

-- Return type changes from INTEGER to JSONB, so the old signature must go first.
DROP FUNCTION IF EXISTS public.record_serial_verification(TEXT, TEXT, TEXT);

-- p_count => false looks the certificate up without incrementing or logging.
-- The public pages use it when their per-IP rate limit is already tripped, so a
-- rate-limited visitor still sees an accurate certificate instead of a
-- misleading "not registered" result.
CREATE FUNCTION public.record_serial_verification(
  p_serial TEXT,
  p_ip_address TEXT,
  p_user_agent TEXT,
  p_count BOOLEAN DEFAULT TRUE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  serial_row public.serial_numbers%ROWTYPE;
  product_row public.products%ROWTYPE;
  next_count INTEGER;
BEGIN
  SELECT *
  INTO serial_row
  FROM public.serial_numbers
  WHERE serial = UPPER(TRIM(p_serial))
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('found', false);
  END IF;

  SELECT *
  INTO product_row
  FROM public.products
  WHERE id = serial_row.product_id;

  -- A revoked certificate is reported as revoked, but is not counted or logged
  -- as a verification.
  IF serial_row.status = 'REVOKED' OR NOT p_count THEN
    next_count := COALESCE(serial_row.verification_count, 0);
  ELSE
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
  END IF;

  RETURN jsonb_build_object(
    'found', true,
    'serial', serial_row.serial,
    'status', serial_row.status,
    'verification_count', next_count,
    'created_at', serial_row.created_at,
    'product_name', product_row.name,
    'product_image', CASE
      WHEN product_row.images IS NULL OR array_length(product_row.images, 1) IS NULL THEN NULL
      ELSE product_row.images[1]
    END
  );
END;
$$;

-- Only the constrained function is reachable from the public anon key. There is
-- deliberately no table-level grant: the function returns one serial per call
-- and cannot be used to enumerate the registry.
REVOKE ALL ON FUNCTION public.record_serial_verification(TEXT, TEXT, TEXT, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_serial_verification(TEXT, TEXT, TEXT, BOOLEAN) TO anon, authenticated;
