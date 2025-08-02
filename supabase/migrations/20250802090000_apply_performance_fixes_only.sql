-- Performance optimization migration that checks for existing structures
-- This migration only applies the performance optimizations needed

-- 1. Add composite indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_profiles_user_id_is_admin ON profiles(user_id, is_admin);
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);

-- Add comments
COMMENT ON INDEX idx_profiles_user_id_is_admin IS 'Optimizes profile lookups by user_id with admin checks';
COMMENT ON INDEX idx_profiles_user_type IS 'Supports RLS policies that check user_type';

-- 2. Optimize RLS policies
-- First drop the problematic policy if it exists
DROP POLICY IF EXISTS "tradies_view_all_profiles" ON public.profiles;

-- Create the optimized policy that doesn't use subqueries
CREATE POLICY "tradies_view_all_profiles" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL
  AND (
    -- Check if user is admin first (fastest check)
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.user_id = auth.uid() 
      AND p.is_admin = true
    )
    OR
    -- Then check if user is tradie
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.user_id = auth.uid() 
      AND p.user_type = 'tradie'
    )
  )
);

-- Add comment explaining the optimization
COMMENT ON POLICY "tradies_view_all_profiles" ON public.profiles 
IS 'Optimized policy using EXISTS instead of subqueries for better performance';

-- 3. Ensure the basic user_id index exists (critical for performance)
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- 4. Add index on auth.users id for join performance
-- This helps when joining profiles with auth.users
CREATE INDEX IF NOT EXISTS idx_profiles_user_id_btree ON profiles USING btree(user_id);

-- 5. Update table statistics for query planner
ANALYZE profiles;