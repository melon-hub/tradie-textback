-- Add address column to profiles table
ALTER TABLE public.profiles
ADD COLUMN address TEXT;

-- Add a constraint to ensure address is not empty if provided
ALTER TABLE public.profiles
ADD CONSTRAINT address_not_empty CHECK (address IS NULL OR LENGTH(address) > 0);
