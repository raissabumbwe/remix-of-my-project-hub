
CREATE TABLE IF NOT EXISTS public.live_streams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'Live',
  facebook_url text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active streams" ON public.live_streams
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage streams" ON public.live_streams
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));
