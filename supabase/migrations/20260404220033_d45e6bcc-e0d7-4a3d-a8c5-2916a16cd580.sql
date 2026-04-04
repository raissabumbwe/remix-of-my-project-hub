
-- Books table
CREATE TABLE public.books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  cover_url TEXT,
  price TEXT NOT NULL DEFAULT '0$',
  category TEXT NOT NULL DEFAULT 'Général',
  rating NUMERIC(2,1) NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  file_url TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published books" ON public.books
  FOR SELECT USING (published = true);

CREATE POLICY "Admins can manage books" ON public.books
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Explorer items table
CREATE TABLE public.explorer_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Général',
  icon TEXT NOT NULL DEFAULT 'MapPin',
  content TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.explorer_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published explorer items" ON public.explorer_items
  FOR SELECT USING (published = true);

CREATE POLICY "Admins can manage explorer items" ON public.explorer_items
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Add update triggers
CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON public.books
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_explorer_items_updated_at
  BEFORE UPDATE ON public.explorer_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
