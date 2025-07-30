-- Create storage bucket for job photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'job-photos', 
  'job-photos', 
  true, 
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- Create storage policies for job photos
CREATE POLICY "Anyone can view job photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'job-photos');

CREATE POLICY "Anyone can upload job photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'job-photos');

CREATE POLICY "Anyone can update job photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'job-photos');

CREATE POLICY "Anyone can delete job photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'job-photos');

-- Update job_photos table to track storage paths and upload metadata
ALTER TABLE public.job_photos 
ADD COLUMN IF NOT EXISTS storage_path TEXT,
ADD COLUMN IF NOT EXISTS file_name TEXT,
ADD COLUMN IF NOT EXISTS file_size INTEGER,
ADD COLUMN IF NOT EXISTS mime_type TEXT,
ADD COLUMN IF NOT EXISTS uploaded_by TEXT;