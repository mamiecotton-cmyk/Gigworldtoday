-- Migration: Add missing product columns expected by admin UI
-- Run this in the Supabase SQL editor (or your Postgres client).

-- 1) Add columns if they don't already exist
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS short_description text,
  ADD COLUMN IF NOT EXISTS long_description text,
  ADD COLUMN IF NOT EXISTS price text,
  ADD COLUMN IF NOT EXISTS image text,
  ADD COLUMN IF NOT EXISTS images text[],
  ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS external_link text;

-- 2) Optional: ensure RLS and policies allow the client to insert/update.
-- Recommended: require authenticated users and a server-side admin flow for
-- product management. For quick local/dev testing you can allow anon inserts
-- (NOT recommended for production).

-- Enable row-level security (only if you want RLS enabled)
-- ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Example policy to allow authenticated users to INSERT/UPDATE/DELETE
-- (uncomment and adapt to your auth setup):
-- CREATE POLICY "Authenticated modify products"
--   ON public.products
--   FOR ALL
--   TO authenticated
--   USING (auth.role() = 'authenticated')
--   WITH CHECK (auth.role() = 'authenticated');

-- Dev-only example: allow anon inserts (use only for local/dev)
-- CREATE POLICY "Allow anon inserts"
--   ON public.products
--   FOR INSERT
--   USING (true);

-- 3) Quick verification query to list columns after running migration
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_schema='public' AND table_name='products'
-- ORDER BY ordinal_position;
