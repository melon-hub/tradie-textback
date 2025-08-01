-- Add user_type column to profiles table
ALTER TABLE public.profiles
ADD COLUMN user_type TEXT NOT NULL DEFAULT 'client';
