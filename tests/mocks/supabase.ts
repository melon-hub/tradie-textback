import { vi } from 'vitest';
import { 
  createMockProfile, 
  createClientProfile, 
  createAdminProfile,
  mockTradeTypes,
  mockServiceLocations,
  mockSmsTemplates,
  createMockTwilioSettings
} from '../factories';

// Mock user for testing
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00.000Z',
};

// Mock profiles with enhanced schema
export const mockTradieProfile = createMockProfile({
  id: 'profile-1',
  user_id: 'test-user-id',
  name: 'Test Tradie',
  phone: '+61412345678',
  user_type: 'tradie',
  is_admin: false,
  address: '123 Test St, Sydney NSW 2000',
});

export const mockClientProfile = createClientProfile({
  id: 'profile-2',
  user_id: 'client-user-id',
  name: 'Test Client',
  phone: '+61498765432',
  address: '456 Client Ave, Melbourne VIC 3000',
});

export const mockAdminProfile = createAdminProfile({
  id: 'profile-3',
  user_id: 'admin-user-id',
  name: 'Test Admin',
  phone: '+61412345679',
});

// Mock data for new tables
export const mockTwilioSettings = createMockTwilioSettings({
  user_id: 'test-user-id',
  phone_number: '+61412345678',
  status: 'active',
  verified_at: new Date().toISOString(),
});

