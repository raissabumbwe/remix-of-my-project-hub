ALTER TABLE public.article_comments
DROP CONSTRAINT article_comments_user_id_fkey;

ALTER TABLE public.article_comments
ADD CONSTRAINT article_comments_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;