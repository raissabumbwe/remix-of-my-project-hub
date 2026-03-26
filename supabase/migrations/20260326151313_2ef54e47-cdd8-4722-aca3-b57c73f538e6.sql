
-- Create storage bucket for article media
INSERT INTO storage.buckets (id, name, public) VALUES ('article-media', 'article-media', true);

-- Allow anyone to view files (public bucket)
CREATE POLICY "Public read access" ON storage.objects FOR SELECT TO public USING (bucket_id = 'article-media');

-- Allow authenticated admins to upload
CREATE POLICY "Admins can upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'article-media' AND public.has_role(auth.uid(), 'admin'::public.app_role));

-- Allow authenticated admins to delete
CREATE POLICY "Admins can delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'article-media' AND public.has_role(auth.uid(), 'admin'::public.app_role));
