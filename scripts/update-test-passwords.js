#!/usr/bin/env node

// Script to update test user passwords using Supabase Admin API
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Get Supabase URL and service role key from environment
const supabaseUrl = `https://${process.env.SUPABASE_PROJECT_ID}.supabase.co`;
const supabaseServiceKey = process.env.SUPABASE_API_KEY;

if (!supabaseServiceKey || !process.env.SUPABASE_PROJECT_ID) {
  console.error('❌ Missing SUPABASE_PROJECT_ID or SUPABASE_API_KEY in .env.local');
  process.exit(1);
}

// Create admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function updatePasswords() {
  console.log('🔐 Updating test user passwords...\n');

  const users = [
    { email: 'testadmin@dev.local', password: 'TestAdmin123!' },
    { email: 'testtradie@dev.local', password: 'TestTradie123!' },
    { email: 'testclient@dev.local', password: 'TestClient123!' }
  ];

  for (const user of users) {
    try {
      // First, get the user ID
      const { data: userData, error: fetchError } = await supabase.auth.admin.listUsers();
      
      if (fetchError) {
        console.error(`❌ Error fetching users: ${fetchError.message}`);
        continue;
      }

      const existingUser = userData.users.find(u => u.email === user.email);
      
      if (!existingUser) {
        console.log(`⚠️  User ${user.email} not found`);
        continue;
      }

      // Update the password
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        { password: user.password }
      );

      if (updateError) {
        console.error(`❌ Failed to update ${user.email}: ${updateError.message}`);
      } else {
        console.log(`✅ Updated password for ${user.email}`);
      }
    } catch (error) {
      console.error(`❌ Error updating ${user.email}:`, error.message);
    }
  }

  console.log('\n✨ Done! Test credentials:');
  console.log('   Admin:  testadmin@dev.local / TestAdmin123!');
  console.log('   Tradie: testtradie@dev.local / TestTradie123!');
  console.log('   Client: testclient@dev.local / TestClient123!');
}

// Run the update
updatePasswords().catch(console.error);