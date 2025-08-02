#!/usr/bin/env node

/**
 * Supabase Migration Sync Analysis and Fix Script
 * 
 * This script analyzes the current migration state and provides safe commands
 * to sync the migration history without breaking existing data.
 * 
 * Usage: node scripts/analyze-migration-sync.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from both .env and .env.local
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

// Construct Supabase URL from project ID
const PROJECT_ID = process.env.VITE_SUPABASE_PROJECT_ID || process.env.SUPABASE_PROJECT_ID;
const SUPABASE_URL = `https://${PROJECT_ID}.supabase.co`;
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_API_KEY || process.env.SUPABASE_API_KEY;
const PGPASSWORD = process.env.PGPASSWORD;
const DB_URL = process.env.DB_URL;

if (!PROJECT_ID || !SUPABASE_SERVICE_KEY || !PGPASSWORD) {
  console.error('❌ Missing environment variables. Please ensure .env/.env.local contains:');
  console.error('   - VITE_SUPABASE_PROJECT_ID or SUPABASE_PROJECT_ID');
  console.error('   - VITE_SUPABASE_API_KEY or SUPABASE_API_KEY (service role key)');
  console.error('   - PGPASSWORD');
  console.log('\nCurrent values:');
  console.log('   PROJECT_ID:', PROJECT_ID ? '✓ found' : '❌ missing');
  console.log('   SERVICE_KEY:', SUPABASE_SERVICE_KEY ? '✓ found' : '❌ missing');
  console.log('   PGPASSWORD:', PGPASSWORD ? '✓ found' : '❌ missing');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Read all migration files
function getMigrationFiles() {
  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
  return fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort()
    .map(file => ({
      filename: file,
      timestamp: file.split('_')[0],
      name: file.replace('.sql', ''),
      path: path.join(migrationsDir, file)
    }));
}

// Check if a table exists
async function tableExists(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    return !error || !error.message.includes('relation') && !error.message.includes('does not exist');
  } catch (e) {
    return false;
  }
}

// Check if a column exists
async function columnExists(tableName, columnName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select(columnName)
      .limit(1);
    return !error || !error.message.includes('column') && !error.message.includes('does not exist');
  } catch (e) {
    return false;
  }
}

// Check if an index exists
async function indexExists(indexName) {
  try {
    const { data, error } = await supabase
      .rpc('sql', {
        query: `
          SELECT 1 FROM pg_indexes 
          WHERE indexname = '${indexName}';
        `
      });
    return data && data.length > 0;
  } catch (e) {
    // Fallback method - try to get index info
    try {
      const { data, error } = await supabase
        .from('pg_stat_user_indexes')
        .select('indexrelname')
        .eq('indexrelname', indexName)
        .limit(1);
      return data && data.length > 0;
    } catch (e2) {
      console.log(`⚠️  Unable to check index ${indexName} - will assume it doesn't exist`);
      return false;
    }
  }
}

// Check applied migrations
async function getAppliedMigrations() {
  try {
    const { data, error } = await supabase
      .from('supabase_migrations.schema_migrations')
      .select('version');
    
    if (error) {
      console.log('⚠️  Unable to read migration history directly');
      return [];
    }
    
    return data.map(row => row.version);
  } catch (e) {
    console.log('⚠️  Migration history table not accessible');
    return [];
  }
}

// Analyze performance bottlenecks
async function analyzePerformance() {
  console.log('\n🔍 PERFORMANCE ANALYSIS');
  console.log('========================');
  
  const results = {
    missingIndexes: [],
    slowQueries: [],
    recommendations: []
  };
  
  // Check critical indexes
  const criticalIndexes = [
    { name: 'idx_profiles_user_id', table: 'profiles', column: 'user_id' },
    { name: 'idx_profiles_user_type', table: 'profiles', column: 'user_type' },
    { name: 'idx_profiles_user_id_is_admin', table: 'profiles', columns: 'user_id, is_admin' },
    { name: 'idx_jobs_client_id', table: 'jobs', column: 'client_id' },
    { name: 'idx_jobs_status', table: 'jobs', column: 'status' }
  ];
  
  for (const index of criticalIndexes) {
    const exists = await indexExists(index.name);
    console.log(`${exists ? '✅' : '❌'} Index ${index.name} on ${index.table}(${index.column || index.columns})`);
    
    if (!exists) {
      results.missingIndexes.push(index);
    }
  }
  
  // Test profile query performance (the critical bottleneck)
  try {
    console.log('\n🎯 Testing profile query performance...');
    const start = Date.now();
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    const duration = Date.now() - start;
    console.log(`Profile query took: ${duration}ms`);
    
    if (duration > 1000) {
      results.slowQueries.push({
        query: 'profiles select',
        duration,
        severity: duration > 5000 ? 'critical' : 'warning'
      });
    }
  } catch (e) {
    console.log('❌ Could not test profile query:', e.message);
  }
  
  return results;
}

// Analyze database state
async function analyzeDatabaseState() {
  console.log('\n📊 DATABASE STATE ANALYSIS');
  console.log('===========================');
  
  const analysis = {
    tables: {},
    columns: {},
    data: {}
  };
  
  // Check main tables
  const tables = ['profiles', 'jobs', 'job_links', 'business_settings', 'admin_audit_log'];
  
  for (const table of tables) {
    const exists = await tableExists(table);
    analysis.tables[table] = exists;
    console.log(`${exists ? '✅' : '❌'} Table: ${table}`);
  }
  
  // Check critical columns
  if (analysis.tables.profiles) {
    const profileColumns = ['user_type', 'address', 'is_admin'];
    for (const col of profileColumns) {
      const exists = await columnExists('profiles', col);
      analysis.columns[`profiles.${col}`] = exists;
      console.log(`${exists ? '✅' : '❌'} Column: profiles.${col}`);
    }
  }
  
  if (analysis.tables.jobs) {
    const exists = await columnExists('jobs', 'client_id');
    analysis.columns['jobs.client_id'] = exists;
    console.log(`${exists ? '✅' : '❌'} Column: jobs.client_id`);
  }
  
  // Check data counts
  try {
    if (analysis.tables.profiles) {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      analysis.data.profiles_count = count;
      console.log(`📊 Profiles count: ${count}`);
    }
    
    if (analysis.tables.jobs) {
      const { count } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true });
      analysis.data.jobs_count = count;
      console.log(`📊 Jobs count: ${count}`);
    }
  } catch (e) {
    console.log('⚠️  Could not get data counts');
  }
  
  return analysis;
}

// Generate safe migration commands
function generateMigrationCommands(migrationFiles, appliedMigrations, dbAnalysis, perfAnalysis) {
  console.log('\n🛠️  MIGRATION SYNC STRATEGY');
  console.log('============================');
  
  const commands = [];
  const safeCommands = [];
  const dangerousCommands = [];
  
  // Step 1: Backup command
  safeCommands.push('# 1. CREATE BACKUP (REQUIRED)');
  safeCommands.push('supabase db dump -f backup-$(date +%Y%m%d-%H%M%S).sql --password "$PGPASSWORD"');
  safeCommands.push('');
  
  // Step 2: Check migration status
  safeCommands.push('# 2. CHECK CURRENT MIGRATION STATUS');
  safeCommands.push('supabase migration list --password "$PGPASSWORD"');
  safeCommands.push('');
  
  // Step 3: Analyze which migrations need to be marked as applied
  const needsMarking = [];
  
  migrationFiles.forEach(migration => {
    if (!appliedMigrations.includes(migration.timestamp)) {
      // Check if this migration's changes are already in the database
      let alreadyApplied = false;
      
      // Special cases based on migration content
      if (migration.name.includes('baseline_schema')) {
        alreadyApplied = dbAnalysis.tables.profiles && dbAnalysis.tables.jobs;
      } else if (migration.name.includes('client_id')) {
        alreadyApplied = dbAnalysis.columns['jobs.client_id'];
      } else if (migration.name.includes('user_type')) {
        alreadyApplied = dbAnalysis.columns['profiles.user_type'];
      } else if (migration.name.includes('address')) {
        alreadyApplied = dbAnalysis.columns['profiles.address'];
      } else if (migration.name.includes('admin_features')) {
        alreadyApplied = dbAnalysis.tables.admin_audit_log && dbAnalysis.tables.business_settings;
      }
      
      if (alreadyApplied) {
        needsMarking.push(migration);
      } else {
        // This migration actually needs to be applied
        if (migration.name.includes('baseline_schema')) {
          dangerousCommands.push(`# WARNING: Baseline migration not applied - this is complex`);
          dangerousCommands.push(`# supabase migration repair --status applied ${migration.timestamp} --password "$PGPASSWORD"`);
        } else {
          safeCommands.push(`# Apply missing migration: ${migration.name}`);
          safeCommands.push(`supabase db push --password "$PGPASSWORD"`);
        }
      }
    }
  });
  
  // Step 4: Mark already-applied migrations
  if (needsMarking.length > 0) {
    safeCommands.push('# 3. MARK ALREADY-APPLIED MIGRATIONS (SAFE)');
    needsMarking.forEach(migration => {
      safeCommands.push(`supabase migration repair --status applied ${migration.timestamp} --password "$PGPASSWORD"`);
    });
    safeCommands.push('');
  }
  
  // Step 5: Apply critical performance fixes immediately
  if (perfAnalysis.missingIndexes.length > 0) {
    safeCommands.push('# 4. APPLY CRITICAL PERFORMANCE FIXES (SAFE - CREATE INDEX IF NOT EXISTS)');
    perfAnalysis.missingIndexes.forEach(index => {
      const createCommand = getIndexCreateCommand(index);
      if (createCommand) {
        safeCommands.push(`# Fix: ${index.name}`);
        safeCommands.push(`echo "${createCommand}" | psql "$DB_URL"`);
      }
    });
    safeCommands.push('');
  }
  
  // Step 6: Apply remaining migrations
  safeCommands.push('# 5. APPLY ANY REMAINING MIGRATIONS');
  safeCommands.push('supabase db push --password "$PGPASSWORD"');
  safeCommands.push('');
  
  // Step 7: Verification
  safeCommands.push('# 6. VERIFY EVERYTHING IS WORKING');
  safeCommands.push('node scripts/verify-supabase-setup.js');
  safeCommands.push('supabase migration list --password "$PGPASSWORD"');
  
  return { safeCommands, dangerousCommands, needsMarking };
}

function getIndexCreateCommand(index) {
  const commands = {
    'idx_profiles_user_id': 'CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);',
    'idx_profiles_user_type': 'CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);',
    'idx_profiles_user_id_is_admin': 'CREATE INDEX IF NOT EXISTS idx_profiles_user_id_is_admin ON profiles(user_id, is_admin);',
    'idx_jobs_client_id': 'CREATE INDEX IF NOT EXISTS idx_jobs_client_id ON jobs(client_id);',
    'idx_jobs_status': 'CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);'
  };
  
  return commands[index.name];
}

async function main() {
  console.log('🔍 SUPABASE MIGRATION SYNC ANALYSIS');
  console.log('=====================================');
  console.log(`Database: ${SUPABASE_URL}`);
  console.log(`Project ID: ${PROJECT_ID}`);
  console.log('');
  
  try {
    // Get migration files
    const migrationFiles = getMigrationFiles();
    console.log(`📄 Found ${migrationFiles.length} migration files:`);
    migrationFiles.forEach(m => console.log(`   ${m.name}`));
    
    // Get applied migrations
    const appliedMigrations = await getAppliedMigrations();
    console.log(`\n✅ Applied migrations: ${appliedMigrations.length}`);
    if (appliedMigrations.length > 0) {
      appliedMigrations.forEach(m => console.log(`   ${m}`));
    }
    
    // Analyze database state
    const dbAnalysis = await analyzeDatabaseState();
    
    // Analyze performance
    const perfAnalysis = await analyzePerformance();
    
    // Generate commands
    const { safeCommands, dangerousCommands, needsMarking } = generateMigrationCommands(
      migrationFiles, 
      appliedMigrations, 
      dbAnalysis, 
      perfAnalysis
    );
    
    // Write commands to file
    const commandsFile = path.join(__dirname, 'migration-sync-commands.sh');
    const commandScript = [
      '#!/bin/bash',
      '# Supabase Migration Sync Commands',
      '# Generated: ' + new Date().toISOString(),
      '# Project: tradie-textback',
      '',
      'set -e  # Exit on any error',
      '',
      '# Load environment variables',
      'source .env.local',
      '',
      '# Ensure we have the required variables',
      'if [ -z "$PGPASSWORD" ] || [ -z "$DB_URL" ]; then',
      '  echo "❌ Missing required environment variables"',
      '  echo "Please ensure .env.local contains PGPASSWORD and DB_URL"',
      '  exit 1',
      'fi',
      '',
      'echo "🚀 Starting Supabase Migration Sync..."',
      'echo "Project: cjxejmljovszxuleibqn"',
      'echo "Time: $(date)"',
      'echo ""',
      '',
      ...safeCommands,
      '',
      'echo "✅ Migration sync complete!"',
      'echo "Next steps:"',
      'echo "1. Test your application thoroughly"',
      'echo "2. Monitor performance improvements"',
      'echo "3. Check admin dashboard functionality"'
    ];
    
    if (dangerousCommands.length > 0) {
      commandScript.push('');
      commandScript.push('# ========================================');
      commandScript.push('# DANGEROUS COMMANDS - REVIEW CAREFULLY');
      commandScript.push('# ========================================');
      commandScript.push(...dangerousCommands);
    }
    
    fs.writeFileSync(commandsFile, commandScript.join('\n'));
    console.log(`\n📝 Commands written to: ${commandsFile}`);
    
    // Summary
    console.log('\n📋 SUMMARY & RECOMMENDATIONS');
    console.log('=============================');
    
    if (perfAnalysis.missingIndexes.length > 0) {
      console.log(`❌ Critical: ${perfAnalysis.missingIndexes.length} missing performance indexes`);
      console.log('   This is likely causing the 30+ second load times');
    }
    
    if (needsMarking.length > 0) {
      console.log(`⚠️  ${needsMarking.length} migrations need to be marked as applied`);
    }
    
    if (!dbAnalysis.tables.admin_audit_log || !dbAnalysis.tables.business_settings) {
      console.log('⚠️  Admin features incomplete - some tables missing');
    }
    
    console.log('\n🎯 IMMEDIATE ACTIONS NEEDED:');
    console.log('1. Run the generated script: bash scripts/migration-sync-commands.sh');
    console.log('2. Test application performance (should be much faster)');
    console.log('3. Verify admin functionality works');
    console.log('4. Monitor for any issues');
    
    console.log('\n⚠️  IMPORTANT SAFETY NOTES:');
    console.log('- A backup will be created automatically');
    console.log('- All commands use "IF NOT EXISTS" for safety');
    console.log('- Migration repair only marks status, doesn\'t run SQL');
    console.log('- Stop immediately if any command fails');
    
  } catch (error) {
    console.error('\n❌ Analysis failed:', error.message);
    console.error('\nThis could indicate:');
    console.error('- Database connection issues');
    console.error('- Permission problems');
    console.error('- Configuration errors');
    process.exit(1);
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main, analyzeDatabaseState, analyzePerformance };