/**
 * Database Mock Helper Functions
 * 
 * Provides consistent mock responses and helper functions for database operations
 * across all test files. Supports the enhanced schema with onboarding system.
 */

import { vi } from 'vitest';
import type { Tables } from '@/types/database.types';
import { 
  createMockProfile, 
  createClientProfile,
  createMockTradeType,
  createMockServiceLocation,
  createMockSmsTemplate,
  createMockTwilioSettings,
  createMockJob,
  getOnboardingState
} from '../factories';

// Type aliases for better readability
type Profile = Tables<'profiles'>;
type TradeType = Tables<'trade_types'>;
type ServiceLocation = Tables<'service_locations'>;
type SmsTemplate = Tables<'tenant_sms_templates'>;
type TwilioSettings = Tables<'twilio_settings'>;

/**
 * Mock Response Builder
 * Creates consistent mock responses for Supabase queries
 */
export class MockResponseBuilder {
  static success<T>(data: T) {
    return { data, error: null };
  }

  static error(message: string, details?: string) {
    return { 
      data: null, 
      error: { message, details, hint: null, code: 'TEST_ERROR' } 
    };
  }

  static empty() {
    return { data: null, error: null };
  }

  static array<T>(items: T[]) {
    return { data: items, error: null };
  }
}

/**
 * Profile Mock Helpers
 */
export class ProfileMockHelper {
  static createCompleteTradie(overrides = {}): Profile {
    return createMockProfile({
      onboarding_completed: true,
      onboarding_step: 6,
      trade_primary: 'plumber',
      business_name: 'Test Plumbing Services',
      service_postcodes: ['2000', '2001'],
      ...overrides,
    });
  }

  static createIncompleteTradie(step: number, overrides = {}): Profile {
    const onboardingState = getOnboardingState(step);
    return createMockProfile({
      ...onboardingState.profileData,
      ...overrides,
    });
  }

  static createClient(overrides = {}): Profile {
    return createClientProfile(overrides);
  }

  static mockProfileQuery(profile: Profile | null, error: any = null) {
    return vi.fn().mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue(
        error ? MockResponseBuilder.error(error) : MockResponseBuilder.success(profile)
      ),
      single: vi.fn().mockResolvedValue(
        error ? MockResponseBuilder.error(error) : MockResponseBuilder.success(profile)
      ),
    }));
  }

  static mockProfileUpdate(updatedProfile: Profile, error: any = null) {
    return vi.fn().mockImplementation(() => ({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockResolvedValue(
        error ? MockResponseBuilder.error(error) : MockResponseBuilder.array([updatedProfile])
      ),
    }));
  }
}

/**
 * Onboarding Mock Helpers
 */
export class OnboardingMockHelper {
  static mockStepValidation(step: number, isValid: boolean = true) {
    const state = getOnboardingState(step);
    const profile = createMockProfile(state.profileData);
    
    return {
      profile,
      isValid,
      nextStep: isValid ? step + 1 : step,
      canProceed: isValid && step < 6,
    };
  }

  static mockOnboardingFlow(startStep: number = 0, endStep: number = 6) {
    const steps = [];
    for (let i = startStep; i <= endStep; i++) {
      steps.push(this.mockStepValidation(i));
    }
    return steps;
  }

  static mockTradeSelectionStep() {
    return {
      tradeTypes: [
        createMockTradeType({ code: 'plumber', label: 'Plumber' }),
        createMockTradeType({ code: 'electrician', label: 'Electrician' }),
        createMockTradeType({ code: 'carpenter', label: 'Carpenter' }),
      ],
      selectedPrimary: 'plumber',
      selectedSecondary: ['electrician'],
    };
  }

  static mockServiceAreaStep() {
    return {
      postcodes: ['2000', '2001', '2002'],
      radius: 25,
      locations: [
        createMockServiceLocation({ postcode: '2000', suburb: 'Sydney' }),
        createMockServiceLocation({ postcode: '2001', suburb: 'Sydney' }),
      ],
    };
  }
}

/**
 * Table Mock Helpers
 */
export class TableMockHelper {
  static mockTradeTypesQuery(tradeTypes: TradeType[] = [], error: any = null) {
    return vi.fn().mockImplementation(() => ({
      select: vi.fn().mockResolvedValue(
        error ? MockResponseBuilder.error(error) : MockResponseBuilder.array(tradeTypes)
      ),
    }));
  }

