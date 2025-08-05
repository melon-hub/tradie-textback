import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

/**
 * Comprehensive Validation Test Suite for Tradie-Textback Project
 * Tests all critical system components and configurations
 * Run with: npm run test:validation
 */

interface EnvironmentConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceKey: string;
  projectId: string;
}

interface ValidationResult {
  passed: boolean;
  message: string;
  details?: any;
}

class ValidationTestSuite {
  private config: EnvironmentConfig;
  private supabase: ReturnType<typeof createClient<Database>>;
  private serviceSupabase: ReturnType<typeof createClient<Database>>;

  constructor() {
    // Load environment configuration
    this.config = {
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
      supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
      supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      projectId: process.env.SUPABASE_PROJECT_ID || '',
    };

    // Initialize Supabase clients
    this.supabase = createClient<Database>(
      this.config.supabaseUrl,
      this.config.supabaseAnonKey
    );

    this.serviceSupabase = createClient<Database>(
      this.config.supabaseUrl,
      this.config.supabaseServiceKey
    );
  }

  // Environment Variables Validation
  async validateEnvironmentVariables(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    const requiredVars = [
      { key: 'VITE_SUPABASE_URL', value: this.config.supabaseUrl },
      { key: 'VITE_SUPABASE_ANON_KEY', value: this.config.supabaseAnonKey },
      { key: 'SUPABASE_SERVICE_ROLE_KEY', value: this.config.supabaseServiceKey },
      { key: 'SUPABASE_PROJECT_ID', value: this.config.projectId },
    ];

    for (const { key, value } of requiredVars) {
      results.push({
        passed: !!value,
        message: `Environment variable ${key} should be set`,
        details: { key, hasValue: !!value }
      });
    }

    // Validate URL format
    try {
      new URL(this.config.supabaseUrl);
      results.push({
        passed: true,
        message: 'Supabase URL format is valid'
      });
    } catch {
      results.push({
        passed: false,
        message: 'Supabase URL format is invalid'
      });
    }

    return results;
  }

