
-- Add rating, views, badge to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS rating numeric NOT NULL DEFAULT 4.5;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS rating_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS views integer NOT NULL DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS badge text DEFAULT NULL;

-- Activity log table
CREATE TABLE IF NOT EXISTS public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  details text NOT NULL,
  actor text NOT NULL DEFAULT 'النظام',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Activity log publicly readable" ON public.activity_log FOR SELECT USING (true);
CREATE POLICY "Activity log publicly insertable" ON public.activity_log FOR INSERT WITH CHECK (true);

-- Coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_percent integer NOT NULL DEFAULT 10,
  max_uses integer NOT NULL DEFAULT 100,
  used_count integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Coupons publicly readable" ON public.coupons FOR SELECT USING (true);
CREATE POLICY "Coupons publicly insertable" ON public.coupons FOR INSERT WITH CHECK (true);
CREATE POLICY "Coupons publicly updatable" ON public.coupons FOR UPDATE USING (true);
