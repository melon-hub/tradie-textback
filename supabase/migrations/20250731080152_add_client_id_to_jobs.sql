-- UP
ALTER TABLE public.jobs ADD COLUMN client_id UUID REFERENCES auth.users(id);

-- DOWN
ALTER TABLE public.jobs DROP COLUMN client_id;
