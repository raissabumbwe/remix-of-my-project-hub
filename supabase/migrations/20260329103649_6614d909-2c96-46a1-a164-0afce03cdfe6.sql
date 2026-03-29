
INSERT INTO public.profiles (id, full_name, is_online)
SELECT id, COALESCE(raw_user_meta_data->>'full_name', email), false
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;
