-- Optimize profiles RLS policies for better performance
-- This migration improves the RLS policies to avoid subqueries that cause performance issues

-- Drop the existing policy that uses a subquery
DROP POLICY IF EXISTS "tradies_view_all_profiles" ON public.profiles;

-- Create a more efficient policy using auth.jwt() to check user type
-- This avoids the need for a subquery to the same table
CREATE POLICY "tradies_view_all_profiles" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL
  AND auth.jwt() ->> 'user_type' = 'tradie'
);

-- Add a comment to explain the optimization
COMMENT ON POLICY "tradies_view_all_profiles" ON public.profiles 
IS 'Optimized policy that avoids subquery to same table, uses JWT claim instead';
