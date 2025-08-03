import { vi } from 'vitest';

// Mock user for testing
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00.000Z',
};

// Mock profiles
export const mockTradieProfile = {
  id: 'profile-1',
  user_id: 'test-user-id',
  name: 'Test Tradie',
  phone: '+61412345678',
  user_type: 'tradie',
  role: 'tradie',
  is_admin: false,
  address: '123 Test St',
};

export const mockClientProfile = {
  id: 'profile-2',
  user_id: 'client-user-id',
  name: 'Test Client',
  phone: '+61498765432',
  user_type: 'client',
  role: 'client',
  is_admin: false,
  address: '456 Client Ave',
};

export const mockAdminProfile = {
  ...mockTradieProfile,
  is_admin: true,
};

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

// Create Supabase mock
export const createSupabaseMock = (options = {}) => {
  const defaultOptions = {
    user: mockUser,
    profile: mockTradieProfile,
    jobs: mockJobs,
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
        order: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
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
      }

      return queryBuilder;
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