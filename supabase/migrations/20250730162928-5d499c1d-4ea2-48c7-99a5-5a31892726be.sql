-- Create profiles table for tradie authentication
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT,
  name TEXT,
  role TEXT DEFAULT 'tradie',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create job_links table for secure, expiring job access
CREATE TABLE public.job_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_for_phone TEXT,
  accessed_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on job_links
ALTER TABLE public.job_links ENABLE ROW LEVEL SECURITY;

-- Create policies for job_links (public access via token)
CREATE POLICY "Anyone can access job links with valid token" 
ON public.job_links 
FOR SELECT 
USING (expires_at > now());

CREATE POLICY "Admin can manage job links" 
ON public.job_links 
FOR ALL 
USING (true);

-- Function to create profile automatically when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, phone, name)
  VALUES (
    NEW.id,
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email, 'Tradie')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to generate secure job link
CREATE OR REPLACE FUNCTION public.create_job_link(
  p_job_id UUID,
  p_phone TEXT DEFAULT NULL,
  p_expires_hours INTEGER DEFAULT 720 -- 30 days default
)
RETURNS TEXT AS $$
DECLARE
  v_token TEXT;
BEGIN
  -- Generate secure random token
  v_token := encode(gen_random_bytes(32), 'base64url');
  
  -- Insert job link record
  INSERT INTO public.job_links (job_id, token, expires_at, created_for_phone)
  VALUES (
    p_job_id,
    v_token,
    now() + (p_expires_hours || ' hours')::INTERVAL,
    p_phone
  );
  
  RETURN v_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;