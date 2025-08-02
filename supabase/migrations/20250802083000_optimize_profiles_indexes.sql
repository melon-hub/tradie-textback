-- Optimize profiles table indexes for better query performance
-- This migration adds composite indexes to speed up common query patterns

-- Add composite index for user_id and is_admin for faster admin checks
CREATE INDEX IF NOT EXISTS idx_profiles_user_id_is_admin ON profiles(user_id, is_admin);

-- Add index to support RLS policies for user_type checks
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);

-- Add comment to explain the purpose of these indexes
COMMENT ON INDEX idx_profiles_user_id_is_admin IS 'Optimizes profile lookups by user_id with admin checks';
COMMENT ON INDEX idx_profiles_user_type IS 'Supports RLS policies that check user_type';
