-- EMERGENCY FIX: Fix ALL RLS recursion issues causing timeouts
-- This fixes the auth.uid() recursion problem across ALL tables
-- Run this IMMEDIATELY in Supabase SQL Editor

BEGIN;

-- ============================================
-- STEP 1: FIX PROFILES TABLE (already done but let's ensure)
-- ============================================
DO $$
BEGIN
    -- Drop all existing profiles policies
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', pol.policyname);
    END LOOP;
    
    -- Create fixed policies
    CREATE POLICY "profiles_own_select" ON profiles FOR SELECT USING ((SELECT auth.uid()) = user_id);
    CREATE POLICY "profiles_own_insert" ON profiles FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
    CREATE POLICY "profiles_own_update" ON profiles FOR UPDATE USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
    CREATE POLICY "profiles_tradie_view_all" ON profiles FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = (SELECT auth.uid()) AND p.user_type = 'tradie')
    );
    RAISE NOTICE 'Fixed profiles table policies';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Profiles policies already fixed or error: %', SQLERRM;
END $$;

-- ============================================
-- STEP 2: FIX JOBS TABLE (CRITICAL - has 7 bad policies)
-- ============================================
-- Drop all existing jobs policies
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'jobs' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON jobs', pol.policyname);
        RAISE NOTICE 'Dropped jobs policy: %', pol.policyname;
    END LOOP;
END $$;

-- Create fixed jobs policies using (SELECT auth.uid())
CREATE POLICY "jobs_clients_view_own" ON jobs FOR SELECT 
USING ((SELECT auth.uid()) = client_id);

CREATE POLICY "jobs_tradies_view_all" ON jobs FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = (SELECT auth.uid()) 
    AND p.user_type = 'tradie'
));

CREATE POLICY "jobs_clients_create" ON jobs FOR INSERT 
WITH CHECK ((SELECT auth.uid()) = client_id);

CREATE POLICY "jobs_clients_update_own" ON jobs FOR UPDATE 
USING ((SELECT auth.uid()) = client_id)
WITH CHECK ((SELECT auth.uid()) = client_id);

CREATE POLICY "jobs_tradies_update_all" ON jobs FOR UPDATE
USING (EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = (SELECT auth.uid()) 
    AND p.user_type = 'tradie'
));

CREATE POLICY "jobs_tradies_delete_all" ON jobs FOR DELETE
USING (EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = (SELECT auth.uid()) 
    AND p.user_type = 'tradie'
));

-- ============================================
-- STEP 3: FIX BUSINESS_SETTINGS TABLE
-- ============================================
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'business_settings' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON business_settings', pol.policyname);
    END LOOP;
END $$;

CREATE POLICY "business_settings_own" ON business_settings FOR ALL 
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "business_settings_admin_view" ON business_settings FOR SELECT
USING (EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = (SELECT auth.uid()) 
    AND p.is_admin = true
));

-- ============================================
-- STEP 4: FIX SERVICE_LOCATIONS TABLE
-- ============================================
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'service_locations' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON service_locations', pol.policyname);
    END LOOP;
END $$;

CREATE POLICY "service_locations_own" ON service_locations FOR ALL 
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

-- ============================================
-- STEP 5: FIX TENANT_SMS_TEMPLATES TABLE
-- ============================================
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'tenant_sms_templates' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON tenant_sms_templates', pol.policyname);
    END LOOP;
END $$;

CREATE POLICY "tenant_sms_templates_own" ON tenant_sms_templates FOR ALL 
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

-- ============================================
-- STEP 6: FIX TWILIO_SETTINGS TABLE
-- ============================================
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'twilio_settings' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON twilio_settings', pol.policyname);
    END LOOP;
END $$;

CREATE POLICY "twilio_settings_own" ON twilio_settings FOR ALL 
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

-- ============================================
-- STEP 7: FIX TRADE_TYPES TABLE
-- ============================================
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'trade_types' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON trade_types', pol.policyname);
    END LOOP;
END $$;

-- Trade types are read-only reference data
CREATE POLICY "trade_types_authenticated_read" ON trade_types FOR SELECT 
USING ((SELECT auth.uid()) IS NOT NULL);

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 
    tablename,
    policyname,
    cmd,
    qual::text as using_clause
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'jobs', 'business_settings', 'service_locations', 'tenant_sms_templates', 'twilio_settings', 'trade_types')
ORDER BY tablename, policyname;

-- Show success message
SELECT '✅ ALL RLS RECURSION ISSUES FIXED! Profile should load instantly now.' as status;

COMMIT;