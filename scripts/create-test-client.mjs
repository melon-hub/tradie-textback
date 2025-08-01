#!/usr/bin/env node

// Script to create a test client account for development/testing purposes
// This script simulates the signup process for a client user

import { createClient } from '@supabase/supabase-js';

// Configuration - These will be loaded from environment variables
// Make sure to set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate required environment variables
if (!SUPABASE_URL) {
  console.error('❌ Error: SUPABASE_URL environment variable is not set');
  console.error('Please set it in your environment or .env file');
  process.exit(1);
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable is not set');
  console.error('Please set it in your environment or .env file');
  console.error('You can find this in your Supabase project settings under API > Service Role Key');
  process.exit(1);
}

// Test client data
const testClientData = {
  phone: '+61400000000',
  name: 'Test Client',
  address: '123 Test Street, Sydney, NSW 2000',
  user_type: 'client'
};

async function createTestClient() {
  try {
    // Initialize Supabase client with service role key (admin access)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Create the user in auth.users table
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      phone: testClientData.phone,
      user_metadata: {
        name: testClientData.name,
        address: testClientData.address,
        user_type: testClientData.user_type
      },
      email_confirm: true
    });
    
    if (authError) {
      throw new Error(`Auth error: ${authError.message}`);
    }
    
    console.log('✅ Test client created successfully!');
    console.log('User ID:', authData.user.id);
    console.log('Phone:', testClientData.phone);
    console.log('Name:', testClientData.name);
    console.log('User Type:', testClientData.user_type);
    
    // Verify the profile was created
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    if (profileError) {
      console.warn('⚠️  Profile verification failed:', profileError.message);
    } else {
      console.log('✅ Profile verified:', {
        name: profileData.name,
        user_type: profileData.user_type,
        address: profileData.address
      });
    }
    
    return authData.user.id;
  } catch (error) {
    console.error('❌ Error creating test client:', error.message);
    process.exit(1);
  }
}

// Create a test job for the client
async function createTestJob(clientId) {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const { data, error } = await supabase
      .from('jobs')
      .insert({
        client_id: clientId,
        description: 'Test job for client onboarding verification',
        status: 'new',
        urgency: 'normal',
        customer: {
          name: 'Test Client',
          phone: '+61400000000',
          address: '123 Test Street, Sydney, NSW 2000'
        }
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(`Job creation error: ${error.message}`);
    }
    
    console.log('✅ Test job created successfully!');
    console.log('Job ID:', data.id);
    
    return data.id;
  } catch (error) {
    console.error('❌ Error creating test job:', error.message);
  }
}

// Main execution
async function main() {
  console.log('🔧 Creating test client account...');
  
  const clientId = await createTestClient();
  
  if (clientId) {
    console.log('\n🔧 Creating test job for the client...');
    await createTestJob(clientId);
  }
  
  console.log('\n✅ Test setup complete!');
  console.log('You can now test the client experience by logging in with:');
  console.log('- Phone:', testClientData.phone);
  console.log('- User Type: Client');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { createTestClient, createTestJob };
