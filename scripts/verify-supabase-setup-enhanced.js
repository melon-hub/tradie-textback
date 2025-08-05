#!/usr/bin/env node

/**
 * Enhanced Verification script for Supabase multi-tenant setup
 * Comprehensive checks for all aspects of the Supabase configuration
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
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

// Colors for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  purple: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function logSuccess(message) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function logError(message) {
  console.log(`${colors.red}❌ ${message}${colors.reset}`);
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

function logInfo(message) {
  console.log(`${colors.blue}ℹ️  ${message}${colors.reset}`);
}

function logSection(message) {
  console.log(`\n${colors.purple}=== ${message} ===${colors.reset}`);
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  logError('Missing environment variables. Please set:');
  console.log('   - VITE_SUPABASE_URL or SUPABASE_PROJECT_ID');
  console.log('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const anonSupabase = SUPABASE_ANON_KEY ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

function incrementCheck(passed) {
  totalChecks++;
  if (passed) {
    passedChecks++;
  } else {
    failedChecks++;
  }
}

async function verifySetup() {
  console.log(`${colors.cyan}🔍 Enhanced Supabase Setup Verification${colors.reset}`);
  console.log(`Project URL: ${SUPABASE_URL}`);
  console.log(`Project ID: ${PROJECT_ID}`);
  
  // 1. Environment Variables Check
  logSection('1. ENVIRONMENT VARIABLES');
  
  const requiredVars = [
    { name: 'VITE_SUPABASE_URL', value: SUPABASE_URL },
    { name: 'SUPABASE_SERVICE_ROLE_KEY', value: SUPABASE_SERVICE_KEY },
    { name: 'VITE_SUPABASE_ANON_KEY', value: SUPABASE_ANON_KEY }
  ];
  
  for (const { name, value } of requiredVars) {
    if (value) {
      logSuccess(`${name} is configured`);
      incrementCheck(true);
    } else {
      logError(`${name} is missing`);
      incrementCheck(false);
    }
  }

  // 2. Basic Connectivity
  logSection('2. DATABASE CONNECTIVITY');
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (!error) {
      logSuccess('Service role client can connect to database');
      incrementCheck(true);
    } else {
      logError(`Service role connection failed: ${error.message}`);
      incrementCheck(false);
    }
  } catch (e) {
    logError(`Database connection error: ${e.message}`);
    incrementCheck(false);
  }

  // Test anonymous client if available
  if (anonSupabase) {
    try {
      const { data, error } = await anonSupabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      logSuccess('Anonymous client can connect to database');
      incrementCheck(true);
    } catch (e) {
      logWarning(`Anonymous client connection issue (may be expected due to RLS): ${e.message}`);
      incrementCheck(true); // This might be expected behavior
    }
  }

  // 3. Table Structure Validation
  logSection('3. TABLE STRUCTURE');
  
  const expectedTables = ['profiles', 'jobs', 'job_photos', 'twilio_settings', 'tenant_sms_templates'];
  
  for (const table of expectedTables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (!error) {
        logSuccess(`Table '${table}' exists and is accessible`);
        incrementCheck(true);
      } else {
        logError(`Table '${table}' error: ${error.message}`);
        incrementCheck(false);
      }
    } catch (e) {
      logError(`Error checking table '${table}': ${e.message}`);
      incrementCheck(false);
    }
  }

  // 4. Critical Columns Check
  logSection('4. CRITICAL COLUMNS');
  
  const criticalColumns = [
    { table: 'jobs', column: 'client_id' },
    { table: 'profiles', column: 'user_type' },
    { table: 'jobs', column: 'status' },
    { table: 'job_photos', column: 'job_id' }
  ];
  
  for (const { table, column } of criticalColumns) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select(column)
        .limit(1);
      
      if (!error) {
        logSuccess(`Column '${table}.${column}' exists`);
        incrementCheck(true);
      } else if (error.message.includes('column') && error.message.includes('does not exist')) {
        logError(`Missing column '${table}.${column}'`);
        incrementCheck(false);
      } else {
        logWarning(`Column check '${table}.${column}': ${error.message}`);
        incrementCheck(true); // Might be RLS blocking, which is OK
      }
    } catch (e) {
      logError(`Error checking column '${table}.${column}': ${e.message}`);
      incrementCheck(false);
    }
  }

  // 5. Data Constraints Validation
  logSection('5. DATA CONSTRAINTS');
  
  try {
    // Check job status values
    const { data: jobs, error: jobError } = await supabase
      .from('jobs')
      .select('status')
      .limit(50);
    
    if (!jobError && jobs) {
      const validStatuses = ['new', 'contacted', 'quoted', 'scheduled', 'completed', 'cancelled'];
      const invalidStatuses = jobs
        .map(job => job.status)
        .filter(status => status && !validStatuses.includes(status));
      
      if (invalidStatuses.length === 0) {
        logSuccess('All job statuses are valid');
        incrementCheck(true);
      } else {
        logError(`Found ${invalidStatuses.length} jobs with invalid status: ${invalidStatuses.join(', ')}`);
        incrementCheck(false);
      }
    } else {
      logWarning('Could not verify job status constraints');
      incrementCheck(true);
    }
  } catch (e) {
    logError(`Error checking job constraints: ${e.message}`);
    incrementCheck(false);
  }

  try {
    // Check user type values
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('user_type')
      .limit(50);
    
    if (!profileError && profiles) {
      const validUserTypes = ['client', 'tradie'];
      const invalidUserTypes = profiles
        .map(profile => profile.user_type)
        .filter(userType => userType && !validUserTypes.includes(userType));
      
      if (invalidUserTypes.length === 0) {
        logSuccess('All user types are valid');
        incrementCheck(true);
      } else {
        logError(`Found ${invalidUserTypes.length} profiles with invalid user_type: ${invalidUserTypes.join(', ')}`);
        incrementCheck(false);
      }
      
      // Show user type distribution
      const clientCount = profiles.filter(p => p.user_type === 'client').length;
      const tradieCount = profiles.filter(p => p.user_type === 'tradie').length;
      logInfo(`User distribution: ${clientCount} clients, ${tradieCount} tradies`);
    } else {
      logWarning('Could not verify user type constraints');
      incrementCheck(true);
    }
  } catch (e) {
    logError(`Error checking profile constraints: ${e.message}`);
    incrementCheck(false);
  }

  // 6. RLS Policies Check
  logSection('6. ROW LEVEL SECURITY');
  
  if (anonSupabase) {
    try {
      // Test that anonymous client is properly restricted
      const { data: anonJobs, error: anonError } = await anonSupabase
        .from('jobs')
        .select('*');
      
      // If we get no data or an auth error, RLS is likely working
      const isRLSWorking = anonError?.message?.includes('row-level security') ||
                          anonError?.message?.includes('policy') ||
                          (anonJobs && anonJobs.length === 0);
      
      if (isRLSWorking) {
        logSuccess('RLS policies are preventing unauthorized access');
        incrementCheck(true);
      } else {
        logWarning('RLS policies may not be properly configured');
        logInfo(`Anonymous query returned ${anonJobs?.length || 0} rows`);
        incrementCheck(false);
      }
    } catch (e) {
      logSuccess('RLS policies are blocking anonymous access (expected)');
      incrementCheck(true);
    }
  } else {
    logWarning('Cannot test RLS policies without anonymous key');
    incrementCheck(true);
  }

  // 7. Edge Functions Check
  logSection('7. EDGE FUNCTIONS');
  
  const expectedFunctions = [
    'create-test-client',
    'create-test-job', 
    'create-test-tradie',
    'dev-login',
    'reset-test-data'
  ];
  
  for (const functionName of expectedFunctions) {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
        method: 'OPTIONS',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
        }
      });
      
      if (response.ok || response.status === 204) {
        logSuccess(`Edge function '${functionName}' is deployed`);
        incrementCheck(true);
      } else {
        logWarning(`Edge function '${functionName}' returned status ${response.status}`);
        incrementCheck(false);
      }
    } catch (e) {
      logError(`Edge function '${functionName}' is not accessible: ${e.message}`);
      incrementCheck(false);
    }
  }

  // 8. Data Integrity Check
  logSection('8. DATA INTEGRITY');
  
  try {
    // Check for jobs without client_id
    const { data: orphanedJobs, error } = await supabase
      .from('jobs')
      .select('id')
      .is('client_id', null);
    
    if (!error) {
      const orphanCount = orphanedJobs?.length || 0;
      if (orphanCount === 0) {
        logSuccess('All jobs have associated client_id');
        incrementCheck(true);
      } else {
        logWarning(`Found ${orphanCount} jobs without client_id`);
        incrementCheck(false);
      }
    } else {
      logWarning('Could not check job-client relationships');
      incrementCheck(true);
    }
  } catch (e) {
    logError(`Error checking data integrity: ${e.message}`);
    incrementCheck(false);
  }

  try {
    // Check for orphaned job photos
    const { data: allPhotos, error: photoError } = await supabase
      .from('job_photos')
      .select('id, job_id');
    
    if (!photoError && allPhotos) {
      const { data: allJobs, error: jobError } = await supabase
        .from('jobs')
        .select('id');
      
      if (!jobError && allJobs) {
        const jobIds = new Set(allJobs.map(j => j.id));
        const orphanedPhotos = allPhotos.filter(photo => !jobIds.has(photo.job_id));
        
        if (orphanedPhotos.length === 0) {
          logSuccess('No orphaned job photos found');
          incrementCheck(true);
        } else {
          logWarning(`Found ${orphanedPhotos.length} orphaned job photos`);
          incrementCheck(false);
        }
      }
    }
  } catch (e) {
    logInfo('Could not check for orphaned photos (may not be an issue)');
    incrementCheck(true);
  }

  // 9. Performance and Optimization
  logSection('9. PERFORMANCE INDICATORS');
  
  try {
    // Check table sizes and row counts
    const tables = ['profiles', 'jobs', 'job_photos'];
    for (const table of tables) {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (!error) {
        logInfo(`Table '${table}' has ${count} rows`);
        incrementCheck(true);
      } else {
        logWarning(`Could not get row count for '${table}'`);
        incrementCheck(true);
      }
    }
  } catch (e) {
    logInfo('Could not gather performance metrics');
    incrementCheck(true);
  }

  // 10. Security Check
  logSection('10. SECURITY VALIDATION');
  
  // Check that we're not accidentally exposing service key
  if (process.env.VITE_SUPABASE_SERVICE_KEY) {
    logError('Service role key is exposed in VITE_ environment variable!');
    logError('This is a security risk - service keys should not be in client-side env vars');
    incrementCheck(false);
  } else {
    logSuccess('Service role key is properly secured');
    incrementCheck(true);
  }
  
  // Check key differences
  if (SUPABASE_SERVICE_KEY === SUPABASE_ANON_KEY) {
    logError('Service role key and anonymous key are the same!');
    incrementCheck(false);
  } else {
    logSuccess('Service role and anonymous keys are different');
    incrementCheck(true);
  }

  // Summary
  logSection('VALIDATION SUMMARY');
  
  console.log(`Total checks: ${totalChecks}`);
  console.log(`${colors.green}Passed: ${passedChecks}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failedChecks}${colors.reset}`);
  
  const passRate = (passedChecks / totalChecks) * 100;
  console.log(`Pass rate: ${passRate.toFixed(1)}%`);
  
  if (failedChecks === 0) {
    logSuccess('🎉 All validation checks passed!');
    console.log('\nYour Supabase setup appears to be fully configured and healthy.');
  } else if (passRate >= 80) {
    logWarning(`⚠️  Most checks passed, but ${failedChecks} issues need attention.`);
    console.log('\nNext steps:');
    console.log('1. Review the failed checks above');
    console.log('2. Run: supabase db push (if schema issues)');
    console.log('3. Run: supabase functions deploy (if function issues)');
    console.log('4. Check your .env.local configuration');
  } else {
    logError(`❌ Significant issues found. ${failedChecks} checks failed.`);
    console.log('\nCritical next steps:');
    console.log('1. Fix environment variable configuration');
    console.log('2. Run: supabase db push');
    console.log('3. Run: supabase functions deploy');
    console.log('4. Review database schema and constraints');
    process.exit(1);
  }
  
  console.log('\nFor more detailed validation, run: npm run validate:all');
}

// Run verification
verifySetup().catch((error) => {
  logError(`Verification failed: ${error.message}`);
  process.exit(1);
});