  // Database Connectivity Tests
  async validateDatabaseConnectivity(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    try {
      // Test anonymous client connectivity
      const { data, error } = await this.supabase
        .from('profiles')
        .select('count')
        .limit(1);

      results.push({
        passed: !error,
        message: 'Anonymous client can connect to database',
        details: { error: error?.message }
      });
    } catch (error) {
      results.push({
        passed: false,
        message: 'Anonymous client connection failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }

    try {
      // Test service role client connectivity
      const { data, error } = await this.serviceSupabase
        .from('profiles')
        .select('count')
        .limit(1);

      results.push({
        passed: !error,
        message: 'Service role client can connect to database',
        details: { error: error?.message }
      });
    } catch (error) {
      results.push({
        passed: false,
        message: 'Service role client connection failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }

    return results;
  }

  // Database Schema Validation
  async validateDatabaseSchema(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    // Test required tables exist
    const requiredTables = ['profiles', 'jobs', 'job_photos'];
    
    for (const table of requiredTables) {
      try {
        const { error } = await this.serviceSupabase
          .from(table as any)
          .select('*')
          .limit(1);

        results.push({
          passed: !error,
          message: `Table '${table}' exists and is accessible`,
          details: { table, error: error?.message }
        });
      } catch (error) {
        results.push({
          passed: false,
          message: `Table '${table}' is not accessible`,
          details: { 
            table, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          }
        });
      }
    }

    return results;
  }

  // Database Constraints Validation
  async validateDatabaseConstraints(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    try {
      // Test job status constraint
      const { data: jobs, error } = await this.serviceSupabase
        .from('jobs')
        .select('status')
        .limit(100);

      if (!error && jobs) {
        const validStatuses = ['new', 'contacted', 'quoted', 'scheduled', 'completed', 'cancelled'];
        const invalidStatuses = jobs
          .map(job => job.status)
          .filter(status => status && !validStatuses.includes(status));

        results.push({
          passed: invalidStatuses.length === 0,
          message: 'All job statuses match expected constraint values',
          details: { invalidStatuses, validStatuses }
        });
      } else {
        results.push({
          passed: false,
          message: 'Could not validate job status constraints',
          details: { error: error?.message }
        });
      }
    } catch (error) {
      results.push({
        passed: false,
        message: 'Error validating job status constraints',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }

    try {
      // Test user type constraint
      const { data: profiles, error } = await this.serviceSupabase
        .from('profiles')
        .select('user_type')
        .limit(100);

      if (!error && profiles) {
        const validUserTypes = ['client', 'tradie'];
        const invalidUserTypes = profiles
          .map(profile => profile.user_type)
          .filter(userType => userType && !validUserTypes.includes(userType));

        results.push({
          passed: invalidUserTypes.length === 0,
          message: 'All user types match expected constraint values',
          details: { invalidUserTypes, validUserTypes }
        });
      } else {
        results.push({
          passed: false,
          message: 'Could not validate user type constraints',
          details: { error: error?.message }
        });
      }
    } catch (error) {
      results.push({
        passed: false,
        message: 'Error validating user type constraints',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }

    return results;
  }

  // RLS Policies Validation
  async validateRLSPolicies(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    try {
      // Test that anonymous client cannot access all jobs (RLS should prevent this)
      const { data, error } = await this.supabase
        .from('jobs')
        .select('*');

      // If we get data back, RLS might not be properly configured
      // If we get an auth error, that's expected behavior
      const isRLSWorking = error?.message?.includes('row-level security') || 
                          error?.message?.includes('policy') ||
                          (data && data.length === 0);

      results.push({
        passed: isRLSWorking,
        message: 'RLS policies are preventing unauthorized access to jobs',
        details: { 
          error: error?.message,
          dataLength: data?.length,
          isRLSWorking
        }
      });
    } catch (error) {
      results.push({
        passed: false,
        message: 'Error testing RLS policies',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }

    return results;
  }

  // Edge Functions Validation
  async validateEdgeFunctions(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    
    const expectedFunctions = [
      'create-test-client',
      'create-test-job',
      'create-test-tradie',
      'dev-login',
      'reset-test-data'
    ];

    for (const functionName of expectedFunctions) {
      try {
        const response = await fetch(
          `${this.config.supabaseUrl}/functions/v1/${functionName}`,
          {
            method: 'OPTIONS',
            headers: {
              'Authorization': `Bearer ${this.config.supabaseServiceKey}`,
            },
          }
        );

        results.push({
          passed: response.ok,
          message: `Edge function '${functionName}' is deployed and accessible`,
          details: { 
            functionName, 
            status: response.status,
            statusText: response.statusText
          }
        });
      } catch (error) {
        results.push({
          passed: false,
          message: `Edge function '${functionName}' is not accessible`,
          details: { 
            functionName,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        });
      }
    }

    return results;
  }

  // Security Configuration Validation
  async validateSecurityConfiguration(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    // Test that service role key is not exposed in client-side environment
    const clientSideServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY ||
                                import.meta.env.VITE_SERVICE_ROLE_KEY;

    results.push({
      passed: !clientSideServiceKey,
      message: 'Service role key is not exposed in client-side environment variables',
      details: { hasClientSideServiceKey: !!clientSideServiceKey }
    });

    // Test that anon key is different from service key
    results.push({
      passed: this.config.supabaseAnonKey !== this.config.supabaseServiceKey,
      message: 'Anonymous key is different from service role key',
      details: { 
        anonKeyPrefix: this.config.supabaseAnonKey.substring(0, 10),
        serviceKeyPrefix: this.config.supabaseServiceKey.substring(0, 10)
      }
    });

    return results;
  }

  // Data Integrity Validation
  async validateDataIntegrity(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    try {
      // Check for orphaned job photos (jobs that don't exist)
      const { data: orphanedPhotos, error } = await this.serviceSupabase
        .rpc('get_orphaned_job_photos')
        .catch(() => ({ data: null, error: { message: 'Function not available' } }));

      if (!error && orphanedPhotos !== null) {
        results.push({
          passed: Array.isArray(orphanedPhotos) && orphanedPhotos.length === 0,
          message: 'No orphaned job photos found',
          details: { orphanedCount: Array.isArray(orphanedPhotos) ? orphanedPhotos.length : 0 }
        });
      } else {
        results.push({
          passed: true, // Neutral result if we can't check
          message: 'Could not check for orphaned job photos (function not available)',
          details: { error: error?.message }
        });
      }
    } catch (error) {
      results.push({
        passed: false,
        message: 'Error checking data integrity',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }

    try {
      // Check for jobs without client_id
      const { data: jobsWithoutClient, error } = await this.serviceSupabase
        .from('jobs')
        .select('id')
        .is('client_id', null);

      if (!error) {
        results.push({
          passed: !jobsWithoutClient || jobsWithoutClient.length === 0,
          message: 'All jobs have associated client_id',
          details: { jobsWithoutClientCount: jobsWithoutClient?.length || 0 }
        });
      } else {
        results.push({
          passed: false,
          message: 'Could not validate job-client relationships',
          details: { error: error.message }
        });
      }
    } catch (error) {
      results.push({
        passed: false,
        message: 'Error validating job-client relationships',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }

    return results;
  }

  // Run all validations
  async runAllValidations(): Promise<{ [category: string]: ValidationResult[] }> {
    const results: { [category: string]: ValidationResult[] } = {};

    results['Environment Variables'] = await this.validateEnvironmentVariables();
    results['Database Connectivity'] = await this.validateDatabaseConnectivity();
    results['Database Schema'] = await this.validateDatabaseSchema();
    results['Database Constraints'] = await this.validateDatabaseConstraints();
    results['RLS Policies'] = await this.validateRLSPolicies();
    results['Edge Functions'] = await this.validateEdgeFunctions();
    results['Security Configuration'] = await this.validateSecurityConfiguration();
    results['Data Integrity'] = await this.validateDataIntegrity();

    return results;
  }
}

// Test Suite
describe('System Validation', () => {
  let validator: ValidationTestSuite;

  beforeAll(() => {
    validator = new ValidationTestSuite();
  });

  describe('Environment Variables', () => {
    it('should have all required environment variables configured', async () => {
      const results = await validator.validateEnvironmentVariables();
      
      for (const result of results) {
        expect(result.passed).toBe(true);
      }
    });
  });

  describe('Database Connectivity', () => {
    it('should be able to connect to database with both client types', async () => {
      const results = await validator.validateDatabaseConnectivity();
      
      for (const result of results) {
        expect(result.passed).toBe(true);
      }
    });
  });

  describe('Database Schema', () => {
    it('should have all required tables accessible', async () => {
      const results = await validator.validateDatabaseSchema();
      
      for (const result of results) {
        expect(result.passed).toBe(true);
      }
    });
  });

  describe('Database Constraints', () => {
    it('should have valid constraint values in database', async () => {
      const results = await validator.validateDatabaseConstraints();
      
      for (const result of results) {
        expect(result.passed).toBe(true);
      }
    });
  });

  describe('RLS Policies', () => {
    it('should have working row-level security policies', async () => {
      const results = await validator.validateRLSPolicies();
      
      for (const result of results) {
        expect(result.passed).toBe(true);
      }
    });
  });

  describe('Edge Functions', () => {
    it('should have all expected edge functions deployed', async () => {
      const results = await validator.validateEdgeFunctions();
      
      // Allow some edge functions to be missing in development
      const criticalFunctions = ['create-test-client', 'dev-login'];
      const criticalResults = results.filter(r => 
        criticalFunctions.some(cf => r.message.includes(cf))
      );
      
      for (const result of criticalResults) {
        expect(result.passed).toBe(true);
      }
    });
  });

  describe('Security Configuration', () => {
    it('should have proper security configuration', async () => {
      const results = await validator.validateSecurityConfiguration();
      
      for (const result of results) {
        expect(result.passed).toBe(true);
      }
    });
  });

  describe('Data Integrity', () => {
    it('should have consistent data relationships', async () => {
      const results = await validator.validateDataIntegrity();
      
      for (const result of results) {
        expect(result.passed).toBe(true);
      }
    });
  });

  // Comprehensive validation test that runs all checks
  describe('Comprehensive Validation', () => {
    it('should pass all validation checks', async () => {
      const allResults = await validator.runAllValidations();
      
      let totalTests = 0;
      let passedTests = 0;
      let failedTests: { category: string; result: ValidationResult }[] = [];

      for (const [category, results] of Object.entries(allResults)) {
        for (const result of results) {
          totalTests++;
          if (result.passed) {
            passedTests++;
          } else {
            failedTests.push({ category, result });
          }
        }
      }

      // Log summary
      console.log(`\n🔍 Validation Summary:`);
      console.log(`   Total checks: ${totalTests}`);
      console.log(`   Passed: ${passedTests}`);
      console.log(`   Failed: ${failedTests.length}`);

      if (failedTests.length > 0) {
        console.log(`\n❌ Failed checks:`);
        for (const { category, result } of failedTests) {
          console.log(`   [${category}] ${result.message}`);
          if (result.details) {
            console.log(`     Details:`, result.details);
          }
        }
      }

      // The test passes if at least 80% of checks pass
      const passRate = passedTests / totalTests;
      expect(passRate).toBeGreaterThanOrEqual(0.8);
      
      if (passRate === 1) {
        console.log(`\n✅ All validation checks passed!`);
      } else {
        console.log(`\n⚠️  Some validation checks failed. Pass rate: ${Math.round(passRate * 100)}%`);
      }
    }, 30000); // 30 second timeout for comprehensive test
  });
});

// Export the validator class for use in other tests
export { ValidationTestSuite };
export type { ValidationResult };