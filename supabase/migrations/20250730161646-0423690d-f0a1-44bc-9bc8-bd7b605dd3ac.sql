-- Create jobs table to replace mock data
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  job_type TEXT NOT NULL,
  location TEXT NOT NULL,
  urgency TEXT NOT NULL CHECK (urgency IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'completed', 'cancelled')),
  estimated_value DECIMAL(10,2),
  description TEXT,
  preferred_time TEXT,
  last_contact TIMESTAMP WITH TIME ZONE,
  sms_blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create auth_sessions table for session management
CREATE TABLE public.auth_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create job_photos table for photo uploads
CREATE TABLE public.job_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  upload_status TEXT NOT NULL DEFAULT 'pending' CHECK (upload_status IN ('pending', 'uploaded', 'failed')),
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_photos ENABLE ROW LEVEL SECURITY;

-- Create policies for admin-only access (you as the only admin)
CREATE POLICY "Admin can manage all jobs" 
ON public.jobs 
FOR ALL 
USING (true);

CREATE POLICY "Admin can manage all sessions" 
ON public.auth_sessions 
FOR ALL 
USING (true);

CREATE POLICY "Admin can manage all photos" 
ON public.job_photos 
FOR ALL 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data to replace mock data
INSERT INTO public.jobs (customer_name, phone, job_type, location, urgency, status, estimated_value, description, preferred_time, last_contact) VALUES
('John Smith', '+61412345678', 'Leaking Tap', '123 Main St, Sydney', 'high', 'new', 150.00, 'Kitchen tap has been dripping for 3 days', 'Morning (8-12pm)', '2024-01-29 10:30:00+00'),
('Sarah Johnson', '+61423456789', 'Blocked Drain', '456 Oak Ave, Melbourne', 'urgent', 'in_progress', 250.00, 'Main drain completely blocked, water backing up', 'ASAP', '2024-01-29 14:15:00+00'),
('Mike Wilson', '+61434567890', 'Hot Water System', '789 Pine Rd, Brisbane', 'medium', 'new', 450.00, 'No hot water for 2 days', 'Afternoon (1-5pm)', '2024-01-28 16:45:00+00'),
('Emma Davis', '+61445678901', 'Toilet Repair', '321 Elm St, Perth', 'high', 'new', 180.00, 'Toilet not flushing properly', 'Evening (5-7pm)', '2024-01-29 09:20:00+00'),
('Tom Brown', '+61456789012', 'Pipe Replacement', '654 Maple Dr, Adelaide', 'low', 'completed', 800.00, 'Old pipes need replacing in bathroom', 'Any time', '2024-01-27 11:30:00+00');

-- Insert sample photos
INSERT INTO public.job_photos (job_id, photo_url, upload_status) 
SELECT id, 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop', 'uploaded'
FROM public.jobs 
LIMIT 3;