// Mock jobs
export const mockJobs = [
  {
    id: 'job-1',
    client_id: 'test-user-id',
    customer_name: 'John Doe',
    phone: '+61412345678',
    job_type: 'Plumbing',
    location: 'Sydney NSW',
    urgency: 'high',
    status: 'new',
    estimated_value: 250,
    description: 'Leaking tap',
    preferred_time: 'Morning',
    last_contact: new Date().toISOString(),
    sms_blocked: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'job-2',
    client_id: 'test-user-id',
    customer_name: 'Jane Smith',
    phone: '+61498765432',
    job_type: 'Electrical',
    location: 'Melbourne VIC',
    urgency: 'medium',
    status: 'contacted',
    estimated_value: 500,
    description: 'Power outlet not working',
    preferred_time: 'Afternoon',
    last_contact: new Date().toISOString(),
    sms_blocked: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Export the Jobs array to prevent breaking existing tests
export { mockJobs };

// Create Supabase mock with enhanced schema support
export const createSupabaseMock = (options = {}) => {
  const defaultOptions = {
    user: mockUser,
    profile: mockTradieProfile,
    jobs: mockJobs,
    tradeTypes: mockTradeTypes,
    serviceLocations: mockServiceLocations,
    smsTemplates: mockSmsTemplates,
    twilioSettings: mockTwilioSettings,
    error: null,
  };

  const config = { ...defaultOptions, ...options };

  return {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: config.user ? { user: config.user } : null },
        error: config.error,
      }),
      getUser: vi.fn().mockResolvedValue({
        data: { user: config.user },
        error: config.error,
      }),
      signInWithOtp: vi.fn().mockResolvedValue({
        data: {},
        error: config.error,
      }),
      signOut: vi.fn().mockResolvedValue({
        error: config.error,
      }),
      onAuthStateChange: vi.fn().mockImplementation((callback) => {
        if (config.user) {
          callback('SIGNED_IN', { user: config.user });
        }
        return {
          data: { subscription: { unsubscribe: vi.fn() } },
        };
      }),
    },
    from: vi.fn().mockImplementation((table) => {
      const queryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        upsert: vi.fn().mockReturnThis(),
      };

      // Handle different table queries
      if (table === 'profiles') {
        queryBuilder.single = vi.fn().mockResolvedValue({
          data: config.profile,
          error: config.error,
        });
        queryBuilder.maybeSingle = vi.fn().mockResolvedValue({
          data: config.profile,
          error: config.error,
        });
      } else if (table === 'jobs') {
        queryBuilder.single = vi.fn().mockResolvedValue({
          data: config.jobs[0],
          error: config.error,
        });
        queryBuilder.eq = vi.fn().mockImplementation(() => {
          return {
            ...queryBuilder,
            single: vi.fn().mockResolvedValue({
              data: config.jobs[0],
              error: config.error,
            }),
          };
        });
        // Default to returning all jobs
        const execute = vi.fn().mockResolvedValue({
          data: config.jobs,
          error: config.error,
        });
        Object.setPrototypeOf(queryBuilder, { then: execute.then?.bind(execute) });
      } else if (table === 'trade_types') {
        const execute = vi.fn().mockResolvedValue({
          data: config.tradeTypes,
          error: config.error,
        });
        Object.setPrototypeOf(queryBuilder, { then: execute.then?.bind(execute) });
      } else if (table === 'service_locations') {
        queryBuilder.eq = vi.fn().mockImplementation((column: string, value: any) => {
          let filteredLocations = config.serviceLocations;
          
          if (column === 'user_id') {
            filteredLocations = config.serviceLocations.filter(
              (loc: any) => loc.user_id === value
            );
          } else if (column === 'is_active') {
            filteredLocations = filteredLocations.filter(
              (loc: any) => loc.is_active === value
            );
          }
          
          const execute = vi.fn().mockResolvedValue({
            data: filteredLocations,
            error: config.error,
          });
          
          return {
            ...queryBuilder,
            eq: vi.fn().mockImplementation((nextColumn: string, nextValue: any) => {
              if (nextColumn === 'is_active') {
                const activeFiltered = filteredLocations.filter(
                  (loc: any) => loc.is_active === nextValue
                );
                return Promise.resolve({
                  data: activeFiltered,
                  error: config.error,
                });
              }
              return Promise.resolve({
                data: filteredLocations,
                error: config.error,
              });
            }),
            then: execute.then?.bind(execute),
          };
        });
        
        const execute = vi.fn().mockResolvedValue({
          data: config.serviceLocations,
          error: config.error,
        });
        Object.setPrototypeOf(queryBuilder, { then: execute.then?.bind(execute) });
      } else if (table === 'tenant_sms_templates') {
        queryBuilder.eq = vi.fn().mockImplementation((column: string, value: any) => {
          let filteredTemplates = config.smsTemplates;
          
          if (column === 'user_id') {
            filteredTemplates = config.smsTemplates.filter(
              (template: any) => template.user_id === value
            );
          } else if (column === 'template_type') {
            filteredTemplates = filteredTemplates.filter(
              (template: any) => template.template_type === value
            );
          }
          
          const execute = vi.fn().mockResolvedValue({
            data: filteredTemplates,
            error: config.error,
          });
          
          return {
            ...queryBuilder,
            eq: vi.fn().mockImplementation((nextColumn: string, nextValue: any) => {
              if (nextColumn === 'is_active') {
                const activeFiltered = filteredTemplates.filter(
                  (template: any) => template.is_active === nextValue
                );
                return Promise.resolve({
                  data: activeFiltered,
                  error: config.error,
                });
              }
              return Promise.resolve({
                data: filteredTemplates,
                error: config.error,
              });
            }),
            then: execute.then?.bind(execute),
          };
        });
        
        const execute = vi.fn().mockResolvedValue({
          data: config.smsTemplates,
          error: config.error,
        });
        Object.setPrototypeOf(queryBuilder, { then: execute.then?.bind(execute) });
      } else if (table === 'twilio_settings') {
        queryBuilder.single = vi.fn().mockResolvedValue({
          data: config.twilioSettings,
          error: config.error,
        });
        queryBuilder.maybeSingle = vi.fn().mockResolvedValue({
          data: config.twilioSettings,
          error: config.error,
        });
      }

      return queryBuilder;
    }),
    rpc: vi.fn().mockImplementation((functionName, params) => {
      // Mock database functions
      if (functionName === 'create_default_sms_templates') {
        return Promise.resolve({ data: null, error: config.error });
      }
      if (functionName === 'get_twilio_settings') {
        return Promise.resolve({ 
          data: [config.twilioSettings], 
          error: config.error 
        });
      }
      return Promise.resolve({ data: null, error: config.error });
    }),
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnValue({
        unsubscribe: vi.fn(),
      }),
    }),
  };
};

// Export for use in tests
export const supabaseMock = createSupabaseMock();

/**
 * Helper functions for creating specific test scenarios
 */
export const createMockForIncompleteOnboarding = () => {
  return createSupabaseMock({
    profile: createMockProfile({
      onboarding_completed: false,
      onboarding_step: 3,
      trade_primary: null,
      business_name: null,
    }),
  });
};

export const createMockForClientUser = () => {
  return createSupabaseMock({
    user: { ...mockUser, id: 'client-user-id' },
    profile: mockClientProfile,
  });
};

export const createMockForAdminUser = () => {
  return createSupabaseMock({
    user: { ...mockUser, id: 'admin-user-id' },
    profile: mockAdminProfile,
  });
};

export const createMockWithError = (error: any) => {
  return createSupabaseMock({ error });
};

/**
 * Mock data exports for direct use in tests
 */
export {
  mockTradeTypes,
  mockServiceLocations, 
  mockSmsTemplates,
  mockTwilioSettings,
};