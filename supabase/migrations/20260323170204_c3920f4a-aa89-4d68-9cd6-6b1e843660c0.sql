
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles" ON public.user_roles
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Articles table
CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  category TEXT NOT NULL,
  author TEXT NOT NULL,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published articles" ON public.articles
FOR SELECT USING (published = true);

CREATE POLICY "Admins can manage articles" ON public.articles
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- TV channels table
CREATE TABLE public.tv_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  stream_url TEXT,
  logo_url TEXT,
  is_live BOOLEAN NOT NULL DEFAULT false,
  schedule JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tv_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view channels" ON public.tv_channels
FOR SELECT USING (true);

CREATE POLICY "Admins can manage channels" ON public.tv_channels
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Radio stations table
CREATE TABLE public.radio_stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  stream_url TEXT,
  logo_url TEXT,
  is_live BOOLEAN NOT NULL DEFAULT false,
  current_show TEXT,
  current_host TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.radio_stations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view stations" ON public.radio_stations
FOR SELECT USING (true);

CREATE POLICY "Admins can manage stations" ON public.radio_stations
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Updated at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_articles_updated_at
BEFORE UPDATE ON public.articles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tv_channels_updated_at
BEFORE UPDATE ON public.tv_channels
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_radio_stations_updated_at
BEFORE UPDATE ON public.radio_stations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
