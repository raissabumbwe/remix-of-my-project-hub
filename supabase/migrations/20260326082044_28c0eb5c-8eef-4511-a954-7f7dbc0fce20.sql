
CREATE TABLE public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe" ON public.push_subscriptions
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Anyone can unsubscribe" ON public.push_subscriptions
  FOR DELETE TO public USING (true);

CREATE POLICY "Admins can read subscriptions" ON public.push_subscriptions
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