  static mockServiceLocationsQuery(locations: ServiceLocation[] = [], userId?: string, error: any = null) {
    return vi.fn().mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockImplementation((column: string, value: any) => {
        if (column === 'user_id' && userId) {
          const userLocations = locations.filter(loc => loc.user_id === value);
          return Promise.resolve(
            error ? MockResponseBuilder.error(error) : MockResponseBuilder.array(userLocations)
          );
        }
        return Promise.resolve(
          error ? MockResponseBuilder.error(error) : MockResponseBuilder.array(locations)
        );
      }),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
    }));
  }

  static mockSmsTemplatesQuery(templates: SmsTemplate[] = [], userId?: string, error: any = null) {
    return vi.fn().mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockImplementation((column: string, value: any) => {
        if (column === 'user_id' && userId) {
          const userTemplates = templates.filter(template => template.user_id === value);
          return Promise.resolve(
            error ? MockResponseBuilder.error(error) : MockResponseBuilder.array(userTemplates)
          );
        }
        if (column === 'template_type') {
          const typeTemplates = templates.filter(template => template.template_type === value);
          return Promise.resolve(
            error ? MockResponseBuilder.error(error) : MockResponseBuilder.array(typeTemplates)
          );
        }
        return Promise.resolve(
          error ? MockResponseBuilder.error(error) : MockResponseBuilder.array(templates)
        );
      }),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
    }));
  }

  static mockTwilioSettingsQuery(settings: TwilioSettings | null = null, error: any = null) {
    return vi.fn().mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue(
        error ? MockResponseBuilder.error(error) : MockResponseBuilder.success(settings)
      ),
      maybeSingle: vi.fn().mockResolvedValue(
        error ? MockResponseBuilder.error(error) : MockResponseBuilder.success(settings)
      ),
    }));
  }
}

/**
 * RLS Policy Mock Helpers
 */
export class RLSMockHelper {
  static mockUserCanAccess(userId: string, resourceUserId: string | null): boolean {
    // Simulate RLS policy: users can only access their own data
    return userId === resourceUserId;
  }

  static mockAdminCanAccess(isAdmin: boolean): boolean {
    // Simulate RLS policy: admins can access all data
    return isAdmin;
  }

  static filterByRLS<T extends { user_id?: string | null }>(
    items: T[], 
    currentUserId: string, 
    isAdmin: boolean = false
  ): T[] {
    if (isAdmin) {
      return items;
    }
    return items.filter(item => this.mockUserCanAccess(currentUserId, item.user_id));
  }
}

/**
 * Test Data Builders for specific scenarios
 */
export class TestDataBuilder {
  static buildOnboardingScenario(step: number) {
    const state = getOnboardingState(step);
    const profile = createMockProfile(state.profileData);
    
    return {
      user: { id: 'test-user-id', email: 'test@example.com' },
      profile,
      canProceed: !state.completed && step < 6,
      nextStep: state.completed ? 6 : step + 1,
      isComplete: state.completed,
    };
  }

  static buildTradieWithServices(userId: string = 'test-user-id') {
    const profile = ProfileMockHelper.createCompleteTradie({ user_id: userId });
    const locations = [
      createMockServiceLocation({ user_id: userId, postcode: '2000' }),
      createMockServiceLocation({ user_id: userId, postcode: '2001' }),
    ];
    const templates = [
      createMockSmsTemplate({ user_id: userId, template_type: 'missed_call' }),
      createMockSmsTemplate({ user_id: userId, template_type: 'job_confirmation' }),
    ];
    
    return { profile, locations, templates };
  }

  static buildClientScenario(userId: string = 'client-user-id') {
    const profile = ProfileMockHelper.createClient({ user_id: userId });
    const jobs = [
      createMockJob({ client_id: userId, job_type: 'Plumbing' }),
      createMockJob({ client_id: userId, job_type: 'Electrical' }),
    ];
    
    return { profile, jobs };
  }
}

/**
 * Integration Test Helpers
 */
export class IntegrationTestHelper {
  static async mockCompleteOnboardingFlow() {
    const steps = [];
    for (let i = 0; i <= 6; i++) {
      const scenario = TestDataBuilder.buildOnboardingScenario(i);
      steps.push({
        step: i,
        ...scenario,
      });
    }
    return steps;
  }

  static mockDatabaseOperations() {
    return {
      profiles: {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(MockResponseBuilder.success(null)),
        maybeSingle: vi.fn().mockResolvedValue(MockResponseBuilder.success(null)),
      },
      tables: {
        'trade_types': TableMockHelper.mockTradeTypesQuery(),
        'service_locations': TableMockHelper.mockServiceLocationsQuery(),
        'tenant_sms_templates': TableMockHelper.mockSmsTemplatesQuery(),
        'twilio_settings': TableMockHelper.mockTwilioSettingsQuery(),
      },
    };
  }
}

/**
 * Error Simulation Helpers
 */
export class ErrorSimulationHelper {
  static networkError() {
    return 'Network connection failed';
  }

  static validationError(field: string) {
    return `Validation failed for field: ${field}`;
  }

  static permissionError() {
    return 'Insufficient permissions';
  }

  static notFoundError(resource: string) {
    return `${resource} not found`;
  }

  static conflictError(resource: string) {
    return `${resource} already exists`;
  }
}