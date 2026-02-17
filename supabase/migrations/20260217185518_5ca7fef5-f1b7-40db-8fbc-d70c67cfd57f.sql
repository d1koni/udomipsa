
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('adopter', 'shelter');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  city TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'adopter',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create dogs table
CREATE TABLE public.dogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  breed TEXT NOT NULL DEFAULT 'Mešanac',
  age INT,
  size TEXT NOT NULL DEFAULT 'Srednji' CHECK (size IN ('Mali', 'Srednji', 'Veliki')),
  gender TEXT NOT NULL DEFAULT 'Muški' CHECK (gender IN ('Muški', 'Ženski')),
  location TEXT,
  description TEXT,
  health_status TEXT,
  is_vaccinated BOOLEAN DEFAULT false,
  is_sterilized BOOLEAN DEFAULT false,
  images TEXT[] DEFAULT '{}',
  shelter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dogs ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles policies
CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own role" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Dogs policies
CREATE POLICY "Anyone can view dogs" ON public.dogs FOR SELECT USING (true);
CREATE POLICY "Shelters can insert dogs" ON public.dogs FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'shelter') AND auth.uid() = shelter_id);
CREATE POLICY "Shelters can update own dogs" ON public.dogs FOR UPDATE USING (public.has_role(auth.uid(), 'shelter') AND auth.uid() = shelter_id);
CREATE POLICY "Shelters can delete own dogs" ON public.dogs FOR DELETE USING (public.has_role(auth.uid(), 'shelter') AND auth.uid() = shelter_id);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'adopter'));
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_dogs_updated_at BEFORE UPDATE ON public.dogs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Storage bucket for dog images
INSERT INTO storage.buckets (id, name, public) VALUES ('dog-images', 'dog-images', true);

CREATE POLICY "Anyone can view dog images" ON storage.objects FOR SELECT USING (bucket_id = 'dog-images');
CREATE POLICY "Shelters can upload dog images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'dog-images' AND auth.role() = 'authenticated');
CREATE POLICY "Shelters can delete own dog images" ON storage.objects FOR DELETE USING (bucket_id = 'dog-images' AND auth.uid()::text = (storage.foldername(name))[1]);
