#!/usr/bin/env node

/**
 * Verification script for Supabase multi-tenant setup
 * Run this to check if your Supabase instance is properly configured
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();
dotenv.config({ path: '.env.local' });

const PROJECT_ID = process.env.VITE_SUPABASE_PROJECT_ID || process.env.SUPABASE_PROJECT_ID;
const SUPABASE_URL = PROJECT_ID ? `https://${PROJECT_ID}.supabase.co` : process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_API_KEY || process.env.SUPABASE_API_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing environment variables. Please set:');
  console.error('   - VITE_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function verifySetup() {
  console.log('🔍 Verifying Supabase Setup...\n');

  // 1. Check if client_id column exists
  console.log('1️⃣ Checking client_id column...');
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('client_id')
      .limit(1);
    
    if (error && error.message.includes('column "client_id" does not exist')) {
      console.log('❌ client_id column is missing');
      console.log('   Run: supabase db push');
    } else {
      console.log('✅ client_id column exists');
    }
  } catch (e) {
    console.error('❌ Error checking client_id:', e.message);
  }

  // 2. Check RLS policies
  console.log('\n2️⃣ Checking RLS policies...');
  try {
    const { data: policies } = await supabase.rpc('get_policies_for_table', {
      table_name: 'jobs'
    }).catch(() => ({ data: null }));

    if (!policies) {
      // Fallback: Try direct query
      const { data, error } = await supabase
        .from('pg_policies')
        .select('policyname')
        .eq('tablename', 'jobs');
      
      if (data && data.length > 0) {
        console.log(`✅ Found ${data.length} RLS policies on jobs table`);
        data.forEach(p => console.log(`   - ${p.policyname}`));
      } else {
        console.log('⚠️  No RLS policies found or unable to check');
        console.log('   Please verify in Supabase dashboard');
      }
    }
  } catch (e) {
    console.log('⚠️  Unable to check RLS policies automatically');
    console.log('   Please verify in Supabase dashboard');
  }

  // 3. Check user types
  console.log('\n3️⃣ Checking user types...');
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('user_type')
      .limit(10);
    
    if (error) throw error;
    
    const userTypes = [...new Set(profiles.map(p => p.user_type))];
    console.log('✅ User types found:', userTypes.join(', '));
    
    const clientCount = profiles.filter(p => p.user_type === 'client').length;
    const tradieCount = profiles.filter(p => p.user_type === 'tradie').length;
    console.log(`   - Clients: ${clientCount}`);
    console.log(`   - Tradies: ${tradieCount}`);
  } catch (e) {
    console.error('❌ Error checking profiles:', e.message);
  }

  // 4. Check jobs with client_id
  console.log('\n4️⃣ Checking jobs with client_id...');
  try {
    const { data: allJobs, error: allError } = await supabase
      .from('jobs')
      .select('id', { count: 'exact' });
    
    const { data: jobsWithClient, error: clientError } = await supabase
      .from('jobs')
      .select('id', { count: 'exact' })
      .not('client_id', 'is', null);
    
    if (allError || clientError) throw allError || clientError;
    
    const totalJobs = allJobs?.length || 0;
    const jobsWithClientId = jobsWithClient?.length || 0;
    
    console.log(`✅ Jobs status:`);
    console.log(`   - Total jobs: ${totalJobs}`);
    console.log(`   - Jobs with client_id: ${jobsWithClientId}`);
    console.log(`   - Jobs without client_id: ${totalJobs - jobsWithClientId}`);
    
    if (totalJobs > jobsWithClientId) {
      console.log('⚠️  Some jobs are missing client_id');
      console.log('   These jobs won\'t be visible to clients');
    }
  } catch (e) {
    console.error('❌ Error checking jobs:', e.message);
  }

  // 5. Test edge functions
  console.log('\n5️⃣ Checking edge functions...');
  const functions = ['create-test-client', 'create-test-job'];
  
  for (const fn of functions) {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/${fn}`, {
        method: 'OPTIONS',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
        }
      });
      
      if (response.ok) {
        console.log(`✅ Edge function '${fn}' is deployed`);
      } else {
        console.log(`❌ Edge function '${fn}' returned ${response.status}`);
        console.log(`   Run: supabase functions deploy ${fn}`);
      }
    } catch (e) {
      console.log(`❌ Edge function '${fn}' is not accessible`);
      console.log(`   Run: supabase functions deploy ${fn}`);
    }
  }

  console.log('\n✅ Verification complete!');
  console.log('\nNext steps:');
  console.log('1. Fix any ❌ issues above');
  console.log('2. Run: supabase db push');
  console.log('3. Run: supabase functions deploy');
  console.log('4. Test with real client and tradie accounts');
}

// Run verification
verifySetup().catch(console.error);